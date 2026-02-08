import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

// --- NUEVO: para resolver rutas absolutas en ES Modules ---
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("SERVER ARRANCANDO...");
console.log("Tiene API key Resend?:", Boolean(process.env.RESEND_API_KEY));

const resend = new Resend(process.env.RESEND_API_KEY);

// --------------------- RUTAS API --------------------- //
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    time: new Date().toISOString(),
  });
});

app.post("/send-email", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html || typeof html !== "string" || html.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "El campo 'html' es requerido y debe ser string no vacío." });
    }

    const response = await resend.emails.send({
      // Para sandbox, usa destinatarios verificados en Resend.
      from: "Cabot Scheduler <onboarding@resend.dev>",
      to: ["amacias@cabotcorp.com"],
      subject: "Cronograma Cabot Scheduler",
      html,
    });

    console.log("Email enviado. Resend response:", response);
    res.json(response);
  } catch (err) {
    console.error("Error enviando correo:", err);
    res.status(500).json({ error: err?.message || "Error interno" });
  }
});
// ------------------- FIN RUTAS API ------------------- //

// ----------- NUEVO: SERVIR FRONTEND COMPILADO ----------- //
// Esto permite que el mismo servicio de Render sirva la SPA de Vite (carpeta dist)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

// Archivos estáticos (JS/CSS/imagenes generados por Vite)
app.use(express.static(distPath));

// Fallback para SPA (React Router, etc.)
// IMPORTANTE: Este fallback debe ir DESPUÉS de tus rutas API
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
// --------- FIN: SERVIR FRONTEND COMPILADO --------- //

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor correo activo en puerto ${PORT}`);
});