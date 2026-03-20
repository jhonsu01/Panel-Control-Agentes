'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Document, Project, Category } from '@/types';
import { Plus } from 'lucide-react';

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Document>) => void;
  document?: Document | null;
  projects: Project[];
  categories: Category[];
  onNewCategory: (name: string) => void;
}

export default function DocumentForm({ open, onClose, onSubmit, document: doc, projects, categories, onNewCategory }: DocumentFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('otro');
  const [project_id, setProjectId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content);
      setCategory(doc.category);
      setProjectId(doc.project_id ? String(doc.project_id) : '');
    } else {
      setTitle('');
      setContent('');
      setCategory('otro');
      setProjectId('');
    }
  }, [doc, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      content,
      category,
      project_id: project_id ? Number(project_id) : null,
    });
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onNewCategory(newCategory.trim().toLowerCase());
      setCategory(newCategory.trim().toLowerCase());
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={doc ? 'Editar Documento' : 'Nuevo Documento'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea
          label="Contenido (Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="font-mono text-xs"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-muted">Categoria</label>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-xs text-accent hover:text-accent-hover"
              >
                <Plus size={12} className="inline" /> Nueva
              </button>
            </div>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nombre..."
                  className="flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-sm"
                />
                <Button type="button" size="sm" onClick={handleAddCategory}>OK</Button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
          <Select
            label="Proyecto"
            value={project_id}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Sin proyecto' },
              ...projects.map(p => ({ value: String(p.id), label: p.name })),
            ]}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{doc ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
