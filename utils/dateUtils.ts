
import { SHIFT_SEQUENCE } from '../constants';
import { ShiftType } from '../types';

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const formatDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const getShiftForDate = (
  baseDate: string,
  startIndex: number,
  targetDateStr: string
): ShiftType => {
  const base = new Date(baseDate + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');
  
  // Normalize dates to midnight for consistent math
  base.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const sequenceLength = SHIFT_SEQUENCE.length;
  let index = (startIndex + diffDays) % sequenceLength;
  if (index < 0) index += sequenceLength;
  
  return SHIFT_SEQUENCE[index];
};

export const isToday = (year: number, month: number, day: number): boolean => {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
};
