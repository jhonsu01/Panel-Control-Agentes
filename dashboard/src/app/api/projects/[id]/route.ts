import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const project = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'terminado') as completed_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status != 'terminado') as pending_tasks,
        CAST(julianday('now') - julianday(COALESCE(p.updated_at, p.created_at)) AS INTEGER) as days_since_activity
      FROM projects p WHERE p.id = ?
    `).get(id);

    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    return NextResponse.json(project);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, color, icon, archived } = body;

  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

  db.prepare(`
    UPDATE projects SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      color = COALESCE(?, color),
      icon = COALESCE(?, icon),
      archived = COALESCE(?, archived),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, description, color, icon, archived, id);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return NextResponse.json(project);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
