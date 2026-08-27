import React from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffMemberId } from '../types';
import { EVENT_CATEGORIES, STATUS_CONFIGS } from '../data/staffConfig';
import { formatDateItalian, timeToMinutes, addDays, getTodayString } from '../utils/dateUtils';

interface ScheduleMatrixProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSlotClick: (memberId: StaffMemberId, time: string) => void;
  onOpenFindFreeSlots: () => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  staffMembers,
  events,
  selectedDate,
  onChangeDate,
  onSelectEvent,
  onSlotClick,
  onOpenFindFreeSlots,
}) => {
  const isToday = selectedDate === getTodayString();
  const dayEvents = events.filter(e => e.date === selectedDate);

  // Helper to compute event position and height inside an hourly grid (each hour = 70px)
  const START_HOUR = 8;
  const PIXELS_PER_HOUR = 70;

  const getEventStyle = (event: CalendarEvent) => {
    const startMin = timeToMinutes(event.startTime);
    const endMin = timeToMinutes(event.endTime);
    const durationMin = Math.max(endMin - startMin, 25);

    const topPx = ((startMin - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
    const heightPx = Math.max((durationMin / 60) * PIXELS_PER_HOUR - 4, 34);

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`,
    };
  };

  // Current time line calculation
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isWithinWorkingHours = currentMinutes >= 8 * 60 && currentMinutes <= 18 * 60;
  const currentLineTop = ((currentMinutes - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md overflow-hidden mb-8">
      {/* Matrix Controls Header */}
      <div className="px-5 py-4 border-b-2 border-slate-200 bg-[#FAFAFA] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center bg-white rounded-xl border-2 border-slate-300 shadow-xs p-1">
            <button
              type="button"
              onClick={() => onChangeDate(addDays(selectedDate, -1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Giorno precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(getTodayString())}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg transition-colors ${
                isToday
                  ? 'bg-[#E63946] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Oggi
            </button>
            <button
              type="button"
              onClick={() => onChangeDate(addDays(selectedDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Giorno successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E63946]" />
              <h3 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-tight capitalize">
                {formatDateItalian(selectedDate)}
              </h3>
              {isToday && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#E63946] text-white">
                  Oggi
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block mt-0.5">
              Visualizzazione comparativa oraria simultanea (ore 08:00 - 18:00)
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFindFreeSlots}
            className="text-xs font-black uppercase tracking-wider text-[#F1FAEE] bg-[#1D3557] hover:bg-[#152744] border-2 border-[#457B9D] px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A8DADC]" />
            <span>Trova Slot Libero Comune</span>
          </button>
        </div>
      </div>

      {/* Main Parallel Columns Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          
          {/* Column Headers (5 Staff Members) */}
          <div className="grid grid-cols-[75px_repeat(5,1fr)] border-b-2 border-slate-300 bg-[#121212] text-white sticky top-0 z-10 shadow-sm">
            <div className="p-3 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-r border-[#2A2A2A] flex items-center justify-center">
              Ora
            </div>
            {staffMembers.map((member) => {
              const memberEventsCount = dayEvents.filter(e => e.attendeeIds.includes(member.id)).length;
              const statusCfg = STATUS_CONFIGS[member.currentStatus];
              return (
                <div
                  key={member.id}
                  className="p-3 border-r border-[#2A2A2A] last:border-r-0 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      member.id === 'sanvitale' ? 'bg-[#E63946] text-white' : 'bg-slate-800 text-white border border-slate-700'
                    }`}>
                      {member.avatarInitials}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black uppercase tracking-tight text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {member.shortRole}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#2A2A2A] text-[10px]">
                    <span className="flex items-center gap-1 text-slate-300 font-bold uppercase tracking-wider">
                      <span className={`w-2 h-2 rounded-full ${statusCfg?.dotColor || 'bg-slate-400'}`} />
                      {statusCfg?.shortLabel}
                    </span>
                    <span className="font-mono font-black text-slate-200 bg-white/10 px-1.5 py-0.2 rounded">
                      {memberEventsCount} {memberEventsCount === 1 ? 'imp.' : 'imp.'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Rows and Event Blocks Container */}
          <div className="relative grid grid-cols-[75px_repeat(5,1fr)] bg-white" style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}>
            
            {/* Background Grid Horizontal Hour Lines */}
            {HOURS.map((hour, idx) => (
              <React.Fragment key={hour}>
                {/* Time Label */}
                <div 
                  className="absolute left-0 w-[75px] text-center text-xs font-mono font-bold text-slate-700 bg-slate-50 border-r-2 border-slate-200 flex items-start justify-center pt-1.5"
                  style={{ top: `${idx * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                >
                  {hour}
                </div>

                {/* Horizontal Guide Lines */}
                <div
                  className="absolute left-[75px] right-0 border-b border-slate-200 pointer-events-none"
                  style={{ top: `${idx * PIXELS_PER_HOUR}px` }}
                />
              </React.Fragment>
            ))}

            {/* Current Live Time Indicator Bar (if viewing today) */}
            {isToday && isWithinWorkingHours && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${currentLineTop}px` }}
              >
                <div className="w-[75px] bg-[#E63946] text-white text-[10px] font-black font-mono px-1 py-0.5 text-center rounded-r shadow-md uppercase tracking-wider">
                  {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1 h-0.5 bg-[#E63946] shadow-sm" />
              </div>
            )}

            {/* Empty column slots to allow 1-click new event creation */}
            <div className="col-start-1 col-span-1 border-r-2 border-slate-200" />
            
            {staffMembers.map((member, colIdx) => {
              const memberEvents = dayEvents.filter(e => e.attendeeIds.includes(member.id));
              
              return (
                <div
                  key={member.id}
                  className="relative border-r border-slate-200 last:border-r-0 h-full"
                >
                  {/* Clickable hour blocks for creating events */}
                  {HOURS.map((hour, hIdx) => (
                    <div
                      key={hour}
                      onClick={() => onSlotClick(member.id, hour)}
                      className="group absolute w-full hover:bg-red-50/40 cursor-pointer transition-colors border-b border-slate-100 flex items-center justify-center"
                      style={{ top: `${hIdx * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px` }}
                      title={`Clicca per aggiungere impegno per ${member.name} alle ${hour}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase tracking-wider text-white bg-[#121212] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 transition-opacity">
                        <Plus className="w-3 h-3 text-[#E63946]" /> Aggiungi {hour}
                      </span>
                    </div>
                  ))}

                  {/* Render Event Boxes in this member's column */}
                  {memberEvents.map((evt) => {
                    const style = getEventStyle(evt);
                    const catCfg = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.staff_meeting;
                    const isMultiStaff = evt.attendeeIds.length > 1;

                    return (
                      <div
                        key={`${evt.id}-${member.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        style={style}
                        className={`absolute left-1 right-1 rounded-xl p-2 z-20 cursor-pointer shadow-sm border-2 transition-transform hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between overflow-hidden ${catCfg.bg} ${catCfg.border} border-l-4`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-mono text-[10px] font-black tracking-tight text-slate-800 truncate">
                              {evt.startTime} - {evt.endTime}
                            </span>
                            {evt.isUrgent && (
                              <span className="px-1.5 py-0.2 bg-[#E63946] text-white text-[9px] font-black uppercase rounded">
                                URGENTE
                              </span>
                            )}
                            {isMultiStaff && (
                              <span className="flex items-center gap-0.5 text-[9px] font-black text-[#1D3557] bg-[#A8DADC]/40 px-1 rounded" title={`${evt.attendeeIds.length} membri coinvolti`}>
                                <Users className="w-2.5 h-2.5" />
                                {evt.attendeeIds.length}
                              </span>
                            )}
                          </div>
                          
                          <div className="font-black text-xs leading-tight line-clamp-2 text-[#121212]">
                            {evt.title}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 truncate mt-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-[#E63946]" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* Footer Legend */}
      <div className="px-5 py-3.5 bg-[#FAFAFA] border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3.5 text-[11px]">
          <span className="font-black uppercase tracking-wider text-slate-600">Categorie:</span>
          {Object.values(EVENT_CATEGORIES).slice(0, 6).map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-xs ${cat.border.replace('border-l-', 'bg-')}`} />
              <span className="text-slate-800 font-bold">{cat.label}</span>
            </div>
          ))}
        </div>
        <div className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">
          Suggerimento: clicca su un intervallo orario vuoto per fissare un impegno.
        </div>
      </div>
    </div>
  );
};

