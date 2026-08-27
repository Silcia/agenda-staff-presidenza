import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Phone, 
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffMemberId } from '../types';
import { STATUS_CONFIGS } from '../data/staffConfig';
import { formatTimeAgo, timeToMinutes } from '../utils/dateUtils';

interface StaffStatusCardsProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  selectedMemberFilter: StaffMemberId | 'all';
  onSelectMemberFilter: (id: StaffMemberId | 'all') => void;
  onQuickNewEventWithMember: (memberId: StaffMemberId) => void;
}

export const StaffStatusCards: React.FC<StaffStatusCardsProps> = ({
  staffMembers,
  events,
  selectedDate,
  selectedMemberFilter,
  onSelectMemberFilter,
  onQuickNewEventWithMember,
}) => {
  // Compute next or current commitment for each staff member on selectedDate
  const getMemberCommitmentInfo = (memberId: StaffMemberId) => {
    const memberEvents = events
      .filter(e => e.date === selectedDate && e.attendeeIds.includes(memberId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let activeEvent: CalendarEvent | null = null;
    let nextEvent: CalendarEvent | null = null;

    for (const evt of memberEvents) {
      const startMin = timeToMinutes(evt.startTime);
      const endMin = timeToMinutes(evt.endTime);
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        activeEvent = evt;
        break;
      } else if (startMin > currentMinutes && !nextEvent) {
        nextEvent = evt;
      }
    }

    if (!nextEvent && !activeEvent && memberEvents.length > 0) {
      nextEvent = memberEvents[0];
    }

    return {
      totalToday: memberEvents.length,
      activeEvent,
      nextEvent,
      allEvents: memberEvents,
    };
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E63946] rounded-xs" />
            <h2 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-tight flex items-center gap-2">
              Presenze & Disponibilità Staff (5 Membri)
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Quadro operativo in tempo reale per lo Staff di Presidenza
          </p>
        </div>

        {selectedMemberFilter !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectMemberFilter('all')}
            className="self-start sm:self-auto text-xs font-black uppercase tracking-wider text-white bg-[#121212] hover:bg-[#2A2A2A] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Filtro Attivo: Mostra Tutti</span>
          </button>
        )}
      </div>

      {/* 5 Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {staffMembers.map((member) => {
          const isFiltered = selectedMemberFilter === member.id;
          const statusCfg = STATUS_CONFIGS[member.currentStatus] || STATUS_CONFIGS.libero_disponibile;
          const { totalToday, activeEvent, nextEvent } = getMemberCommitmentInfo(member.id);

          return (
            <div
              key={member.id}
              id={`staff-card-${member.id}`}
              className={`rounded-2xl border-2 transition-all flex flex-col justify-between p-4 ${
                isFiltered
                  ? 'bg-rose-50/50 border-[#E63946] shadow-lg ring-2 ring-[#E63946]/30'
                  : 'bg-white border-[#E5E5E5] hover:border-slate-400 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Member Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0 border-2 ${
                      member.id === 'sanvitale'
                        ? 'bg-[#E63946] text-white border-[#C1121F]'
                        : 'bg-[#121212] text-white border-[#2A2A2A]'
                    }`}>
                      {member.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[#121212] uppercase tracking-tight leading-tight line-clamp-1">
                        {member.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider line-clamp-1 mt-0.5">
                        {member.shortRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 w-full justify-start ${statusCfg.badgeBg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dotColor} flex-shrink-0`} />
                    <span className="truncate">{statusCfg.label}</span>
                  </div>
                </div>

                {/* Location & Status Note */}
                <div className="space-y-1.5 text-xs mb-3.5">
                  {member.locationRoom && (
                    <div className="flex items-center gap-1.5 text-slate-800 text-[11px] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
                      <span className="truncate">{member.locationRoom}</span>
                    </div>
                  )}
                  {member.statusNote && (
                    <p className="text-[11px] text-slate-600 italic line-clamp-2 pl-2.5 border-l-2 border-[#E63946]/40 font-medium">
                      "{member.statusNote}"
                    </p>
                  )}
                </div>

                {/* Today's schedule preview */}
                <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-slate-200 text-[11px] mb-3.5">
                  <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E63946]" /> Impegni oggi:
                    </span>
                    <span className="font-mono font-black text-slate-900 bg-slate-200 px-1.5 py-0.2 rounded">
                      {totalToday}
                    </span>
                  </div>

                  {activeEvent ? (
                    <div className="text-purple-900 font-bold truncate">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-600 mr-1 animate-pulse" />
                      In corso: {activeEvent.startTime} {activeEvent.title}
                    </div>
                  ) : nextEvent ? (
                    <div className="text-slate-800 truncate font-semibold">
                      <span className="font-mono font-black text-[#121212] mr-1">{nextEvent.startTime}</span> {nextEvent.title}
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-bold">
                      Nessun impegno in programma
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions: Filter / New Meeting */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-1.5 text-xs">
                <button
                  type="button"
                  id={`filter-member-${member.id}`}
                  onClick={() => onSelectMemberFilter(isFiltered ? 'all' : member.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all flex items-center gap-1 border ${
                    isFiltered
                      ? 'bg-[#121212] text-white border-[#121212]'
                      : 'text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                  title={isFiltered ? 'Disattiva filtro' : 'Filtra calendario su questo membro'}
                >
                  <Filter className="w-3 h-3 text-[#E63946]" />
                  <span>{isFiltered ? 'Filtrato' : 'Filtra'}</span>
                </button>

                <button
                  type="button"
                  id={`quick-event-with-${member.id}`}
                  onClick={() => onQuickNewEventWithMember(member.id)}
                  className="px-2.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[10px] text-white bg-[#E63946] hover:bg-[#D62828] transition-all flex items-center gap-1 shadow-xs"
                  title={`Crea nuovo impegno con ${member.name}`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Impegno</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

