import { StaffMember, ShiftType, MailingConfig } from './types';

// Secuencia oficial MANDATORIA de 10 días
export const SHIFT_SEQUENCE: ShiftType[] = ['D1', 'D2', 'N1', 'N2', 'X1', 'X2', 'X3', 'X4', 'X5', 'O'];

// Todos los turnos posibles incluyendo especiales
export const ALL_SHIFTS: ShiftType[] = ['D1', 'D2', 'N1', 'N2', 'X1', 'X2', 'X3', 'X4', 'X5', 'O', 'L', 'M', 'P', 'CD', 'C', 'V', 'I'];

export const SEQUENCE_INFO = [
  { label: 'D1 (Diurno 1)', index: 0 },
  { label: 'D2 (Diurno 2)', index: 1 },
  { label: 'N1 (Nocturno 1)', index: 2 },
  { label: 'N2 (Nocturno 2)', index: 3 },
  { label: 'X1 (Descanso 1)', index: 4 },
  { label: 'X2 (Descanso 2)', index: 5 },
  { label: 'X3 (Descanso 3)', index: 6 },
  { label: 'X4 (Descanso 4)', index: 7 },
  { label: 'X5 (Descanso 5)', index: 8 },
  { label: 'O (Oficina)', index: 9 },
];

// Configuración base oficial FEBRERO 2026 (Según PDF corregido)
export const INITIAL_STAFF: StaffMember[] = [
  { 
    id: 'atila-1', 
    name: 'Atila Manjarres', 
    role: 'Analista de Laboratorio Senior', 
    baseDate: '2026-02-01', 
    startIndex: 3,
    photo: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Staff/1.Atila.png'
  },
  { 
    id: 'sebastian-1', 
    name: 'Sebastián Álvarez', 
    role: 'Analista de Laboratorio', 
    baseDate: '2026-02-01', 
    startIndex: 9,
    photo: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Staff/2.Sebastian.png'
  },
  { 
    id: 'andres-1', 
    name: 'Andrés E. Macias', 
    role: 'Analista de Laboratorio', 
    baseDate: '2026-02-01', 
    startIndex: 1,
    photo: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Staff/3.Andres.png'
  },
  { 
    id: 'jose-ruiz-1', 
    name: 'José Ruiz', 
    role: 'Analista de Laboratorio', 
    baseDate: '2026-02-01', 
    startIndex: 5,
    photo: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Staff/4.Jose_D.png'
  },
  { 
    id: 'jose-armenta-1', 
    name: 'José Armenta', 
    role: 'Analista de Laboratorio', 
    baseDate: '2026-02-01', 
    startIndex: 7,
    photo: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Staff/5.Jose_A.png'
  }
];

export const DEFAULT_MAILING_CONFIG: MailingConfig = {
  sendDay: 29,
  sendTime: '14:30'
};

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Versión 7: Forzar reemplazo para aplicar fotos de Supabase
export const STORAGE_KEY = 'cabot_shift_scheduler_v7';

// Contraseña para cambios manuales
export const SHIFT_CHANGE_PASSWORD = 'neuro2026+';

export const DEFAULT_LOGOS = {
  left: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Logos/logo-left.png',
  right: 'https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/assets/Logos/logo-right.png'
};

export const SPECIAL_SHIFTS: ShiftType[] = ['V', 'CD', 'C', 'P', 'I', 'L', 'M', 'O'];

export const SHIFT_LEGEND = [
  { code: 'D1/D2', time: '06:00–18:00', desc: 'Diurno', color: 'bg-orange-100 border-orange-400' },
  { code: 'N1/N2', time: '18:00–06:00', desc: 'Nocturno', color: 'bg-purple-100 border-purple-400' },
  { code: 'O', time: '07:30–16:00', desc: 'Oficina', color: 'bg-slate-100 border-slate-400' },
  { code: 'L', time: '06:00–14:00', desc: 'Mañana', color: 'bg-cyan-50 border-cyan-400' },
  { code: 'M', time: '14:00–22:00', desc: 'Tarde', color: 'bg-orange-50 border-orange-400' },
];

export const STATUS_LEGEND = [
  { code: 'P', desc: 'Permiso' },
  { code: 'CD', desc: 'Calamidad' },
  { code: 'C', desc: 'Compensado' },
  { code: 'V', desc: 'Vacaciones' },
  { code: 'I', desc: 'Incapacidad' },
  { code: 'X1-X5', desc: 'Descanso' },
];
