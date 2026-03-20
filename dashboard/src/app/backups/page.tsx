'use client';

import { useState, useRef } from 'react';
import { useBackups } from '@/hooks/useBackups';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Download, Upload, Archive, HardDrive, AlertTriangle, Trash2 } from 'lucide-react';
import { Backup } from '@/types';

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BackupsPage() {
  const { backups, loading, createBackup, importBackup, downloadBackup, removeBackup } = useBackups();
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deleteBackup, setDeleteBackup] = useState<Backup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const res = await createBackup();
      if (res.ok) {
        setMessage({ text: 'Backup creado exitosamente', type: 'success' });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Error creando backup', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de conexion', type: 'error' });
    }
    setCreating(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const res = await importBackup(file);
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || 'Importacion completada', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Error importando', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de conexion', type: 'error' });
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Backups</h1>
          <p className="text-muted text-sm mt-1">Copias de seguridad e importacion</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Download size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Exportar Backup</h3>
              <p className="text-xs text-muted">Descarga una copia completa de la base de datos</p>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            Se creara un archivo <code className="bg-background px-1.5 py-0.5 rounded text-xs">.tar.gz</code> con
            la base de datos SQLite y el schema.
          </p>
          <Button onClick={handleCreateBackup} disabled={creating}>
            <Archive size={16} /> {creating ? 'Creando...' : 'Crear Backup'}
          </Button>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Upload size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Importar Backup</h3>
              <p className="text-xs text-muted">Restaura desde un archivo .tar.gz</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 rounded-lg p-2 mb-4">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>Esto reemplazara TODOS los datos actuales. Se guardara una copia de seguridad automatica antes de importar.</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".tar.gz,.tgz"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload size={16} /> {importing ? 'Importando...' : 'Seleccionar Archivo'}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Backup History */}
      <h2 className="text-lg font-semibold mb-3">Historial</h2>
      {loading ? (
        <div className="text-muted text-center py-8">Cargando...</div>
      ) : backups.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <HardDrive size={40} className="mx-auto mb-2 opacity-30" />
          <p>No hay backups registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map(backup => (
            <div key={backup.id} className="bg-card-bg border border-card-border rounded-lg p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Archive size={16} className="text-muted" />
                <div>
                  <p className="text-sm font-medium">{backup.filename}</p>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span>{new Date(backup.created_at).toLocaleString('es-ES')}</span>
                    <span>{formatBytes(backup.size_bytes)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={backup.type === 'export' ? 'blue' : 'amber'}>
                  {backup.type === 'export' ? 'Exportado' : 'Importado'}
                </Badge>
                {backup.type === 'export' && (
                  <Button size="sm" variant="ghost" onClick={() => downloadBackup(backup.id)}>
                    <Download size={14} /> Descargar
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setDeleteBackup(backup)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteBackup}
        onClose={() => setDeleteBackup(null)}
        onConfirm={async () => { if (deleteBackup) await removeBackup(deleteBackup.id); }}
        title="Eliminar Backup"
        message={`¿Seguro que deseas eliminar "${deleteBackup?.filename}"? El archivo se borrara del disco.`}
      />
    </div>
  );
}
