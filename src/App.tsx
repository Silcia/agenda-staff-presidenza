import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Sparkles, 
  Plus, 
  ListOrdered, 
  Grid3X3, 
  CalendarDays, 
  TableProperties, 
  Filter, 
  MessageSquareQuote,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Search,
  CheckSquare2,
  Shield,
  CalendarX2,
  Trash2
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffNote, StaffMemberId, StatusType, SchoolLocation } from './types';
import { INITIAL_STAFF_MEMBERS, getInitialEvents, INITIAL_STAFF_NOTES, INITIAL_LOCATIONS } from './data/staffConfig';
import { 
  subscribeToStaff, 
  subscribeToEvents, 
  subscribeToNotes, 
  subscribeToLocations,
  saveEventToCloud,
  deleteEventFromCloud,
  deleteBatchEventsFromCloud,
  deleteAllEventsFromCloud,
  updateStaffMemberInCloud,
  saveAllStaffToCloud,
  saveNoteToCloud,
  deleteNoteFromCloud,
  saveAllLocationsToCloud
} from './services/cloudSync';
import { Header } from './components/Header';
import { CurrentStatusSelector } from './components/CurrentStatusSelector';
import { StaffStatusCards } from './components/StaffStatusCards';
import { AvailabilityMatrix } from './components/AvailabilityMatrix';
import { ScheduleMatrix } from './components/ScheduleMatrix';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { TimelineAgendaView } from './components/TimelineAgendaView';
import { FindFreeSlotModal } from './components/FindFreeSlotModal';
import { EventModal } from './components/EventModal';
import { EventDetailModal } from './components/EventDetailModal';
import { StaffNotesModal } from './components/StaffNotesModal';
import { PrintExportModal } from './components/PrintExportModal';
import { StaffProfilesModal } from './components/StaffProfilesModal';
import { LocationsModal } from './components/LocationsModal';
import { ClearAgendaModal } from './components/ClearAgendaModal';
import { getTodayString } from './utils/dateUtils';

type ViewMode = 'availability' | 'matrix' | 'week' | 'month' | 'agenda';

