// ==================================================
// IMPORTS
// ==================================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ==================================================
// CONFIG
// ==================================================
dotenv.config();

const app = express();

// Resolver __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================================================
// SUPABASE
// ==================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==================================================
// RESEND
// ==================================================
const resend = new Resend(process.env.RESEND_API_KEY);

// ==================================================
// MIDDLEWARES
// ==================================================
app.use(cors());
app.use(express.json({ limit: "25mb" }));

console.log("SERVER ARRANCANDO...");
console.log("Tiene API key Resend?:", Boolean(process.env.RESEND_API_KEY));
console.log("Tiene Supabase URL?:", Boolean(process.env.SUPABASE_URL));

// ==================================================
// CRON SETTINGS (SUPABASE)
// ==================================================

/**
 * Obtiene la configuración del cron desde Supabase
 */
async function getCronSettings() {
  try {
    const { data, error } = await supabase
      .from("cron_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          sendDay: null,
          sendTime: null,
          lastSentMonth: null,
        };
      }
      throw error;
    }

    return {
      sendDay: data.send_day,
      sendTime: data.send_time,
      lastSentMonth: data.last_sent_month,
    };
  } catch (err) {
    console.error("❌ Error obteniendo cron_settings:", err);
    return null;
  }
}

/**
 * Guarda la configuración del cron en Supabase
 */
async function saveCronSettings(settings) {
  try {
    const { error } = await supabase.from("cron_settings").upsert({
      id: 1,
      send_day: settings.sendDay,
      send_time: settings.sendTime,
      last_sent_month: settings.lastSentMonth,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("❌ Error guardando cron_settings:", err);
    return false;
  }
}

app.post("/cron/check-and-send", async (req, res) => {
  try {
    const config = await getCronSettings();

    if (!config || config.sendDay == null || !config.sendTime) {
      return res.json({
        skipped: true,
        reason: "Sin configuración válida",
      });
    }

    const now = new Date();
    const todayDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    if (config.lastSentMonth === currentMonthKey) {
      return res.json({ skipped: true, reason: "Ya enviado este mes" });
    }

    if (todayDay !== config.sendDay) {
      return res.json({
        skipped: true,
        reason: `Hoy es día ${todayDay}, se espera ${config.sendDay}`,
      });
    }

    if (currentTime < config.sendTime) {
      return res.json({
        skipped: true,
        reason: "Aún no es la hora",
      });
    }

    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data: scheduleRow, error } = await supabase
      .from("schedules")
      .select("data")
      .eq("month", month)
      .eq("year", year)
      .single();

    if (error || !scheduleRow?.data) {
      return res.json({
        skipped: true,
        reason: "No existe cronograma para el mes actual",
      });
    }

    const htmlEmail = buildScheduleEmailHTML(
      scheduleRow.data,
      month,
      year
    );

    await resend.emails.send({
      from: "Cabot Scheduler <onboarding@resend.dev>",
      to: ["amacias@cabotcorp.com"],
      subject: `Cronograma Turnos Laboratorio / ${year}-${month}`,
      html: htmlEmail,
    });

    await saveCronSettings({
      ...config,
      lastSentMonth: currentMonthKey,
    });

    console.log(`✅ Correo CRON enviado para ${currentMonthKey}`);
    res.json({ sent: true, month: currentMonthKey });

  } catch (error) {
    console.error("❌ Error CRON:", error);
    res.status(500).json({ error: "Error ejecutando CRON" });
  }
});

function buildScheduleEmailHTML(scheduleData, month, year) {
  const { staff = [], resolvedSchedule = {} } = scheduleData;

  const monthName = new Date(year, month - 1).toLocaleString("es-CO", {
    month: "long",
  });

  const daysInMonth = new Date(year, month, 0).getDate();

  const getShift = (staffId, day) => {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return resolvedSchedule?.[staffId]?.[dateKey] || "";
  };

  let html = `
  <div style="font-family: Arial, sans-serif; font-size:13px; color:#1f2937;">
    <h2 style="color:#1e3a8a;">
      Cronograma Turnos Personal Laboratorio Cabot Colombiana S.A.S.
    </h2>

    <p>
      Estimados,<br/><br/>
      A continuación, Cronograma de Turnos del Personal de Laboratorio
      para el mes de <strong>${monthName}</strong>,
      Año <strong>${year}</strong>.
    </p>

    <p>Favor tener en cuenta para fines pertinentes:</p>
    <ul>
      <li>Programación de Transporte</li>
      <li>Servicio Comedor (Cenas & Meriendas)</li>
      <li>Capacitaciones</li>
      <li>Etc.</li>
    </ul>

    <table border="1" cellspacing="0" cellpadding="4"
      style="border-collapse:collapse; width:100%; font-size:11px; text-align:center;">
      <thead style="background:#1e3a8a; color:white;">
        <tr>
          <th style="text-align:left;">Analista</th>
          <th style="text-align:left;">Cargo</th>
  `;

  for (let d = 1; d <= daysInMonth; d++) {
    html += `<th>${d}</th>`;
  }

  html += `</tr></thead><tbody>`;

  staff.forEach(person => {
    html += `
      <tr>
        <td style="text-align:left;"><strong>${person.name}</strong></td>
        <td style="text-align:left;">${person.role}</td>
    `;

    for (let d = 1; d <= daysInMonth; d++) {
      html += `<td>${getShift(person.id, d)}</td>`;
    }

    html += `</tr>`;
  });

  html += `
      </tbody>
    </table>

    <br/>
    <strong>Nomenclatura de Turnos</strong>
    <table border="1" cellspacing="0" cellpadding="4"
      style="border-collapse:collapse; font-size:11px;">
      <tr><td>D1 / D2</td><td>06:00 - 18:00 (Diurno)</td></tr>
      <tr><td>N1 / N2</td><td>18:00 - 06:00 (Nocturno)</td></tr>
      <tr><td>M</td><td>14:00 - 22:00 (Tarde)</td></tr>
      <tr><td>L</td><td>07:30 - 16:00 (Oficina)</td></tr>
      <tr><td>X</td><td>08:00 - 14:00 (Mañana)</td></tr>
      <tr><td>O</td><td>Descanso</td></tr>
      <tr><td>P</td><td>Permiso</td></tr>
      <tr><td>CD</td><td>Calamidad</td></tr>
      <tr><td>C</td><td>Compensado</td></tr>
      <tr><td>V</td><td>Vacaciones</td></tr>
      <tr><td>I</td><td>Incapacidad</td></tr>
    </table>

    <br/>
    <em>
      Notification sent by <strong>Cabot Scheduler</strong>
      – NeuroDigitalverse App´s
    </em>
  </div>
  `;

  return html;
}

// ==================================================
// ROUTES
// ==================================================

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    supabaseConnected: Boolean(process.env.SUPABASE_URL),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * ENVÍO MANUAL DE CORREO
 */
app.post("/send-email", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html || typeof html !== "string" || html.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "El campo 'html' es requerido y debe ser texto válido." });
    }

    const now = new Date();
    const subjectDate = now.toLocaleString("es-CO", {
      month: "long",
      year: "numeric",
    });

    const response = await resend.emails.send({
      from: "Cabot Scheduler <onboarding@resend.dev>",
      to: ["amacias@cabotcorp.com"],
      subject: `Cronograma Turnos Personal Laboratorio / ${subjectDate}`,
      html,
    });

    console.log("✅ Cronograma enviado manualmente:", response);
    res.json(response);
  } catch (err) {
    console.error("❌ Error enviando correo manual:", err);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

/**
 * GUARDAR CONFIGURACIÓN DE ENVÍO PROGRAMADO
 */
app.post("/schedule/save", async (req, res) => {
  try {
    const { sendDay, sendTime } = req.body;

    if (sendDay === undefined || !sendTime) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const current = await getCronSettings();

    const success = await saveCronSettings({
      sendDay: Number(sendDay),
      sendTime,
      lastSentMonth: current?.lastSentMonth ?? null,
    });

    if (!success) throw new Error("Error persistiendo en Supabase");

    console.log("✅ Configuración programada guardada en Supabase");
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error guardando config programada:", err);
    res.status(500).json({ error: "Error interno guardando configuración" });
  }
});

/**
 * GUARDAR CRONOGRAMA (SUPABASE)
 */
app.post("/schedule/data/save", async (req, res) => {
  try {
    const { month, year, data } = req.body;

    if (!month || !year || !data) {
      return res.status(400).json({
        error: "month, year y data son obligatorios",
      });
    }

    const { error } = await supabase.from("schedules").upsert(
      {
        month: Number(month),
        year: Number(year),
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "month,year" }
    );

    if (error) throw error;

    console.log(`✅ Cronograma ${month}/${year} guardado/actualizado`);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error guardando cronograma:", error);
    res.status(500).json({ error: "Error guardando cronograma" });
  }
});

/**
 * LEER CRONOGRAMA
 */
app.get("/schedule/data", async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month y year son requeridos" });
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("data")
      .eq("month", Number(month))
      .eq("year", Number(year))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.json({});
      }
      throw error;
    }

    // ✅ DEVOLVER DATA COMPLETA
    res.json({ data: data.data });

  } catch (err) {
    console.error("❌ Error leyendo cronograma:", err);
    res.status(500).json({ error: "Error leyendo cronograma" });
  }
});

