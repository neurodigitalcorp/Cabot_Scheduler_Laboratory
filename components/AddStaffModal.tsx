
import React, { useState } from 'react';
import { UserIcon } from './Icons';
import { SEQUENCE_INFO } from '../constants';

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (name: string, role: string, startIndex: number) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [startIndex, setStartIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role) {
      onAdd(name, role, startIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserIcon size={20} />
            <h2 className="text-lg font-bold">Nueva Persona</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-xl font-light">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
            <input 
              required
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María García"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo / Especialidad</label>
            <input 
              required
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej. Técnico de Lab"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Posición del Ciclo Inicial (1 de Feb)</label>
            <select 
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              style={{ color: '#0f172a' }} // Asegura texto negro profundo
              value={startIndex}
              onChange={(e) => setStartIndex(parseInt(e.target.value))}
            >
              {SEQUENCE_INFO.map((info) => (
                <option key={info.index} value={info.index} className="text-slate-900 bg-white">
                  {info.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[9px] text-slate-400 leading-tight">
              Seleccione el turno que le correspondía el 1 de Febrero para calcular la rotación actual.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-all active:scale-[0.98] mt-4"
          >
            Añadir al Cronograma
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
