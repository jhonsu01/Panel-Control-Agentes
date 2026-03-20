'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ScheduledTask } from '@/types';

interface ScheduledTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ScheduledTask>) => void;
  task?: ScheduledTask | null;
  defaultDate?: string;
}

export default function ScheduledTaskForm({ open, onClose, onSubmit, task, defaultDate }: ScheduledTaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('unica');
  const [scheduled_time, setScheduledTime] = useState('09:00');
  const [scheduled_date, setScheduledDate] = useState('');
  const [status, setStatus] = useState('activa');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setFrequency(task.frequency);
      setScheduledTime(task.scheduled_time);
      setScheduledDate(task.scheduled_date || '');
      setStatus(task.status);
    } else {
      setName('');
      setDescription('');
      setFrequency('unica');
      setScheduledTime('09:00');
      setScheduledDate(defaultDate || '');
      setStatus('activa');
    }
  }, [task, open, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      frequency: frequency as ScheduledTask['frequency'],
      scheduled_time,
      scheduled_date: scheduled_date || null,
      status: status as ScheduledTask['status'],
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Editar Tarea Programada' : 'Nueva Tarea Programada'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Frecuencia"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            options={[
              { value: 'unica', label: 'Unica' },
              { value: 'diaria', label: 'Diaria' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensual', label: 'Mensual' },
              { value: 'personalizada', label: 'Personalizada' },
            ]}
          />
          <Input
            label="Hora"
            type="time"
            value={scheduled_time}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>
        {(frequency === 'unica' || frequency === 'semanal') && (
          <Input
            label="Fecha"
            type="date"
            value={scheduled_date}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        )}
        {task && (
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'activa', label: 'Activa' },
              { value: 'pausada', label: 'Pausada' },
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
