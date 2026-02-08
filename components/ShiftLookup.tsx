
import React, { useState } from 'react';
import { StaffMember, Overrides, ShiftType } from '../types';
import { formatDateKey, getShiftForDate } from '../utils/dateUtils';
import { MONTHS } from '../constants';
import { SearchIcon, CalendarIcon, UserIcon } from './Icons';

interface ShiftLookupProps {
  staff: StaffMember[];
  overrides: Overrides;
}

const ShiftLookup: React.FC<ShiftLookupProps> = ({ staff, overrides }) => {
  const today = new Date();
  const [selectedId, setSelectedId] = useState<string>(staff[0]?.id || '');
  const [day, setDay] = useState<number>(today.getDate());
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [queryResult, setQueryResult] = useState<ShiftType | null>(null);

  const handleConsult = () => {
    const person = staff.find(s => s.id === selectedId);
    if (!person) return;

    const dateKey = formatDateKey(year, month, day);
    const shift = overrides[person.id]?.[dateKey] || getShiftForDate(person.baseDate, person.startIndex, dateKey);
    setQueryResult(shift);
  };

  const years = [2025, 2026, 2027];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-2 rounded-lg border border-slate-800 shadow-md flex flex-col h-full">
      <h3 className="text-[8px] font-black uppercase text-slate-900 mb-1.5 tracking-widest border-b border-slate-100 pb-0.5 flex items-center gap-1">
        <SearchIcon size={8} /> Consulta Rápida de Turnos
      </h3>
      
      <div className="grid grid-cols-12 gap-1.5 items-end">
        {/* Selector de Analista */}
        <div className="col-span-5">
          <label className="text-[7px] font-bold text-black uppercase block mb-0.5">Analista</label>
          <select 
            className="w-full text-[9px] font-bold border border-slate-300 rounded px-1 py-0.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Fecha: Día */}
        <div className="col-span-2">
          <label className="text-[7px] font-bold text-black uppercase block mb-0.5">Día</label>
          <select 
            className="w-full text-[9px] font-bold border border-slate-300 rounded px-1 py-0.5 bg-slate-50"
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
          >
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Fecha: Mes */}
        <div className="col-span-3">
          <label className="text-[7px] font-bold text-black uppercase block mb-0.5">Mes</label>
          <select 
            className="w-full text-[9px] font-bold border border-slate-300 rounded px-1 py-0.5 bg-slate-50"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>

        {/* Botón Consultar */}
        <div className="col-span-2">
          <button 
            onClick={handleConsult}
            className="w-full bg-slate-900 text-white text-[8px] font-black uppercase py-1 rounded hover:bg-black transition-colors active:scale-95"
          >
            Ver
          </button>
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-2 flex-1 flex items-center justify-center border-t border-dashed border-slate-100 pt-1.5">
        {queryResult ? (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-black uppercase">Turno Asignado:</span>
            <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-bottom-1">
              {queryResult}
            </span>
          </div>
        ) : (
          <span className="text-[7px] text-slate-400 italic">Selecciona analista y fecha para consultar</span>
        )}
      </div>
    </div>
  );
};

export default ShiftLookup;
