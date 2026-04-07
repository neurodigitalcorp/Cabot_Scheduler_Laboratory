import React, { useState } from 'react';
import { EyeIcon, PencilIcon, LockIcon, CheckIcon } from './Icons';
import { SHIFT_CHANGE_PASSWORD } from '../constants';

interface EditModeToggleProps {
  isPlanningMode: boolean;
  onToggle: (mode: boolean) => void;
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({ isPlanningMode, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleToggleClick = () => {
    if (isPlanningMode) {
      // Si ya está en modo planificación, volver a lectura sin contraseña
      onToggle(false);
    } else {
      // Si está en modo lectura, pedir contraseña para entrar a planificación
      setIsModalOpen(true);
    }
  };

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === SHIFT_CHANGE_PASSWORD) {
      onToggle(true);
      setIsModalOpen(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <>
      <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm">
        <button
          onClick={handleToggleClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
            !isPlanningMode 
              ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
              : 'text-slate-500 hover:bg-white/50'
          }`}
        >
          <EyeIcon size={14} />
          <span>Modo Lectura</span>
        </button>
        <button
          onClick={handleToggleClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
            isPlanningMode 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-500 hover:bg-white/50'
          }`}
        >
          <PencilIcon size={14} />
          <span>Modo Planificación</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white text-center relative">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <LockIcon size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Acceso Restringido</h3>
              <p className="text-indigo-100 text-xs mt-1 font-medium">Ingrese contraseña para Modo Planificación</p>
            </div>
            
            <form onSubmit={handleConfirm} className="p-8">
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-slate-50 border ${
                      error ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    } rounded-xl text-center text-lg font-bold tracking-widest transition-all outline-none`}
                  />
                  {error && (
                    <p className="text-rose-500 text-[10px] font-bold text-center mt-2 uppercase animate-bounce">
                      Contraseña Incorrecta
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setPassword('');
                      setError(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
                  >
                    <CheckIcon size={16} />
                    Confirmar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModeToggle;
