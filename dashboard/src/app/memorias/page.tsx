'use client';

import { useState, useEffect } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { useProjects } from '@/hooks/useProjects';
import MemoryTimeline from '@/components/memorias/MemoryTimeline';
import MemoryForm from '@/components/memorias/MemoryForm';
import LongTermEditor from '@/components/memorias/LongTermEditor';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import SearchBar from '@/components/ui/SearchBar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';
import { Memory } from '@/types';

export default function MemoriasPage() {
  const [tab, setTab] = useState<'diarias' | 'largo_plazo'>('diarias');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [deleteMemory, setDeleteMemory] = useState<Memory | null>(null);

  const { memories, loading, create, update, remove, search } = useMemories({
    category: categoryFilter || undefined,
    project_id: projectFilter ? Number(projectFilter) : undefined,
  });
  const { projects } = useProjects();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeout = setTimeout(async () => {
        const results = await search(searchQuery);
        setSearchResults(results);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const displayMemories = searchResults ?? memories;

  const handleSubmit = async (data: Partial<Memory>) => {
    if (editingMemory) {
      await update(editingMemory.id, data);
    } else {
      await create(data);
    }
    setEditingMemory(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteMemory) {
      await remove(deleteMemory.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Memorias</h1>
          <p className="text-muted text-sm mt-1">{memories.length} memorias registradas</p>
        </div>
        {tab === 'diarias' && (
          <Button onClick={() => { setEditingMemory(null); setFormOpen(true); }}>
            <Plus size={16} /> Nueva Memoria
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-card-bg border border-card-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('diarias')}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            tab === 'diarias' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
          }`}
        >
          Memorias Diarias
        </button>
        <button
          onClick={() => setTab('largo_plazo')}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            tab === 'largo_plazo' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
          }`}
        >
          Largo Plazo
        </button>
      </div>

      {tab === 'diarias' ? (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar en memorias..."
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'Todas las categorias' },
                { value: 'conversacion', label: 'Conversacion' },
                { value: 'decision', label: 'Decision' },
                { value: 'insight', label: 'Insight' },
                { value: 'nota', label: 'Nota' },
              ]}
            />
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos los proyectos' },
                ...projects.map(p => ({ value: String(p.id), label: p.name })),
              ]}
            />
          </div>

          {loading ? (
            <div className="text-muted text-center py-12">Cargando...</div>
          ) : (
            <MemoryTimeline
              memories={displayMemories}
              onEdit={(m) => { setEditingMemory(m); setFormOpen(true); }}
              onDelete={setDeleteMemory}
            />
          )}
        </>
      ) : (
        <LongTermEditor />
      )}

      <MemoryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingMemory(null); }}
        onSubmit={handleSubmit}
        memory={editingMemory}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleteMemory}
        onClose={() => setDeleteMemory(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Memoria"
        message={`¿Seguro que deseas eliminar "${deleteMemory?.title}"?`}
      />
    </div>
  );
}
