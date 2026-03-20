'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Project } from '@/types';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
];

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  project?: Project | null;
}

export default function ProjectForm({ open, onClose, onSubmit, project }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color);
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || null, color });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="space-y-1.5">
          <label className="block text-sm text-muted">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{project ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
