import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(id);
  if (!job) return NextResponse.json({ error: 'Cron job no encontrado' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, script, language, cron_expression, scheduled_task_id, status } = body;

  db.prepare(`
    UPDATE cron_jobs SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      script = COALESCE(?, script),
      language = COALESCE(?, language),
      cron_expression = ?,
      scheduled_task_id = ?,
      status = COALESCE(?, status),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, description, script, language, cron_expression ?? null, scheduled_task_id ?? null, status, id);

  const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(id);
  return NextResponse.json(job);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM cron_jobs WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
