import { NextResponse } from 'next/server';
import db from '@/lib/db';

export function GET() {
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
  const dayOfMonth = new Date().getDate();

  const tasks = db.prepare(`
    SELECT st.*,
      CASE WHEN EXISTS (
        SELECT 1 FROM scheduled_task_executions e
        WHERE e.scheduled_task_id = st.id
        AND date(e.executed_at) = date('now')
      ) THEN 1 ELSE 0 END as executed_today
    FROM scheduled_tasks st
    WHERE st.status = 'activa'
    AND (
      (st.frequency = 'diaria')
      OR (st.frequency = 'semanal' AND cast(strftime('%w', 'now') as integer) = ?)
      OR (st.frequency = 'mensual' AND cast(strftime('%d', 'now') as integer) = ?)
      OR (st.frequency = 'unica' AND st.scheduled_date = ?)
      OR (st.frequency = 'personalizada')
    )
    ORDER BY st.scheduled_time ASC
  `).all(dayOfWeek, dayOfMonth, today);

  return NextResponse.json(tasks);
}
