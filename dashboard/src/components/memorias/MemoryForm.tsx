'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Memory, Project } from '@/types';

interface MemoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Memory>) => void;
  memory?: Memory | null;
  projects: Project[];
}

export default function MemoryForm({ open, onClose, onSubmit, memory, projects }: MemoryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('nota');
  const [project_id, setProjectId] = useState('');
  const [memory_date, setMemoryDate] = useState('');

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setContent(memory.content);
      setCategory(memory.category);
      setProjectId(memory.project_id ? String(memory.project_id) : '');
      setMemoryDate(memory.memory_date);
    } else {
      setTitle('');
      setContent('');
      setCategory('nota');
      setProjectId('');
      setMemoryDate(new Date().toISOString().split('T')[0]);
    }
  }, [memory, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category: category as Memory['category'],
      project_id: project_id ? Number(project_id) : null,
      memory_date,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={memory ? 'Editar Memoria' : 'Nueva Memoria'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea
          label="Contenido (Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="font-mono text-xs"
        />
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'conversacion', label: 'Conversacion' },
              { value: 'decision', label: 'Decision' },
              { value: 'insight', label: 'Insight' },
              { value: 'nota', label: 'Nota' },
            ]}
          />
          <Select
            label="Proyecto"
            value={project_id}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Sin proyecto' },
              ...projects.map(p => ({ value: String(p.id), label: p.name })),
            ]}
          />
          <Input
            label="Fecha"
            type="date"
            value={memory_date}
            onChange={(e) => setMemoryDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{memory ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
