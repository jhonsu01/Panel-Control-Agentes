'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory, LongTermMemory } from '@/types';

export function useMemories(filters?: { category?: string; project_id?: number; date?: string }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.project_id) params.set('project_id', String(filters.project_id));
    if (filters?.date) params.set('date', filters.date);

    const res = await fetch(`/api/memories?${params}`);
    const data = await res.json();
    setMemories(data);
    setLoading(false);
  }, [filters?.category, filters?.project_id, filters?.date]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (memory: Partial<Memory>) => {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<Memory>) => {
    const res = await fetch(`/api/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  const search = async (q: string) => {
    const res = await fetch(`/api/memories/search?q=${encodeURIComponent(q)}`);
    return res.json();
  };

  return { memories, loading, refresh: fetch_, create, update, remove, search };
}

export function useLongTermMemory() {
  const [memory, setMemory] = useState<LongTermMemory | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/long-term-memory');
    const data = await res.json();
    setMemory(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const save = async (data: Partial<LongTermMemory>) => {
    const res = await fetch('/api/long-term-memory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  return { memory, loading, save, refresh: fetch_ };
}
