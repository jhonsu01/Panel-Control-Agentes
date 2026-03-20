import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export function GET() {
  const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC').all();
  return NextResponse.json(backups);
}

// POST = create a backup (export)
export async function POST() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const filename = `backup_${timestamp}.tar.gz`;
  const backupPath = path.join(backupDir, filename);

  try {
    // Copy the database safely (VACUUM INTO creates a clean copy)
    const tempDbPath = path.join(backupDir, 'database_backup.db');
    if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
    db.exec(`VACUUM INTO '${tempDbPath.replace(/\\/g, '/')}'`);

    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');

    // Create tar.gz using archiver (pure Node.js, no system tar)
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('tar', { gzip: true });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.file(tempDbPath, { name: 'database_backup.db' });
      archive.file(schemaPath, { name: 'schema.sql' });
      archive.finalize();
    });

    // Clean temp db
    fs.unlinkSync(tempDbPath);

    const stats = fs.statSync(backupPath);

    // Log the backup
    const result = db.prepare(
      'INSERT INTO backups (filename, size_bytes, type) VALUES (?, ?, ?)'
    ).run(filename, stats.size, 'export');

    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(backup, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
