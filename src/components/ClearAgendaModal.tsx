import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  CalendarX2, 
  History, 
  Calendar, 
  User, 
  Check, 
  X, 
  Filter, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffMemberId } from '../types';
import { formatDateItalian, getTodayString } from '../utils/dateUtils';
import { EVENT_CATEGORIES } from '../data/staffConfig';

export type ClearScope = 'selected_date' | 'past_events' | 'date_range' | 'staff_member' | 'all_events';

interface ClearAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  staffMembers: StaffMember[];
  selectedDate: string;
  onClearEvents: (eventIdsToDelete: string[], reasonDescription: string) => Promise<void>;
  onResetDemoEvents: () => Promise<void>;
}

export const ClearAgendaModal: React.FC<ClearAgendaModalProps> = ({
  isOpen,
  onClose,
  events,
  staffMembers,
  selectedDate,
  onClearEvents,
  onResetDemoEvents,
}) => {
  const todayStr = getTodayString();
  const [scope, setScope] = useState<ClearScope>('selected_date');
  const [rangeStart, setRangeStart] = useState<string>(selectedDate || todayStr);
  const [rangeEnd, setRangeEnd] = useState<string>(selectedDate || todayStr);
  const [targetMemberId, setTargetMemberId] = useState<StaffMemberId>(staffMembers[0]?.id || 'sanvitale');
  const [excludeUrgent, setExcludeUrgent] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showConfirmStep, setShowConfirmStep] = useState<boolean>(false);

  // Compute matching events to be cleared based on selection (ALWAYS before any conditional return!)
  const matchingEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(evt => {
      if (!evt) return false;
      // Exclude urgent if checked
      if (excludeUrgent && evt.isUrgent) {
        return false;
      }

      switch (scope) {
        case 'selected_date':
          return evt.date === selectedDate;
        case 'past_events':
          return Boolean(evt.date && evt.date < todayStr);
        case 'date_range':
          return Boolean(evt.date && evt.date >= rangeStart && evt.date <= rangeEnd);
        case 'staff_member': {
          const attendees = Array.isArray(evt.attendeeIds) ? evt.attendeeIds : [];
          return attendees.includes(targetMemberId) || evt.createdBy === targetMemberId;
        }
        case 'all_events':
          return true;
        default:
          return false;
      }
    });
  }, [events, scope, selectedDate, todayStr, rangeStart, rangeEnd, targetMemberId, excludeUrgent]);

  if (!isOpen) return null;

  const countToDelete = matchingEvents.length;

  const getScopeDescription = () => {
    switch (scope) {
      case 'selected_date':
        return `Tutti gli impegni del giorno ${formatDateItalian(selectedDate) || selectedDate || 'selezionato'}`;
      case 'past_events':
        return `Tutti gli impegni passati (antecedenti al ${formatDateItalian(todayStr) || todayStr})`;
      case 'date_range':
        return `Impegni compresi tra il ${formatDateItalian(rangeStart) || rangeStart} e il ${formatDateItalian(rangeEnd) || rangeEnd}`;
      case 'staff_member': {
        const member = (staffMembers || []).find(m => m.id === targetMemberId);
        return `Impegni associati a ${member ? member.name : targetMemberId}`;
      }
      case 'all_events':
        return 'Tutti gli impegni indistintamente (Svuotamento totale dell\'agenda)';
      default:
        return 'Impegni selezionati';
    }
  };

  const handleExecuteClear = async () => {
    if (countToDelete === 0) return;
    setIsDeleting(true);
    try {
      const ids = matchingEvents.map(e => e.id);
      await onClearEvents(ids, getScopeDescription());
      setShowConfirmStep(false);
      onClose();
    } catch (err) {
      console.error('Errore durante la pulizia impegni:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExecuteReset = async () => {
    if (window.confirm('Vuoi ripristinare il set predefinito di impegni di esempio del Liceo Classico?')) {
      setIsResetting(true);
      try {
        await onResetDemoEvents();
        onClose();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Danger / Alert styling */}
        <div className="bg-[#121212] px-6 py-5 text-white flex items-center justify-between border-b-2 border-red-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500">
              <CalendarX2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Pulizia & Rimozione Impegni</span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-500/30">
                  Cloud Live
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Gestisci la cancellazione selettiva o totale degli eventi in agenda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {!showConfirmStep ? (
            <>
              {/* Option Selection Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Scegli cosa desideri pulire dall'agenda:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* 1. Giorno Selezionato */}
                  <div
                    onClick={() => setScope('selected_date')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      scope === 'selected_date'
                        ? 'border-[#E63946] bg-red-50/50 text-[#121212] shadow-sm'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${scope === 'selected_date' ? 'text-[#E63946]' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Giorno Visualizzato</span>
                      </div>
                      {scope === 'selected_date' && <Check className="w-4 h-4 text-[#E63946]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Solo impegni del {formatDateItalian(selectedDate)}
                    </p>
                  </div>

                  {/* 2. Tutti gli impegni passati */}
                  <div
                    onClick={() => setScope('past_events')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      scope === 'past_events'
                        ? 'border-[#E63946] bg-red-50/50 text-[#121212] shadow-sm'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className={`w-4 h-4 ${scope === 'past_events' ? 'text-[#E63946]' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Tutti gli Eventi Passati</span>
                      </div>
                      {scope === 'past_events' && <Check className="w-4 h-4 text-[#E63946]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Archivia e rimuovi impegni antecedenti a oggi
                    </p>
                  </div>

                  {/* 3. Intervallo di Date */}
                  <div
                    onClick={() => setScope('date_range')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      scope === 'date_range'
                        ? 'border-[#E63946] bg-red-50/50 text-[#121212] shadow-sm'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${scope === 'date_range' ? 'text-[#E63946]' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Intervallo di Date</span>
                      </div>
                      {scope === 'date_range' && <Check className="w-4 h-4 text-[#E63946]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Specifica una data di inizio e una di fine
                    </p>
                  </div>

                  {/* 4. Per Membro dello Staff */}
                  <div
                    onClick={() => setScope('staff_member')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      scope === 'staff_member'
                        ? 'border-[#E63946] bg-red-50/50 text-[#121212] shadow-sm'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${scope === 'staff_member' ? 'text-[#E63946]' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Per Membro Staff</span>
                      </div>
                      {scope === 'staff_member' && <Check className="w-4 h-4 text-[#E63946]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Impegni in cui è coinvolto un componente
                    </p>
                  </div>

                </div>

                {/* 5. Svuotamento Totale dell'Agenda (Opzione Massiva) */}
                <div
                  onClick={() => setScope('all_events')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    scope === 'all_events'
                      ? 'border-red-600 bg-red-100/70 text-red-950 font-bold shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-red-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trash2 className={`w-4 h-4 ${scope === 'all_events' ? 'text-red-600' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs">Svuota Completamente l'Agenda (Tutti gli impegni)</span>
                    </div>
                    {scope === 'all_events' && <Check className="w-4 h-4 text-red-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cancella l'intero archivio degli appuntamenti per ricominciare da zero
                  </p>
                </div>
              </div>

              {/* Scope-specific configuration sub-panel */}
              {scope === 'date_range' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Da data:</label>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">A data:</label>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {scope === 'staff_member' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Seleziona il componente dello staff:
                  </label>
                  <select
                    value={targetMemberId}
                    onChange={(e) => setTargetMemberId(e.target.value as StaffMemberId)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {staffMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.shortRole})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preservation Checkbox */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <input
                  type="checkbox"
                  id="exclude-urgent-checkbox"
                  checked={excludeUrgent}
                  onChange={(e) => setExcludeUrgent(e.target.checked)}
                  className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946] border-slate-300"
                />
                <label htmlFor="exclude-urgent-checkbox" className="text-xs font-semibold text-amber-900 cursor-pointer">
                  Salva gli impegni contrassegnati come <span className="font-black text-amber-950 uppercase">"Urgente / Indifferibile"</span>
                </label>
              </div>

              {/* Status / Matching preview */}
              <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                countToDelete > 0 
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    {countToDelete > 0 ? 'Impegni che verranno rimossi:' : 'Nessun impegno trovato con questi criteri'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {getScopeDescription()}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black tabular-nums ${countToDelete > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {countToDelete}
                  </span>
                  <span className="text-xs font-bold ml-1">impegni</span>
                </div>
              </div>

              {/* Mini List Preview if matching > 0 */}
              {countToDelete > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-36 overflow-y-auto">
                  <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 sticky top-0 border-b border-slate-200">
                    Anteprima eventi da cancellare ({matchingEvents.length}):
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {matchingEvents.slice(0, 15).map((evt) => {
                      const cat = evt.category && EVENT_CATEGORIES[evt.category] ? EVENT_CATEGORIES[evt.category] : null;
                      return (
                        <div key={evt.id} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="font-bold text-slate-800 truncate">{evt.title || 'Senza titolo'}</span>
                            <span className="text-[10px] text-slate-400">({evt.date || ''} • {evt.startTime || ''}-{evt.endTime || ''})</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {cat?.label || evt.category || 'Impegno'}
                          </span>
                        </div>
                      );
                    })}
                    {matchingEvents.length > 15 && (
                      <div className="px-3 py-1.5 text-[11px] text-slate-400 italic text-center bg-slate-50">
                        ...altri {matchingEvents.length - 15} impegni
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Confirmation Step */
            <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-300 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 mt-0.5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-red-950 tracking-tight">
                    Conferma Rimozione Definitiva
                  </h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    Stai per eliminare definitivamente <strong>{countToDelete} impegni</strong> dall'agenda ({getScopeDescription()}).
                  </p>
                  <p className="text-xs text-red-700 font-semibold mt-2">
                    L'azione si rifletterà istantaneamente su tutti i dispositivi connessi tramite il Cloud Firebase.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Secondary helper: Ripristina Impegni Demo */}
          <div>
            {!showConfirmStep && (
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-200/60 transition-colors"
                title="Ripristina il set di appuntamenti standard per testare l'agenda"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Ripristina Demo Iniziale</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (showConfirmStep) {
                  setShowConfirmStep(false);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Annulla
            </button>

            {!showConfirmStep ? (
              <button
                type="button"
                disabled={countToDelete === 0}
                onClick={() => setShowConfirmStep(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all ${
                  countToDelete > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Procedi alla Pulizia ({countToDelete})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteClear}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-lg focus:ring-2 focus:ring-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-bounce' : ''}`} />
                <span>{isDeleting ? 'Eliminazione in corso...' : `Sì, Elimina ${countToDelete} Impegni`}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
