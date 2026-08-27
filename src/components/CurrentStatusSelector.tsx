import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Users, 
  UserCheck, 
  MapPin, 
  Briefcase, 
  Laptop, 
  ClockAlert,
  Send,
  Sparkles,
  Edit3,
  Check,
  Plus
} from 'lucide-react';
import { StaffMember, StatusType, SchoolLocation } from '../types';
import { STATUS_CONFIGS } from '../data/staffConfig';
import { formatTimeAgo } from '../utils/dateUtils';

interface CurrentStatusSelectorProps {
  activeUser: StaffMember;
  onUpdateStatus: (status: StatusType, note: string, locationRoom?: string) => Promise<void>;
  isUpdating: boolean;
  locations?: SchoolLocation[];
  onOpenLocationsModal?: () => void;
}

export const CurrentStatusSelector: React.FC<CurrentStatusSelectorProps> = ({
  activeUser,
  onUpdateStatus,
  isUpdating,
  locations = [],
  onOpenLocationsModal,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(activeUser.currentStatus);
  const [noteText, setNoteText] = useState<string>(activeUser.statusNote);
  const [locationText, setLocationText] = useState<string>(activeUser.locationRoom || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setSelectedStatus(activeUser.currentStatus);
    setNoteText(activeUser.statusNote);
    setLocationText(activeUser.locationRoom || '');
  }, [activeUser]);

  const handleQuickStatusClick = async (preset: typeof quickPresets[number]) => {
    setSelectedStatus(preset.key as StatusType);
    const autoLocation = preset.location;
    const autoNote = preset.note;

    setLocationText(autoLocation);
    setNoteText(autoNote);

    await onUpdateStatus(preset.key as StatusType, autoNote, autoLocation);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleSaveCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus(selectedStatus, noteText, locationText);
    setIsEditingNote(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const currentCfg = STATUS_CONFIGS[activeUser.currentStatus] || STATUS_CONFIGS.libero_disponibile;

  const quickPresets = [
    { 
      key: 'libero_disponibile', 
      label: 'Disponibile in sede', 
      location: 'Sede Centrale',
      note: 'Disponibile in sede per adempimenti di presidenza, colloqui e coordinamento.',
      icon: CheckCircle2, 
      activeClass: 'bg-emerald-700 text-white border-emerald-800' 
    },
    { 
      key: 'in_presidenza', 
      label: 'In Presidenza', 
      location: 'Ufficio di Presidenza (Piano 1)',
      note: 'In Presidenza per udienze programmate, adempimenti di direzione e firma atti.',
      icon: Building2, 
      activeClass: 'bg-[#1D3557] text-white border-[#1D3557]' 
    },
    { 
      key: 'in_riunione', 
      label: 'In riunione Staff', 
      location: 'Ufficio Vicepresidenza / Staff',
      note: 'In riunione di Staff di Presidenza per coordinamento operativo e didattico.',
      icon: Users, 
      activeClass: 'bg-[#6D28D9] text-white border-[#6D28D9]' 
    },
    { 
      key: 'in_classe', 
      label: 'In Classe / Lezione', 
      location: 'Aula di Cattedra',
      note: 'In classe per attività di insegnamento disciplinare.',
      icon: GraduationCap, 
      activeClass: 'bg-[#D97706] text-white border-[#D97706]' 
    },
    { 
      key: 'ricevimento', 
      label: 'Ricevimento Utenza', 
      location: 'Ufficio Staff / Presidenza',
      note: 'Ricevimento genitori, studenti e personale su appuntamento.',
      icon: UserCheck, 
      activeClass: 'bg-[#0E7490] text-white border-[#0891B2]' 
    },
    { 
      key: 'smart_working', 
      label: 'A casa (Lavoro agile)', 
      location: 'Da remoto / Domicilio',
      note: 'Attività lavorativa e coordinamento da remoto / A casa (reperibile via email/telefono).',
      icon: Laptop, 
      activeClass: 'bg-[#3B82F6] text-white border-[#2563EB]' 
    },
    { 
      key: 'fuori_sede', 
      label: 'Fuori Sede / USR', 
      location: 'Ufficio Scolastico Regionale / Enti Esterni',
      note: 'Fuori sede per incontri istituzionali USR o enti del territorio.',
      icon: Briefcase, 
      activeClass: 'bg-[#334155] text-white border-[#334155]' 
    },
    { 
      key: 'assente_permesso', 
      label: 'In permesso / Assente', 
      location: 'Non in servizio',
      note: 'In permesso orario / Assente autorizzato.',
      icon: ClockAlert, 
      activeClass: 'bg-[#DC2626] text-white border-[#B91C1C]' 
    },
  ] as const;

  return (
    <section className="bg-white rounded-2xl p-5 border-2 border-[#E5E5E5] shadow-md transition-all mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: User identity and current active state indicator */}
        <div className="flex items-start sm:items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-md flex-shrink-0 border-2 ${
            activeUser.id === 'sanvitale' 
              ? 'bg-[#E63946] text-white border-[#C1121F]' 
              : 'bg-[#121212] text-white border-[#2A2A2A]'
          }`}>
            {activeUser.avatarInitials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded border border-[#E63946]/20">
                La Tua Posizione Attuale
              </span>
              <h2 className="font-black text-[#121212] text-lg sm:text-xl tracking-tight uppercase">
                {activeUser.name}
              </h2>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                {activeUser.shortRole}
              </span>
            </div>

            {/* Current status pill and note */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 shadow-xs ${currentCfg.badgeBg}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${currentCfg.dotColor} animate-pulse`} />
                {currentCfg.label}
              </span>
              
              {activeUser.locationRoom && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                  {activeUser.locationRoom}
                </span>
              )}

              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Aggiornato {formatTimeAgo(activeUser.lastUpdated)}
              </span>

              {savedFeedback && (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 animate-bounce">
                  <Check className="w-3.5 h-3.5" /> Aggiornato!
                </span>
              )}
            </div>

            {/* Status note text */}
            {activeUser.statusNote && !isEditingNote && (
              <p className="text-xs text-slate-700 mt-2 italic font-medium flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span>"{activeUser.statusNote}"</span>
                <button 
                  type="button" 
                  onClick={() => setIsEditingNote(true)} 
                  className="text-slate-500 hover:text-[#E63946] p-0.5 ml-1 transition-colors"
                  title="Modifica nota"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right / Bottom: Quick 1-click status switcher buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!isEditingNote ? (
            <button
              type="button"
              id="edit-custom-note-btn"
              onClick={() => setIsEditingNote(true)}
              className="text-xs font-black uppercase tracking-wider text-[#121212] hover:bg-slate-100 px-4 py-2.5 rounded-xl border-2 border-[#121212] transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md"
            >
              <Edit3 className="w-4 h-4 text-[#E63946]" />
              <span>Personalizza Nota / Sede</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Quick 1-click status pills matrix */}
      <div className="mt-5 pt-4 border-t-2 border-slate-100">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E63946]" />
          Aggiorna stato con 1 click:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickPresets.map((preset) => {
            const Icon = preset.icon;
            const isCurrent = activeUser.currentStatus === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                id={`status-preset-${preset.key}`}
                disabled={isUpdating}
                onClick={() => handleQuickStatusClick(preset)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-2 ${
                  isCurrent 
                    ? `${preset.activeClass} font-black shadow-md ring-2 ring-black/10 scale-[1.02]`
                    : 'bg-[#FAFAFA] text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Note & Location Editor Form */}
      {isEditingNote && (
        <form onSubmit={handleSaveCustomNote} className="mt-4 pt-4 border-t-2 border-slate-100 bg-slate-50 p-4 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Nota di stato per i colleghi dello staff:
              </label>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Es. In aula 14 per lezione fino alle 11:00, reperibile per urgenze..."
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-[#121212] focus:border-[#E63946] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Ufficio / Aula / Sede:
                </label>
                {onOpenLocationsModal && (
                  <button
                    type="button"
                    onClick={onOpenLocationsModal}
                    className="text-[10px] text-[#E63946] hover:underline font-bold uppercase"
                  >
                    Gestisci Sedi
                  </button>
                )}
              </div>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Es. Ufficio Presidenza / Aula Magna"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-[#121212] focus:border-[#E63946] focus:outline-none"
              />

              {/* Quick location chips */}
              {locations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {locations.slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setLocationText(loc.name)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 hover:bg-[#E63946] hover:text-white text-slate-700 transition-colors"
                    >
                      {loc.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 mt-3.5">
            <button
              type="button"
              onClick={() => setIsEditingNote(false)}
              className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="text-xs font-black uppercase tracking-wider px-5 py-2.5 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Salva e Aggiorna Posizione</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

