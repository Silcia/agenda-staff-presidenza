import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Clock, 
  Calendar as CalendarIcon, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { StaffMember, CalendarEvent, StaffMemberId } from '../types';
import { findCommonFreeSlots, formatDateItalian, getTodayString } from '../utils/dateUtils';

interface FindFreeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
  onSelectSlotToCreateEvent: (slot: { date: string; startTime: string; endTime: string; attendeeIds: StaffMemberId[] }) => void;
}

export const FindFreeSlotModal: React.FC<FindFreeSlotModalProps> = ({
  isOpen,
  onClose,
  staffMembers,
  events,
  selectedDate: initialDate,
  onSelectSlotToCreateEvent,
}) => {
  const [targetDate, setTargetDate] = useState<string>(initialDate || getTodayString());
  const [selectedMemberIds, setSelectedMemberIds] = useState<StaffMemberId[]>(['sanvitale', 'ciancetta', 'braconi', 'finelli', 'giancaterino']);
  const [minDuration, setMinDuration] = useState<number>(30); // in minutes

  if (!isOpen) return null;

  const toggleMember = (id: StaffMemberId) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter(m => m !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const selectAllMembers = () => {
    setSelectedMemberIds(staffMembers.map(m => m.id));
  };

  const freeSlots = findCommonFreeSlots(
    events,
    selectedMemberIds,
    targetDate,
    minDuration
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E63946] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Trova Orario Libero Comune Staff
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Pianificatore automatico senza sovrapposizioni o lezioni
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Controls: Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#E63946]" />
                Data di riferimento:
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                Durata desiderata:
              </label>
              <select
                value={minDuration}
                onChange={(e) => setMinDuration(Number(e.target.value))}
                className="w-full text-xs font-bold uppercase px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
              >
                <option value={15}>15 MINUTI (BRIEFING RAPIDO)</option>
                <option value={30}>30 MINUTI (INCONTRO STANDARD)</option>
                <option value={45}>45 MINUTI</option>
                <option value={60}>1 ORA (RIUNIONE DI STAFF)</option>
                <option value={90}>1 ORA E 30 MINUTI</option>
                <option value={120}>2 ORE (COMMISSIONE / CONSIGLIO)</option>
              </select>
            </div>
          </div>

          {/* Members Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E63946]" />
                Membri dello Staff da coinvolgere ({selectedMemberIds.length}/5):
              </label>
              <button
                type="button"
                onClick={selectAllMembers}
                className="text-[11px] font-black uppercase tracking-wider text-[#E63946] hover:underline"
              >
                Seleziona Tutti
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {staffMembers.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
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

          {/* Results List: Free Slots */}
          <div className="border-t-2 border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-[#121212] uppercase tracking-wider">
                Fasce Orarie Libere per {formatDateItalian(targetDate)}:
              </h4>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                {freeSlots.length} {freeSlots.length === 1 ? 'FASCIA TROVATA' : 'FASCE TROVATE'}
              </span>
            </div>

            {freeSlots.length === 0 ? (
              <div className="p-6 text-center bg-[#FAFAFA] rounded-xl border-2 border-dashed border-slate-300">
                <p className="text-xs font-black uppercase text-slate-800">
                  Nessuna finestra libera comune di almeno {minDuration} minuti trovata.
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  Prova a ridurre la durata desiderata o deseleziona alcuni membri non strettamente necessari.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {freeSlots.map((slot, index) => (
                  <div
                    key={`${slot.startTime}-${slot.endTime}-${index}`}
                    className="p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl flex items-center justify-between group hover:border-emerald-500 transition-colors"
                  >
                    <div>
                      <div className="font-mono text-sm font-black text-emerald-950 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {slot.startTime} – {slot.endTime}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                        Durata: {slot.durationMinutes} min
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectSlotToCreateEvent({
                          date: targetDate,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                          attendeeIds: selectedMemberIds,
                        });
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <span>Pianifica</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
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

