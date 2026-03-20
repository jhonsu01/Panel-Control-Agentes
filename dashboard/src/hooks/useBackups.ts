'use client';

import { useState, useEffect, useCallback } from 'react';
import { Backup } from '@/types';

export function useBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/backups');
    const data = await res.json();
    setBackups(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createBackup = async () => {
    const res = await fetch('/api/backups', { method: 'POST' });
    if (res.ok) await fetch_();
    return res;
  };

  const importBackup = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/backups/import', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) await fetch_();
    return res;
  };

  const downloadBackup = (id: number) => {
    window.open(`/api/backups/${id}`, '_blank');
  };

  const removeBackup = async (id: number) => {
    const res = await fetch(`/api/backups/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  return { backups, loading, refresh: fetch_, createBackup, importBackup, downloadBackup, removeBackup };
}
