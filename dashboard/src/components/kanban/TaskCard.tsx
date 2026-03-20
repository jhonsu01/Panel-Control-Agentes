'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import Badge from '@/components/ui/Badge';
import { GripVertical, Pencil, Trash2, User, Bot } from 'lucide-react';

const PRIORITY_COLOR: Record<string, 'red' | 'yellow' | 'green'> = {
  alta: 'red',
  media: 'yellow',
  baja: 'green',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isReview = task.status === 'revision';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card-bg border rounded-lg p-3 group transition-colors ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${
        isReview
          ? 'border-l-4 border-l-amber-400 border-t-card-border border-r-card-border border-b-card-border bg-amber-400/5'
          : 'border-card-border hover:border-accent/30'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 text-muted hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
            {task.project_name && <Badge color="purple">{task.project_name}</Badge>}
            <span className="text-xs text-muted flex items-center gap-1">
              {task.assigned === 'agente' ? <Bot size={12} /> : <User size={12} />}
              {task.assigned}
            </span>
          </div>
          <div className="text-xs text-muted/60 mt-1.5">
            {new Date(task.created_at).toLocaleDateString('es-ES')}
            {task.completed_at && (
              <span className="ml-2 text-success">
                Completada: {new Date(task.completed_at).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(task)} className="text-muted hover:text-foreground p-1">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(task)} className="text-muted hover:text-danger p-1">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
