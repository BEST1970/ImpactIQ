import type { Experiment, AppSettings } from '../types';

// ─── StorageService interface ─────────────────────────────────────────────────
// De rest van de app praat ALLEEN via deze interface.
// Later vervang je de implementatie (localStorage → Supabase) zonder de UI aan te passen.

export interface StorageService {
  // Experimenten
  listExperiments(): Promise<Experiment[]>;
  getExperiment(id: string): Promise<Experiment | null>;
  saveExperiment(data: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experiment>;
  updateExperiment(id: string, data: Partial<Omit<Experiment, 'id' | 'createdAt'>>): Promise<Experiment>;
  deleteExperiment(id: string): Promise<void>;

  // Instellingen
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;

  // Hulpfuncties
  exportJSON(): Promise<string>;
  exportCSV(): Promise<string>;
  resetAll(): Promise<void>;
}
