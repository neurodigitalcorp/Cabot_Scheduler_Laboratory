import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StaffMember, AppData, Overrides, ShiftType, MailingConfig } from './types';
import { INITIAL_STAFF, STORAGE_KEY, MONTHS, SPECIAL_SHIFTS, SHIFT_LEGEND, STATUS_LEGEND, DEFAULT_MAILING_CONFIG, DEFAULT_LOGOS, SHIFT_CHANGE_PASSWORD } from './constants';
import ShiftTable from './components/ShiftTable';
import ConfigModal from './components/ConfigModal';
import AddStaffModal from './components/AddStaffModal';
import EditStaffModal from './components/EditStaffModal';
import RecalculateModal from './components/RecalculateModal';
import ShiftLookup from './components/ShiftLookup';
import PasswordModal from './components/PasswordModal';
import RepeatShiftModal from './components/RepeatShiftModal';
import DigitalClock from './components/DigitalClock';
import TutorialVideo from './components/TutorialVideo';
import EditModeToggle from './components/EditModeToggle';
import SaveStatusIndicator from './components/SaveStatusIndicator';
import { formatDateKey, getShiftForDate, getDaysInMonth } from './utils/dateUtils';
import { 
  CalendarIcon, 
  SettingsIcon, 
  PlusIcon,
  SaveIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  RefreshCwIcon,
  FileTextIcon,
  TableIcon,
  PlusCircleIcon,
  CheckIcon,
  UserIcon
} from './components/Icons';

