import React, { useState } from "react";
import { StaffMember, Overrides, ShiftType } from "../types";
import { SHIFT_LEGEND } from "../constants";
import { formatDateKey } from "../utils/dateUtils";
import TutorialVideo from "./TutorialVideo";

interface Props {
  staff: StaffMember[];
  overrides: Overrides;
  resolvedSchedule: Record<string, Record<string, ShiftType>>;
  currentDate: Date;
  isPlanningMode: boolean;
  onShiftChange: (staffId: string, dateKey: string, shift: ShiftType) => void;
}

const ShiftTableMobileWeek: React.FC<Props> = ({
  staff,
  overrides,
  resolvedSchedule,
  currentDate,
  isPlanningMode,
  onShiftChange,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState<{
    staffId: string;
    dateKey: string;
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  /* -------------------------------------------------
     Calcular semana (lunes → domingo)
  -------------------------------------------------- */
  const baseDate = new Date(currentDate);
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);

  const baseDay = baseDate.getDay(); // 0 domingo
  const mondayOffset = baseDay === 0 ? -6 : 1 - baseDay;

  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekLabel = `${weekDays[0].toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  })} – ${weekDays[6].toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="relative w-full px-3 pb-36 overflow-y-auto">
      {/* Header navegación por semana */}
      <div className="sticky top-0 z-20 bg-white py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="px-3 py-2 text-indigo-600 font-black text-lg"
        >
          ◀
        </button>

        <div className="text-sm font-black text-slate-900 uppercase">
          Semana {weekLabel}
        </div>

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="px-3 py-2 text-indigo-600 font-black text-lg"
        >
          ▶
        </button>
      </div>

      {/* Lista por persona */}
      <div className="flex flex-col gap-4 mt-4">
        {staff.map(person => (
          <div
            key={person.id}
            className="bg-white border border-slate-300 rounded-xl p-3 shadow-sm"
          >
            <div className="font-bold text-slate-900">{person.name}</div>
            <div className="text-xs text-slate-500 mb-2">{person.role}</div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => {
                const dateKey = formatDateKey(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate()
                );

                const shift =
                  resolvedSchedule?.[person.id]?.[dateKey] ??
                  overrides?.[person.id]?.[dateKey] ??
                  "";

                const legend = SHIFT_LEGEND.find(l => l.code === shift);

                return (
                  <button
                    key={dateKey}
                    disabled={!isPlanningMode}
                    onClick={() =>
                      isPlanningMode &&
                      setEditing({ staffId: person.id, dateKey })
                    }
                    className={`rounded-lg py-2 flex flex-col items-center justify-center text-[11px] font-black ${
                      legend?.color ?? "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="text-[10px] font-bold">
                      {day.getDate()}
                    </span>
                    <span>{shift || "--"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal selección de turno */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-4 max-h-[70vh] overflow-y-auto">
            <div className="text-sm font-black mb-4">
              Seleccionar turno
            </div>

            <div className="grid grid-cols-4 gap-2">
              {SHIFT_LEGEND.map(shift => (
                <button
                  key={shift.code}
                  onClick={() => {
                    onShiftChange(editing.staffId, editing.dateKey, shift.code);
                    setEditing(null);
                  }}
                  className={`p-2 rounded-xl text-xs font-black ${shift.color}`}
                >
                  {shift.code}
                  <div className="text-[9px] font-medium mt-1">
                    {shift.time}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditing(null)}
              className="mt-4 w-full py-2 rounded-lg bg-slate-200 text-slate-700 font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante Ayuda */}
      <button
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-black shadow-lg"
      >
        ?
      </button>

      {/* Modal Tutorial */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[95%] max-w-md p-4 relative">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-2 right-2 text-slate-500 font-bold"
            >
              ✕
            </button>
            <TutorialVideo />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTableMobileWeek;
