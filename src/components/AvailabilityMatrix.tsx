import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Sparkles, 
  Plus, 
  MapPin, 
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffMemberId } from '../types';
import { EVENT_CATEGORIES, STATUS_CONFIGS } from '../data/staffConfig';
import { formatDateItalian, timeToMinutes, addDays, getTodayString } from '../utils/dateUtils';

interface AvailabilityMatrixProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSlotClick: (memberId: StaffMemberId, time: string) => void;
  onOpenFindFreeSlots: () => void;
  onPlanMeetingForSlot: (time: string, availableMembers: StaffMemberId[]) => void;
}

// 30-minute intervals from 08:00 to 18:00
const TIME_SLOTS_30 = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30'
];

const TIME_SLOTS_60 = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const AvailabilityMatrix: React.FC<AvailabilityMatrixProps> = ({
  staffMembers,
  events,
  selectedDate,
  onChangeDate,
  onSelectEvent,
  onSlotClick,
  onOpenFindFreeSlots,
  onPlanMeetingForSlot,
}) => {
  const [slotGranularity, setSlotGranularity] = useState<'30' | '60'>('30');
  const [onlyCommonFree, setOnlyCommonFree] = useState<boolean>(false);

  const isToday = selectedDate === getTodayString();
  const dayEvents = events.filter(e => e.date === selectedDate);
  const slots = slotGranularity === '30' ? TIME_SLOTS_30 : TIME_SLOTS_60;
  const slotDuration = slotGranularity === '30' ? 30 : 60;

  // Helper to check if a member has an event overlapping with a slot
  const getMemberEventForSlot = (memberId: StaffMemberId, slotStart: string) => {
    const slotStartMin = timeToMinutes(slotStart);
    const slotEndMin = slotStartMin + slotDuration;

    return dayEvents.find(evt => {
      if (!evt.attendeeIds.includes(memberId)) return false;
      const evtStartMin = timeToMinutes(evt.startTime);
      const evtEndMin = timeToMinutes(evt.endTime);
      // Overlap condition
      return Math.max(slotStartMin, evtStartMin) < Math.min(slotEndMin, evtEndMin);
    });
  };

  // Compute common free stats for the day
  const slotsAnalysis = slots.map(slot => {
    const freeMembers: StaffMember[] = [];
    const busyMembers: { member: StaffMember; event: CalendarEvent }[] = [];

    staffMembers.forEach(member => {
      const evt = getMemberEventForSlot(member.id, slot);
      if (evt) {
        busyMembers.push({ member, event: evt });
      } else {
        freeMembers.push(member);
      }
    });

    return {
      slot,
      freeMembers,
      busyMembers,
      isAllFree: freeMembers.length === staffMembers.length,
      freeCount: freeMembers.length,
      totalCount: staffMembers.length,
    };
  });

  const allFreeSlotsCount = slotsAnalysis.filter(s => s.isAllFree).length;
  const displayedSlots = onlyCommonFree 
    ? slotsAnalysis.filter(s => s.freeCount >= Math.ceil(staffMembers.length / 2))
    : slotsAnalysis;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md overflow-hidden mb-8">
      
      {/* Top Header Controls */}
      <div className="px-5 py-4 border-b-2 border-slate-200 bg-[#FAFAFA] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-3.5">
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
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Vista Disponibilità (Libero / Occupato)
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block mt-0.5">
              Matrice chiara dello stato di ciascun componente dello staff ora per ora
            </p>
          </div>
        </div>

        {/* View Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Granularity Toggle */}
          <div className="flex items-center bg-white rounded-xl border-2 border-slate-300 p-1 text-xs font-black uppercase">
            <button
              type="button"
              onClick={() => setSlotGranularity('30')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                slotGranularity === '30' 
                  ? 'bg-[#121212] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              30 Min
            </button>
            <button
              type="button"
              onClick={() => setSlotGranularity('60')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                slotGranularity === '60' 
                  ? 'bg-[#121212] text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1 Ora
            </button>
          </div>

          {/* Majority Free Filter */}
          <button
            type="button"
            onClick={() => setOnlyCommonFree(!onlyCommonFree)}
            className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              onlyCommonFree
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Fasce con Maggioranza Libera</span>
          </button>

          {/* Quick Find Free Slot modal trigger */}
          <button
            type="button"
            onClick={onOpenFindFreeSlots}
            className="text-xs font-black uppercase tracking-wider text-[#F1FAEE] bg-[#1D3557] hover:bg-[#152744] border-2 border-[#457B9D] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A8DADC]" />
            <span>Trova Slot Libero</span>
          </button>

        </div>
      </div>

      {/* Daily Free Stats Banner */}
      <div className="bg-[#121212] text-white px-5 py-3 border-b-2 border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
            <span className="font-black uppercase tracking-wider text-emerald-400">Verde: Libero / Disponibile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-300" />
            <span className="font-black uppercase tracking-wider text-rose-300">Rosso: Occupato con Impegno</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300">
          <span>Finestre con 100% staff disponibile:</span>
          <span className="font-mono font-black text-white bg-emerald-600 px-2 py-0.5 rounded-lg">
            {allFreeSlotsCount} {allFreeSlotsCount === 1 ? 'finestra' : 'finestre'}
          </span>
        </div>
      </div>

      {/* Main Table Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="bg-[#1C1C1C] text-white border-b-2 border-slate-300">
              <th className="p-3.5 w-32 border-r border-[#2E2E2E] text-center text-xs font-black uppercase tracking-widest text-slate-400">
                Fascia Oraria
              </th>
              <th className="p-3.5 w-44 border-r border-[#2E2E2E] text-xs font-black uppercase tracking-wider text-slate-300 text-center">
                Disponibilità Staff
              </th>
              {staffMembers.map((member) => (
                <th key={member.id} className="p-3.5 border-r border-[#2E2E2E] last:border-r-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                      member.id === 'sanvitale' ? 'bg-[#E63946]' : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {member.avatarInitials}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black uppercase tracking-tight text-white truncate">{member.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{member.shortRole}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayedSlots.map(({ slot, freeMembers, busyMembers, isAllFree, freeCount, totalCount }) => {
              const [h, m] = slot.split(':').map(Number);
              const slotEndMinutes = h * 60 + m + slotDuration;
              const endHour = Math.floor(slotEndMinutes / 60);
              const endMin = slotEndMinutes % 60;
              const slotEndStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

              return (
                <tr 
                  key={slot} 
                  className={`transition-colors ${
                    isAllFree 
                      ? 'bg-emerald-50/50 hover:bg-emerald-50' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Time interval column */}
                  <td className="p-3 text-center border-r-2 border-slate-200 bg-[#FAFAFA]">
                    <div className="font-mono text-xs font-black text-[#121212] flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>{slot} – {slotEndStr}</span>
                    </div>
                  </td>

                  {/* Summary availability gauge & quick plan meeting */}
                  <td className="p-3 border-r-2 border-slate-200 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 ${
                        isAllFree
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : freeCount >= 3
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : freeCount > 0
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        {isAllFree ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Tutti Liberi ({freeCount}/{totalCount})</span>
                          </>
                        ) : (
                          <span>{freeCount}/{totalCount} Disponibili</span>
                        )}
                      </span>

                      {freeCount >= 2 && (
                        <button
                          type="button"
                          onClick={() => onPlanMeetingForSlot(slot, freeMembers.map(m => m.id))}
                          className="text-[10px] font-black uppercase tracking-wider text-[#1D3557] hover:text-[#E63946] flex items-center gap-1 hover:underline"
                          title="Pianifica impegno con i membri disponibili"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pianifica</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Individual Staff Cells (Libero vs Occupato) */}
                  {staffMembers.map((member) => {
                    const evt = getMemberEventForSlot(member.id, slot);
                    const isBusy = !!evt;

                    return (
                      <td key={member.id} className="p-2.5 border-r border-slate-200 last:border-r-0 align-top">
                        {isBusy ? (
                          // BUSY CELL
                          <div 
                            onClick={() => onSelectEvent(evt)}
                            className="p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50/80 hover:bg-rose-100 cursor-pointer transition-all shadow-xs group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-1.5 py-0.5 rounded">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Occupato</span>
                              </span>
                              <span className="font-mono text-[9px] font-bold text-rose-700">
                                {evt.startTime}–{evt.endTime}
                              </span>
                            </div>

                            <div className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-[#E63946] line-clamp-2 leading-tight">
                              {evt.title}
                            </div>

                            {evt.location && (
                              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // FREE / AVAILABLE CELL
                          <div
                            onClick={() => onSlotClick(member.id, slot)}
                            className="p-2.5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between group h-full min-h-[64px]"
                            title={`Clicca per inserire impegno per ${member.name} alle ore ${slot}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Libero</span>
                              </span>
                              <span className="text-[10px] font-black text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                <Plus className="w-3 h-3" />
                                <span>Aggiungi</span>
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider mt-1">
                              Disponibile
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
