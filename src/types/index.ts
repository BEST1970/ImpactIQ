// ─── Types ────────────────────────────────────────────────────────────────────

export type FrequentieEenheid = 'dag' | 'week' | 'maand';

export interface Experiment {
  // Systeem
  id: string;          // UUID, auto-gegenereerd
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601

  // Identificatie
  medewerker: string;
  entiteit: string;
  aiTool: string;
  taakomschrijving: string;
  taakcategorie: string;

  // Niveau 1 – Technisch
  kwaliteitScore: number;   // 1–5
  correctieNodig: boolean;

  // Niveau 2 – Adoptie
  verderGebruiken: boolean;
  vertrouwen: number;              // 1–5
  frequentie: number;              // aantal > 0
  frequentieEenheid: FrequentieEenheid; // dag | week | maand

  // Niveau 3 – Operationeel
  tijdVoor: number;   // minuten > 0
  tijdMet: number;    // minuten >= 0
  minderFouten: boolean;

  // Niveau 4 – Werkverrijking
  nieuwWerkMogelijk: boolean;
  meertijdVoorAnalyse: boolean;
  gewonnenTijdTekst: string; // optioneel

  // Extra
  besteprompt: string;  // optioneel
  gevoeligeData: boolean;
}

export interface AppSettings {
  entiteiten: string[];
  aiTools: string[];
  taakcategorieen: string[];
  adminPinHash: string | null; // SHA-256 hash van de admin-PIN; null = nog niet ingesteld
}

// ─── Frequentie → per maand normalisatie ──────────────────────────────────────

export function frequentiePerMaand(e: Pick<Experiment, 'frequentie' | 'frequentieEenheid'>): number {
  switch (e.frequentieEenheid) {
    case 'dag':   return e.frequentie * 30;
    case 'week':  return e.frequentie * 4.33;
    case 'maand': return e.frequentie;
  }
}

export function frequentieLabel(e: Pick<Experiment, 'frequentie' | 'frequentieEenheid'>): string {
  const eenheden: Record<FrequentieEenheid, string> = {
    dag: 'per dag',
    week: 'per week',
    maand: 'per maand',
  };
  return `${e.frequentie}× ${eenheden[e.frequentieEenheid]}`;
}

// ─── Afgeleide waarden (nooit opgeslagen) ─────────────────────────────────────

export interface DerivedMetrics {
  frequentiePerMaandVal: number;   // genormaliseerde frequentie
  bespaardPerTaakMin: number;      // kan negatief zijn
  bespaardPerMaandMin: number;     // kan negatief zijn
  bespaardPerJaarUur: number;      // kan negatief zijn
  procentueleBesparing: number | null; // null als tijdVoor === 0
  basisVolumePerMaandMin: number;
}

export function deriveMetrics(e: Experiment): DerivedMetrics {
  const frequentiePerMaandVal = frequentiePerMaand(e);
  const bespaardPerTaakMin = e.tijdVoor - e.tijdMet;
  const bespaardPerMaandMin = bespaardPerTaakMin * frequentiePerMaandVal;
  const bespaardPerJaarUur = (bespaardPerMaandMin * 12) / 60;
  const basisVolumePerMaandMin = e.tijdVoor * frequentiePerMaandVal;
  const procentueleBesparing =
    e.tijdVoor > 0 ? (bespaardPerTaakMin / e.tijdVoor) * 100 : null;
  return { frequentiePerMaandVal, bespaardPerTaakMin, bespaardPerMaandMin, bespaardPerJaarUur, procentueleBesparing, basisVolumePerMaandMin };
}

// ─── Migratie: oud formaat → nieuw formaat ────────────────────────────────────
// Experimenten die nog `frequentiePerMaand` hebben (v1-data) worden geconverteerd.

export function migrateExperiment(raw: Record<string, unknown>): Experiment {
  if ('frequentiePerMaand' in raw && !('frequentie' in raw)) {
    const fpm = raw['frequentiePerMaand'] as number;
    return {
      ...(raw as unknown as Experiment),
      frequentie: fpm,
      frequentieEenheid: 'maand',
    };
  }
  return raw as unknown as Experiment;
}