const App: React.FC = () => {
  const isInitialized = useRef(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [resolvedSchedule, setResolvedSchedule] =
  useState<Record<string, Record<string, ShiftType>>>({});
  const [emails, setEmails] = useState<string[]>([]);
  const [mailingConfig, setMailingConfig] = useState<MailingConfig>(DEFAULT_MAILING_CONFIG);
  
  // Custom Logos State (Now fixed to Supabase URLs)
  const leftLogo = DEFAULT_LOGOS.left;
  const rightLogo = DEFAULT_LOGOS.right;

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isRecalcOpen, setIsRecalcOpen] = useState(false);
  const [selectedStaffForRecalc, setSelectedStaffForRecalc] = useState<StaffMember | null>(null);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [pendingShift, setPendingShift] = useState<{staffId: string, dateKey: string, shift: ShiftType} | null>(null);

    // New UI States
  const [isPlanningMode, setIsPlanningMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
useEffect(() => {
  const loadFromBackend = async () => {
    try {
      const month = currentDate.getMonth() + 1; // 1–12
      const year = currentDate.getFullYear();

      const response = await fetch(
        `/schedule/data?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error('No data from backend');
      }

      const result = await response.json();

      if (result && result.data) {
        // ✅ Caso normal: hay cronograma guardado
        setStaff(result.data.staff ?? INITIAL_STAFF);
        setOverrides(result.data.overrides ?? {});
        setResolvedSchedule(result.data.resolvedSchedule ?? {});
        setEmails(result.data.emails ?? []);
        setMailingConfig(
          result.data.mailingConfig ?? DEFAULT_MAILING_CONFIG
        );
      } else {
        // ✅ Mes sin data: usar base, PERO NO borrar resolvedSchedule
        setStaff(INITIAL_STAFF);
        setOverrides({});
        // ❌ NO setResolvedSchedule aquí
      }
    } catch (error) {
      console.error('Error cargando desde backend:', error);

      // ✅ Fallback seguro
      setStaff(INITIAL_STAFF);
      setOverrides({});
      // ❌ NO tocar resolvedSchedule aquí tampoco
    }
  };

  loadFromBackend();
}, [currentDate]);

const saveToBackend = useCallback(async () => {
  setSaveStatus("saving");

  try {
    // Diagnóstico opcional
    if (!resolvedSchedule || Object.keys(resolvedSchedule).length === 0) {
      console.warn(
        "⚠️ resolvedSchedule vacío al guardar — se completará solo una vez"
      );
    }

    const resolvedScheduleToSave: Record<string, Record<string, ShiftType>> =
      JSON.parse(JSON.stringify(resolvedSchedule || {}));

    const daysCount = getDaysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

    staff.forEach(person => {
      if (!resolvedScheduleToSave[person.id]) {
        resolvedScheduleToSave[person.id] = {};
      }

      for (let d = 1; d <= daysCount; d++) {
        const dateKey = formatDateKey(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          d
        );

        if (resolvedScheduleToSave[person.id][dateKey] == null) {
          resolvedScheduleToSave[person.id][dateKey] =
            overrides[person.id]?.[dateKey] ??
            getShiftForDate(
              person.baseDate,
              person.startIndex,
              dateKey
            );
        }
      }
    });

    await fetch("/schedule/data/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        data: {
          staff,
          overrides,
          resolvedSchedule: resolvedScheduleToSave,
          emails,
          mailingConfig,
        },
      }),
    });

    setResolvedSchedule(resolvedScheduleToSave);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  } catch (error) {
    console.error("Error guardando en backend:", error);
    setSaveStatus("idle");
    alert("Error guardando cronograma");
  }
}, [staff, overrides, emails, mailingConfig, currentDate, resolvedSchedule]);

  const triggerSave = () => {
    setIsPasswordModalOpen(true);
  };

  const confirmSave = () => {
    saveToBackend(staff, overrides, emails, mailingConfig, currentDate);
    setIsPasswordModalOpen(false);
    setHasUnsavedChanges(false);
  };

  const handleManualShiftChange = (staffId: string, dateKey: string, shift: ShiftType) => {
    if (!isPlanningMode) return;
    setHasUnsavedChanges(true);
    if (SPECIAL_SHIFTS.includes(shift)) {
      setPendingShift({ staffId, dateKey, shift });
      setIsRepeatModalOpen(true);
    } else {
      let newOverrides = { ...overrides };
      if (!newOverrides[staffId]) newOverrides[staffId] = {};
      newOverrides[staffId][dateKey] = shift;
      setOverrides(newOverrides);
    }
  };

  const confirmRepeatShift = (days: number) => {
    if (!pendingShift || !isPlanningMode) return;
    setHasUnsavedChanges(true);
    const { staffId, dateKey, shift } = pendingShift;
    let newOverrides = { ...overrides };
    const baseDate = new Date(dateKey + 'T00:00:00');
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + i);
      const key = formatDateKey(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      if (!newOverrides[staffId]) newOverrides[staffId] = {};
      newOverrides[staffId][key] = shift;
    }
    setOverrides(newOverrides);
    setIsRepeatModalOpen(false);
    setPendingShift(null);
  };

  const handleAddStaff = (name: string, role: string, startIndex: number) => {
    if (!isPlanningMode) return;
    setHasUnsavedChanges(true);
    const newMember: StaffMember = {
      id: `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      role,
      baseDate: '2026-02-01',
      startIndex: startIndex
    };
    const updated = [...staff, newMember];
    setStaff(updated);
    setIsAddStaffOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (!isPlanningMode) return;
    if (window.confirm('¿Está seguro de eliminar a esta persona de forma permanente?')) {
      setHasUnsavedChanges(true);
      const updatedStaff = staff.filter(s => s.id !== id);
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setStaff(updatedStaff);
      setOverrides(newOverrides);
    }
  };

  const handleUpdateStaff = (id: string, name: string, role: string) => {
    if (!isPlanningMode) return;
    setHasUnsavedChanges(true);
    const updated = staff.map(s => s.id === id ? { ...s, name, role } : s);
    setStaff(updated);
    setIsEditStaffOpen(false);
  };

  const handleRecalculate = (staffId: string, date: string, shift: ShiftType, seqIndex: number) => {
    if (!isPlanningMode) return;
    setHasUnsavedChanges(true);
    const updated = staff.map(s => s.id === staffId ? { ...s, baseDate: date, startIndex: seqIndex } : s);
    const staffOverrides = { ...overrides[staffId] };
    const filteredOverrides: Record<string, ShiftType> = {};
    const targetDate = new Date(date).getTime();
    Object.keys(staffOverrides).forEach(key => {
      if (new Date(key).getTime() < targetDate) {
        filteredOverrides[key] = staffOverrides[key];
      }
    });
    const newOverrides = { ...overrides, [staffId]: filteredOverrides };
    setOverrides(newOverrides);
    setStaff(updated);
    setIsRecalcOpen(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const exportToPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text(`Cronograma de Turnos - ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`, 14, 15);
    doc.setFontSize(10);
    doc.text('Laboratorio Cabot Colombia S.A.S', 14, 20);
    const daysCount = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const head = [['Nombre', 'Cargo', ...Array.from({ length: daysCount }, (_, i) => (i + 1).toString())]];
    const body = staff.map(person => {
      const row = [person.name, person.role];
      for (let d = 1; d <= daysCount; d++) {
  const dateKey = formatDateKey(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    d
  );

  row.push(
    resolvedSchedule?.[person.id]?.[dateKey]
    ?? overrides?.[person.id]?.[dateKey]
    ?? getShiftForDate(
         person.baseDate,
         person.startIndex,
         dateKey
       )
  );
}
      return row;
    });
    (doc as any).autoTable({
      head, body, startY: 25, styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [79, 70, 229] }, theme: 'grid'
    });
    doc.save(`Cronograma_Cabot_${MONTHS[currentDate.getMonth()]}_${currentDate.getFullYear()}.pdf`);
  };

  const exportToExcel = () => {
    const XLSX = (window as any).XLSX;
    const daysCount = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const headers = ['Nombre', 'Cargo', ...Array.from({ length: daysCount }, (_, i) => (i + 1).toString())];
    const data = staff.map(person => {
      const row = [person.name, person.role];
      for (let d = 1; d <= daysCount; d++) {
  const dateKey = formatDateKey(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    d
  );

  row.push(
    resolvedSchedule?.[person.id]?.[dateKey]
    ?? overrides?.[person.id]?.[dateKey]
    ?? getShiftForDate(
         person.baseDate,
         person.startIndex,
         dateKey
       )
  );
}
      return row;
    });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma");
    XLSX.writeFile(workbook, `Cronograma_Cabot_${MONTHS[currentDate.getMonth()]}_${currentDate.getFullYear()}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden">
      {/* HEADER CORPORATIVO CON LOGOS FIJOS DE SUPABASE SIN BORDES */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center" style={{ marginLeft: '1cm' }}>
          <div className="w-32 h-20 flex items-center justify-center overflow-hidden">
            <img src={leftLogo} alt="Logo neuroDIGITAL" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-black tracking-tight leading-none">Cabot Scheduler</h1>
          <h2 className="text-sm font-bold text-orange-500 mt-1">Tu Cronograma, Siempre a Tiempo</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest">By neuroDIGITAL Team</p>
        </div>

        <div className="flex items-center" style={{ marginRight: '1cm' }}>
          <div className="w-32 h-20 flex items-center justify-center overflow-hidden">
             <img src={rightLogo} alt="Logo Cabot" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      {/* BARRA DE ACCIONES CON POSICIONES INTERCAMBIADAS */}
      <div className="bg-white px-6 py-3 border-b border-slate-200 flex justify-between items-center">
        {/* LEYENDA CORPORATIVA IZQUIERDA (CON ICONO) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm">
              <CalendarIcon size={20} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[13px] font-black text-slate-900 leading-none">Laboratorio Cabot Colombia S.A.S</span>
              <span className="text-[10px] font-bold text-slate-500 mt-1 tracking-normal">Gestión de Turnos Rotativos</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTONES DE EXPORTACIÓN Y CONFIGURACIÓN */}
          <div className="flex gap-2 border border-slate-800 rounded-lg p-1.5 bg-slate-50 mr-2">
             <EditModeToggle isPlanningMode={isPlanningMode} onToggle={setIsPlanningMode} />
             <button onClick={exportToPDF} className="flex items-center gap-1 bg-white text-rose-600 border border-rose-200 px-4 py-1.5 rounded-md text-[10px] font-bold hover:bg-rose-50 transition-colors">
              <FileTextIcon size={14}/> PDF
            </button>
             <button onClick={exportToExcel} className="flex items-center gap-1 bg-white text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-md text-[10px] font-bold hover:bg-emerald-50 transition-colors">
              <TableIcon size={14}/> Excel
            </button>
            <button 
              onClick={() => setIsConfigOpen(true)} 
              disabled={!isPlanningMode}
              className={`p-1.5 rounded-md transition-all ${
                !isPlanningMode ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
              }`}
            >
              <SettingsIcon size={22}/>
            </button>
          </div>

          <button 
            onClick={() => setIsAddStaffOpen(true)} 
            disabled={!isPlanningMode}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
              !isPlanningMode ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-900'
            }`}
          >
            <UserIcon size={16}/> Persona
          </button>

          <button 
            onClick={triggerSave} 
            disabled={!isPlanningMode}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
              !isPlanningMode ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
              saveStatus === 'saved' ? 'bg-emerald-600 text-white' :
              saveStatus === 'saving' ? 'bg-slate-700 text-white animate-pulse' :
              'bg-black text-white hover:bg-slate-900'
            }`}
          >
            {saveStatus === 'saved' ? <CheckIcon size={14}/> : <SaveIcon size={14}/>}
            {saveStatus === 'saved' ? 'Guardado' : saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          {/* SELECTOR DE MES A LA DERECHA */}
          <div className="flex items-center bg-white rounded-lg p-1 border border-slate-800 shadow-sm ml-2">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 rounded-md text-indigo-700 active:scale-90"><ChevronLeftIcon size={18}/></button>
            <span className="px-3 font-black text-slate-800 min-w-[120px] text-center text-[12px] uppercase tracking-wider">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 rounded-md text-indigo-700 active:scale-90"><ChevronRightIcon size={18}/></button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-full bg-white rounded-xl shadow-xl border border-slate-800 overflow-hidden relative flex flex-col">
<ShiftTable
  staff={staff}
  overrides={overrides}
  resolvedSchedule={resolvedSchedule}
  year={currentDate.getFullYear()}
  month={currentDate.getMonth()}
  isPlanningMode={isPlanningMode}
  onShiftChange={handleManualShiftChange}
  onDeleteStaff={handleDeleteStaff}
  onEditStaff={(s) => {
    setSelectedStaffForEdit(s);
    setIsEditStaffOpen(true);
  }}
  onRecalc={(s) => {
    setSelectedStaffForRecalc(s);
    setIsRecalcOpen(true);
  }}
/>

        </div>

        {/* ÁREA DE LEYENDAS Y CONSULTA */}
        <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 px-2">
          {/* LEYENDAS REDUCIDAS SIGNIFICATIVAMENTE (-4 pt) */}
          <div className="bg-white p-1.5 rounded-lg border border-slate-800 shadow-md">
            <h3 className="text-[10px] font-black uppercase text-slate-900 mb-1.5 tracking-widest border-b border-slate-100 pb-0.5">Horarios de Turnos</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {SHIFT_LEGEND.map(l => (
                <div key={l.code} className="flex items-center gap-1.5">
                  <span className={`w-8 h-4.5 flex items-center justify-center rounded text-[9px] font-black border ${l.color}`}>{l.code}</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black leading-none text-slate-900">{l.time}</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{l.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white p-1.5 rounded-lg border border-slate-800 shadow-md">
              <h3 className="text-[10px] font-black uppercase text-slate-900 mb-1.5 tracking-widest border-b border-slate-100 pb-0.5">Estados y Ausencias</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {STATUS_LEGEND.map(l => (
                  <div key={l.code} className="flex items-center gap-1.5">
                    <span className="w-8 h-4.5 flex items-center justify-center rounded bg-slate-50 border border-slate-800 text-[9px] font-black">{l.code}</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">{l.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-800 shadow-md overflow-hidden">
              <SaveStatusIndicator hasUnsavedChanges={hasUnsavedChanges} />
            </div>
          </div>

          {/* COMPONENTE DE CONSULTA RÁPIDA */}
          <ShiftLookup staff={staff} overrides={overrides} resolvedSchedule={resolvedSchedule}/>
        </div>
      </main>

      {isConfigOpen && (
        <ConfigModal 
          emails={emails} 
          staff={staff}
          overrides={overrides}
          mailingConfig={mailingConfig}
          currentMonth={currentDate.getMonth()}
          currentYear={currentDate.getFullYear()}
          onClose={() => setIsConfigOpen(false)} 
          onSave={(e, config) => { 
            setEmails(e); 
            setMailingConfig(config);
            setIsConfigOpen(false); 
          }}
          onBatchRecalc={handleRecalculate}
        />
      )}
      {isAddStaffOpen && <AddStaffModal onClose={() => setIsAddStaffOpen(false)} onAdd={handleAddStaff} />}
      {isEditStaffOpen && selectedStaffForEdit && (
        <EditStaffModal 
          staff={selectedStaffForEdit} 
          onClose={() => setIsEditStaffOpen(false)} 
          onSave={handleUpdateStaff} 
        />
      )}
      {isRecalcOpen && selectedStaffForRecalc && (
        <RecalculateModal 
          staff={selectedStaffForRecalc} 
          year={currentDate.getFullYear()} 
          month={currentDate.getMonth()} 
          onClose={() => setIsRecalcOpen(false)} 
          onRecalc={handleRecalculate} 
        />
      )}
      {isPasswordModalOpen && (
        <PasswordModal 
          onConfirm={confirmSave} 
          onClose={() => setIsPasswordModalOpen(false)} 
        />
      )}

      {isRepeatModalOpen && pendingShift && (
        <RepeatShiftModal
          shift={pendingShift.shift}
          onConfirm={confirmRepeatShift}
          onClose={() => {
            setIsRepeatModalOpen(false);
            setPendingShift(null);
          }}
        />
      )}

      <DigitalClock />
      <TutorialVideo />
    </div>
  );
};

export default App;
