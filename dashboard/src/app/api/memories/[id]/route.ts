import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memory = db.prepare('SELECT m.*, p.name as project_name FROM memories m LEFT JOIN projects p ON m.project_id = p.id WHERE m.id = ?').get(id);
  if (!memory) return NextResponse.json({ error: 'Memoria no encontrada' }, { status: 404 });
  return NextResponse.json(memory);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, category, project_id, memory_date } = body;

  db.prepare(`
    UPDATE memories SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      category = COALESCE(?, category),
      project_id = ?,
      memory_date = COALESCE(?, memory_date),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(title, content, category, project_id !== undefined ? project_id : null, memory_date, id);

  const memory = db.prepare('SELECT m.*, p.name as project_name FROM memories m LEFT JOIN projects p ON m.project_id = p.id WHERE m.id = ?').get(id);
  return NextResponse.json(memory);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM memories WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
