import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const project_id = searchParams.get('project_id');
  const date = searchParams.get('date');

  let query = `
    SELECT m.*, p.name as project_name
    FROM memories m
    LEFT JOIN projects p ON m.project_id = p.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (category) { query += ' AND m.category = ?'; params.push(category); }
  if (project_id) { query += ' AND m.project_id = ?'; params.push(Number(project_id)); }
  if (date) { query += ' AND m.memory_date = ?'; params.push(date); }

  query += ' ORDER BY m.memory_date DESC, m.created_at DESC';

  const memories = db.prepare(query).all(...params);
  return NextResponse.json(memories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, category, project_id, memory_date } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Titulo y contenido son requeridos' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO memories (title, content, category, project_id, memory_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, content, category || 'nota', project_id || null, memory_date || new Date().toISOString().split('T')[0]);

  const memory = db.prepare('SELECT m.*, p.name as project_name FROM memories m LEFT JOIN projects p ON m.project_id = p.id WHERE m.id = ?').get(result.lastInsertRowid);
  return NextResponse.json(memory, { status: 201 });
}
