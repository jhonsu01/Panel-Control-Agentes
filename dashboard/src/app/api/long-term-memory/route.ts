import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const memory = db.prepare('SELECT * FROM long_term_memory WHERE id = 1').get();
  return NextResponse.json(memory);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  db.prepare(`
    UPDATE long_term_memory SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      updated_at = datetime('now')
    WHERE id = 1
  `).run(title, content);

  const memory = db.prepare('SELECT * FROM long_term_memory WHERE id = 1').get();
  return NextResponse.json(memory);
}
