'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Project } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const COLUMNS = [
  { id: 'pendiente', title: 'Pendientes', color: '#6366f1' },
  { id: 'en_progreso', title: 'En Progreso', color: '#3b82f6' },
  { id: 'revision', title: 'Revision', color: '#f59e0b' },
  { id: 'terminado', title: 'Terminado', color: '#22c55e' },
];

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onUpdate: (id: number, data: Partial<Task>) => Promise<Response>;
  onCreate: (data: Partial<Task>) => Promise<Response>;
  onDelete: (id: number) => Promise<Response>;
  onRefresh: () => void;
}

export default function KanbanBoard({ tasks, projects, onUpdate, onCreate, onDelete, onRefresh }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState('pendiente');
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Keep local tasks in sync
  if (JSON.stringify(tasks.map(t => t.id).sort()) !== JSON.stringify(localTasks.map(t => t.id).sort())) {
    setLocalTasks(tasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getTasksByColumn = (columnId: string) =>
    localTasks.filter(t => t.status === columnId).sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTaskItem = localTasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    // Determine target column
    let targetColumn: string;
    const overTask = localTasks.find(t => t.id === overId);
    if (overTask) {
      targetColumn = overTask.status;
    } else {
      targetColumn = overId as string;
    }

    if (activeTaskItem.status !== targetColumn) {
      setLocalTasks(prev =>
        prev.map(t => t.id === activeId ? { ...t, status: targetColumn as Task['status'] } : t)
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTaskItem = localTasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    // Determine target column
    let targetColumn: string;
    const overTask = localTasks.find(t => t.id === overId);
    if (overTask) {
      targetColumn = overTask.status;
    } else {
      targetColumn = overId as string;
    }

    // Reorder within column
    const columnTasks = localTasks
      .filter(t => t.status === targetColumn)
      .sort((a, b) => a.position - b.position);

    if (overTask && activeId !== overId) {
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        reordered.forEach((t, i) => {
          if (t.position !== i) {
            onUpdate(t.id, { position: i, status: targetColumn as Task['status'] });
          }
        });
      }
    }

    // Update status on server
    await onUpdate(activeId, { status: targetColumn as Task['status'] });
    onRefresh();
  };

  const handleAdd = (status: string) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Task>) => {
    if (editingTask) {
      await onUpdate(editingTask.id, data);
    } else {
      await onCreate(data);
    }
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (deleteTask) {
      await onDelete(deleteTask.id);
      onRefresh();
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-140px)]">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getTasksByColumn(col.id)}
              color={col.color}
              onEdit={handleEdit}
              onDelete={setDeleteTask}
              onAdd={handleAdd}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        projects={projects}
        defaultStatus={defaultStatus}
      />

      <ConfirmDialog
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Tarea"
        message={`¿Seguro que deseas eliminar "${deleteTask?.title}"?`}
      />
    </>
  );
}
