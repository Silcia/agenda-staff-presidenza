import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { CalendarEvent, StaffMember, StaffMemberId, EventCategory } from '../types';
import { EVENT_CATEGORIES } from '../data/staffConfig';
import { formatDateItalian, getTodayString } from '../utils/dateUtils';

interface TimelineAgendaViewProps {
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedMemberFilter: StaffMemberId | 'all';
  onSelectMemberFilter: (id: StaffMemberId | 'all') => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEvent: () => void;
}

export const TimelineAgendaView: React.FC<TimelineAgendaViewProps> = ({
  staffMembers,
  events,
  selectedMemberFilter,
  onSelectMemberFilter,
  onSelectEvent,
  onNewEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter events
  let filteredEvents = events.filter(evt => {
    // Search query
    const matchQuery = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.description && evt.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Member filter
    const matchMember = 
      selectedMemberFilter === 'all' || evt.attendeeIds.includes(selectedMemberFilter);

    // Category filter
    const matchCategory = 
      selectedCategory === 'all' || evt.category === selectedCategory;

    return matchQuery && matchMember && matchCategory;
  });

  // Sort chronologically by date then startTime
  filteredEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  // Group by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const evt of filteredEvents) {
    if (!eventsByDate[evt.date]) {
      eventsByDate[evt.date] = [];
    }
    eventsByDate[evt.date].push(evt);
  }

  const todayStr = getTodayString();
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-md p-5 sm:p-6 mb-8">
      
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-slate-200">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#E63946]" />
            Agenda & Prossimi Impegni di Staff
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Elenco cronologico completo degli impegni con filtri di ricerca
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca impegni, aule, parole..."
              className="w-full text-xs font-bold pl-8 pr-3 py-2 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
            />
          </div>

          {/* Member Filter */}
          <select
            value={selectedMemberFilter}
            onChange={(e) => onSelectMemberFilter(e.target.value as StaffMemberId | 'all')}
            className="text-xs font-bold uppercase px-3 py-2 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-slate-800 focus:border-[#E63946] focus:outline-none"
          >
            <option value="all">TUTTI I MEMBRI</option>
            {staffMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold uppercase px-3 py-2 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-slate-800 focus:border-[#E63946] focus:outline-none"
          >
            <option value="all">TUTTE LE CATEGORIE</option>
            {Object.values(EVENT_CATEGORIES).map(c => (
              <option key={c.key} value={c.key}>{c.label.toUpperCase()}</option>
            ))}
          </select>

          {/* New Event Button */}
          <button
            type="button"
            onClick={onNewEvent}
            className="px-3.5 py-2 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo</span>
          </button>
        </div>
      </div>

      {/* Grouped Events List */}
      <div className="pt-6 space-y-6">
        {sortedDates.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs italic font-medium">
            Nessun impegno trovato corrispondente ai filtri selezionati.
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const dayEvents = eventsByDate[dateStr];
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className="space-y-3.5">
                
                {/* Date Header Badge */}
                <div className="flex items-center gap-3">
                  <div className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isToday
                      ? 'bg-[#E63946] text-white shadow-sm'
                      : 'bg-[#121212] text-white shadow-xs'
                  }`}>
                    <CalendarIcon className="w-3.5 h-3.5 text-white/80" />
                    <span className="capitalize">{formatDateItalian(dateStr)}</span>
                    {isToday && <span className="bg-white/20 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">Oggi</span>}
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200" />
                </div>

                {/* Day's Event Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pl-2 sm:pl-4">
                  {dayEvents.map(evt => {
                    const catCfg = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.staff_meeting;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className={`p-4 rounded-xl border-2 cursor-pointer hover:shadow-md hover:scale-[1.008] transition-all flex flex-col justify-between ${catCfg.bg} ${catCfg.border} border-l-4`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                              {evt.startTime} – {evt.endTime}
                            </span>
                            {evt.isUrgent && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#E63946] text-white flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> URGENTE
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-sm text-[#121212] leading-snug mb-1">
                            {evt.title}
                          </h4>

                          {evt.description && (
                            <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2">
                              {evt.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-200/80 text-xs text-slate-600 font-semibold">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#E63946]" />
                            <span className="truncate">{evt.location}</span>
                          </span>

                          <div className="flex items-center -space-x-1.5 flex-shrink-0 ml-2">
                            {evt.attendeeIds.map(id => {
                              const sm = staffMembers.find(m => m.id === id);
                              return (
                                <div
                                  key={id}
                                  className="w-5 h-5 rounded-full bg-[#121212] text-white text-[9px] font-black flex items-center justify-center border border-white"
                                  title={sm?.name}
                                >
                                  {sm?.avatarInitials}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

