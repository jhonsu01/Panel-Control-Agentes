import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { extract } from 'tar';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });

  const tempDir = path.join(os.tmpdir(), `backup_import_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Save uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    const tarPath = path.join(tempDir, 'import.tar.gz');
    fs.writeFileSync(tarPath, buffer);

    // Extract using Node.js tar (no system command)
    await extract({ file: tarPath, cwd: tempDir });

    // Look for the database file
    const dbFile = path.join(tempDir, 'database_backup.db');
    if (!fs.existsSync(dbFile)) {
      return NextResponse.json({ error: 'No se encontro database_backup.db en el archivo' }, { status: 400 });
    }

    // Close current db connections by running a checkpoint
    db.pragma('wal_checkpoint(TRUNCATE)');

    // Replace current database
    const currentDbPath = path.join(process.cwd(), 'data', 'database.db');

    // Backup current before replacing
    const backupCurrent = currentDbPath + '.pre_import';
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, backupCurrent);
    }

    fs.copyFileSync(dbFile, currentDbPath);

    // Remove WAL/SHM files to force fresh start
    try { fs.unlinkSync(currentDbPath + '-wal'); } catch {}
    try { fs.unlinkSync(currentDbPath + '-shm'); } catch {}

    // Log the import
    db.prepare('INSERT INTO backups (filename, size_bytes, type) VALUES (?, ?, ?)')
      .run(file.name, buffer.length, 'import');

    // Cleanup temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    return NextResponse.json({ success: true, message: 'Importacion completada. Reinicia el servidor para aplicar cambios.' });
  } catch (err: unknown) {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
