import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function guessExtension(title: string, content: string): string {
  // If the title already has an extension, use it
  const extMatch = title.match(/\.(sh|md|py|js|ts|json|txt|sql|yaml|yml|toml|csv|html|css|xml|ini|cfg|conf|env|bash|zsh)$/i);
  if (extMatch) return '';

  // Guess from content
  if (content.startsWith('#!/')) return '.sh';
  if (content.match(/^(import |from |def |class )/m) && content.match(/\.py|python/i)) return '.py';
  if (content.match(/^(const |let |var |function |import )/m)) return '.js';
  // Default to markdown
  return '.md';
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as {
    title: string;
    content: string;
  } | undefined;

  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });

  const ext = guessExtension(doc.title, doc.content);
  const filename = slugify(doc.title) + ext;

  return new NextResponse(doc.content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(Buffer.byteLength(doc.content, 'utf-8')),
    },
  });
}
