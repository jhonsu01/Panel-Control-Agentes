import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const project_id = searchParams.get('project_id');
  const sort = searchParams.get('sort') || 'updated_at';

  let query = `
    SELECT d.*, p.name as project_name
    FROM documents d
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (category) { query += ' AND d.category = ?'; params.push(category); }
  if (project_id) { query += ' AND d.project_id = ?'; params.push(Number(project_id)); }

  const validSorts = ['updated_at', 'created_at', 'title'];
  const sortCol = validSorts.includes(sort) ? sort : 'updated_at';
  query += ` ORDER BY d.${sortCol} DESC`;

  const documents = db.prepare(query).all(...params);
  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, category, project_id } = body;

  if (!title) {
    return NextResponse.json({ error: 'El titulo es requerido' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO documents (title, content, category, project_id)
    VALUES (?, ?, ?, ?)
  `).run(title, content || '', category || 'otro', project_id || null);

  const doc = db.prepare('SELECT d.*, p.name as project_name FROM documents d LEFT JOIN projects p ON d.project_id = p.id WHERE d.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(doc, { status: 201 });
}
