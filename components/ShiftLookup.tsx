import React, { useState } from 'react';
import { StaffMember, Overrides, ShiftType } from '../types';
import { formatDateKey, getShiftForDate } from '../utils/dateUtils';
import { MONTHS } from '../constants';
import { SearchIcon } from './Icons';

interface ShiftLookupProps {
  staff: StaffMember[];
  overrides: Overrides;
  resolvedSchedule: Record<string, Record<string, ShiftType>>;
}

const ShiftLookup: React.FC<ShiftLookupProps> = ({
  staff,
  overrides,
  resolvedSchedule,
}) => {
  const today = new Date();

  const [selectedId, setSelectedId] = useState<string>(
    staff[0]?.id ?? ''
  );
  const [day, setDay] = useState<number>(today.getDate());
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [queryResult, setQueryResult] = useState<ShiftType | null>(null);

  const handleConsult = () => {
    const person = staff.find((s) => s.id === selectedId);
    if (!person) return;

    const dateKey = formatDateKey(year, month, day);

    const shift =
      resolvedSchedule?.[person.id]?.[dateKey] ??
      overrides?.[person.id]?.[dateKey] ??
      getShiftForDate(person.baseDate, person.startIndex, dateKey);

    setQueryResult(shift);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = [2025, 2026, 2027];

  return (
    <div className="bg-white rounded-lg border border-slate-800 shadow-md p-2">
      <h3 className="text-[10px] font-black uppercase text-slate-900 mb-2 tracking-widest">
        Consulta Rápida de Turnos
      </h3>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Analista */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-slate-400 rounded px-2 py-1 text-xs"
        >
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Día */}
        <select
          value={day}
          onChange={(e) => setDay(parseInt(e.target.value))}
          className="border border-slate-400 rounded px-2 py-1 text-xs"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Mes */}
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="border border-slate-400 rounded px-2 py-1 text-xs"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        {/* Año */}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border border-slate-400 rounded px-2 py-1 text-xs"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Consultar */}
        <button
          onClick={handleConsult}
          className="bg-black text-white text-xs px-3 py-1 rounded flex items-center gap-1"
        >
          <SearchIcon size={12} /> Ver
        </button>
      </div>

      <div className="mt-3 text-xs">
        {queryResult ? (
          <strong>Turno asignado: {queryResult}</strong>
        ) : (
          <span className="text-slate-500">
            Selecciona analista y fecha para consultar
          </span>
        )}
      </div>
    </div>
  );
};

export default ShiftLookup;
