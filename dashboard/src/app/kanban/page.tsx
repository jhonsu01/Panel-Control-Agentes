'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import TaskForm from '@/components/kanban/TaskForm';
import { Plus } from 'lucide-react';

export default function KanbanPage() {
  const { tasks, loading, create, update, remove, refresh } = useTasks();
  const { projects } = useProjects();
  const [formOpen, setFormOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState('');

  const filteredTasks = projectFilter
    ? tasks.filter(t => t.project_id === Number(projectFilter))
    : tasks;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tablero</h1>
          <p className="text-muted text-sm mt-1">{tasks.length} tareas en total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos los proyectos' },
                ...projects.map(p => ({ value: String(p.id), label: p.name })),
              ]}
            />
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Nueva Tarea
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          projects={projects}
          onUpdate={update}
          onCreate={create}
          onDelete={remove}
          onRefresh={refresh}
        />
      )}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => { await create(data); }}
        projects={projects}
      />
    </div>
  );
}
