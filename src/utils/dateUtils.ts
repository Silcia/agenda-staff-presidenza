import { CalendarEvent, StaffMemberId } from '../types';

export const ITALIAN_DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
export const ITALIAN_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
export const ITALIAN_MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export function formatDateItalian(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;
  const dayName = ITALIAN_DAYS[date.getDay()] || '';
  const monthName = ITALIAN_MONTHS[month - 1] || '';
  return `${dayName} ${day} ${monthName} ${year}`;
}

export function formatDateShortItalian(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;
  const dayName = ITALIAN_DAYS_SHORT[date.getDay()] || '';
  const monthName = (ITALIAN_MONTHS[month - 1] || '').substring(0, 3);
  return `${dayName} ${day} ${monthName}`;
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDays(referenceDateStr: string): string[] {
  const [year, month, day] = referenceDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const currentDayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon
  
  // School week: Monday to Saturday (6 days)
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const days: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${dd}`);
  }
  return days;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Find free slots for a given list of members on a specific date
export interface FreeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export function findCommonFreeSlots(
  events: CalendarEvent[],
  selectedMemberIds: StaffMemberId[],
  date: string,
  minDurationMinutes: number = 30,
  dayStartMinutes: number = 8 * 60, // 08:00
  dayEndMinutes: number = 18 * 60   // 18:00
): FreeSlot[] {
  // Filter events for the day that involve at least one of the selected members
  const dayEvents = events.filter(e => 
    e.date === date && 
    e.attendeeIds.some(id => selectedMemberIds.includes(id))
  );

  // Create minute-by-minute occupancy array
  const totalMinutes = dayEndMinutes - dayStartMinutes;
  const occupied = new Array(totalMinutes).fill(false);

  for (const evt of dayEvents) {
    const evtStart = Math.max(timeToMinutes(evt.startTime), dayStartMinutes);
    const evtEnd = Math.min(timeToMinutes(evt.endTime), dayEndMinutes);

    for (let m = evtStart; m < evtEnd; m++) {
      const idx = m - dayStartMinutes;
      if (idx >= 0 && idx < totalMinutes) {
        occupied[idx] = true;
      }
    }
  }

  // Find continuous free blocks
  const freeSlots: FreeSlot[] = [];
  let blockStart: number | null = null;

  for (let i = 0; i <= totalMinutes; i++) {
    const isFree = i < totalMinutes ? !occupied[i] : false;

    if (isFree && blockStart === null) {
      blockStart = i;
    } else if (!isFree && blockStart !== null) {
      const duration = i - blockStart;
      if (duration >= minDurationMinutes) {
        freeSlots.push({
          startTime: minutesToTime(dayStartMinutes + blockStart),
          endTime: minutesToTime(dayStartMinutes + i),
          durationMinutes: duration,
        });
      }
      blockStart = null;
    }
  }

  return freeSlots;
}

export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'poco fa';
  if (diffMins < 60) return `${diffMins} min fa`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ore fa`;
  return `${Math.floor(diffHours / 24)} gg fa`;
}
