'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Task, Project } from '@/types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  task?: Task | null;
  projects: Project[];
  defaultStatus?: string;
}

export default function TaskForm({ open, onClose, onSubmit, task, projects, defaultStatus }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [assigned, setAssigned] = useState('yo');
  const [project_id, setProjectId] = useState('');
  const [status, setStatus] = useState('pendiente');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setAssigned(task.assigned);
      setProjectId(task.project_id ? String(task.project_id) : '');
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('media');
      setAssigned('yo');
      setProjectId('');
      setStatus(defaultStatus || 'pendiente');
    }
  }, [task, open, defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority: priority as Task['priority'],
      assigned: assigned as Task['assigned'],
      project_id: project_id ? Number(project_id) : null,
      status: status as Task['status'],
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Editar Tarea' : 'Nueva Tarea'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Prioridad"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Media' },
              { value: 'baja', label: 'Baja' },
            ]}
          />
          <Select
            label="Asignado"
            value={assigned}
            onChange={(e) => setAssigned(e.target.value)}
            options={[
              { value: 'yo', label: 'Yo' },
              { value: 'agente', label: 'Agente' },
            ]}
          />
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
        {task && (
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'en_progreso', label: 'En Progreso' },
              { value: 'revision', label: 'Revision' },
              { value: 'terminado', label: 'Terminado' },
            ]}
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{task ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}
