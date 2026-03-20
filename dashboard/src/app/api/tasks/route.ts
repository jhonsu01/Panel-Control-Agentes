import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const project_id = searchParams.get('project_id');
  const assigned = searchParams.get('assigned');

  let query = `
    SELECT t.*, p.name as project_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (project_id) { query += ' AND t.project_id = ?'; params.push(Number(project_id)); }
  if (assigned) { query += ' AND t.assigned = ?'; params.push(assigned); }

  query += ' ORDER BY t.position ASC, t.created_at DESC';

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, status, priority, assigned, project_id } = body;

  if (!title) {
    return NextResponse.json({ error: 'El titulo es requerido' }, { status: 400 });
  }

  const maxPos = db.prepare(
    'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM tasks WHERE status = ?'
  ).get(status || 'pendiente') as { next_pos: number };

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, assigned, project_id, position)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || null,
    status || 'pendiente',
    priority || 'media',
    assigned || 'yo',
    project_id || null,
    maxPos.next_pos
  );

  const task = db.prepare('SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(task, { status: 201 });
}
