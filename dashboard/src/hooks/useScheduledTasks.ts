'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScheduledTask } from '@/types';

export function useScheduledTasks(month?: string) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set('month', month);

    const [allRes, todayRes] = await Promise.all([
      fetch(`/api/scheduled-tasks?${params}`),
      fetch('/api/scheduled-tasks/today'),
    ]);
    const allData = await allRes.json();
    const todayData = await todayRes.json();
    setTasks(allData);
    setTodayTasks(todayData);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (task: Partial<ScheduledTask>) => {
    const res = await fetch('/api/scheduled-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<ScheduledTask>) => {
    const res = await fetch(`/api/scheduled-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const execute = async (id: number, result?: string) => {
    const res = await fetch(`/api/scheduled-tasks/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    });
    if (res.ok) await fetch_();
    return res;
  };

  return { tasks, todayTasks, loading, refresh: fetch_, create, update, execute };
}
