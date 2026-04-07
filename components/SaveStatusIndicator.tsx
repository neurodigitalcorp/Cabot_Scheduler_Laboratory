
import React from 'react';
import { CheckIcon, RefreshCwIcon } from './Icons';

interface SaveStatusIndicatorProps {
  hasUnsavedChanges: boolean;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ hasUnsavedChanges }) => {
  return (
    <div className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
      hasUnsavedChanges 
        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm animate-pulse' 
        : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
        hasUnsavedChanges ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
      }`}>
        {hasUnsavedChanges ? <RefreshCwIcon size={18} className="animate-spin" /> : <CheckIcon size={18} />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase tracking-widest leading-none">
          {hasUnsavedChanges ? '🔴 Cambios Sin Guardar' : '🟢 Cronograma Sincronizado'}
        </span>
        <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight">
          {hasUnsavedChanges 
            ? 'Se han detectado modificaciones pendientes de guardar' 
            : 'Toda la información está actualizada.'}
        </span>
      </div>
    </div>
  );
};

export default SaveStatusIndicator;
