'use client';

import { useState, useEffect, useCallback } from 'react';
import { CronJob } from '@/types';

export function useCronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/cron-jobs');
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (job: Partial<CronJob>) => {
    const res = await fetch('/api/cron-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<CronJob>) => {
    const res = await fetch(`/api/cron-jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/cron-jobs/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  const run = async (id: number) => {
    const res = await fetch(`/api/cron-jobs/${id}/run`, { method: 'POST' });
    const data = await res.json();
    await fetch_();
    return data;
  };

  return { jobs, loading, refresh: fetch_, create, update, remove, run };
}
