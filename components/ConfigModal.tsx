
import React, { useState } from 'react';
import { MailIcon, TrashIcon, PlusIcon, ClockIcon, RefreshCwIcon, SettingsIcon, CheckIcon } from './Icons';
import { StaffMember, ShiftType, MailingConfig, Overrides } from '../types';
import { SEQUENCE_INFO, MONTHS, SHIFT_SEQUENCE } from '../constants';
import { formatDateKey, getDaysInMonth, getShiftForDate } from '../utils/dateUtils';

interface ConfigModalProps {
  emails: string[];
  staff: StaffMember[];
  overrides: Overrides;
  mailingConfig: MailingConfig;
  currentMonth: number;
  currentYear: number;
  onClose: () => void;
  onSave: (emails: string[], config: MailingConfig) => void;
  onBatchRecalc: (staffId: string, date: string, shift: ShiftType, seqIndex: number) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ 
  emails, staff, overrides, mailingConfig, currentMonth, currentYear, onClose, onSave, onBatchRecalc 
}) => {
  const [emailList, setEmailList] = useState<string[]>(emails);
  const [newEmail, setNewEmail] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string>(staff[0]?.id || '');
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState<number>(0);
  
  // Local state for mailing config
  const [sendDay, setSendDay] = useState(mailingConfig.sendDay);
  const [sendTime, setSendTime] = useState(mailingConfig.sendTime);

  // Status for manual email sending
  const [sendManualStatus, setSendManualStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sendTestStatus, setSendTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const addEmail = () => {
    if (newEmail && newEmail.includes('@') && !emailList.includes(newEmail)) {
      setEmailList([...emailList, newEmail]);
      setNewEmail('');
    }
  };

  const handleApplySequence = () => {
    if (!selectedStaff) return;
    const dateStr = formatDateKey(currentYear, currentMonth, 1);
    const selectedStep = SEQUENCE_INFO[selectedSequenceIndex];
    onBatchRecalc(selectedStaff, dateStr, 'D1' as any, selectedStep.index);
    alert('Secuencia aplicada al día 1 de este mes.');
  };

  const generateEmailHTML = () => {
    const mesNombre = MONTHS[currentMonth];
    const añoVal = currentYear;
    const daysCount = getDaysInMonth(añoVal, currentMonth);
    
    let tableRows = '';
    staff.forEach(person => {
      let cells = '';
      for (let d = 1; d <= daysCount; d++) {
        const dk = formatDateKey(añoVal, currentMonth, d);
        const shift = overrides[person.id]?.[dk] || getShiftForDate(person.baseDate, person.startIndex, dk);
        
        let bgColor = '#ffffff';
        let textColor = '#475569';
        if (shift.startsWith('D')) { bgColor = '#fff7ed'; textColor = '#c2410c'; }
        else if (shift.startsWith('N')) { bgColor = '#faf5ff'; textColor = '#7e22ce'; }
        else if (shift.startsWith('X')) { bgColor = '#ecfdf5'; textColor = '#047857'; }
        else if (shift === 'O') { bgColor = '#f8fafc'; textColor = '#334155'; }
        else if (['V', 'I', 'CD', 'P', 'C'].includes(shift)) { bgColor = '#fff1f2'; textColor = '#be123c'; }

        cells += `<td style="border:1px solid #e2e8f0; padding:4px; text-align:center; background-color:${bgColor}; color:${textColor}; font-weight:bold; font-size:10px;">${shift}</td>`;
      }
      tableRows += `
        <tr>
          <td style="border:1px solid #e2e8f0; padding:4px; font-weight:bold; font-size:10px; color:#1e293b; background-color:#f1f5f9;">${person.name}</td>
          <td style="border:1px solid #e2e8f0; padding:4px; font-size:9px; color:#64748b; background-color:#f1f5f9;">${person.role}</td>
          ${cells}
        </tr>
      `;
    });

    const daysHeader = Array.from({ length: daysCount }, (_, i) => `<th style="border:1px solid #e2e8f0; padding:4px; font-size:9px; background-color:#4f46e5; color:#ffffff;">${i + 1}</th>`).join('');

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 1000px;">
        <p>Estimados,</p>
        <p>A continuación, Cronograma de Turnos del Personal de Laboratorio para el mes de <strong>${mesNombre}</strong>, Año <strong>${añoVal}</strong>.</p>
        <p>Favor tener en cuenta para fines pertinentes:</p>
        <ul style="margin-bottom: 20px;">
          <li>Programación de Transporte</li>
          <li>Servicio Comedor (Cenas & Meriendas)</li>
          <li>Capacitaciones</li>
          <li>Etc.</li>
        </ul>

        <div style="overflow-x: auto; margin-bottom: 30px;">
          <table style="border-collapse: collapse; width: 100%; min-width: 600px;">
            <thead>
              <tr>
                <th style="border:1px solid #e2e8f0; padding:6px; background-color:#4f46e5; color:#ffffff; font-size:10px; text-align:left;">Analista</th>
                <th style="border:1px solid #e2e8f0; padding:6px; background-color:#4f46e5; color:#ffffff; font-size:10px; text-align:left;">Cargo</th>
                ${daysHeader}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0; font-family: 'Trebuchet MS', sans-serif; font-weight: bold; font-size: 13px; color: #555;">Notification sent by</p>
          <p style="margin: 2px 0; font-family: 'Calibri', 'Candara', 'Segoe', sans-serif; font-weight: bold; font-style: italic; font-size: 18px; color: #f97316;">Cabot Scheduler</p>
          <p style="margin: 0; font-family: 'Trebuchet MS', sans-serif; font-weight: bold; font-style: italic; font-size: 12px; color: #666;">a Neuro Digitalverse App´s</p>
          
          <div style="margin-top: 20px;">
            <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #000; font-size: 14px;">neuroDigital.</p>
            <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-style: italic; color: #000; font-size: 12px;">Decoding Tomorrow Through Neuro Digitalverse.</p>
          </div>

          <div style="margin-top: 25px;">
            <p style="margin: 0; font-family: Arial, sans-serif; font-weight: bold; color: #dc2626; font-size: 14px;">Cabot Colombiana S.A.S</p>
            <p style="margin: 2px 0; font-family: Arial, sans-serif; font-weight: bold; color: #000; font-size: 13px;">Cartagena</p>
            <p style="margin: 0; font-family: Arial, sans-serif; color: #555; font-size: 12px; line-height: 1.5;">
              T +57 5 6688523<br>
              F +57 5 6688580<br>
              Zona Industrial de Mamonal Km 12<br>
              Cartagena - Colombia
            </p>
          </div>
        </div>
      </div>
    `;
  };

const callResendAPI = async (subject: string, html: string) => {

  const response = await fetch("http://localhost:4000/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subject,
      html
    })
  });

  if (!response.ok) {
    throw new Error("Error enviando correo desde backend");
  }

  return await response.json();
};

  const handleSendManualEmail = async () => {
    if (emailList.length === 0) {
      alert("Por favor agregue al menos un correo electrónico.");
      return;
    }

    setSendManualStatus('sending');
    setLastError(null);

    try {
      const subject = `Cronograma de Turnos — Laboratorio Cabot — ${MONTHS[currentMonth]} ${currentYear}`;
      const html = generateEmailHTML();
      await callResendAPI(subject, html);
      setSendManualStatus('success');
      setTimeout(() => setSendManualStatus('idle'), 4000);
    } catch (err: any) {
      console.error("Resend API Error:", err);
      setLastError(err.message);
      setSendManualStatus('error');
    }
  };

  const handleSendTestEmail = async () => {
    if (emailList.length === 0) {
      alert("Por favor agregue al menos un correo electrónico.");
      return;
    }

    setSendTestStatus('sending');
    setLastError(null);

    try {
      const subject = "Prueba de Conexión — Cabot Scheduler";
      const html = "<p>Esta es una prueba de envío real para confirmar que la integración con Resend funciona correctamente.</p>";
      await callResendAPI(subject, html);
      setSendTestStatus('success');
      setTimeout(() => setSendTestStatus('idle'), 4000);
    } catch (err: any) {
      console.error("Resend Test Error:", err);
      setLastError(err.message);
      setSendTestStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SettingsIcon size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Configuración Avanzada</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-2xl font-light">×</button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[75vh] custom-scrollbar bg-white">
          {/* Columna Izquierda: Correos y Horarios de Envío */}
          <div>
            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2 border-b border-indigo-100 pb-2">
              <MailIcon size={16} className="text-indigo-600" /> Notificaciones y Envío Real
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <div className="col-span-2 text-[10px] font-black text-indigo-900 uppercase mb-1 tracking-wider opacity-60">Programación Automática</div>
              <div>
                <label className="text-[10px] text-indigo-950 font-bold mb-1 block">Día del mes</label>
                <input 
                  type="number" min="1" max="31"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-indigo-200 bg-white text-indigo-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                  value={sendDay} onChange={e => setSendDay(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[10px] text-indigo-950 font-bold mb-1 block">Hora de envío</label>
                <input 
                  type="time"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-indigo-200 bg-white text-indigo-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                  value={sendTime} onChange={e => setSendTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input 
                type="email" placeholder="correo@ejemplo.com"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all placeholder:text-slate-400"
                value={newEmail} onChange={e => setNewEmail(e.target.value)}
              />
              <button onClick={addEmail} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                <PlusIcon size={18} />
              </button>
            </div>
            
            <div className="space-y-2 mb-4 max-h-[120px] overflow-y-auto custom-scrollbar">
              {emailList.length === 0 ? (
                <div className="text-[10px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">No hay correos en la lista</div>
              ) : (
                emailList.map(email => (
                  <div key={email} className="bg-white px-4 py-2.5 rounded-xl flex justify-between items-center border border-slate-200 text-xs shadow-sm hover:border-indigo-200 transition-colors">
                    <span className="truncate max-w-[150px] font-bold text-slate-800">{email}</span>
                    <button onClick={() => setEmailList(emailList.filter(e => e !== email))} className="text-slate-400 hover:text-rose-600 transition-colors"><TrashIcon size={14}/></button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleSendManualEmail}
                disabled={sendManualStatus === 'sending'}
                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                  sendManualStatus === 'success' ? 'bg-emerald-500 text-white' : 
                  sendManualStatus === 'error' ? 'bg-rose-600 text-white' :
                  sendManualStatus === 'sending' ? 'bg-indigo-400 text-white cursor-wait' :
                  'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {sendManualStatus === 'idle' && <><MailIcon size={18}/> ENVIAR CRONOGRAMA REAL</>}
                {sendManualStatus === 'sending' && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                {sendManualStatus === 'sending' && "Conectando con Resend..."}
                {sendManualStatus === 'success' && <><CheckIcon size={18}/> ¡Enviado correctamente!</>}
                {sendManualStatus === 'error' && "Fallo en el Envío"}
              </button>

              <button 
                onClick={handleSendTestEmail}
                disabled={sendTestStatus === 'sending'}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                  sendTestStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                  sendTestStatus === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sendTestStatus === 'idle' && "Enviar Email de Prueba"}
                {sendTestStatus === 'sending' && "Validando Conexión..."}
                {sendTestStatus === 'success' && "Prueba Exitosa"}
                {sendTestStatus === 'error' && "Prueba Fallida"}
              </button>
            </div>

            {lastError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-700 font-bold font-mono overflow-hidden break-words">
                ERROR: {lastError}
              </div>
            )}
          </div>

          {/* Columna Derecha: Posicionamiento Ciclo */}
          <div className="border-l border-slate-100 pl-4">
            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2 border-b border-indigo-100 pb-2">
              <RefreshCwIcon size={16} className="text-indigo-600" /> Ajustar Inicio de Mes
            </h3>
            <p className="text-[10px] text-slate-500 mb-5 leading-relaxed">Define en qué parte de la secuencia inicia este trabajador el día <span className="font-bold text-slate-800">1 de {MONTHS[currentMonth]}</span>.</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1.5 block opacity-60">Analista</label>
                <select 
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-indigo-200 bg-white text-indigo-950 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer transition-all"
                  value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
                >
                  {staff.map(s => <option key={s.id} value={s.id} className="font-medium text-slate-900">{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1.5 block opacity-60">Iniciar Mes con:</label>
                <select 
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-indigo-200 bg-white text-indigo-950 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer transition-all"
                  value={selectedSequenceIndex} onChange={e => setSelectedSequenceIndex(parseInt(e.target.value))}
                >
                  {SEQUENCE_INFO.map((info, idx) => <option key={idx} value={idx} className="font-medium text-slate-900">{info.label}</option>)}
                </select>
              </div>
              <button 
                onClick={handleApplySequence}
                className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg active:scale-95"
              >
                Aplicar al Día 1
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-white border border-slate-300 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">Cancelar</button>
          <button 
            onClick={() => onSave(emailList, { sendDay, sendTime })} 
            className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-indigo-200 shadow-lg active:scale-95 transition-all"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
