'use client';

import { useState, useEffect, use } from 'react';
import { Document as Doc, Project, Category } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DocumentForm from '@/components/documentos/DocumentForm';
import { ArrowLeft, Pencil, Trash2, Eye, Edit3, Save, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${id}`).then(r => r.json()).then(d => { setDoc(d); setContent(d.content); });
    fetch('/api/projects?archived=0').then(r => r.json()).then(setProjects);
    fetch('/api/categories?type=document').then(r => r.json()).then(setCategories);
  }, [id]);

  const handleSaveContent = async () => {
    setSaving(true);
    await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const updated = await fetch(`/api/documents/${id}`).then(r => r.json());
    setDoc(updated);
    setSaving(false);
    setEditing(false);
  };

  const handleUpdateMeta = async (data: Partial<Doc>) => {
    await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated = await fetch(`/api/documents/${id}`).then(r => r.json());
    setDoc(updated);
  };

  const handleDelete = async () => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.push('/documentos');
  };

  if (!doc) return <div className="text-muted text-center py-12">Cargando...</div>;

  return (
    <div>
      <Link href="/documentos" className="inline-flex items-center gap-1 text-muted hover:text-foreground text-sm mb-4">
        <ArrowLeft size={16} /> Documentos
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge color="blue">{doc.category}</Badge>
            {doc.project_name && <Badge color="purple">{doc.project_name}</Badge>}
            <span className="text-xs text-muted">
              Modificado: {new Date(doc.updated_at).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => window.open(`/api/documents/${id}/download`, '_blank')}>
            <Download size={14} /> Descargar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setFormOpen(true)}>
            <Pencil size={14} /> Editar info
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? <><Eye size={14} /> Vista previa</> : <><Edit3 size={14} /> Editar</>}
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSaveContent} disabled={saving}>
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-6">
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[600px] bg-background border border-card-border rounded-lg p-4 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
          />
        ) : (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content || '*Sin contenido*'}</ReactMarkdown>
          </div>
        )}
      </div>

      <DocumentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleUpdateMeta}
        document={doc}
        projects={projects}
        categories={categories}
        onNewCategory={async (name) => {
          await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type: 'document' }),
          });
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Documento"
        message={`¿Seguro que deseas eliminar "${doc.title}"?`}
      />
    </div>
  );
}
