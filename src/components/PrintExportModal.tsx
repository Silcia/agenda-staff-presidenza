import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Calendar as CalendarIcon, 
  Building2, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { StaffMember, CalendarEvent } from '../types';
import { STATUS_CONFIGS, EVENT_CATEGORIES } from '../data/staffConfig';
import { formatDateItalian, getTodayString } from '../utils/dateUtils';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: StaffMember[];
  events: CalendarEvent[];
  selectedDate: string;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  staffMembers,
  events,
  selectedDate,
}) => {
  if (!isOpen) return null;

  const dayEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Toolbar (Non-printable) */}
        <div className="px-6 py-4 bg-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E63946] flex items-center justify-center text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Prospetto Presenze & Impegni di Staff
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Liceo Classico Statale "Gabriele d'Annunzio" - Pescara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Stampa / Salva PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-white text-slate-900 print:p-0 print:max-h-none">
          
          {/* Institution Header */}
          <div className="border-b-4 border-black pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-black">
                LICEO CLASSICO STATALE "GABRIELE D'ANNUNZIO" - PESCARA
              </h2>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-600 mt-0.5">
                Staff di Presidenza • Prospetto Presenze, Disponibilità e Impegni
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">Data:</div>
              <div className="text-sm font-black uppercase text-black capitalize">{formatDateItalian(selectedDate)}</div>
            </div>
          </div>

          {/* Section 1: Staff Presence & Location Snapshot */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2.5 pb-1 border-b-2 border-slate-300">
              1. Stato Presenze e Posizione Attuale dello Staff
            </h4>
            <div className="border-2 border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 font-black uppercase tracking-wider text-slate-700">
                    <th className="p-2.5 border-r border-slate-300">Docente / Ruolo</th>
                    <th className="p-2.5 border-r border-slate-300">Stato</th>
                    <th className="p-2.5 border-r border-slate-300">Ufficio / Aula</th>
                    <th className="p-2.5">Recapito Interno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {staffMembers.map(m => {
                    const statusCfg = STATUS_CONFIGS[m.currentStatus];
                    return (
                      <tr key={m.id}>
                        <td className="p-2.5 border-r border-slate-300">
                          <div className="font-black text-black uppercase">{m.name}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{m.shortRole}</div>
                        </td>
                        <td className="p-2.5 border-r border-slate-300 font-bold uppercase text-slate-800">
                          {statusCfg?.label}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 font-bold text-slate-700">
                          {m.locationRoom || 'Sede Centrale'}
                        </td>
                        <td className="p-2.5 font-mono font-black text-slate-900">
                          {m.phoneExt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Program of Commitments Today */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2.5 pb-1 border-b-2 border-slate-300">
              2. Ordine degli Impegni e Riunioni Programmate ({dayEvents.length})
            </h4>
            {dayEvents.length === 0 ? (
              <p className="text-xs italic font-medium text-slate-500">Nessun impegno registrato per questa giornata.</p>
            ) : (
              <div className="border-2 border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300 font-black uppercase tracking-wider text-slate-700">
                      <th className="p-2.5 border-r border-slate-300 w-32">Orario</th>
                      <th className="p-2.5 border-r border-slate-300">Oggetto / Impegno</th>
                      <th className="p-2.5 border-r border-slate-300">Sede / Aula</th>
                      <th className="p-2.5">Partecipanti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dayEvents.map(evt => (
                      <tr key={evt.id}>
                        <td className="p-2.5 border-r border-slate-300 font-mono font-black text-black whitespace-nowrap">
                          {evt.startTime} – {evt.endTime}
                        </td>
                        <td className="p-2.5 border-r border-slate-300">
                          <div className="font-black text-black uppercase">{evt.title}</div>
                          {evt.description && <div className="text-[11px] font-medium text-slate-600 mt-0.5">{evt.description}</div>}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 font-bold text-slate-700">
                          {evt.location}
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1">
                            {evt.attendeeIds.map(id => {
                              const sm = staffMembers.find(m => m.id === id);
                              return (
                                <span key={id} className="inline-block bg-slate-200 border border-slate-300 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-800">
                                  {sm ? sm.name.split(' ').slice(1).join(' ') : id}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t-2 border-slate-200 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Documento a uso interno dello Staff di Presidenza - Liceo G. d'Annunzio Pescara</span>
            <span>Generato il {new Date().toLocaleDateString('it-IT')} alle {new Date().toLocaleTimeString('it-IT')}</span>
          </div>

        </div>

      </div>
    </div>
  );
};

