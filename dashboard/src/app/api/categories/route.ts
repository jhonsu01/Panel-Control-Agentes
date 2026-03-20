import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let query = 'SELECT * FROM categories';
  const params: string[] = [];

  if (type) { query += ' WHERE type = ?'; params.push(type); }
  query += ' ORDER BY name ASC';

  const categories = db.prepare(query).all(...params);
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type } = body;

  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

  try {
    const result = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type || 'document');
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(cat, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Categoria ya existe' }, { status: 409 });
  }
}
