
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StaffMember, AppData, Overrides, ShiftType, MailingConfig } from './types';
import { INITIAL_STAFF, STORAGE_KEY, MONTHS, SPECIAL_SHIFTS, SHIFT_LEGEND, STATUS_LEGEND, DEFAULT_MAILING_CONFIG } from './constants';
import ShiftTable from './components/ShiftTable';
import ConfigModal from './components/ConfigModal';
import AddStaffModal from './components/AddStaffModal';
import EditStaffModal from './components/EditStaffModal';
import RecalculateModal from './components/RecalculateModal';
import ShiftLookup from './components/ShiftLookup';
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

const LOGO_STORAGE_KEY = 'cabot_custom_logos_v2';

const App: React.FC = () => {
  const isInitialized = useRef(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [emails, setEmails] = useState<string[]>([]);
  const [mailingConfig, setMailingConfig] = useState<MailingConfig>(DEFAULT_MAILING_CONFIG);
  
  // Custom Logos State
  const [leftLogo, setLeftLogo] = useState<string | null>(null);
  const [rightLogo, setRightLogo] = useState<string | null>(null);
  const leftLogoInput = useRef<HTMLInputElement>(null);
  const rightLogoInput = useRef<HTMLInputElement>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isRecalcOpen, setIsRecalcOpen] = useState(false);
  const [selectedStaffForRecalc, setSelectedStaffForRecalc] = useState<StaffMember | null>(null);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Load App Data
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: AppData = JSON.parse(savedData);
        if (parsed.staff && parsed.staff.length > 0) {
          setStaff(parsed.staff);
        } else {
          setStaff(INITIAL_STAFF);
        }
        setOverrides(parsed.overrides || {});
        setEmails(parsed.emails || []);
        setMailingConfig(parsed.mailingConfig || DEFAULT_MAILING_CONFIG);
        if (parsed.currentDate) {
          setCurrentDate(new Date(parsed.currentDate));
        }
      } catch (e) {
        console.error("Error cargando persistencia:", e);
        setStaff(INITIAL_STAFF);
      }
    } else {
      setStaff(INITIAL_STAFF);
    }

    // Load Logos Data
    const savedLogos = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedLogos) {
      try {
        const parsed = JSON.parse(savedLogos);
        if (parsed.left) setLeftLogo(parsed.left);
        if (parsed.right) setRightLogo(parsed.right);
      } catch (e) {}
    }

    isInitialized.current = true;
  }, []);

  const saveToStorage = useCallback((
    updatedStaff: StaffMember[], 
    updatedOverrides: Overrides, 
    updatedEmails: string[],
    updatedMailingConfig: MailingConfig,
    updatedDate: Date
  ) => {
    if (!isInitialized.current) return;
    setSaveStatus('saving');
    const data: AppData = {
      staff: updatedStaff,
      overrides: updatedOverrides,
      emails: updatedEmails,
      mailingConfig: updatedMailingConfig,
      lastSaved: new Date().toISOString(),
      currentDate: updatedDate.toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 2500);
  }, []);

  const triggerSave = () => {
    saveToStorage(staff, overrides, emails, mailingConfig, currentDate);
  };

  const handleLogoUpload = (side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newLogos = {
          left: side === 'left' ? base64 : leftLogo,
          right: side === 'right' ? base64 : rightLogo
        };
        if (side === 'left') setLeftLogo(base64);
        else setRightLogo(base64);
        localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(newLogos));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualShiftChange = (staffId: string, dateKey: string, shift: ShiftType) => {
    let newOverrides = { ...overrides };
    if (SPECIAL_SHIFTS.includes(shift)) {
      const daysStr = window.prompt(`¿Repetir ${shift} por cuántos días? (Ej: 5)`, "1");
      const days = parseInt(daysStr || "1");
      if (!isNaN(days) && days > 0) {
        const baseDate = new Date(dateKey + 'T00:00:00');
        for (let i = 0; i < days; i++) {
          const targetDate = new Date(baseDate);
          targetDate.setDate(baseDate.getDate() + i);
          const key = formatDateKey(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          if (!newOverrides[staffId]) newOverrides[staffId] = {};
          newOverrides[staffId][key] = shift;
        }
      }
    } else {
      if (!newOverrides[staffId]) newOverrides[staffId] = {};
      newOverrides[staffId][dateKey] = shift;
    }
    setOverrides(newOverrides);
    saveToStorage(staff, newOverrides, emails, mailingConfig, currentDate);
  };

  const handleAddStaff = (name: string, role: string, startIndex: number) => {
    const newMember: StaffMember = {
      id: `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      role,
      baseDate: '2026-02-01',
      startIndex: startIndex
    };
    const updated = [...staff, newMember];
    setStaff(updated);
    saveToStorage(updated, overrides, emails, mailingConfig, currentDate);
    setIsAddStaffOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar a esta persona de forma permanente?')) {
      const updatedStaff = staff.filter(s => s.id !== id);
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setStaff(updatedStaff);
      setOverrides(newOverrides);
      saveToStorage(updatedStaff, newOverrides, emails, mailingConfig, currentDate);
    }
  };

  const handleUpdateStaff = (id: string, name: string, role: string) => {
    const updated = staff.map(s => s.id === id ? { ...s, name, role } : s);
    setStaff(updated);
    saveToStorage(updated, overrides, emails, mailingConfig, currentDate);
    setIsEditStaffOpen(false);
  };

  const handleUpdatePhoto = (id: string, photo: string | undefined) => {
    const updated = staff.map(s => s.id === id ? { ...s, photo } : s);
    setStaff(updated);
    saveToStorage(updated, overrides, emails, mailingConfig, currentDate);
  };

  const handleRecalculate = (staffId: string, date: string, shift: ShiftType, seqIndex: number) => {
    const updated = staff.map(s => s.id === staffId ? { ...s, baseDate: date, startIndex: seqIndex } : s);
    const staffOverrides = { ...overrides[staffId] } || {};
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
    saveToStorage(updated, newOverrides, emails, mailingConfig, currentDate);
    setIsRecalcOpen(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    saveToStorage(staff, overrides, emails, mailingConfig, newDate);
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
        const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), d);
        row.push(overrides[person.id]?.[dateKey] || getShiftForDate(person.baseDate, person.startIndex, dateKey));
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
        const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), d);
        row.push(overrides[person.id]?.[dateKey] || getShiftForDate(person.baseDate, person.startIndex, dateKey));
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
      {/* HEADER CORPORATIVO CON LOGOS MANUALES GRANDES (+3 pt) Y TEXTOS AJUSTADOS */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <input type="file" ref={leftLogoInput} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} />
        <input type="file" ref={rightLogoInput} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} />
        
        <div className="flex items-center" style={{ marginLeft: '1cm' }}>
          <div 
            onClick={() => leftLogoInput.current?.click()}
            className="w-32 h-20 border-2 border-slate-200 border-dashed rounded-lg bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
          >
            {leftLogo ? <img src={leftLogo} alt="Logo Izquierdo" className="w-full h-full object-contain" /> : <div className="text-[9px] font-bold text-slate-400 text-center px-1 uppercase tracking-tighter">Subir Logo neuroDIGITAL</div>}
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-black tracking-tight leading-none">Cabot Scheduler</h1>
          <h2 className="text-sm font-bold text-orange-500 mt-1">Tu Cronograma, Siempre a Tiempo</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest">By neuroDIGITAL Team</p>
        </div>

        <div className="flex items-center" style={{ marginRight: '1cm' }}>
          <div 
            onClick={() => rightLogoInput.current?.click()}
            className="w-32 h-20 border-2 border-slate-200 border-dashed rounded-lg bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
          >
             {rightLogo ? <img src={rightLogo} alt="Logo Derecho" className="w-full h-full object-contain" /> : <div className="text-[9px] font-bold text-slate-400 text-center px-1 uppercase tracking-tighter">Subir Logo Cabot</div>}
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
             <button onClick={exportToPDF} className="flex items-center gap-1 bg-white text-rose-600 border border-rose-200 px-4 py-1.5 rounded-md text-[10px] font-bold hover:bg-rose-50 transition-colors">
              <FileTextIcon size={14}/> PDF
            </button>
             <button onClick={exportToExcel} className="flex items-center gap-1 bg-white text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-md text-[10px] font-bold hover:bg-emerald-50 transition-colors">
              <TableIcon size={14}/> Excel
            </button>
            <button onClick={() => setIsConfigOpen(true)} className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all"><SettingsIcon size={22}/></button>
          </div>

          <button onClick={() => setIsAddStaffOpen(true)} className="flex items-center gap-1.5 bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95">
            <UserIcon size={16}/> Persona
          </button>

          <button onClick={triggerSave} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
            saveStatus === 'saved' ? 'bg-emerald-600 text-white' :
            saveStatus === 'saving' ? 'bg-slate-700 text-white animate-pulse' :
            'bg-black text-white hover:bg-slate-900'
          }`}>
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
            year={currentDate.getFullYear()} 
            month={currentDate.getMonth()}
            onShiftChange={handleManualShiftChange}
            onDeleteStaff={handleDeleteStaff}
            onEditStaff={(s) => { setSelectedStaffForEdit(s); setIsEditStaffOpen(true); }}
            onRecalc={(s) => { setSelectedStaffForRecalc(s); setIsRecalcOpen(true); }}
            onPhotoChange={handleUpdatePhoto}
          />
        </div>

        {/* ÁREA DE LEYENDAS Y CONSULTA */}
        <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 px-2">
          {/* LEYENDAS REDUCIDAS SIGNIFICATIVAMENTE (-4 pt) */}
          <div className="bg-white p-1.5 rounded-lg border border-slate-800 shadow-md">
            <h3 className="text-[8px] font-black uppercase text-slate-900 mb-1.5 tracking-widest border-b border-slate-100 pb-0.5">Horarios de Turnos</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {SHIFT_LEGEND.map(l => (
                <div key={l.code} className="flex items-center gap-1.5">
                  <span className={`w-8 h-4.5 flex items-center justify-center rounded text-[7px] font-black border ${l.color}`}>{l.code}</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black leading-none text-slate-900">{l.time}</span>
                    <span className="text-[6px] text-slate-500 font-bold uppercase tracking-tighter">{l.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-1.5 rounded-lg border border-slate-800 shadow-md">
            <h3 className="text-[8px] font-black uppercase text-slate-900 mb-1.5 tracking-widest border-b border-slate-100 pb-0.5">Estados y Ausencias</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {STATUS_LEGEND.map(l => (
                <div key={l.code} className="flex items-center gap-1.5">
                  <span className="w-8 h-4.5 flex items-center justify-center rounded bg-slate-50 border border-slate-800 text-[7px] font-black">{l.code}</span>
                  <span className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COMPONENTE DE CONSULTA RÁPIDA */}
          <ShiftLookup staff={staff} overrides={overrides} />
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
            saveToStorage(staff, overrides, e, config, currentDate); 
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
    </div>
  );
};

export default App;
