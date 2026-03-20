'use client';

import { Document } from '@/types';
import Badge from '@/components/ui/Badge';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
}

const CATEGORY_COLORS: Record<string, 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'gray'> = {
  planificacion: 'blue',
  arquitectura: 'purple',
  PRD: 'green',
  newsletter: 'amber',
  contenido: 'red',
  otro: 'gray',
};

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const preview = doc.content.substring(0, 150).replace(/[#*_`]/g, '');

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/api/documents/${doc.id}/download`, '_blank');
  };

  return (
    <Link
      href={`/documentos/${doc.id}`}
      className="block bg-card-bg border border-card-border rounded-xl p-4 hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm group-hover:text-accent transition-colors">{doc.title}</h3>
            <button
              onClick={handleDownload}
              className="shrink-0 p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Descargar"
            >
              <Download size={14} />
            </button>
          </div>
          <p className="text-xs text-muted mt-1 line-clamp-2">{preview || 'Sin contenido'}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge color={CATEGORY_COLORS[doc.category] || 'gray'}>{doc.category}</Badge>
            {doc.project_name && <Badge color="purple">{doc.project_name}</Badge>}
          </div>
          <div className="flex gap-3 text-xs text-muted/60 mt-2">
            <span>Creado: {new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
            <span>Modificado: {new Date(doc.updated_at).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
