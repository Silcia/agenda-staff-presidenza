import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter
} from 'lucide-react';
import { CalendarEvent, StaffMember, StaffMemberId } from '../types';
import { EVENT_CATEGORIES, STATUS_CONFIGS } from '../data/staffConfig';
import { getWeekDays, formatDateShortItalian, addDays, getTodayString } from '../utils/dateUtils';

interface WeeklyCalendarProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  selectedMemberFilter: StaffMemberId | 'all';
  onChangeDate: (date: string) => void;
  onSelectMemberFilter: (id: StaffMemberId | 'all') => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEventOnDate: (date: string) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  staffMembers,
  events,
  selectedDate,
  selectedMemberFilter,
  onChangeDate,
  onSelectMemberFilter,
  onSelectEvent,
  onNewEventOnDate,
}) => {
  const weekDays = getWeekDays(selectedDate);
  const todayStr = getTodayString();

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md overflow-hidden mb-8">
      {/* Week Header Navigation */}
      <div className="px-5 py-4 border-b-2 border-slate-200 bg-[#FAFAFA] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center bg-white rounded-xl border-2 border-slate-300 shadow-xs p-1">
            <button
              type="button"
              onClick={() => onChangeDate(addDays(selectedDate, -7))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Settimana precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(todayStr)}
              className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Settimana Corrente
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(addDays(selectedDate, 7))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Settimana successiva"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-tight">
              Settimana: {formatDateShortItalian(weekDays[0])} – {formatDateShortItalian(weekDays[5])}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Impegni di staff distribuiti da Lunedì a Sabato
            </p>
          </div>
        </div>

        {/* Member filter selector inside week view */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#E63946]" /> Filtra Membro:
          </span>
          <select
            value={selectedMemberFilter}
            onChange={(e) => onSelectMemberFilter(e.target.value as StaffMemberId | 'all')}
            className="text-xs px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-800 font-bold uppercase tracking-tight focus:border-[#E63946] focus:outline-none"
          >
            <option value="all">TUTTO LO STAFF (TUTTI)</option>
            {staffMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name.toUpperCase()} ({m.shortRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6-Day Columns Grid (Lunedì - Sabato) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x-2 divide-slate-200 min-h-[500px]">
        {weekDays.map((dayStr) => {
          const isToday = dayStr === todayStr;
          let dayEvents = events.filter(e => e.date === dayStr);

          if (selectedMemberFilter !== 'all') {
            dayEvents = dayEvents.filter(e => e.attendeeIds.includes(selectedMemberFilter));
          }

          dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={dayStr}
              className={`p-3.5 flex flex-col justify-between ${
                isToday ? 'bg-rose-50/30' : 'bg-white'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b-2 border-slate-200">
                  <div>
                    <div className={`text-xs font-black uppercase tracking-tight ${isToday ? 'text-[#E63946]' : 'text-[#121212]'}`}>
                      {formatDateShortItalian(dayStr)}
                    </div>
                    {isToday && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#E63946] text-white px-1.5 py-0.2 rounded">
                        Oggi
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNewEventOnDate(dayStr)}
                    className="p-1 text-slate-400 hover:text-[#E63946] hover:bg-slate-100 rounded-lg transition-colors"
                    title={`Aggiungi impegno per ${dayStr}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Events List */}
                <div className="space-y-2.5">
                  {dayEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic font-medium">
                      Nessun impegno
                    </div>
                  ) : (
                    dayEvents.map((evt) => {
                      const catCfg = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.staff_meeting;
                      return (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className={`p-2.5 rounded-xl border-2 text-xs cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] transition-all ${catCfg.bg} ${catCfg.border} border-l-4`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-black text-slate-800 mb-1">
                            <span>{evt.startTime} - {evt.endTime}</span>
                            {evt.isUrgent && (
                              <span className="text-[9px] bg-[#E63946] text-white px-1 rounded font-black uppercase">
                                URG
                              </span>
                            )}
                          </div>
                          
                          <div className="font-black text-[#121212] text-xs leading-snug line-clamp-2 mb-1.5">
                            {evt.title}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-700 mt-1 font-semibold">
                            <span className="truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-[#E63946]" />
                              <span className="truncate">{evt.location}</span>
                            </span>

                            <div className="flex items-center -space-x-1 ml-1 flex-shrink-0">
                              {evt.attendeeIds.map(id => {
                                const m = staffMembers.find(sm => sm.id === id);
                                return (
                                  <div
                                    key={id}
                                    className="w-4 h-4 rounded-full bg-[#121212] text-white text-[8px] font-bold flex items-center justify-center border border-white"
                                    title={m?.name}
                                  >
                                    {m?.avatarInitials}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Add footer button */}
              <button
                type="button"
                onClick={() => onNewEventOnDate(dayStr)}
                className="mt-4 w-full py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-[#E63946] hover:bg-slate-100 rounded-xl transition-all border-2 border-dashed border-slate-300 flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#E63946]" /> Aggiungi
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