export default function App() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('dannunzio_staff_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed parsing saved profiles');
      }
    }
    return INITIAL_STAFF_MEMBERS;
  });
  
  const [events, setEvents] = useState<CalendarEvent[]>(getInitialEvents());
  const [staffNotes, setStaffNotes] = useState<StaffNote[]>(INITIAL_STAFF_NOTES);
  const [locations, setLocations] = useState<SchoolLocation[]>(() => {
    const saved = localStorage.getItem('dannunzio_school_locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed parsing saved locations');
      }
    }
    return INITIAL_LOCATIONS;
  });
  
  // Active User profile (saved in localStorage if available)
  const [activeUser, setActiveUser] = useState<StaffMember>(() => {
    const savedId = localStorage.getItem('active_staff_id');
    const found = INITIAL_STAFF_MEMBERS.find(m => m.id === savedId);
    return found || INITIAL_STAFF_MEMBERS[1]; // Default to Vicaria (Silvia Ciancetta) or DS
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<StaffMemberId | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('availability');
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Partial<CalendarEvent> | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [isFindFreeSlotsOpen, setIsFindFreeSlotsOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isClearAgendaModalOpen, setIsClearAgendaModalOpen] = useState(false);
  
  // Async status states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Firestore Real-Time Subscriptions (Sub-second cloud updates)
  useEffect(() => {
    const unsubStaff = subscribeToStaff((updatedStaff) => {
      setStaffMembers(updatedStaff);
      localStorage.setItem('dannunzio_staff_profiles', JSON.stringify(updatedStaff));
      setActiveUser((prev) => {
        const matching = updatedStaff.find((m) => m.id === prev.id);
        return matching || prev;
      });
    });

    const unsubEvents = subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
    });

    const unsubNotes = subscribeToNotes((updatedNotes) => {
      setStaffNotes(updatedNotes);
    });

    const unsubLocations = subscribeToLocations((updatedLocs) => {
      setLocations(updatedLocs);
      localStorage.setItem('dannunzio_school_locations', JSON.stringify(updatedLocs));
    });

    return () => {
      unsubStaff();
      unsubEvents();
      unsubNotes();
      unsubLocations();
    };
  }, []);

  // Manual fallback refresh
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Handle active user change
  const handleSelectActiveUser = (member: StaffMember) => {
    setActiveUser(member);
    localStorage.setItem('active_staff_id', member.id);
  };

  // Save all staff profiles to Cloud Firestore
  const handleSaveStaffMembers = async (updatedStaff: StaffMember[]) => {
    setStaffMembers(updatedStaff);
    localStorage.setItem('dannunzio_staff_profiles', JSON.stringify(updatedStaff));
    
    const updatedActive = updatedStaff.find(m => m.id === activeUser.id);
    if (updatedActive) {
      setActiveUser(updatedActive);
    }

    try {
      await saveAllStaffToCloud(updatedStaff);
    } catch (err) {
      console.warn('Firestore sync failed, local state preserved:', err);
    }
  };

  // Save school locations to Cloud Firestore
  const handleSaveLocations = async (updatedLocations: SchoolLocation[]) => {
    setLocations(updatedLocations);
    localStorage.setItem('dannunzio_school_locations', JSON.stringify(updatedLocations));
    try {
      await saveAllLocationsToCloud(updatedLocations);
    } catch (err) {
      console.warn('Saved locations locally, cloud error:', err);
    }
  };

  // Handle status update in Real-Time Cloud
  const handleUpdateStatus = async (status: StatusType, note: string, locationRoom?: string) => {
    setIsUpdatingStatus(true);
    const updatedMember: StaffMember = {
      ...activeUser,
      currentStatus: status,
      statusNote: note,
      locationRoom: locationRoom !== undefined ? locationRoom : activeUser.locationRoom,
      lastUpdated: new Date().toISOString(),
    };

    // Optimistic UI update
    setActiveUser(updatedMember);
    setStaffMembers(prev => prev.map(m => m.id === activeUser.id ? updatedMember : m));

    try {
      await updateStaffMemberInCloud(updatedMember);
    } catch (err) {
      console.error('Failed to sync status to Firestore:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Create or Update Event in Cloud
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    const eventId = eventData.id || `evt-${Date.now()}`;
    const fullEvent: CalendarEvent = {
      id: eventId,
      title: eventData.title || '',
      category: eventData.category || 'staff_meeting',
      date: eventData.date || selectedDate,
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || '10:00',
      location: eventData.location || 'Presidenza',
      attendeeIds: eventData.attendeeIds || [activeUser.id],
      createdBy: eventData.createdBy || activeUser.id,
      description: eventData.description,
      isUrgent: eventData.isUrgent,
      notes: eventData.notes,
    };

    // Optimistic update
    if (eventData.id) {
      setEvents(prev => prev.map(e => e.id === eventData.id ? fullEvent : e));
    } else {
      setEvents(prev => [...prev, fullEvent]);
    }

    try {
      await saveEventToCloud(fullEvent);
    } catch (err) {
      console.error('Failed saving event to Firestore:', err);
    }
  };

  // Handle Delete Event from Cloud
  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      await deleteEventFromCloud(id);
    } catch (err) {
      console.warn('Delete failed in Firestore:', err);
    }
  };

  // Handle Notes in Cloud
  const handleAddNote = async (text: string, isPinned?: boolean, priority?: 'normal' | 'important') => {
    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      authorId: activeUser.id,
      text,
      createdAt: new Date().toISOString(),
      isPinned,
      priority,
    };

    setStaffNotes(prev => [newNote, ...prev]);

    try {
      await saveNoteToCloud(newNote);
    } catch (err) {
      console.error('Failed to save note to Firestore:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setStaffNotes(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNoteFromCloud(id);
    } catch (err) {
      console.warn('Delete note failed in Firestore:', err);
    }
  };

  // Quick slot click to create event
  const handleSlotClick = (memberId: StaffMemberId, timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const endH = h + 1;
    const endStr = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    setEventToEdit({
      date: selectedDate,
      startTime: timeStr,
      endTime: endStr,
      attendeeIds: [memberId],
      location: 'Ufficio Staff / Presidenza',
    });
    setIsEventModalOpen(true);
  };

  // Quick plan meeting for a slot with available members
  const handlePlanMeetingForSlot = (timeStr: string, availableMembers: StaffMemberId[]) => {
    const [h, m] = timeStr.split(':').map(Number);
    const endH = m === 30 ? h + 1 : h + 1;
    const endM = m;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    setEventToEdit({
      title: 'Riunione di Staff di Presidenza',
      category: 'staff_meeting',
      date: selectedDate,
      startTime: timeStr,
      endTime: endStr,
      attendeeIds: availableMembers,
      location: 'Ufficio di Presidenza',
    });
    setIsEventModalOpen(true);
  };

  // Quick new event with specific member
  const handleQuickNewEventWithMember = (memberId: StaffMemberId) => {
    setEventToEdit({
      date: selectedDate,
      startTime: '10:00',
      endTime: '11:00',
      attendeeIds: activeUser.id === memberId ? [memberId] : [activeUser.id, memberId],
      location: 'Ufficio di Presidenza',
    });
    setIsEventModalOpen(true);
  };

  // New event on specific date
  const handleNewEventOnDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEventToEdit({
      date: dateStr,
      startTime: '09:00',
      endTime: '10:00',
      attendeeIds: staffMembers.map(m => m.id),
      location: 'Ufficio di Presidenza',
    });
    setIsEventModalOpen(true);
  };

  // Pre-fill event from Find Free Slots tool
  const handleSelectSlotToCreateEvent = (slot: { date: string; startTime: string; endTime: string; attendeeIds: StaffMemberId[] }) => {
    setEventToEdit({
      title: 'Riunione di Staff di Presidenza',
      category: 'staff_meeting',
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      attendeeIds: slot.attendeeIds,
      location: 'Ufficio di Presidenza',
    });
    setIsEventModalOpen(true);
  };

  // Handle Selective or Full Clear of Agenda Events
  const handleClearEvents = async (eventIdsToDelete: string[], reasonDescription: string) => {
    // Optimistic local state update
    setEvents(prev => prev.filter(e => !eventIdsToDelete.includes(e.id)));
    try {
      await deleteBatchEventsFromCloud(eventIdsToDelete);
    } catch (err) {
      console.error('Failed to clear events in Firestore:', err);
    }
  };

  // Reset demo events helper
  const handleResetDemoEvents = async () => {
    const initEvents = getInitialEvents();
    setEvents(initEvents);
    try {
      await deleteAllEventsFromCloud();
      for (const evt of initEvents) {
        await saveEventToCloud(evt);
      }
    } catch (err) {
      console.error('Failed to reset events in Firestore:', err);
    }
  };

  // Reset demo data helper (all data)
  const handleResetData = async () => {
    if (window.confirm('Vuoi ripristinare i dati, le sedi e i profili iniziali di esempio?')) {
      try {
        await fetch('/api/reset-data', { method: 'POST' });
        localStorage.removeItem('dannunzio_staff_profiles');
        localStorage.removeItem('dannunzio_school_locations');
        loadData();
      } catch {
        setStaffMembers(INITIAL_STAFF_MEMBERS);
        setEvents(getInitialEvents());
        setStaffNotes(INITIAL_STAFF_NOTES);
        setLocations(INITIAL_LOCATIONS);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#121212] flex flex-col font-sans selection:bg-[#E63946] selection:text-white">
      
      {/* 1. Header Navigation with School Branding & User Switcher */}
      <Header
        staffMembers={staffMembers}
        activeUser={activeUser}
        onSelectActiveUser={handleSelectActiveUser}
        onOpenNewEventModal={() => {
          setEventToEdit(null);
          setIsEventModalOpen(true);
        }}
        onOpenFindFreeSlots={() => setIsFindFreeSlotsOpen(true)}
        onOpenNotesModal={() => setIsNotesModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenProfilesModal={() => setIsProfilesModalOpen(true)}
        onOpenLocationsModal={() => setIsLocationsModalOpen(true)}
        onOpenClearAgendaModal={() => setIsClearAgendaModalOpen(true)}
        onRefreshData={loadData}
        isRefreshing={isRefreshing}
        notesCount={staffNotes.length}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* User's 1-Click Position & Status Update Banner */}
        <CurrentStatusSelector
          activeUser={activeUser}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdatingStatus}
          locations={locations}
          onOpenLocationsModal={() => setIsLocationsModalOpen(true)}
        />

        {/* 5 Staff Members Live Status Summary Cards */}
        <StaffStatusCards
          staffMembers={staffMembers}
          events={events}
          selectedDate={selectedDate}
          selectedMemberFilter={selectedMemberFilter}
          onSelectMemberFilter={setSelectedMemberFilter}
          onQuickNewEventWithMember={handleQuickNewEventWithMember}
        />

        {/* View Switcher Bar with Bold Typography */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-3 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Navigation View Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Primary: Matrice Disponibilità (Libero / Occupato) */}
            <button
              type="button"
              id="view-availability-btn"
              onClick={() => setViewMode('availability')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                viewMode === 'availability'
                  ? 'bg-[#E63946] text-white border-[#C1121F] shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <CheckSquare2 className="w-4 h-4" />
              <span>Matrice Disponibilità (Libero / Occupato)</span>
            </button>

            {/* Tabellone Parallelo Orario */}
            <button
              type="button"
              id="view-matrix-btn"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                viewMode === 'matrix'
                  ? 'bg-[#121212] text-white border-black shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Tabellone Orario Simultaneo</span>
            </button>

            {/* Vista Settimanale */}
            <button
              type="button"
              id="view-week-btn"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                viewMode === 'week'
                  ? 'bg-[#121212] text-white border-black shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Vista Settimanale</span>
            </button>

            {/* Vista Mensile */}
            <button
              type="button"
              id="view-month-btn"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                viewMode === 'month'
                  ? 'bg-[#121212] text-white border-black shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Vista Mensile</span>
            </button>

            {/* Elenco Agenda */}
            <button
              type="button"
              id="view-agenda-btn"
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                viewMode === 'agenda'
                  ? 'bg-[#121212] text-white border-black shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Elenco Agenda</span>
            </button>
          </div>

          {/* Right helper tools */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setIsProfilesModalOpen(true)}
              className="text-xs font-black uppercase tracking-wider text-[#1D3557] hover:text-[#E63946] flex items-center gap-1.5 hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Personalizza Ruoli Staff</span>
            </button>
            
            <span className="text-slate-300">|</span>

            {/* Pulisci Agenda */}
            <button
              type="button"
              onClick={() => setIsClearAgendaModalOpen(true)}
              className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-800 flex items-center gap-1.5 hover:underline"
              title="Pulisci o svuota gli impegni dall'agenda"
            >
              <CalendarX2 className="w-3.5 h-3.5" />
              <span>Pulisci Agenda</span>
            </button>
            
            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={handleResetData}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
              title="Ripristina dati iniziali di prova"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* 3. Selected View Component */}
        {viewMode === 'availability' && (
          <AvailabilityMatrix
            staffMembers={staffMembers}
            events={events}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onSelectEvent={evt => setViewingEvent(evt)}
            onSlotClick={handleSlotClick}
            onOpenFindFreeSlots={() => setIsFindFreeSlotsOpen(true)}
            onPlanMeetingForSlot={handlePlanMeetingForSlot}
          />
        )}

        {viewMode === 'matrix' && (
          <ScheduleMatrix
            staffMembers={staffMembers}
            events={events}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onSelectEvent={evt => setViewingEvent(evt)}
            onSlotClick={handleSlotClick}
            onOpenFindFreeSlots={() => setIsFindFreeSlotsOpen(true)}
          />
        )}

        {viewMode === 'week' && (
          <WeeklyCalendar
            staffMembers={staffMembers}
            events={events}
            selectedDate={selectedDate}
            selectedMemberFilter={selectedMemberFilter}
            onChangeDate={setSelectedDate}
            onSelectMemberFilter={setSelectedMemberFilter}
            onSelectEvent={evt => setViewingEvent(evt)}
            onNewEventOnDate={handleNewEventOnDate}
          />
        )}

        {viewMode === 'month' && (
          <MonthlyCalendar
            staffMembers={staffMembers}
            events={events}
            selectedDate={selectedDate}
            selectedMemberFilter={selectedMemberFilter}
            onSelectDate={setSelectedDate}
            onSelectEvent={evt => setViewingEvent(evt)}
            onNewEventOnDate={handleNewEventOnDate}
          />
        )}

        {viewMode === 'agenda' && (
          <TimelineAgendaView
            staffMembers={staffMembers}
            events={events}
            selectedMemberFilter={selectedMemberFilter}
            onSelectMemberFilter={setSelectedMemberFilter}
            onSelectEvent={evt => setViewingEvent(evt)}
            onNewEvent={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
          />
        )}

      </main>

      {/* 4. Footer */}
      <footer className="bg-[#121212] text-slate-400 text-xs py-6 border-t-2 border-[#2A2A2A] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-white uppercase tracking-tight">Liceo Classico Statale "Gabriele d'Annunzio"</span>
            <span>•</span>
            <span className="font-medium text-slate-300">Via Venezia 41, 65121 Pescara (PE)</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Piattaforma Gestionale Staff di Presidenza • Sincronizzazione in tempo reale
          </div>
        </div>
      </footer>

      {/* 5. Modals & Dialogs */}
      {/* Create / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        staffMembers={staffMembers}
        activeUser={activeUser}
        initialEvent={eventToEdit}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
        locations={locations}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={viewingEvent}
        onClose={() => setViewingEvent(null)}
        staffMembers={staffMembers}
        onEdit={(evt) => {
          setEventToEdit(evt);
          setIsEventModalOpen(true);
        }}
        onDelete={handleDeleteEvent}
      />

      {/* Find Free Slots Modal */}
      <FindFreeSlotModal
        isOpen={isFindFreeSlotsOpen}
        onClose={() => setIsFindFreeSlotsOpen(false)}
        staffMembers={staffMembers}
        events={events}
        selectedDate={selectedDate}
        onSelectSlotToCreateEvent={handleSelectSlotToCreateEvent}
      />

      {/* Staff Internal Notes Modal */}
      <StaffNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={staffNotes}
        staffMembers={staffMembers}
        activeUser={activeUser}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Print / Export Modal */}
      <PrintExportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        staffMembers={staffMembers}
        events={events}
        selectedDate={selectedDate}
      />

      {/* Staff Profiles Customization Modal */}
      <StaffProfilesModal
        isOpen={isProfilesModalOpen}
        onClose={() => setIsProfilesModalOpen(false)}
        staffMembers={staffMembers}
        onSaveStaffMembers={handleSaveStaffMembers}
        activeUserId={activeUser.id}
        onSelectActiveUser={handleSelectActiveUser}
      />

      {/* School Locations Management Modal */}
      <LocationsModal
        isOpen={isLocationsModalOpen}
        onClose={() => setIsLocationsModalOpen(false)}
        locations={locations}
        onSaveLocations={handleSaveLocations}
      />

      {/* Clear / Cleanup Agenda Events Modal */}
      <ClearAgendaModal
        isOpen={isClearAgendaModalOpen}
        onClose={() => setIsClearAgendaModalOpen(false)}
        events={events}
        staffMembers={staffMembers}
        selectedDate={selectedDate}
        onClearEvents={handleClearEvents}
        onResetDemoEvents={handleResetDemoEvents}
      />

    </div>
  );
}
