'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/proyectos/ProjectCard';
import ProjectForm from '@/components/proyectos/ProjectForm';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Project } from '@/types';

export default function ProyectosPage() {
  const { projects, loading, create, update } = useProjects();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const handleSubmit = async (data: Partial<Project>) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setEditing(null);
  };

  const handleEdit = (project: Project) => {
    setEditing(project);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-muted text-sm mt-1">{projects.length} proyectos activos</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg">No hay proyectos aun</p>
          <p className="text-sm mt-1">Crea tu primer proyecto para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        project={editing}
      />
    </div>
  );
}
