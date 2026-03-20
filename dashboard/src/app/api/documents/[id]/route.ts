import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = db.prepare('SELECT d.*, p.name as project_name FROM documents d LEFT JOIN projects p ON d.project_id = p.id WHERE d.id = ?').get(id);
  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, category, project_id } = body;

  db.prepare(`
    UPDATE documents SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      category = COALESCE(?, category),
      project_id = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(title, content, category, project_id !== undefined ? project_id : null, id);

  const doc = db.prepare('SELECT d.*, p.name as project_name FROM documents d LEFT JOIN projects p ON d.project_id = p.id WHERE d.id = ?').get(id);
  return NextResponse.json(doc);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
