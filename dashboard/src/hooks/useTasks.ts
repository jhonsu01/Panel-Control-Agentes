'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';

export function useTasks(filters?: { status?: string; project_id?: number; assigned?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.project_id) params.set('project_id', String(filters.project_id));
    if (filters?.assigned) params.set('assigned', filters.assigned);

    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [filters?.status, filters?.project_id, filters?.assigned]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (task: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  return { tasks, setTasks, loading, refresh: fetch_, create, update, remove };
}
