import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!task) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

  db.prepare(
    'INSERT INTO scheduled_task_executions (scheduled_task_id, result) VALUES (?, ?)'
  ).run(id, body.result || null);

  return NextResponse.json({ success: true });
}
