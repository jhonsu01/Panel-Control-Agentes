import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = db.prepare('SELECT * FROM cron_jobs WHERE id = ?').get(id) as {
    id: number; script: string; language: string; name: string;
  } | undefined;

  if (!job) return NextResponse.json({ error: 'Cron job no encontrado' }, { status: 404 });
  if (!job.script.trim()) return NextResponse.json({ error: 'Script vacio' }, { status: 400 });

  const ext = job.language === 'python' ? '.py' : job.language === 'node' ? '.js' : '.sh';
  const tmpFile = path.join(os.tmpdir(), `cronjob_${job.id}${ext}`);

  try {
    fs.writeFileSync(tmpFile, job.script, 'utf-8');

    const cmd = job.language === 'python' ? `python "${tmpFile}"`
      : job.language === 'node' ? `node "${tmpFile}"`
      : `bash "${tmpFile}"`;

    const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8', maxBuffer: 1024 * 1024 });

    db.prepare('UPDATE cron_jobs SET last_run = datetime(\'now\'), last_result = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(output.substring(0, 5000), id);

    fs.unlinkSync(tmpFile);
    return NextResponse.json({ success: true, output: output.substring(0, 5000) });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    db.prepare('UPDATE cron_jobs SET last_run = datetime(\'now\'), last_result = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(`ERROR: ${errorMsg.substring(0, 5000)}`, id);

    try { fs.unlinkSync(tmpFile); } catch {}
    return NextResponse.json({ success: false, error: errorMsg.substring(0, 2000) }, { status: 500 });
  }
}
