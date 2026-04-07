
import React, { useState } from 'react';
import { StaffMember, ShiftType } from '../types';
import { SHIFT_SEQUENCE, SEQUENCE_INFO } from '../constants';
import { formatDateKey, getDaysInMonth } from '../utils/dateUtils';
import { RefreshCwIcon } from './Icons';

interface RecalculateModalProps {
  staff: StaffMember;
  year: number;
  month: number;
  onClose: () => void;
  onRecalc: (id: string, date: string, shift: ShiftType, seqIndex: number) => void;
}

const RecalculateModal: React.FC<RecalculateModalProps> = ({ staff, year, month, onClose, onRecalc }) => {
  const [day, setDay] = useState(1);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleRecalc = () => {
    const dateStr = formatDateKey(year, month, day);
    const shift = SHIFT_SEQUENCE[selectedStep];
    onRecalc(staff.id, dateStr, shift, selectedStep);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RefreshCwIcon size={24} />
            <h2 className="text-xl font-bold">Recalcular Secuencia</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-2xl font-light">×</button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm text-slate-500 italic">Persona seleccionada: <span className="font-bold text-indigo-600">{staff.name}</span></p>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Punto de Inicio (Día)</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value))}
            >
              {days.map(d => (
                <option key={d} value={d} className="bg-white text-black">Día {d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Turno Base en esa fecha</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
              value={selectedStep}
              onChange={(e) => setSelectedStep(parseInt(e.target.value))}
            >
              {SEQUENCE_INFO.map((info, idx) => (
                <option key={idx} value={idx} className="bg-white text-black">{info.label}</option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-slate-400">Toda la rotación futura se ajustará siguiendo la secuencia fija desde este punto.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <div className="text-blue-500">⚠️</div>
            <p className="text-xs text-blue-800">Se eliminarán los cambios manuales posteriores a la fecha seleccionada para este trabajador.</p>
          </div>

          <button 
            onClick={handleRecalc}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Confirmar y Recalcular
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecalculateModal;
