'use client';

import { Project } from '@/types';
import Badge from '@/components/ui/Badge';
import { FolderKanban, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const total = project.total_tasks || 0;
  const completed = project.completed_tasks || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inactive = (project.days_since_activity || 0) > 7;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 hover:border-accent/30 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color + '20' }}
          >
            <FolderKanban size={20} style={{ color: project.color }} />
          </div>
          <div>
            <Link href={`/proyectos/${project.id}`} className="font-medium hover:text-accent transition-colors">
              {project.name}
            </Link>
            {project.description && (
              <p className="text-xs text-muted mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onEdit(project)}
          className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all text-xs"
        >
          Editar
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{completed}/{total} tareas</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge color={project.pending_tasks ? 'blue' : 'green'}>
          {project.pending_tasks || 0} pendientes
        </Badge>
        {inactive && (
          <div className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle size={12} />
            <span>{project.days_since_activity}d sin actividad</span>
          </div>
        )}
      </div>
    </div>
  );
}
