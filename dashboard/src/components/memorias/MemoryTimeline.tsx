'use client';

import { useState } from 'react';
import { Memory } from '@/types';
import Badge from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, Pencil, Trash2, MessageSquare, Lightbulb, Target, StickyNote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CATEGORY_CONFIG: Record<string, { icon: typeof MessageSquare; color: 'blue' | 'amber' | 'purple' | 'gray'; label: string }> = {
  conversacion: { icon: MessageSquare, color: 'blue', label: 'Conversacion' },
  decision: { icon: Target, color: 'amber', label: 'Decision' },
  insight: { icon: Lightbulb, color: 'purple', label: 'Insight' },
  nota: { icon: StickyNote, color: 'gray', label: 'Nota' },
};

interface MemoryTimelineProps {
  memories: Memory[];
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
}

export default function MemoryTimeline({ memories, onEdit, onDelete }: MemoryTimelineProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Group by date
  const grouped = memories.reduce<Record<string, Memory[]>>((acc, m) => {
    (acc[m.memory_date] = acc[m.memory_date] || []).push(m);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (memories.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No hay memorias</p>;
  }

  return (
    <div className="space-y-2">
      {dates.map(date => {
        const isExpanded = expandedDates.has(date);
        const items = grouped[date];
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <div key={date} className="border border-card-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleDate(date)}
              className="w-full flex items-center justify-between p-3 bg-card-bg hover:bg-card-border/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-medium text-sm capitalize">{formattedDate}</span>
                <span className="text-xs text-muted">{items.length} memorias</span>
              </div>
            </button>
            {isExpanded && (
              <div className="p-3 space-y-3 bg-background/50">
                {items.map(memory => {
                  const config = CATEGORY_CONFIG[memory.category] || CATEGORY_CONFIG.nota;
                  const Icon = config.icon;
                  return (
                    <div key={memory.id} className="bg-card-bg border border-card-border rounded-lg p-3 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} className="text-muted" />
                            <span className="font-medium text-sm">{memory.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge color={config.color}>{config.label}</Badge>
                            {memory.project_name && <Badge color="purple">{memory.project_name}</Badge>}
                          </div>
                          <div className="markdown-content text-sm text-muted">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{memory.content}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button onClick={() => onEdit(memory)} className="text-muted hover:text-foreground p-1">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => onDelete(memory)} className="text-muted hover:text-danger p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