/**
 * CRON CHECK
 */
app.post("/cron/check-and-send", async (req, res) => {
  try {
    const config = await getCronSettings();

    if (!config || config.sendDay == null || !config.sendTime) {
      return res.json({
        skipped: true,
        reason: "Sin configuración válida",
      });
    }

    const now = new Date();
    const todayDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    if (config.lastSentMonth === currentMonthKey) {
      return res.json({ skipped: true, reason: "Ya enviado este mes" });
    }

    if (todayDay !== config.sendDay) {
      return res.json({
        skipped: true,
        reason: `Hoy es día ${todayDay}, se espera ${config.sendDay}`,
      });
    }

    if (currentTime < config.sendTime) {
      return res.json({
        skipped: true,
        reason: "Aún no es la hora",
      });
    }

    // Aquí solo marcamos como enviado (correo automático ya validado antes)
    await saveCronSettings({
      ...config,
      lastSentMonth: currentMonthKey,
    });

    res.json({ sent: true, month: currentMonthKey });
  } catch (error) {
    console.error("❌ Error CRON:", error);
    res.status(500).json({ error: "Error ejecutando CRON" });
  }
});

// ==================================================
// SERVIR FRONTEND BUILT (VITE / DIST)
// ==================================================
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ==================================================
// START SERVER
// ==================================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Servidor activo en puerto ${PORT}`);
});