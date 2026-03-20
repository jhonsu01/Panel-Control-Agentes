'use client';

import { useState, useEffect } from 'react';
import { useLongTermMemory } from '@/hooks/useMemories';
import Button from '@/components/ui/Button';
import { Save, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LongTermEditor() {
  const { memory, loading, save } = useLongTermMemory();
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memory) setContent(memory.content);
  }, [memory]);

  const handleSave = async () => {
    setSaving(true);
    await save({ content });
    setSaving(false);
    setEditing(false);
  };

  if (loading) return <div className="text-muted text-center py-8">Cargando...</div>;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-card-border">
        <div>
          <h3 className="font-semibold">Memoria a Largo Plazo</h3>
          {memory && (
            <p className="text-xs text-muted mt-0.5">
              Modificado: {new Date(memory.updated_at).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <><Eye size={14} /> Vista previa</> : <><Edit3 size={14} /> Editar</>}
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] bg-background border border-card-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
          />
        ) : (
          <div className="markdown-content min-h-[200px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Sin contenido*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
