import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users 
} from 'lucide-react';
import { CalendarEvent, StaffMember, StaffMemberId } from '../types';
import { EVENT_CATEGORIES } from '../data/staffConfig';
import { ITALIAN_MONTHS, ITALIAN_DAYS_SHORT, formatDateItalian, getTodayString } from '../utils/dateUtils';

interface MonthlyCalendarProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  selectedMemberFilter: StaffMemberId | 'all';
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEventOnDate: (date: string) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  staffMembers,
  events,
  selectedDate,
  selectedMemberFilter,
  onSelectDate,
  onSelectEvent,
  onNewEventOnDate,
}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return { year: y, month: m }; // 1-indexed month
  });

  const todayStr = getTodayString();

  const handlePrevMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Generate matrix for month
  const { year, month } = currentYearMonth;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const totalDays = lastDayOfMonth.getDate();

  // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const firstDayWeekday = firstDayOfMonth.getDay();
  // Adjust so Monday is 0
  const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  const daysCells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const formatted = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysCells.push(formatted);
  }

  // Selected date events for the right sidebar or detail view
  let activeDayEvents = events.filter(e => e.date === selectedDate);
  if (selectedMemberFilter !== 'all') {
    activeDayEvents = activeDayEvents.filter(e => e.attendeeIds.includes(selectedMemberFilter));
  }
  activeDayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Left 2 Cols: Monthly Grid */}
      <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md p-5 sm:p-6">
        
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#E63946]" />
            <h3 className="text-lg sm:text-xl font-black text-[#121212] uppercase tracking-tight capitalize">
              {ITALIAN_MONTHS[month - 1]} {year}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border-2 border-slate-200 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              title="Mese precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCurrentYearMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
                onSelectDate(todayStr);
              }}
              className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg text-slate-800 hover:bg-slate-200 transition-colors"
            >
              Oggi
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              title="Mese successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header (Lun - Dom) */}
        <div className="grid grid-cols-7 text-center text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysCells.map((dayStr, idx) => {
            if (!dayStr) {
              return <div key={`empty-${idx}`} className="h-16 sm:h-20 bg-slate-50/60 rounded-xl" />;
            }

            const dayNum = Number(dayStr.split('-')[2]);
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedDate;

            let dayEvents = events.filter(e => e.date === dayStr);
            if (selectedMemberFilter !== 'all') {
              dayEvents = dayEvents.filter(e => e.attendeeIds.includes(selectedMemberFilter));
            }

            return (
              <div
                key={dayStr}
                onClick={() => onSelectDate(dayStr)}
                className={`h-16 sm:h-20 p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-50 border-[#E63946] shadow-md ring-2 ring-[#E63946]/20'
                    : isToday
                    ? 'bg-red-50/40 border-[#E63946]/50'
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black font-mono w-5 h-5 flex items-center justify-center rounded-lg ${
                    isToday ? 'bg-[#E63946] text-white' : isSelected ? 'text-[#E63946]' : 'text-slate-800'
                  }`}>
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-black text-white bg-[#121212] px-1.5 py-0.2 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Mini dots / event teasers */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[9px] font-bold truncate px-1 py-0.2 rounded bg-slate-100 text-slate-800"
                    >
                      {evt.startTime} {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] text-slate-500 font-bold pl-1">
                      +{dayEvents.length - 2} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Column: Selected Day Detail Sidebar */}
      <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-200 mb-4">
            <div>
              <h4 className="text-base font-black text-[#121212] uppercase tracking-tight capitalize">
                {formatDateItalian(selectedDate)}
              </h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Impegni programmati ({activeDayEvents.length})
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNewEventOnDate(selectedDate)}
              className="p-2 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl shadow-xs transition-colors"
              title="Aggiungi impegno per questo giorno"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeDayEvents.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs italic font-medium">
                Nessun impegno per la data selezionata.
              </div>
            ) : (
              activeDayEvents.map(evt => {
                const catCfg = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.staff_meeting;
                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={`p-3 rounded-xl border-2 text-xs cursor-pointer shadow-xs hover:shadow-md transition-all ${catCfg.bg} ${catCfg.border} border-l-4`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] font-black opacity-90 mb-1">
                      <span>{evt.startTime} - {evt.endTime}</span>
                      {evt.isUrgent && (
                        <span className="text-[9px] bg-[#E63946] text-white px-1.5 rounded font-black uppercase">
                          URGENTE
                        </span>
                      )}
                    </div>

                    <div className="font-black text-[#121212] text-xs mb-1">
                      {evt.title}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-700 font-semibold">
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-[#E63946]" />
                        <span className="truncate">{evt.location}</span>
                      </span>

                      <span className="flex items-center gap-1 font-bold text-slate-600">
                        <Users className="w-3 h-3 text-slate-500" />
                        {evt.attendeeIds.length}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNewEventOnDate(selectedDate)}
          className="w-full mt-5 py-2.5 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Fissa Impegno ({selectedDate.split('-')[2]}/{selectedDate.split('-')[1]})</span>
        </button>
      </div>

    </div>
  );
};

