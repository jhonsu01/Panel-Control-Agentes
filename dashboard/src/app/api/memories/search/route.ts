import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return NextResponse.json([]);

  const memories = db.prepare(`
    SELECT m.*, p.name as project_name
    FROM memories m
    LEFT JOIN projects p ON m.project_id = p.id
    JOIN memories_fts ON memories_fts.rowid = m.id
    WHERE memories_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(q);

  return NextResponse.json(memories);
}
