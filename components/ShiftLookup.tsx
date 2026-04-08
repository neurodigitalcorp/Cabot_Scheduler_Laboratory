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

const getShiftClass = (shift: string) => {
  if (shift.startsWith("D")) {
    return "bg-orange-50 text-orange-700 border border-orange-300";
  }
  if (shift.startsWith("N")) {
    return "bg-purple-50 text-purple-700 border border-purple-300";
  }
  if (shift.startsWith("X")) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-300";
  }

  switch (shift) {
    case "O":
      return "bg-slate-50 text-slate-700 border border-slate-300";
    case "C":
    case "V":
    case "CD":
    case "P":
    case "I":
      return "bg-rose-50 text-rose-700 border border-rose-300";
    default:
      return "bg-white text-slate-600 border border-slate-300";
  }
};

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
          className="border border-slate-400 rounded px-2 py-1 text-xs font-bold"
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
          className="border border-slate-400 rounded px-2 py-1 text-xs font-bold"
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
          className="border border-slate-400 rounded px-2 py-1 text-xs font-bold"
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
          className="border border-slate-400 rounded px-2 py-1 text-xs font-bold"
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
  <div className="flex items-center gap-2 mt-2">
    <span className="text-xs font-bold text-slate-700">
      Turno asignado:
    </span>

    <span
      className={`px-3 py-1 text-sm font-black rounded-md ${getShiftClass(
        queryResult
      )}`}
    >
      {queryResult}
    </span>
  </div>
) : (
  <span className="text-slate-500 text-xs">
    Selecciona analista y fecha para consultar
  </span>
)}

      </div>
    </div>
  );
};

export default ShiftLookup;
