
export type ShiftType = 'D1' | 'D2' | 'N1' | 'N2' | 'X1' | 'X2' | 'X3' | 'X4' | 'X5' | 'O' | 'L' | 'M' | 'P' | 'CD' | 'C' | 'V' | 'I';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  baseDate: string; // ISO format: YYYY-MM-DD (Referencia fija para cálculo)
  startIndex: number; // Índice en la secuencia SHIFT_SEQUENCE
}

export interface Overrides {
  [staffId: string]: {
    [dateKey: string]: ShiftType;
  };
}

export interface MailingConfig {
  sendDay: number;
  sendTime: string;
}

export interface AppData {
  staff: StaffMember[];
  overrides: Overrides;
  emails: string[];
  mailingConfig: MailingConfig;
  lastSaved: string;
  currentDate?: string; // Persistencia de la vista actual (ISO string)
}
