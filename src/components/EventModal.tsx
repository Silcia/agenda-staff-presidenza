import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  FileText, 
  Check, 
  Sparkles,
  Building2,
  Trash2
} from 'lucide-react';
import { CalendarEvent, StaffMember, StaffMemberId, EventCategory, SchoolLocation } from '../types';
import { EVENT_CATEGORIES } from '../data/staffConfig';
import { getTodayString } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: StaffMember[];
  activeUser: StaffMember;
  initialEvent?: Partial<CalendarEvent> | null;
  onSaveEvent: (eventData: Partial<CalendarEvent>) => Promise<void>;
  onDeleteEvent?: (id: string) => Promise<void>;
  locations?: SchoolLocation[];
}

const PRESET_TITLES = [
  'Briefing Mattutino di Staff',
  'Riunione di Staff di Presidenza',
  'Consiglio di Presidenza',
  'Consiglio di Classe',
  'Commissione Orario & Sostituzioni',
  'Ricevimento Genitori / Udienze',
  'Tavolo Tecnico Inclusione (GLI/GLO)',
  'Incontro con Ispettore / USR',
  'Verifica Laboratori & Sicurezza',
  'Collegio dei Docenti',
  'Orientamento & Open Day',
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  staffMembers,
  activeUser,
  initialEvent,
  onSaveEvent,
  onDeleteEvent,
  locations = [],
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('staff_meeting');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('Ufficio di Presidenza');
  const [attendeeIds, setAttendeeIds] = useState<StaffMemberId[]>([activeUser.id]);
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = Boolean(initialEvent?.id);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setCategory(initialEvent.category || 'staff_meeting');
      setDate(initialEvent.date || getTodayString());
      setStartTime(initialEvent.startTime || '09:00');
      setEndTime(initialEvent.endTime || '10:00');
      setLocation(initialEvent.location || 'Ufficio di Presidenza');
      setAttendeeIds(initialEvent.attendeeIds && initialEvent.attendeeIds.length > 0 ? initialEvent.attendeeIds : [activeUser.id]);
      setDescription(initialEvent.description || '');
      setIsUrgent(Boolean(initialEvent.isUrgent));
    } else {
      // Defaults for brand new event
      setTitle('');
      setCategory('staff_meeting');
      setDate(getTodayString());
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('Ufficio di Presidenza');
      setAttendeeIds(['sanvitale', 'ciancetta', 'braconi', 'finelli', 'giancaterino']); // default staff meeting with all
      setDescription('');
      setIsUrgent(false);
    }
    setFormError(null);
  }, [initialEvent, isOpen, activeUser.id]);

  if (!isOpen) return null;

  const toggleAttendee = (id: StaffMemberId) => {
    if (attendeeIds.includes(id)) {
      if (attendeeIds.length > 1) {
        setAttendeeIds(attendeeIds.filter(m => m !== id));
      }
    } else {
      setAttendeeIds([...attendeeIds, id]);
    }
  };

  const selectAllAttendees = () => {
    setAttendeeIds(staffMembers.map(m => m.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Inserisci un titolo per l\'impegno.');
      return;
    }
    if (attendeeIds.length === 0) {
      setFormError('Seleziona almeno un membro dello staff.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('L\'ora di fine deve essere successiva all\'ora di inizio.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSaveEvent({
        id: initialEvent?.id,
        title: title.trim(),
        category,
        date,
        startTime,
        endTime,
        location: location.trim(),
        attendeeIds,
        description: description.trim(),
        isUrgent,
        createdBy: initialEvent?.createdBy || activeUser.id,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E63946] flex items-center justify-center text-white shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {isEditing ? 'Modifica Impegno di Staff' : 'Nuovo Impegno / Appuntamento Staff'}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Liceo Classico "Gabriele d'Annunzio" - Pescara
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Oggetto / Titolo dell'impegno: *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Riunione di Staff con DS e Collaboratori..."
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-black uppercase text-slate-500 self-center">Suggeriti:</span>
              {PRESET_TITLES.slice(0, 4).map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className="text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Urgent Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Tipologia / Categoria:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full text-xs font-bold uppercase px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              >
                {Object.values(EVENT_CATEGORIES).map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-slate-300 w-full cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
                />
                <span className="text-xs font-black uppercase tracking-wider text-[#E63946]">
                  Priorità / Urgente
                </span>
              </label>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#E63946]" /> Data:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E63946]" /> Ora Inizio:
              </label>
              <input
                type="time"
                required
                step="900"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E63946]" /> Ora Fine:
              </label>
              <input
                type="time"
                required
                step="900"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" /> Luogo / Sede:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Es. Ufficio di Presidenza, Aula 12..."
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
            />
            {/* Location Suggestions */}
            {locations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {locations.slice(0, 6).map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocation(loc.name)}
                    className="text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                  >
                    {loc.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Staff Attendees (Checkboxes) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E63946]" /> Membri dello Staff Coinvolti: *
              </label>
              <button
                type="button"
                onClick={selectAllAttendees}
                className="text-[11px] font-black uppercase tracking-wider text-[#E63946] hover:underline"
              >
                Seleziona Tutto lo Staff
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {staffMembers.map((member) => {
                const isSelected = attendeeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAttendee(member.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-[#E63946] text-[#121212] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        member.id === 'sanvitale' ? 'bg-[#E63946] text-white' : 'bg-slate-800 text-white'
                      }`}>
                        {member.avatarInitials}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black uppercase tracking-tight truncate">{member.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{member.shortRole}</div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${
                      isSelected ? 'bg-[#E63946] border-[#E63946] text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#E63946]" /> Note / Ordine del Giorno / Dettagli:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Inserisci dettagli, punti all'ordine del giorno o documenti da portare..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
            />
          </div>

          {/* Modal Buttons */}
          <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between">
            {isEditing && onDeleteEvent ? (
              <button
                type="button"
                onClick={() => {
                  if (initialEvent?.id && window.confirm('Sei sicuro di voler eliminare questo impegno dal calendario?')) {
                    onDeleteEvent(initialEvent.id);
                    onClose();
                  }
                }}
                className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 p-2.5 rounded-xl flex items-center gap-1.5 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Elimina Impegno</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Salva Modifiche' : 'Crea Impegno'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

