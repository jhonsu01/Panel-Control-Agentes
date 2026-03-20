import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, frequency, cron_expression, scheduled_time, scheduled_date, status } = body;

  const existing = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

  db.prepare(`
    UPDATE scheduled_tasks SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      frequency = COALESCE(?, frequency),
      cron_expression = ?,
      scheduled_time = COALESCE(?, scheduled_time),
      scheduled_date = ?,
      status = COALESCE(?, status),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, description, frequency, cron_expression ?? null, scheduled_time, scheduled_date ?? null, status, id);

  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  return NextResponse.json(task);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
