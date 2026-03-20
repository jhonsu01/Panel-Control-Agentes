import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const month = searchParams.get('month'); // YYYY-MM format

  let query = 'SELECT * FROM scheduled_tasks WHERE 1=1';
  const params: string[] = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (month) { query += ' AND (scheduled_date LIKE ? OR frequency != \'unica\')'; params.push(`${month}%`); }

  query += ' ORDER BY scheduled_time ASC';

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, frequency, cron_expression, scheduled_time, scheduled_date, status } = body;

  if (!name || !scheduled_time) {
    return NextResponse.json({ error: 'Nombre y hora son requeridos' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO scheduled_tasks (name, description, frequency, cron_expression, scheduled_time, scheduled_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description || null,
    frequency || 'unica',
    cron_expression || null,
    scheduled_time,
    scheduled_date || null,
    status || 'activa'
  );

  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(task, { status: 201 });
}
