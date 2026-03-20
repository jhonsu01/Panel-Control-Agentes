export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  archived: number;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  pending_tasks?: number;
  days_since_activity?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pendiente' | 'en_progreso' | 'revision' | 'terminado';
  priority: 'alta' | 'media' | 'baja';
  assigned: 'yo' | 'agente';
  project_id: number | null;
  project_name?: string;
  created_at: string;
  completed_at: string | null;
  position: number;
  updated_at: string;
}

export interface ScheduledTask {
  id: number;
  name: string;
  description: string | null;
  frequency: 'unica' | 'diaria' | 'semanal' | 'mensual' | 'personalizada';
  cron_expression: string | null;
  scheduled_time: string;
  scheduled_date: string | null;
  status: 'activa' | 'pausada';
  created_at: string;
  updated_at: string;
  executed_today?: number;
}

export interface Memory {
  id: number;
  title: string;
  content: string;
  category: 'conversacion' | 'decision' | 'insight' | 'nota';
  project_id: number | null;
  project_name?: string;
  memory_date: string;
  created_at: string;
  updated_at: string;
}

export interface LongTermMemory {
  id: number;
  title: string;
  content: string;
  section: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  project_id: number | null;
  project_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'document' | 'memory';
}

export interface CronJob {
  id: number;
  name: string;
  description: string | null;
  script: string;
  language: 'python' | 'bash' | 'node';
  cron_expression: string | null;
  scheduled_task_id: number | null;
  status: 'activo' | 'pausado' | 'borrador';
  last_run: string | null;
  last_result: string | null;
  created_at: string;
  updated_at: string;
}

export interface Backup {
  id: number;
  filename: string;
  size_bytes: number | null;
  type: 'export' | 'import';
  created_at: string;
}
