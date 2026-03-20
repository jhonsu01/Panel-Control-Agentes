'use client';

import { ScheduledTask } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { X, Play, Pause, Pencil, CheckCircle2, Clock } from 'lucide-react';

interface DayDetailProps {
  date: string;
  tasks: ScheduledTask[];
  onClose: () => void;
  onEdit: (task: ScheduledTask) => void;
  onExecute: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}

const FREQ_LABELS: Record<string, string> = {
  unica: 'Unica',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  personalizada: 'Personalizada',
};

export default function DayDetail({ date, tasks, onClose, onEdit, onExecute, onToggleStatus }: DayDetailProps) {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold capitalize">{formattedDate}</h3>
        <button onClick={onClose} className="text-muted hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">No hay tareas para este dia</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-background rounded-lg p-3 border border-card-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.name}</p>
                  {task.description && <p className="text-xs text-muted mt-1">{task.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(task)} className="text-muted hover:text-foreground p-1">
                    <Pencil size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge color="blue">
                  <Clock size={10} className="mr-1" /> {task.scheduled_time}
                </Badge>
                <Badge color="purple">{FREQ_LABELS[task.frequency]}</Badge>
                {task.executed_today ? (
                  <Badge color="green"><CheckCircle2 size={10} className="mr-1" /> Ejecutada</Badge>
                ) : (
                  <Badge color="amber">Pendiente</Badge>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {!task.executed_today && (
                  <Button size="sm" variant="primary" onClick={() => onExecute(task.id)}>
                    <CheckCircle2 size={12} /> Marcar ejecutada
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleStatus(task.id, task.status === 'activa' ? 'pausada' : 'activa')}
                >
                  {task.status === 'activa' ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Activar</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
