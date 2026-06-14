import type { Experiment } from '../types';
import { deriveMetrics } from '../types';

// ─── Aggregated dashboard metrics ────────────────────────────────────────────

export interface DashboardMetrics {
  totaalExperimenten: number;

  // Niveau 1
  gemKwaliteit: number | null;
  pctZonderCorrectie: number | null;

  // Niveau 2
  pctVerderGebruiken: number | null;
  gemVertrouwen: number | null;

  // Niveau 3 – kerncijfers (inclusief negatieve waarden!)
  totaalBespaardPerMaandMin: number;
  totaalBespaardPerJaarUur: number;
  gemProcentueleBesparing: number | null;
  pctMinderFouten: number | null;

  // Niveau 4
  pctNieuwWerk: number | null;
  pctMeertijdAnalyse: number | null;
}

function avg(vals: number[]): number | null {
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function pct(count: number, total: number): number | null {
  if (total === 0) return null;
  return (count / total) * 100;
}

export function computeMetrics(experiments: Experiment[]): DashboardMetrics {
  const n = experiments.length;

  if (n === 0) {
    return {
      totaalExperimenten: 0,
      gemKwaliteit: null,
      pctZonderCorrectie: null,
      pctVerderGebruiken: null,
      gemVertrouwen: null,
      totaalBespaardPerMaandMin: 0,
      totaalBespaardPerJaarUur: 0,
      gemProcentueleBesparing: null,
      pctMinderFouten: null,
      pctNieuwWerk: null,
      pctMeertijdAnalyse: null,
    };
  }

  const derived = experiments.map(deriveMetrics);

  const totaalBespaardPerMaandMin = derived.reduce(
    (sum, d) => sum + d.bespaardPerMaandMin,
    0
  );
  const totaalBespaardPerJaarUur = (totaalBespaardPerMaandMin * 12) / 60;

  const pctVals = derived
    .map((d) => d.procentueleBesparing)
    .filter((v): v is number => v !== null);

  return {
    totaalExperimenten: n,

    gemKwaliteit: avg(experiments.map((e) => e.kwaliteitScore)),
    pctZonderCorrectie: pct(experiments.filter((e) => !e.correctieNodig).length, n),

    pctVerderGebruiken: pct(experiments.filter((e) => e.verderGebruiken).length, n),
    gemVertrouwen: avg(experiments.map((e) => e.vertrouwen)),

    totaalBespaardPerMaandMin,
    totaalBespaardPerJaarUur,
    gemProcentueleBesparing: avg(pctVals),
    pctMinderFouten: pct(experiments.filter((e) => e.minderFouten).length, n),

    pctNieuwWerk: pct(experiments.filter((e) => e.nieuwWerkMogelijk).length, n),
    pctMeertijdAnalyse: pct(experiments.filter((e) => e.meertijdVoorAnalyse).length, n),
  };
}

// ─── Per-tool aggregation for charts ─────────────────────────────────────────

export interface ToolSummary {
  tool: string;
  experimenten: number;
  bespaardPerMaandUur: number; // can be negative!
  gemKwaliteit: number | null;
  pctVerderGebruiken: number | null;
}

export function computePerTool(experiments: Experiment[]): ToolSummary[] {
  const byTool = new Map<string, Experiment[]>();
  for (const e of experiments) {
    if (!byTool.has(e.aiTool)) byTool.set(e.aiTool, []);
    byTool.get(e.aiTool)!.push(e);
  }

  return Array.from(byTool.entries()).map(([tool, exps]) => {
    const derived = exps.map(deriveMetrics);
    const totalMin = derived.reduce((s, d) => s + d.bespaardPerMaandMin, 0);
    const n = exps.length;
    return {
      tool,
      experimenten: n,
      bespaardPerMaandUur: totalMin / 60,
      gemKwaliteit: avg(exps.map((e) => e.kwaliteitScore)),
      pctVerderGebruiken: pct(exps.filter((e) => e.verderGebruiken).length, n),
    };
  });
}

// ─── Per-category aggregation ─────────────────────────────────────────────────

export interface CategorySummary {
  categorie: string;
  experimenten: number;
  gemKwaliteit: number | null;
  bespaardPerMaandUur: number;
}

export function computePerCategory(experiments: Experiment[]): CategorySummary[] {
  const byCat = new Map<string, Experiment[]>();
  for (const e of experiments) {
    if (!byCat.has(e.taakcategorie)) byCat.set(e.taakcategorie, []);
    byCat.get(e.taakcategorie)!.push(e);
  }

  return Array.from(byCat.entries()).map(([categorie, exps]) => {
    const derived = exps.map(deriveMetrics);
    const totalMin = derived.reduce((s, d) => s + d.bespaardPerMaandMin, 0);
    return {
      categorie,
      experimenten: exps.length,
      gemKwaliteit: avg(exps.map((e) => e.kwaliteitScore)),
      bespaardPerMaandUur: totalMin / 60,
    };
  });
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatUren(uur: number): string {
  const abs = Math.abs(uur);
  const sign = uur < 0 ? '−' : '';
  if (abs < 1) return `${sign}${Math.round(abs * 60)} min`;
  
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${formatted} u`;
}

export function formatPct(val: number | null): string {
  if (val === null) return '-';
  const formatted = val.toFixed(1).replace('.', ',');
  return `${val >= 0 ? '+' : ''}${formatted}%`;
}
