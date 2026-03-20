import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET = download a backup file
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id) as {
    filename: string;
  } | undefined;

  if (!backup) return NextResponse.json({ error: 'Backup no encontrado' }, { status: 404 });

  const filePath = path.join(process.cwd(), 'data', 'backups', backup.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${backup.filename}"`,
      'Content-Length': String(fileBuffer.length),
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id) as {
    filename: string;
  } | undefined;

  if (!backup) return NextResponse.json({ error: 'Backup no encontrado' }, { status: 404 });

  // Delete file from disk
  const filePath = path.join(process.cwd(), 'data', 'backups', backup.filename);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}

  // Delete record
  db.prepare('DELETE FROM backups WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
