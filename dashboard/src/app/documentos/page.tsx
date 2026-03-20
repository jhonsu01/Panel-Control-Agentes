'use client';

import { useState, useEffect } from 'react';
import { useDocuments, useCategories } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import DocumentCard from '@/components/documentos/DocumentCard';
import DocumentForm from '@/components/documentos/DocumentForm';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import SearchBar from '@/components/ui/SearchBar';
import { Plus, Grid3X3, List } from 'lucide-react';
import { Document } from '@/types';

export default function DocumentosPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formOpen, setFormOpen] = useState(false);

  const { documents, loading, create, search } = useDocuments({
    category: categoryFilter || undefined,
    project_id: projectFilter ? Number(projectFilter) : undefined,
    sort: sortBy,
  });
  const { projects } = useProjects();
  const { categories, create: createCategory } = useCategories('document');

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

  const displayDocs = searchResults ?? documents;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted text-sm mt-1">{documents.length} documentos</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Nuevo Documento
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar documentos..." />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: '', label: 'Todas las categorias' },
            ...categories.map(c => ({ value: c.name, label: c.name })),
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
        <div className="flex items-end gap-2">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'updated_at', label: 'Modificacion' },
              { value: 'created_at', label: 'Creacion' },
              { value: 'title', label: 'Titulo' },
            ]}
          />
          <div className="flex gap-1 border border-card-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-muted'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : displayDocs.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg">No hay documentos</p>
          <p className="text-sm mt-1">Crea tu primer documento</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {displayDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      <DocumentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => { await create(data); }}
        projects={projects}
        categories={categories}
        onNewCategory={createCategory}
      />
    </div>
  );
}
