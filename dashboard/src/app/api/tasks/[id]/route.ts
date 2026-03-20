import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = db.prepare('SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(id);
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, status, priority, assigned, project_id, position } = body;

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as { status: string } | undefined;
  if (!existing) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

  // Handle completion date
  let completed_at = null;
  if (status === 'terminado' && existing.status !== 'terminado') {
    completed_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
  } else if (status && status !== 'terminado') {
    completed_at = null;
  }

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      assigned = COALESCE(?, assigned),
      project_id = ?,
      position = COALESCE(?, position),
      completed_at = CASE
        WHEN ? = 'terminado' AND status != 'terminado' THEN ?
        WHEN ? IS NOT NULL AND ? != 'terminado' THEN NULL
        ELSE completed_at
      END,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title, description, status, priority, assigned,
    project_id !== undefined ? project_id : undefined,
    position,
    status, completed_at,
    status, status,
    id
  );

  // Also update the project's updated_at if task has a project
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as { project_id: number | null };
  if (updatedTask?.project_id) {
    db.prepare('UPDATE projects SET updated_at = datetime(\'now\') WHERE id = ?').run(updatedTask.project_id);
  }

  const task = db.prepare('SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(id);
  return NextResponse.json(task);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
