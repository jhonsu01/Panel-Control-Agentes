import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return NextResponse.json([]);

  const documents = db.prepare(`
    SELECT d.*, p.name as project_name
    FROM documents d
    LEFT JOIN projects p ON d.project_id = p.id
    JOIN documents_fts ON documents_fts.rowid = d.id
    WHERE documents_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(q);

  return NextResponse.json(documents);
}
