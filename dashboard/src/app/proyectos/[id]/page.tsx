'use client';

import { useState, useEffect, use } from 'react';
import { Project, Task, Memory, Document as Doc } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Archive, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendientes',
  en_progreso: 'En Progreso',
  revision: 'Revision',
  terminado: 'Terminado',
};

const PRIORITY_COLOR: Record<string, 'red' | 'yellow' | 'green'> = {
  alta: 'red',
  media: 'yellow',
  baja: 'green',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(setProject);
    fetch(`/api/tasks?project_id=${id}`).then(r => r.json()).then(setTasks);
    fetch(`/api/memories?project_id=${id}`).then(r => r.json()).then(setMemories);
    fetch(`/api/documents?project_id=${id}`).then(r => r.json()).then(setDocuments);
  }, [id]);

  const handleArchive = async () => {
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: 1 }),
    });
    router.push('/proyectos');
  };

  if (!project) return <div className="text-muted text-center py-12">Cargando...</div>;

  const tasksByStatus = Object.keys(STATUS_LABELS).map(status => ({
    status,
    label: STATUS_LABELS[status],
    tasks: tasks.filter(t => t.status === status),
  }));

  return (
    <div>
      <Link href="/proyectos" className="inline-flex items-center gap-1 text-muted hover:text-foreground text-sm mb-4">
        <ArrowLeft size={16} /> Proyectos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
            <FolderKanban size={24} style={{ color: project.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && <p className="text-muted text-sm mt-1">{project.description}</p>}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setConfirmArchive(true)}>
          <Archive size={16} /> Archivar
        </Button>
      </div>

      {/* Tasks by status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Tareas</h2>
        {tasks.length === 0 ? (
          <p className="text-muted text-sm">No hay tareas asociadas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasksByStatus.map(({ status, label, tasks: t }) => (
              <div key={status} className="bg-card-bg border border-card-border rounded-xl p-3">
                <h3 className="text-sm font-medium text-muted mb-2">{label} ({t.length})</h3>
                <div className="space-y-2">
                  {t.map(task => (
                    <div key={task.id} className="bg-background rounded-lg p-2.5 text-sm">
                      <p className="font-medium">{task.title}</p>
                      <Badge color={PRIORITY_COLOR[task.priority]} className="mt-1">{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Memories */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Memorias</h2>
        {memories.length === 0 ? (
          <p className="text-muted text-sm">No hay memorias asociadas</p>
        ) : (
          <div className="space-y-2">
            {memories.map(m => (
              <div key={m.id} className="bg-card-bg border border-card-border rounded-lg p-3">
                <p className="font-medium text-sm">{m.title}</p>
                <p className="text-xs text-muted mt-1">{m.memory_date} - {m.category}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Documentos</h2>
        {documents.length === 0 ? (
          <p className="text-muted text-sm">No hay documentos asociados</p>
        ) : (
          <div className="space-y-2">
            {documents.map(d => (
              <Link key={d.id} href={`/documentos/${d.id}`} className="block bg-card-bg border border-card-border rounded-lg p-3 hover:border-accent/30 transition-colors">
                <p className="font-medium text-sm">{d.title}</p>
                <p className="text-xs text-muted mt-1">{d.category} - {d.updated_at}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        title="Archivar Proyecto"
        message="El proyecto sera archivado. No se perdera ningun dato."
      />
    </div>
  );
}
