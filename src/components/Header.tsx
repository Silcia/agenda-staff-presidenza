import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Printer, 
  MessageSquareQuote, 
  Sparkles, 
  Clock, 
  ChevronDown, 
  UserCheck, 
  ShieldCheck,
  RefreshCw,
  School,
  Settings,
  Users,
  MapPin,
  Cloud,
  CloudCheck,
  CalendarX2
} from 'lucide-react';
import { StaffMember, StaffMemberId } from '../types';
import { STATUS_CONFIGS } from '../data/staffConfig';
import { formatDateItalian, getTodayString } from '../utils/dateUtils';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  staffMembers: StaffMember[];
  activeUser: StaffMember;
  onSelectActiveUser: (member: StaffMember) => void;
  onOpenNewEventModal: () => void;
  onOpenFindFreeSlots: () => void;
  onOpenNotesModal: () => void;
  onOpenPrintModal: () => void;
  onOpenProfilesModal: () => void;
  onOpenLocationsModal: () => void;
  onOpenClearAgendaModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  notesCount: number;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  staffMembers,
  activeUser,
  onSelectActiveUser,
  onOpenNewEventModal,
  onOpenFindFreeSlots,
  onOpenNotesModal,
  onOpenPrintModal,
  onOpenProfilesModal,
  onOpenLocationsModal,
  onOpenClearAgendaModal,
  onRefreshData,
  isRefreshing,
  notesCount,
  isCloudSynced = true,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getTodayString();
  const formattedToday = formatDateItalian(todayStr);
  const activeStatusCfg = STATUS_CONFIGS[activeUser.currentStatus] || STATUS_CONFIGS.libero_disponibile;

  return (
    <header className="bg-[#121212] text-white border-b-2 border-[#222222] shadow-xl sticky top-0 z-40">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3.5 gap-3.5">
          
          {/* Logo & School identity with Official Emblem */}
          <SchoolLogo size="md" variant="header" />

          {/* Right side controls: Live time & Active User Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Live Clock & Date with Bold Mono Font */}
            <div className="hidden xl:flex items-center gap-2.5 bg-[#1C1C1C] px-3.5 py-2 rounded-xl border border-[#2D2D2D] text-xs shadow-inner">
              <Clock className="w-4 h-4 text-[#E63946] animate-pulse" />
              <span className="font-mono text-white font-black tracking-wider text-xs tabular-nums">{currentTime}</span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                {formattedToday.split(' ')[0]} {formattedToday.split(' ')[1]} {formattedToday.split(' ')[2]}
              </span>
            </div>

            {/* Active User Switcher */}
            <div className="relative">
              <button
                type="button"
                id="user-switch-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 bg-[#1C1C1C] hover:bg-[#252525] px-3.5 py-2 rounded-xl border border-[#333333] text-xs font-bold text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                title="Cambia operatore attivo"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                  activeUser.id === 'sanvitale' ? 'bg-[#E63946]' : 'bg-slate-700'
                }`}>
                  {activeUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-white font-black text-xs uppercase tracking-tight leading-tight line-clamp-1">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
                    {activeUser.shortRole}
                  </div>
                </div>
                <span className="md:hidden text-white font-bold text-xs uppercase">{activeUser.name.split(' ')[1] || activeUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border-2 border-[#333333] rounded-2xl shadow-2xl z-50 p-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#2A2A2A] text-slate-400 font-black uppercase text-[10px] tracking-[0.18em] flex items-center justify-between">
                      <span>Seleziona il tuo profilo:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfilesModal();
                        }}
                        className="text-[#E63946] hover:underline flex items-center gap-1 text-[10px]"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Modifica Ruoli</span>
                      </button>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {staffMembers.map((member) => {
                        const isSelected = member.id === activeUser.id;
                        const statusCfg = STATUS_CONFIGS[member.currentStatus];
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              onSelectActiveUser(member);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                              isSelected 
                                ? 'bg-[#E63946] text-white font-bold shadow-md' 
                                : 'hover:bg-[#282828] text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                                isSelected ? 'bg-black/30 text-white' : member.id === 'sanvitale' ? 'bg-[#E63946] text-white' : 'bg-slate-700 text-white'
                              }`}>
                                {member.avatarInitials}
                              </div>
                              <div>
                                <div className="font-black text-xs uppercase tracking-tight">{member.name}</div>
                                <div className={`text-[11px] font-semibold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                  {member.shortRole}
                                </div>
                              </div>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full ${statusCfg?.dotColor || 'bg-slate-500'} ring-2 ring-white/20`} title={statusCfg?.label} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#2A2A2A]">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfilesModal();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#282828] hover:bg-[#333333] text-slate-200 text-center font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>Gestione & Personalizzazione Profili</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action: Gestione Profili & Ruoli */}
            <button
              type="button"
              id="staff-profiles-button"
              onClick={onOpenProfilesModal}
              className="flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-[#333333] text-xs font-bold uppercase tracking-wider transition-all"
              title="Personalizzazione ruoli, compiti e profili dello staff di presidenza"
            >
              <Users className="w-3.5 h-3.5 text-[#E63946]" />
              <span className="hidden sm:inline">Ruoli Staff</span>
            </button>

            {/* Quick Action: Gestione Sedi & Ubicazioni */}
            <button
              type="button"
              id="school-locations-button"
              onClick={onOpenLocationsModal}
              className="flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-[#333333] text-xs font-bold uppercase tracking-wider transition-all"
              title="Personalizza, aggiungi o elimina sedi e ubicazioni"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
              <span className="hidden sm:inline">Sedi & Locali</span>
            </button>

            {/* Quick Action: Bacheca Note */}
            <button
              type="button"
              id="staff-notes-button"
              onClick={onOpenNotesModal}
              className="relative flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-[#333333] text-xs font-bold uppercase tracking-wider transition-all"
              title="Bacheca Comunicazioni e Note di Staff"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#E63946]" />
              <span className="hidden sm:inline">Note</span>
              {notesCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black leading-none text-white bg-[#E63946] rounded-full">
                  {notesCount}
                </span>
              )}
            </button>

            {/* Quick Action: Trova Orario Libero */}
            <button
              type="button"
              id="find-free-slot-button"
              onClick={onOpenFindFreeSlots}
              className="flex items-center gap-1.5 bg-[#1D3557] hover:bg-[#152744] text-[#F1FAEE] border border-[#457B9D] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs"
              title="Trova orario libero comune tra membri per convocare riunioni"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A8DADC]" />
              <span className="hidden md:inline">Trova Slot</span>
              <span className="md:hidden">Slot</span>
            </button>

            {/* Primary Action: Nuovo Impegno with High-Impact Bold Red styling */}
            <button
              type="button"
              id="new-event-button"
              onClick={onOpenNewEventModal}
              className="flex items-center gap-1.5 bg-[#E63946] hover:bg-[#D62828] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#E63946] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Impegno</span>
            </button>

            {/* Pulizia Agenda Impegni */}
            <button
              type="button"
              id="clear-agenda-button"
              onClick={onOpenClearAgendaModal}
              className="flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#2A1B1D] text-slate-200 hover:text-red-400 px-3 py-2 rounded-xl border border-[#333333] hover:border-red-500/50 text-xs font-bold uppercase tracking-wider transition-all"
              title="Pulisci o svuota gli impegni dall'agenda (selettivo o totale)"
            >
              <CalendarX2 className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Pulisci Agenda</span>
            </button>

            {/* Print / Export */}
            <button
              type="button"
              id="print-export-button"
              onClick={onOpenPrintModal}
              className="p-2 text-slate-300 hover:text-white bg-[#1C1C1C] hover:bg-[#252525] rounded-xl border border-[#333333] transition-colors"
              title="Stampa / Esporta prospetto"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Cloud Sync Status Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-[11px] font-bold text-emerald-400"
              title="Sincronizzazione Cloud Firebase Firestore attiva in tempo reale"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tracking-wide uppercase text-[10px]">Cloud Live</span>
            </div>

            {/* Refresh / Sync */}
            <button
              type="button"
              id="refresh-sync-button"
              onClick={onRefreshData}
              className={`p-2 text-slate-300 hover:text-white bg-[#1C1C1C] hover:bg-[#252525] rounded-xl border border-[#333333] transition-colors ${isRefreshing ? 'animate-spin text-[#E63946]' : ''}`}
              title="Sincronizza e aggiorna i dati in tempo reale"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

