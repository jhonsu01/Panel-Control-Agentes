'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAdd: (status: string) => void;
}

export default function KanbanColumn({ id, title, tasks, color, onEdit, onDelete, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`flex flex-col bg-background/50 rounded-xl border border-card-border min-h-[200px] ${isOver ? 'border-accent/50 bg-accent/5' : ''}`}>
      <div className="flex items-center justify-between p-3 border-b border-card-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-xs text-muted bg-card-bg px-1.5 py-0.5 rounded">{tasks.length}</span>
        </div>
        <button onClick={() => onAdd(id)} className="text-muted hover:text-foreground p-1">
          <Plus size={16} />
        </button>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
