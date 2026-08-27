import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Save, 
  Shield, 
  Sparkles, 
  Briefcase, 
  Mail, 
  Phone, 
  GraduationCap, 
  RotateCcw,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { StaffMember } from '../types';
import { INITIAL_STAFF_MEMBERS } from '../data/staffConfig';

interface StaffProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMembers: StaffMember[];
  onSaveStaffMembers: (updatedStaff: StaffMember[]) => Promise<void>;
  activeUserId: string;
  onSelectActiveUser: (member: StaffMember) => void;
}

export const StaffProfilesModal: React.FC<StaffProfilesModalProps> = ({
  isOpen,
  onClose,
  staffMembers,
  onSaveStaffMembers,
  activeUserId,
  onSelectActiveUser,
}) => {
  const [members, setMembers] = useState<StaffMember[]>(staffMembers);
  const [selectedEditId, setSelectedEditId] = useState<string>(staffMembers[0]?.id || 'sanvitale');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentEditingMember = members.find(m => m.id === selectedEditId) || members[0];

  const handleFieldChange = (field: keyof StaffMember, value: any) => {
    if (!currentEditingMember) return;
    const updated = members.map(m => {
      if (m.id === currentEditingMember.id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setMembers(updated);
  };

  const handleAddNewMember = () => {
    const newId = `staff_${Date.now()}`;
    const newMember: StaffMember = {
      id: newId,
      name: 'Nuovo Membro Staff',
      role: 'Staff di Presidenza - Collaboratore',
      shortRole: 'Collaboratore Staff',
      discipline: 'Lettere / Discipline Giuridiche',
      delegatedTasks: 'Coordinamento progetti e supporto organizzativo',
      email: 'staff@liceoclassicope.edu.it',
      phoneExt: `Int. ${100 + members.length + 1}`,
      avatarInitials: 'NS',
      colorTheme: 'blue',
      currentStatus: 'libero_disponibile',
      statusNote: 'Disponibile in sede.',
      locationRoom: 'Ufficio Staff',
      lastUpdated: new Date().toISOString(),
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setSelectedEditId(newId);
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      alert('Non è possibile eliminare l\'unico membro dello staff rimasto.');
      return;
    }
    if (confirm('Sei sicuro di voler rimuovere questo profilo dallo staff di presidenza?')) {
      const filtered = members.filter(m => m.id !== id);
      setMembers(filtered);
      if (selectedEditId === id) {
        setSelectedEditId(filtered[0].id);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveStaffMembers(members);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Errore durante il salvataggio dei profili.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Vuoi ripristinare i profili e ruoli predefiniti dello staff?')) {
      setMembers(INITIAL_STAFF_MEMBERS);
      setSelectedEditId(INITIAL_STAFF_MEMBERS[0].id);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `profili_staff_liceo_dannunzio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
            setSelectedEditId(parsed[0].id);
            alert('Profili importati con successo! Clicca su "Salva Modifiche" per confermare.');
          }
        } catch (error) {
          alert('File JSON non valido o formato non corretto.');
        }
      };
    }
  };

  // Role preset templates for quick customization
  const applyPresetRole = (preset: { role: string; shortRole: string; delegatedTasks: string }) => {
    if (!currentEditingMember) return;
    const updated = members.map(m => {
      if (m.id === currentEditingMember.id) {
        return { 
          ...m, 
          role: preset.role, 
          shortRole: preset.shortRole, 
          delegatedTasks: preset.delegatedTasks 
        };
      }
      return m;
    });
    setMembers(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E63946] flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded">
                  Configurazione Ruoli
                </span>
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Personalizzazione Profili & Funzioni Staff di Presidenza
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Modifica nominativi, incarichi, deleghe e recapiti di ciascun membro dello staff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar List + Edit Form */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Staff Members List */}
          <div className="md:col-span-4 bg-[#FAFAFA] border-r-2 border-slate-200 p-4 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Membri Staff ({members.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNewMember}
                  className="text-[11px] font-black uppercase text-[#E63946] hover:text-[#D62828] flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aggiungi</span>
                </button>
              </div>

              {members.map((member) => {
                const isSelected = member.id === selectedEditId;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedEditId(member.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50 border-[#E63946] text-[#121212] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white flex-shrink-0 ${
                        member.id === 'sanvitale' ? 'bg-[#E63946]' : 'bg-slate-800'
                      }`}>
                        {member.avatarInitials}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black uppercase tracking-tight truncate">{member.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{member.shortRole}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#E63946]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick backup / restore tools */}
            <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-1/2 text-[10px] font-black uppercase tracking-wider py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 transition-colors"
                  title="Esporta configurazione in formato JSON"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Esporta</span>
                </button>

                <label className="w-1/2 text-[10px] font-black uppercase tracking-wider py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer text-center">
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Importa</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full text-[10px] font-bold uppercase tracking-wider py-1.5 text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ripristina Staff Predefinito</span>
              </button>
            </div>
          </div>

          {/* Right Column: Profile Editor Form */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-white">
            {currentEditingMember ? (
              <div className="space-y-4">
                
                {/* Member Header and Quick presets */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-200 gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modifica Profilo</span>
                    <h4 className="text-base font-black text-[#121212] uppercase tracking-tight">{currentEditingMember.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(currentEditingMember.id)}
                      className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Rimuovi</span>
                    </button>
                  </div>
                </div>

                {/* Quick Role Templates Chips */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    Modelli Ruolo Rapidi (Liceo Classico):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: 'Dirigente Scolastico',
                        shortRole: 'Dirigente Scolastico (DS)',
                        delegatedTasks: 'Rappresentanza legale, direzione unitaria dell\'istituzione scolastica, gestione risorse e firma atti.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                    >
                      Dirigente Scolastico
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: '1° Collaboratore del Dirigente Scolastico (Vicaria)',
                        shortRole: '1° Collaboratore (Vicaria)',
                        delegatedTasks: 'Sostituzione del DS in caso di assenza, coordinamento plessi, sostituzioni docenti e gestione orario.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-colors"
                    >
                      Collaboratore Vicario
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: '2° Collaboratore del Dirigente Scolastico',
                        shortRole: '2° Collaboratore DS',
                        delegatedTasks: 'Supporto organizzativo generale, vigilanza alunni, verbalizzazione collegio e coordinamento didattico.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                    >
                      2° Collaboratore
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: 'Staff di Presidenza - Gestione PTOF, Valutazione e RAV',
                        shortRole: 'Referente PTOF & Didattica',
                        delegatedTasks: 'Aggiornamento Piano Triennale Offerta Formativa, monitoraggio RAV, PNRR e supporto ai dipartimenti disciplinari.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200 transition-colors"
                    >
                      Referente PTOF
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: 'Staff di Presidenza - Inclusione, GLI, DSA/BES e Orientamento',
                        shortRole: 'Staff Inclusione & DSA',
                        delegatedTasks: 'Coordinamento sostegno, stesura e verifica PEI/PDP, rapporti con ASL e famiglie, orientamento scolastico.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 transition-colors"
                    >
                      Referente Inclusione
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole({
                        role: 'Staff di Presidenza - Gestione Sedi, Sicurezza e Laboratori',
                        shortRole: 'Staff Sedi & Sicurezza',
                        delegatedTasks: 'Rapporti con RSPP e Provincia per manutenzione sedi dell\'istituto, laboratori scientifici e piano emergenza.'
                      })}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 transition-colors"
                    >
                      Referente Sedi & Sicurezza
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Nome e Cognome Completo con Titolo:
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Es. Prof.ssa Silvia Ciancetta"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Full Institutional Role */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Ruolo / Incarico Istituzionale nello Staff:
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.role}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      placeholder="Es. 1° Collaboratore del Dirigente Scolastico (Vicaria)"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Short Role / Subtitle */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Etichetta Ruolo Breve (Badge & Tabelle):
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.shortRole}
                      onChange={(e) => handleFieldChange('shortRole', e.target.value)}
                      placeholder="Es. 1° Collaboratore (Vicaria)"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Discipline / Teaching Subject */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Disciplina di Insegnamento (Cattedra):
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.discipline || ''}
                      onChange={(e) => handleFieldChange('discipline', e.target.value)}
                      placeholder="Es. Latino e Greco / Italiano"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Specific Delegated Tasks */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Funzioni Delegate, Compiti e Aree di Competenza:
                    </label>
                    <textarea
                      rows={2}
                      value={currentEditingMember.delegatedTasks || ''}
                      onChange={(e) => handleFieldChange('delegatedTasks', e.target.value)}
                      placeholder="Es. Gestione orario e sostituzioni docenti, verbalizzazione incontri di staff, rapporti con segreteria didattica..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#E63946]" />
                      Email Istituzionale:
                    </label>
                    <input
                      type="email"
                      value={currentEditingMember.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="nome.cognome@liceoclassicope.edu.it"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Phone Extension */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#E63946]" />
                      Recapito Telefonico Interno:
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.phoneExt}
                      onChange={(e) => handleFieldChange('phoneExt', e.target.value)}
                      placeholder="Es. Int. 102 / Tel. Sede"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  {/* Avatar Initials & Default Room */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Iniziali Avatar (2 lettere):
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={currentEditingMember.avatarInitials}
                      onChange={(e) => handleFieldChange('avatarInitials', e.target.value.toUpperCase())}
                      placeholder="SC"
                      className="w-full text-xs font-black uppercase px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                      Ufficio / Sede Principale:
                    </label>
                    <input
                      type="text"
                      value={currentEditingMember.locationRoom}
                      onChange={(e) => handleFieldChange('locationRoom', e.target.value)}
                      placeholder="Es. Ufficio Collaboratori DS"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-[#FAFAFA] text-[#121212] focus:border-[#E63946] focus:outline-none"
                    />
                  </div>

                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {saveSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 animate-bounce">
                <Check className="w-4 h-4" /> Modifiche salvate con successo!
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Le modifiche saranno immediatamente visibili in tutti i calendari e schede
              </span>
            )}
          </div>

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
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62828] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Salva Tutti i Profili</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
