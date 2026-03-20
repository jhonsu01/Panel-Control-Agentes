'use client';

import { useState } from 'react';
import { useScheduledTasks } from '@/hooks/useScheduledTasks';
import CalendarGrid, { MONTHS } from '@/components/calendario/CalendarGrid';
import DayDetail from '@/components/calendario/DayDetail';
import ScheduledTaskForm from '@/components/calendario/ScheduledTaskForm';
import Button from '@/components/ui/Button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduledTask } from '@/types';

export default function CalendarioPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { tasks, todayTasks, loading, create, update, execute, refresh } = useScheduledTasks(monthStr);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const getTasksForSelectedDate = (): ScheduledTask[] => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    return tasks.filter(t => {
      if (t.frequency === 'diaria') return true;
      if (t.frequency === 'semanal' && t.scheduled_date) {
        return new Date(t.scheduled_date + 'T00:00:00').getDay() === dayOfWeek;
      }
      if (t.frequency === 'mensual') return dayOfMonth === (t.scheduled_date ? new Date(t.scheduled_date + 'T00:00:00').getDate() : 1);
      if (t.frequency === 'unica') return t.scheduled_date === selectedDate;
      if (t.frequency === 'personalizada') return true;
      return false;
    }).map(t => {
      const todayTask = todayTasks.find(tt => tt.id === t.id);
      return { ...t, executed_today: todayTask?.executed_today || 0 };
    });
  };

  const handleSubmit = async (data: Partial<ScheduledTask>) => {
    if (editingTask) {
      await update(editingTask.id, data);
    } else {
      await create(data);
    }
    setEditingTask(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted text-sm mt-1">{todayTasks.length} tareas para hoy</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
          <Plus size={16} /> Nueva Tarea
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-muted hover:text-foreground p-2">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="text-muted hover:text-foreground p-2">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={`grid gap-4 ${selectedDate ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
        {loading ? (
          <div className="text-muted text-center py-12">Cargando...</div>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            tasks={tasks}
            onDayClick={setSelectedDate}
          />
        )}

        {selectedDate && (
          <DayDetail
            date={selectedDate}
            tasks={getTasksForSelectedDate()}
            onClose={() => setSelectedDate(null)}
            onEdit={(task) => { setEditingTask(task); setFormOpen(true); }}
            onExecute={async (id) => { await execute(id); }}
            onToggleStatus={async (id, status) => { await update(id, { status: status as ScheduledTask['status'] }); }}
          />
        )}
      </div>

      <ScheduledTaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        task={editingTask}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}
