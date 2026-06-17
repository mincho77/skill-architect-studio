'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Download, FileText, BarChart2, Bell, Link, Database, Palette, Settings, Radio, Upload, Box } from 'lucide-react';
import SkillCard from './SkillCard';
import SkillModal from './SkillModal';
import CreateSkillModal from './CreateSkillModal';
import ImportSkillModal from './ImportSkillModal';

const DOMAIN_ICONS: Record<string, any> = {
  documentos: FileText, reportes: BarChart2, notificaciones: Bell,
  integraciones: Link, datos: Database, diseño: Palette,
  procesos: Settings, distribucion: Radio, exportacion: Upload, default: Box,
};

export default function SkillCatalog({ initialSkills }: { initialSkills: any[] }) {
  const [skills, setSkills] = useState((initialSkills || []).filter(Boolean));
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const domains = useMemo(() => {
    const d = new Set(skills.filter(Boolean).map(s => s?.dominio).filter(Boolean));
    return Array.from(d);
  }, [skills]);

  const filtered = useMemo(() => {
    return (skills || []).filter(s => {
      if (!s) return false;
      const matchSearch = !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.id?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      const matchDomain = filterDomain === 'todos' || s.dominio === filterDomain;
      const matchStatus = filterStatus === 'todos' || s.status === filterStatus;
      return matchSearch && matchDomain && matchStatus;
    });
  }, [skills, search, filterDomain, filterStatus]);

  const addSkill = (skill: any) => {
    if (!skill) return;
    setSkills(prev => {
      const exists = prev.find(s => s?.id === skill.id);
      if (exists) return prev.map(s => s?.id === skill.id ? skill : s);
      return [...prev, skill].filter(Boolean);
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto shrink-0 flex flex-col">
        <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-3">Dominios</p>
        <button
          onClick={() => setFilterDomain('todos')}
          className={`text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
            filterDomain === 'todos' ? 'bg-purple-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Todos ({skills.filter(Boolean).length})
        </button>
        {domains.map(d => {
          const count = skills.filter(Boolean).filter(s => s?.dominio === d).length;
          const Icon = DOMAIN_ICONS[d] || DOMAIN_ICONS.default;
          return (
            <button
              key={d}
              onClick={() => setFilterDomain(filterDomain === d ? 'todos' : d)}
              className={`text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center justify-between gap-2 transition-colors ${
                filterDomain === d ? 'bg-purple-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={13} />
                {d}
              </span>
              <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}

        <p className="text-xs text-gray-600 uppercase mt-4 mb-2 font-semibold tracking-wider">Estado</p>
        {[
          { value: 'existente', label: 'Publicado' },
          { value: 'pendiente_desarrollo', label: 'Pendiente' },
        ].map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? 'todos' : s.value)}
            className={`text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              filterStatus === s.value ? 'bg-purple-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 shrink-0">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, ID o descripción..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="text-sm text-gray-500 shrink-0">{filtered.length} skills</span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus size={15} /> Crear Skill
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700 flex items-center gap-2 transition-colors shrink-0"
          >
            <Download size={15} /> Importar
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
              <Box size={40} />
              <p>No hay skills que coincidan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(skill => skill && <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />)}
            </div>
          )}
        </div>
      </div>

      {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
      {showCreate && <CreateSkillModal onClose={() => setShowCreate(false)} onSave={(s) => { addSkill(s); setShowCreate(false); }} />}
      {showImport && <ImportSkillModal onClose={() => setShowImport(false)} onImport={(s) => { addSkill(s); setShowImport(false); }} />}
    </div>
  );
}
