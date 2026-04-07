import React, { useState } from 'react';
import { SHIFT_CHANGE_PASSWORD } from '../constants';

interface PasswordModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onConfirm, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SHIFT_CHANGE_PASSWORD) {
      onConfirm();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 text-white">
          <h3 className="text-xl font-black uppercase tracking-tight">Seguridad</h3>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Se requiere autorización</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Contraseña de Acceso</label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full bg-slate-50 border ${error ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'} rounded-xl px-4 py-4 text-lg font-bold transition-all outline-none`}
              placeholder="••••••••"
            />
            {error && (
              <p className="text-rose-500 text-[10px] font-black uppercase mt-2 tracking-wider animate-bounce">Contraseña incorrecta</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-black text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
