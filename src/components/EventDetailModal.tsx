import React from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Edit3, 
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CalendarEvent, StaffMember } from '../types';
import { EVENT_CATEGORIES } from '../data/staffConfig';
import { formatDateItalian } from '../utils/dateUtils';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  staffMembers: StaffMember[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  staffMembers,
  onEdit,
  onDelete,
}) => {
  if (!event) return null;

  const catCfg = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.staff_meeting;
  const creator = staffMembers.find(m => m.id === event.createdBy);

  const handleDelete = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare l'impegno "${event.title}"?`)) {
      await onDelete(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar with Category Accent */}
        <div className={`p-6 border-b-2 border-slate-200 ${catCfg.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${catCfg.color} bg-white/90 border-2 border-current shadow-xs`}>
                  {catCfg.label}
                </span>
                {event.isUrgent && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#E63946] text-white flex items-center gap-1 shadow-xs">
                    <AlertTriangle className="w-3 h-3" /> URGENTE
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#121212] uppercase tracking-tight leading-snug">
                {event.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#121212] hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Date and Time */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800 bg-[#FAFAFA] p-3.5 rounded-xl border-2 border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E63946]" />
              <span className="font-black uppercase tracking-tight capitalize">{formatDateItalian(event.date)}</span>
            </div>
            <div className="text-slate-300">•</div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E63946]" />
              <span className="font-mono font-black">{event.startTime} – {event.endTime}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-wider text-slate-900">Luogo / Sede: </span>
              <span className="font-bold text-slate-800">{event.location}</span>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E63946]" />
              <span>Membri dello Staff Coinvolti ({event.attendeeIds.length}):</span>
            </div>
            <div className="space-y-2">
              {event.attendeeIds.map(id => {
                const member = staffMembers.find(m => m.id === id);
                if (!member) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAFA] border-2 border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        member.id === 'sanvitale' ? 'bg-[#E63946] text-white' : 'bg-slate-800 text-white'
                      }`}>
                        {member.avatarInitials}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-tight text-[#121212]">{member.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{member.shortRole}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Notes */}
          {event.description && (
            <div className="pt-2 border-t-2 border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Note e Ordine del Giorno:</span>
              </div>
              <p className="text-xs font-medium text-slate-700 whitespace-pre-line bg-[#FAFAFA] p-3.5 rounded-xl border-2 border-slate-200">
                {event.description}
              </p>
            </div>
          )}

          {/* Footer details */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-2 border-t-2 border-slate-100 flex justify-between items-center">
            <span>Creato da: {creator ? creator.name.toUpperCase() : 'STAFF'}</span>
            <span>ID: {event.id}</span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t-2 border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 p-2 rounded-lg flex items-center gap-1.5 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Elimina</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Chiudi
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-wider bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifica</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

