'use client';

import { useState } from 'react';
import { useCronJobs } from '@/hooks/useCronJobs';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Play, Pencil, Trash2, Terminal, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react';
import { CronJob } from '@/types';

const LANG_LABELS: Record<string, string> = { python: 'Python', bash: 'Bash', node: 'Node.js' };
const LANG_COLORS: Record<string, 'blue' | 'green' | 'amber'> = { python: 'blue', bash: 'green', node: 'amber' };
const STATUS_COLORS: Record<string, 'green' | 'yellow' | 'gray'> = { activo: 'green', pausado: 'yellow', borrador: 'gray' };

export default function CronJobsPage() {
  const { jobs, loading, create, update, remove, run } = useCronJobs();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CronJob | null>(null);
  const [deleteJob, setDeleteJob] = useState<CronJob | null>(null);
  const [runResult, setRunResult] = useState<{ jobName: string; output: string; success: boolean } | null>(null);
  const [running, setRunning] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [language, setLanguage] = useState('python');
  const [cronExpr, setCronExpr] = useState('');
  const [status, setStatus] = useState('borrador');

  const openForm = (job?: CronJob) => {
    if (job) {
      setEditing(job);
      setName(job.name);
      setDescription(job.description || '');
      setScript(job.script);
      setLanguage(job.language);
      setCronExpr(job.cron_expression || '');
      setStatus(job.status);
    } else {
      setEditing(null);
      setName('');
      setDescription('');
      setScript('');
      setLanguage('python');
      setCronExpr('');
      setStatus('borrador');
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data: Partial<CronJob> = {
      name: name.trim(),
      description: description.trim() || null,
      script,
      language: language as CronJob['language'],
      cron_expression: cronExpr.trim() || null,
      status: status as CronJob['status'],
    };
    if (editing) await update(editing.id, data);
    else await create(data);
    setFormOpen(false);
  };

  const handleRun = async (job: CronJob) => {
    setRunning(job.id);
    const result = await run(job.id);
    setRunning(null);
    setRunResult({
      jobName: job.name,
      output: result.output || result.error || 'Sin salida',
      success: result.success,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-muted text-sm mt-1">{jobs.length} scripts registrados</p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus size={16} /> Nuevo Script
        </Button>
      </div>

      {loading ? (
        <div className="text-muted text-center py-12">Cargando...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <Terminal size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No hay cron jobs</p>
          <p className="text-sm mt-1">Crea tu primer script para programarlo en el calendario</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-card-bg border border-card-border rounded-xl p-4 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Terminal size={16} className="text-accent" />
                    <span className="font-medium">{job.name}</span>
                    <Badge color={STATUS_COLORS[job.status]}>{job.status}</Badge>
                    <Badge color={LANG_COLORS[job.language]}>{LANG_LABELS[job.language]}</Badge>
                  </div>
                  {job.description && <p className="text-sm text-muted mb-2">{job.description}</p>}
                  {job.cron_expression && (
                    <div className="flex items-center gap-1 text-xs text-muted mb-2">
                      <Clock size={12} /> Cron: <code className="bg-background px-1.5 py-0.5 rounded">{job.cron_expression}</code>
                    </div>
                  )}
                  {/* Script preview */}
                  <pre className="bg-background rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-32 border border-card-border">
                    {job.script || '# Script vacio'}
                  </pre>
                  {job.last_run && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      {job.last_result?.startsWith('ERROR') ? (
                        <XCircle size={12} className="text-danger" />
                      ) : (
                        <CheckCircle2 size={12} className="text-success" />
                      )}
                      Ultima ejecucion: {new Date(job.last_run).toLocaleString('es-ES')}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleRun(job)}
                    disabled={running === job.id || !job.script.trim()}
                  >
                    <Play size={12} /> {running === job.id ? 'Ejecutando...' : 'Ejecutar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openForm(job)}>
                    <Pencil size={12} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update(job.id, { status: job.status === 'activo' ? 'pausado' : 'activo' })}>
                    {job.status === 'activo' ? <Pause size={12} /> : <Play size={12} />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteJob(job)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar Cron Job' : 'Nuevo Cron Job'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required placeholder="ej: sync-data" />
          <Input label="Descripcion" value={description} onChange={e => setDescription(e.target.value)} placeholder="Que hace este script" />
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Lenguaje"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              options={[
                { value: 'python', label: 'Python' },
                { value: 'bash', label: 'Bash' },
                { value: 'node', label: 'Node.js' },
              ]}
            />
            <Input label="Expresion Cron" value={cronExpr} onChange={e => setCronExpr(e.target.value)} placeholder="0 9 * * *" />
            <Select
              label="Estado"
              value={status}
              onChange={e => setStatus(e.target.value)}
              options={[
                { value: 'borrador', label: 'Borrador' },
                { value: 'activo', label: 'Activo' },
                { value: 'pausado', label: 'Pausado' },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-muted">Script</label>
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              rows={12}
              className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
              placeholder={language === 'python' ? '# Tu script Python aqui\nprint("Hola mundo")' : language === 'bash' ? '#!/bin/bash\necho "Hola mundo"' : '// Tu script Node.js aqui\nconsole.log("Hola mundo")'}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Run Result Modal */}
      <Modal open={!!runResult} onClose={() => setRunResult(null)} title={`Resultado: ${runResult?.jobName || ''}`} maxWidth="max-w-2xl">
        <div className={`mb-2 flex items-center gap-2 ${runResult?.success ? 'text-success' : 'text-danger'}`}>
          {runResult?.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span className="font-medium">{runResult?.success ? 'Ejecucion exitosa' : 'Error en ejecucion'}</span>
        </div>
        <pre className="bg-background rounded-lg p-4 text-xs font-mono overflow-auto max-h-96 border border-card-border whitespace-pre-wrap">
          {runResult?.output}
        </pre>
      </Modal>

      <ConfirmDialog
        open={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        onConfirm={async () => { if (deleteJob) await remove(deleteJob.id); }}
        title="Eliminar Cron Job"
        message={`¿Seguro que deseas eliminar "${deleteJob?.name}"?`}
      />
    </div>
  );
}
