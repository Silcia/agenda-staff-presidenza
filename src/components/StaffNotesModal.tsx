import React, { useState } from 'react';
import { 
  X, 
  MessageSquareQuote, 
  Plus, 
  Pin, 
  Trash2, 
  Send, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { StaffNote, StaffMember } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';

interface StaffNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: StaffNote[];
  staffMembers: StaffMember[];
  activeUser: StaffMember;
  onAddNote: (text: string, isPinned?: boolean, priority?: 'normal' | 'important') => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onClearAllNotes?: (includeUrgent: boolean) => Promise<void>;
}

export const StaffNotesModal: React.FC<StaffNotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  staffMembers,
  activeUser,
  onAddNote,
  onDeleteNote,
  onClearAllNotes,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearIncludeUrgent, setClearIncludeUrgent] = useState(true);
  const [isClearingAll, setIsClearingAll] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNoteText.trim(), isPinned, isImportant ? 'important' : 'normal');
      setNewNoteText('');
      setIsPinned(false);
      setIsImportant(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSingle = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      await onDeleteNote(noteId);
    } catch (err) {
      console.error('Errore durante eliminazione nota:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExecuteClearAll = async () => {
    if (!onClearAllNotes) return;
    setIsClearingAll(true);
    try {
      await onClearAllNotes(clearIncludeUrgent);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Errore durante cancellazione massiva note:', err);
    } finally {
      setIsClearingAll(false);
    }
  };

  const urgentCount = notes.filter(n => n.priority === 'important' || n.isPinned).length;
  const normalCount = notes.length - urgentCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E63946] flex items-center justify-center text-white shadow-xs">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Bacheca Note & Comunicazioni Staff
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Avvisi interni, circolari e promemoria operativi dello staff
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* New Note Form */}
          <form onSubmit={handleSubmit} className="bg-[#FAFAFA] p-4 rounded-xl border-2 border-slate-200 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              Aggiungi nuovo promemoria per i colleghi di staff:
            </label>
            <textarea
              rows={2}
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Es. Circolare uscite didattiche pronta per firma del DS... Sostituzioni 3ª ora confermate..."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-[#121212] focus:border-[#E63946] focus:outline-none"
            />
            
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span>Fissa in Alto</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#E63946] font-black uppercase tracking-wider text-[11px]">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span>Priorità Alta / Urgente</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newNoteText.trim()}
                className="px-4 py-2 bg-[#E63946] hover:bg-[#D62828] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pubblica Nota</span>
              </button>
            </div>
          </form>

          {/* Clear Notes Confirmation Box */}
          {showClearConfirm && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-red-950">
                    Conferma cancellazione bacheca note
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">
                    Stai per eliminare le comunicazioni attualmente salvate nella bacheca cloud dello staff.
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-red-200 space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="clear_scope"
                    checked={clearIncludeUrgent === true}
                    onChange={() => setClearIncludeUrgent(true)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Cancella <strong>TUTTE le note</strong> ({notes.length} note, comprese {urgentCount} urgenti/fissate)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="clear_scope"
                    checked={clearIncludeUrgent === false}
                    onChange={() => setClearIncludeUrgent(false)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span>Cancella solo note ordinarie ({normalCount} note, mantieni le {urgentCount} urgenti/fissate)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleExecuteClearAll}
                  disabled={isClearingAll}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isClearingAll ? 'Cancellazione...' : 'Conferma Eliminazione'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Note Attive
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black">
                {notes.length}
              </span>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#E63946] border border-rose-200 text-[10px] font-black">
                  {urgentCount} urgenti/fissate
                </span>
              )}
            </div>

            {notes.length > 0 && onClearAllNotes && !showClearConfirm && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors border border-transparent hover:border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancella Tutte</span>
              </button>
            )}
          </div>

          {/* Notes Items */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic font-medium border-2 border-dashed border-slate-200 rounded-xl">
                Nessuna nota presente in bacheca. Tutte le note sono state cancellate.
              </div>
            ) : (
              notes.map((note) => {
                const author = staffMembers.find(m => m.id === note.authorId);
                const isItemDeleting = deletingId === note.id;
                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      note.isPinned 
                        ? 'bg-rose-50/70 border-[#E63946] shadow-xs' 
                        : 'bg-white border-slate-200'
                    } ${isItemDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                          author?.id === 'sanvitale' ? 'bg-[#E63946] text-white' : 'bg-slate-800 text-white'
                        }`}>
                          {author?.avatarInitials || 'ST'}
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-tight text-[#121212]">
                            {author?.name || 'Membro Staff'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">
                            {formatTimeAgo(note.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {note.priority === 'important' && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#E63946] text-white shadow-xs">
                            URGENTE / IMPORTANTE
                          </span>
                        )}
                        {note.isPinned && (
                          <span title="Fissata in alto">
                            <Pin className="w-3.5 h-3.5 text-[#E63946] fill-[#E63946]" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(note.id)}
                          disabled={isItemDeleting}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Elimina definitivamente questa nota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t-2 border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
