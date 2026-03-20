import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = 'SELECT * FROM cron_jobs WHERE 1=1';
  const params: string[] = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY updated_at DESC';

  const jobs = db.prepare(query).all(...params);
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, script, language, cron_expression, status } = body;

  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

  const result = db.prepare(`
    INSERT INTO cron_jobs (name, description, script, language, cron_expression, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description || null,
    script || '',
    language || 'python',
    cron_expression || null,
    status || 'borrador'
  );

  const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(job, { status: 201 });
}
