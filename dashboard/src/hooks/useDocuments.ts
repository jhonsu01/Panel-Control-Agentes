'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Category } from '@/types';

export function useDocuments(filters?: { category?: string; project_id?: number; sort?: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.project_id) params.set('project_id', String(filters.project_id));
    if (filters?.sort) params.set('sort', filters.sort);

    const res = await fetch(`/api/documents?${params}`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  }, [filters?.category, filters?.project_id, filters?.sort]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (doc: Partial<Document>) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const update = async (id: number, data: Partial<Document>) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res;
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (res.ok) await fetch_();
    return res;
  };

  const search = async (q: string) => {
    const res = await fetch(`/api/documents/search?q=${encodeURIComponent(q)}`);
    return res.json();
  };

  return { documents, loading, refresh: fetch_, create, update, remove, search };
}

export function useCategories(type?: string) {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetch_ = useCallback(async () => {
    const params = type ? `?type=${type}` : '';
    const res = await fetch(`/api/categories${params}`);
    const data = await res.json();
    setCategories(data);
  }, [type]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const create = async (name: string, catType = 'document') => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type: catType }),
    });
    if (res.ok) await fetch_();
    return res;
  };

  return { categories, refresh: fetch_, create };
}
