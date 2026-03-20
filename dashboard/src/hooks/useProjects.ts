'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';

export function useProjects(archived = false) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects?archived=${archived ? 1 : 0}`);
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, [archived]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (project: Partial<Project>) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<Project>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  return { projects, loading, refresh: fetch_, create, update, remove };
}
