import React, { useState } from 'react';
import { ShiftType } from '../types';

interface RepeatShiftModalProps {
  shift: ShiftType;
  onConfirm: (days: number) => void;
  onClose: () => void;
}

const RepeatShiftModal: React.FC<RepeatShiftModalProps> = ({ shift, onConfirm, onClose }) => {
  const [days, setDays] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(days);
    if (!isNaN(parsed) && parsed > 0) {
      onConfirm(parsed);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-black">{shift}</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">Repetir Turno</h3>
          <p className="text-indigo-100 text-sm mt-1 font-medium">¿Cuántas veces deseas aplicar este turno?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Número de días</label>
            <input
              autoFocus
              type="number"
              min="1"
              max="31"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all text-center text-2xl font-black text-slate-800"
              placeholder="Ej: 5"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all uppercase text-xs tracking-widest"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepeatShiftModal;
