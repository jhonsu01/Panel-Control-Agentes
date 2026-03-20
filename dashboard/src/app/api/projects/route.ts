import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get('archived') ?? '0';

  const projects = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'terminado') as completed_tasks,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status != 'terminado') as pending_tasks,
      CAST(julianday('now') - julianday(COALESCE(p.updated_at, p.created_at)) AS INTEGER) as days_since_activity
    FROM projects p
    WHERE p.archived = ?
    ORDER BY p.updated_at DESC
  `).all(Number(archived));

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, color, icon } = body;

  if (!name) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO projects (name, description, color, icon) VALUES (?, ?, ?, ?)'
  ).run(name, description || null, color || '#6366f1', icon || 'folder');

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(project, { status: 201 });
}
