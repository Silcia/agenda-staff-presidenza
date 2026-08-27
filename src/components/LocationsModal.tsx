import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Building2, 
  School, 
  Layers, 
  DoorOpen, 
  FlaskConical, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SchoolLocation } from '../types';
import { INITIAL_LOCATIONS } from '../data/staffConfig';

interface LocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: SchoolLocation[];
  onSaveLocations: (updated: SchoolLocation[]) => void;
}

export const LocationsModal: React.FC<LocationsModalProps> = ({
  isOpen,
  onClose,
  locations,
  onSaveLocations,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<SchoolLocation['type']>('sede');

  // Form for adding new location
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<SchoolLocation['type']>('ufficio');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (loc: SchoolLocation) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditDescription(loc.description || '');
    setEditType(loc.type);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    const updated = locations.map(l => {
      if (l.id === editingId) {
        return {
          ...l,
          name: editName.trim(),
          description: editDescription.trim(),
          type: editType,
        };
      }
      return l;
    });
    onSaveLocations(updated);
    setEditingId(null);
  };

  const handleDeleteLocation = (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare la sede/ubicazione "${name}"?`)) {
      const updated = locations.filter(l => l.id !== id);
      onSaveLocations(updated);
      if (editingId === id) setEditingId(null);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newLoc: SchoolLocation = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      description: newDescription.trim(),
      type: newType,
    };

    onSaveLocations([...locations, newLoc]);
    setNewName('');
    setNewDescription('');
    setIsAdding(false);
  };

  const handleResetDefaults = () => {
    if (confirm('Vuoi ripristinare l\'elenco predefinito delle sedi e uffici della scuola?')) {
      onSaveLocations(INITIAL_LOCATIONS);
      setEditingId(null);
    }
  };

  const getTypeBadge = (type: SchoolLocation['type']) => {
    switch (type) {
      case 'sede':
        return { label: 'Sede Principale', bg: 'bg-red-100 text-red-800 border-red-200', icon: Building2 };
      case 'ufficio':
        return { label: 'Ufficio / Direzione', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: DoorOpen };
      case 'aula':
        return { label: 'Aula / Spazio Didattico', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: School };
      case 'laboratorio':
        return { label: 'Laboratorio', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: FlaskConical };
      case 'esterno':
        return { label: 'Plesso / Esterno', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: MapPin };
      default:
        return { label: 'Locale', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: Layers };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-slate-200 flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#121212] via-[#1D3557] to-[#121212] text-white flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E63946] flex items-center justify-center text-white shadow-md border border-white/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E63946] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  Liceo Classico "G. d'Annunzio"
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase mt-0.5">
                Gestione Sedi & Ubicazioni
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader info & Action bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-600">
            Personalizza, aggiungi o <strong className="text-slate-900">elimina le sedi</strong>, uffici e aule disponibili per eventi e presenze.
          </p>
          <div className="flex items-center gap-2">
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 rounded-xl bg-[#E63946] hover:bg-[#C1121F] text-white font-black uppercase text-[11px] tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Ubicazione</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all"
              title="Ripristina le sedi iniziali"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Add new location card */}
          {isAdding && (
            <form 
              onSubmit={handleAddNew}
              className="p-4 rounded-2xl bg-red-50/70 border-2 border-[#E63946]/30 shadow-sm space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E63946]/20">
                <span className="text-xs font-black uppercase tracking-wider text-[#E63946] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nuova Sede / Ubicazione
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nome Sede / Stanza / Aula *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Es. Sede Centrale, Ufficio Presidenza, Aula 15..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] text-xs bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tipologia
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as SchoolLocation['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] text-xs bg-white font-semibold"
                  >
                    <option value="sede">Sede Principale</option>
                    <option value="ufficio">Ufficio / Direzione</option>
                    <option value="aula">Aula Didattica / Magna</option>
                    <option value="laboratorio">Laboratorio</option>
                    <option value="esterno">Esterno / Plesso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Descrizione / Dettaglio Ubicazione (Opzionale)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Es. Primo piano, Piano terra, Via Venezia 41..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#E63946] hover:bg-[#C1121F] text-white text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  Salva Ubicazione
                </button>
              </div>
            </form>
          )}

          {/* Locations list */}
          <div className="space-y-2.5">
            {locations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Nessuna ubicazione configurata</p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Ripristina Sedi Predefinite
                </button>
              </div>
            ) : (
              locations.map((loc) => {
                const isEditing = editingId === loc.id;
                const typeConfig = getTypeBadge(loc.type);
                const Icon = typeConfig.icon;

                if (isEditing) {
                  return (
                    <div
                      key={loc.id}
                      className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5" />
                          Modifica: {loc.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Nome Ubicazione
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Tipologia
                          </label>
                          <select
                            value={editType}
                            onChange={e => setEditType(e.target.value as SchoolLocation['type'])}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          >
                            <option value="sede">Sede Principale</option>
                            <option value="ufficio">Ufficio / Direzione</option>
                            <option value="aula">Aula Didattica</option>
                            <option value="laboratorio">Laboratorio</option>
                            <option value="esterno">Esterno / Altro Plesso</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                          Descrizione
                        </label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salva Modifiche</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 border border-slate-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900">
                            {loc.name}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${typeConfig.bg}`}>
                            {typeConfig.label}
                          </span>
                        </div>
                        {loc.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {loc.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Edit, Delete) */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(loc)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
                        title="Modifica nome e tipologia"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id, loc.name)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                        title="Elimina questa ubicazione"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            {locations.length} ubicazioni configurate
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#121212] hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
