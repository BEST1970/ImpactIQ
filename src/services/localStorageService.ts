import type { Experiment, AppSettings } from '../types';
import type { StorageService } from './storage';
import { migrateExperiment, frequentiePerMaand } from '../types';

const EXPERIMENTS_KEY = 'impactiq:experiments';
const SETTINGS_KEY    = 'impactiq:settings';

// ─── Default settings ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  entiteiten: ['CFE Group', 'VMA', 'Mobix', 'MBG', 'Van Laere', 'BPC', 'BPI', 'Wood Shapers'],
  aiTools: ['ChatGPT', 'Claude', 'Microsoft Copilot', 'Gemini', 'Mistral', 'Perplexity'],
  taakcategorieen: [
    'Calculatie',
    'Werfverslag',
    'Offerte',
    'Veiligheidsdocument',
    'Correspondentie',
    'Vertaling NL/FR',
    'Planning',
    'Rapportage',
    'Andere',
  ],
  adminPinHash: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function readExperiments(): Experiment[] {
  try {
    const raw = localStorage.getItem(EXPERIMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    // Migrate v1 data (frequentiePerMaand → frequentie + frequentieEenheid)
    return parsed.map(migrateExperiment);
  } catch {
    return [];
  }
}

function writeExperiments(experiments: Experiment[]): void {
  localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experiments));
}

// ─── Admin PIN hashing (Web Crypto SHA-256) ───────────────────────────────────

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── CSV helpers (UTF-8 BOM, RFC 4180 escaping, NL/FR-compatibel) ────────────

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  const cleaned = str.replace(/\r?\n/g, ' ');
  if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n')) {
    return '"' + cleaned.replace(/"/g, '""') + '"';
  }
  return cleaned;
}

const CSV_HEADERS = [
  'id', 'datum', 'medewerker', 'entiteit', 'aiTool', 'taakomschrijving', 'taakcategorie',
  'kwaliteitScore', 'correctieNodig',
  'verderGebruiken', 'vertrouwen',
  'frequentie', 'frequentieEenheid', 'frequentiePerMaand_berekend',
  'tijdVoor_min', 'tijdMet_min', 'bespaardPerTaak_min', 'bespaardPerMaand_min',
  'bespaardPerJaar_uur', 'procentueleBesparing_pct', 'minderFouten',
  'nieuwWerkMogelijk', 'meertijdVoorAnalyse', 'gewonnenTijdTekst',
  'besteprompt', 'gevoeligeData',
];

function experimentToRow(e: Experiment): string[] {
  const fpm = frequentiePerMaand(e);
  const bespaardPerTaak = e.tijdVoor - e.tijdMet;
  const bespaardPerMaand = bespaardPerTaak * fpm;
  const bespaardPerJaar = (bespaardPerMaand * 12) / 60;
  const pctBesparing = e.tijdVoor > 0 ? ((bespaardPerTaak / e.tijdVoor) * 100).toFixed(1).replace('.', ',') : '';

  return [
    e.id,
    e.createdAt.slice(0, 10),
    e.medewerker,
    e.entiteit,
    e.aiTool,
    e.taakomschrijving,
    e.taakcategorie,
    String(e.kwaliteitScore),
    e.correctieNodig ? 'ja' : 'nee',
    e.verderGebruiken ? 'ja' : 'nee',
    String(e.vertrouwen),
    String(e.frequentie),
    e.frequentieEenheid,
    fpm.toFixed(2).replace('.', ','),
    String(e.tijdVoor),
    String(e.tijdMet),
    String(bespaardPerTaak),
    String(Math.round(bespaardPerMaand)),
    bespaardPerJaar.toFixed(2).replace('.', ','),
    pctBesparing,
    e.minderFouten ? 'ja' : 'nee',
    e.nieuwWerkMogelijk ? 'ja' : 'nee',
    e.meertijdVoorAnalyse ? 'ja' : 'nee',
    e.gewonnenTijdTekst,
    e.besteprompt,
    e.gevoeligeData ? 'ja' : 'nee',
  ];
}

// ─── LocalStorage implementation ──────────────────────────────────────────────

export const localStorageService: StorageService = {
  async listExperiments() {
    return readExperiments().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getExperiment(id) {
    return readExperiments().find((e) => e.id === id) ?? null;
  },

  async saveExperiment(data) {
    const experiments = readExperiments();
    const now = new Date().toISOString();
    const newExp: Experiment = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    writeExperiments([newExp, ...experiments]);
    return newExp;
  },

  async updateExperiment(id, data) {
    const experiments = readExperiments();
    const idx = experiments.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Experiment ${id} niet gevonden`);
    const updated: Experiment = { ...experiments[idx], ...data, id, updatedAt: new Date().toISOString() };
    experiments[idx] = updated;
    writeExperiments(experiments);
    return updated;
  },

  async deleteExperiment(id) {
    writeExperiments(readExperiments().filter((e) => e.id !== id));
  },

  async getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const stored = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
      return {
        entiteiten:      stored.entiteiten      ?? DEFAULT_SETTINGS.entiteiten,
        aiTools:         stored.aiTools         ?? DEFAULT_SETTINGS.aiTools,
        taakcategorieen: stored.taakcategorieen ?? DEFAULT_SETTINGS.taakcategorieen,
        adminPinHash:    stored.adminPinHash    ?? null,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  async exportJSON() {
    return JSON.stringify(readExperiments(), null, 2);
  },

  async exportCSV() {
    const experiments = readExperiments();
    const BOM = '\uFEFF';
    const header = CSV_HEADERS.map(csvEscape).join(',');
    const rows = experiments.map((e) => experimentToRow(e).map(csvEscape).join(','));
    return BOM + [header, ...rows].join('\r\n');
  },

  async resetAll() {
    localStorage.removeItem(EXPERIMENTS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },
};
