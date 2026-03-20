'use client';

import { ScheduledTask } from '@/types';
import Badge from '@/components/ui/Badge';

interface CalendarGridProps {
  year: number;
  month: number;
  tasks: ScheduledTask[];
  onDayClick: (date: string) => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getTasksForDate(tasks: ScheduledTask[], dateStr: string): ScheduledTask[] {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  return tasks.filter(t => {
    if (t.status === 'pausada') return false;
    if (t.frequency === 'diaria') return true;
    if (t.frequency === 'semanal') {
      if (t.scheduled_date) {
        const startDate = new Date(t.scheduled_date + 'T00:00:00');
        return startDate.getDay() === dayOfWeek;
      }
      return false;
    }
    if (t.frequency === 'mensual') return dayOfMonth === (t.scheduled_date ? new Date(t.scheduled_date + 'T00:00:00').getDate() : 1);
    if (t.frequency === 'unica') return t.scheduled_date === dateStr;
    if (t.frequency === 'personalizada') return true;
    return false;
  });
}

export { MONTHS };

export default function CalendarGrid({ year, month, tasks, onDayClick }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-muted py-2 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-24" />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = getTasksForDate(tasks, dateStr);
          const isToday = dateStr === today;

          return (
            <div
              key={i}
              onClick={() => onDayClick(dateStr)}
              className={`h-24 border border-card-border rounded-lg p-1.5 cursor-pointer transition-colors hover:border-accent/30 ${
                isToday ? 'bg-accent/10 border-accent/30' : 'bg-card-bg'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-muted'}`}>
                {day}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map(t => (
                  <div key={t.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-accent/10 text-accent">
                    {t.scheduled_time} {t.name}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-muted">+{dayTasks.length - 3} mas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
