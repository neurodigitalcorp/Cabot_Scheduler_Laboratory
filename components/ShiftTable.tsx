
import React, { useState, useRef } from 'react';
import { StaffMember, Overrides, ShiftType } from '../types';
import { getDaysInMonth, formatDateKey, getShiftForDate, isToday } from '../utils/dateUtils';
import { DAYS_SHORT, ALL_SHIFTS } from '../constants';
import { TrashIcon, EditIcon, RefreshCwIcon, UserIcon } from './Icons';

interface ShiftTableProps {
  staff: StaffMember[];
  overrides: Overrides;
  year: number;
  month: number;
  onShiftChange: (id: string, date: string, shift: ShiftType) => void;
  onDeleteStaff: (id: string) => void;
  onEditStaff: (staff: StaffMember) => void;
  onRecalc: (staff: StaffMember) => void;
  onPhotoChange: (id: string, photo: string | undefined) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ 
  staff, overrides, year, month, onShiftChange, onDeleteStaff, onEditStaff, onRecalc, onPhotoChange
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStaffPhotoId, setActiveStaffPhotoId] = useState<string | null>(null);
  
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{staffId: string, dateKey: string, currentShift: ShiftType} | null>(null);

  const getShiftClass = (shift: ShiftType) => {
    if (shift.startsWith('D')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (shift.startsWith('N')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (shift.startsWith('X')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    
    switch (shift) {
      case 'O': return 'bg-slate-50 text-slate-700 border-slate-300';
      case 'L': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'M': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'V': case 'I': case 'CD': case 'P': case 'C':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default: return 'bg-white text-slate-400';
    }
  };

  const handleCellClick = (staffId: string, dateKey: string, currentShift: ShiftType) => {
    setSelectedCell({ staffId, dateKey, currentShift });
    setPickerOpen(true);
  };

  const selectShift = (shift: ShiftType) => {
    if (selectedCell) {
      onShiftChange(selectedCell.staffId, selectedCell.dateKey, shift);
      setPickerOpen(false);
      setSelectedCell(null);
    }
  };

  const handlePhotoClick = (id: string) => {
    setActiveStaffPhotoId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeStaffPhotoId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(activeStaffPhotoId, reader.result as string);
        setActiveStaffPhotoId(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar fotografía?')) {
      onPhotoChange(id, undefined);
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar flex-1">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 bg-slate-50 z-20">
          <tr className="h-11">
            <th className="p-1.5 text-left border-b border-r border-slate-800 bg-slate-100 sticky left-0 z-30 w-[260px] shadow-[1px_0_3px_rgba(0,0,0,0.1)]">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Analistas</span>
            </th>
            {days.map(day => {
              const date = new Date(year, month, day);
              const dayName = DAYS_SHORT[date.getDay()];
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isTodayDate = isToday(year, month, day);
              return (
                <th key={day} className={`border-b border-slate-800 w-[3%] py-1.5 text-center border-r last:border-r-0 ${
                  isTodayDate ? 'bg-indigo-600 text-white font-black' : 
                  isWeekend ? 'bg-slate-300' : 'bg-slate-50'
                }`}>
                  <div className={`text-[8px] uppercase font-black leading-none ${isTodayDate ? 'text-white' : 'text-slate-500'}`}>{dayName}</div>
                  <div className={`text-[11px] font-black leading-none mt-1 ${isTodayDate ? 'text-white' : 'text-slate-900'}`}>{day}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {staff.map((person) => (
            <tr key={person.id} className="group hover:bg-slate-50 transition-colors h-11">
              <td className="px-3 py-1 border-r border-slate-800 bg-white sticky left-0 z-10 group-hover:bg-indigo-50/30 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-2 overflow-hidden h-full">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {/* FOTO DEL EMPLEADO */}
                    <div 
                      onClick={() => handlePhotoClick(person.id)}
                      className="relative w-8 h-8 rounded-full border border-slate-300 bg-slate-100 flex-shrink-0 cursor-pointer overflow-hidden group/photo hover:border-indigo-500 transition-all shadow-sm"
                    >
                      {person.photo ? (
                        <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-full h-full p-1 text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                         <RefreshCwIcon size={12} className="text-white" />
                      </div>
                    </div>

                    <div className="overflow-hidden">
                      <div className="font-black text-slate-900 truncate leading-tight text-[10px]" title={person.name}>{person.name}</div>
                      <div className="text-[8px] text-slate-500 truncate font-bold uppercase tracking-tighter mt-0.5" title={person.role}>{person.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onRecalc(person)} className="p-1 bg-white text-indigo-500 border border-indigo-100 rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-all" title="Recalcular"><RefreshCwIcon size={11}/></button>
                    <button onClick={() => onEditStaff(person)} className="p-1 bg-white text-slate-500 border border-slate-200 rounded shadow-sm hover:bg-slate-800 hover:text-white transition-all" title="Editar"><EditIcon size={11}/></button>
                    <button onClick={() => onDeleteStaff(person.id)} className="p-1 bg-white text-rose-500 border border-rose-200 rounded shadow-sm hover:bg-rose-600 hover:text-white transition-all" title="Eliminar"><TrashIcon size={11}/></button>
                  </div>
                </div>
              </td>
              {days.map(day => {
                const dateKey = formatDateKey(year, month, day);
                const shift = overrides[person.id]?.[dateKey] || getShiftForDate(person.baseDate, person.startIndex, dateKey);
                const isSelected = selectedCell?.staffId === person.id && selectedCell?.dateKey === dateKey;
                
                return (
                  <td key={day} className="border-r border-slate-200 last:border-r-0 p-[1.5px] align-middle">
                    <button 
                      onClick={() => handleCellClick(person.id, dateKey, shift)}
                      className={`w-full h-full min-h-[32px] rounded font-black text-center border transition-all flex items-center justify-center text-[10px] hover:z-10 hover:scale-105 ${getShiftClass(shift)} ${isSelected ? 'ring-2 ring-indigo-500 scale-105 z-10 shadow-lg border-indigo-600' : ''}`}
                    >
                      {shift}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px] animate-in fade-in" onClick={() => setPickerOpen(false)}></div>
          <div className="relative bg-white w-[300px] h-full shadow-2xl animate-in slide-in-from-right flex flex-col border-l border-slate-800">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Cambiar Turno</h3>
                <p className="text-[11px] opacity-70 mt-1 font-bold truncate">
                  {selectedCell ? `${staff.find(s => s.id === selectedCell.staffId)?.name}` : ''}
                </p>
              </div>
              <button onClick={() => setPickerOpen(false)} className="text-4xl font-light hover:rotate-90 transition-transform">×</button>
            </div>
            
            <div className="p-6 grid grid-cols-3 gap-2 overflow-y-auto">
              <div className="col-span-3 text-[11px] uppercase font-black text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-1">Seleccionar Código</div>
              {ALL_SHIFTS.map((s) => (
                <button
                  key={s}
                  onClick={() => selectShift(s)}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${selectedCell?.currentShift === s ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-indigo-300'} ${getShiftClass(s)}`}
                >
                  <span className="text-[14px] font-black">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTable;
