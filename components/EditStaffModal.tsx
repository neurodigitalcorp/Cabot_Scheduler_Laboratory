
import React, { useState, useEffect } from 'react';
import { StaffMember } from '../types';
import { EditIcon } from './Icons';

interface EditStaffModalProps {
  staff: StaffMember;
  onClose: () => void;
  onSave: (id: string, name: string, role: string) => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, onClose, onSave }) => {
  const [name, setName] = useState(staff.name);
  const [role, setRole] = useState(staff.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && role.trim()) {
      onSave(staff.id, name, role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="bg-indigo-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <EditIcon size={20} />
            <h2 className="text-lg font-bold">Editar Analista</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-xl font-light">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
            <input 
              required
              autoFocus
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María García"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cargo / Especialidad</label>
            <input 
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej. Técnico de Lab"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;
