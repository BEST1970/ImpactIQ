import type { Experiment, AppSettings } from '../types';
import type { StorageService } from '../services/storage';
import { localStorageService } from '../services/localStorageService';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Context type ─────────────────────────────────────────────────────────────

interface StorageContextValue {
  service: StorageService;
  experiments: Experiment[];
  settings: AppSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const service = localStorageService; // swap this for supabaseService later

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [exps, sets] = await Promise.all([
      service.listExperiments(),
      service.getSettings(),
    ]);
    setExperiments(exps);
    setSettings(sets);
    setLoading(false);
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <StorageContext.Provider value={{ service, experiments, settings, loading, refresh }}>
      {children}
    </StorageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useStorage must be used within a StorageProvider');
  return ctx;
}
