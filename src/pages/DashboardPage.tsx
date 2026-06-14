import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStorage } from '../context/StorageContext';
import {
  computeMetrics,
  computePerTool,
  computePerCategory,
  formatUren,
} from '../utils/metrics';
import type { Experiment } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import { Clock, FlaskConical, TrendingDown, TrendingUp } from 'lucide-react';

// ─── Custom XAxis Tick (Staggered / Zigzag) ──────────────────────────────────
// Zet even/oneven labels op verschillende hoogtes om horizontale overlap te voorkomen.
const CustomXAxisTick = ({ x, y, payload, index }: any) => {
  const { t } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const isOdd = index % 2 !== 0;
  const dyOffset = isOdd ? 30 : 12; // Oneven labels staan een stukje lager

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={dyOffset}
        textAnchor="middle"
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
      >
        {cats[payload.value] || payload.value}
      </text>
    </g>
  );
};

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, big, isNegative, dark
}: {
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
  isNegative?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-blue-300' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className={`font-bold leading-none ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'} ${isNegative ? 'text-red-400' : dark ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </p>
      {sub && <p className={`text-xs font-medium ${dark ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children, dark, color }: { children: React.ReactNode; dark?: boolean; color?: string }) {
  return (
    <h2 className={`text-lg font-bold flex items-center gap-3 tracking-tight ${dark ? 'text-white' : color || 'text-slate-800'}`}>
      {children}
    </h2>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  
  const valHours = payload.find((p) => p.dataKey === 'bespaardPerMaandUur')?.value;
  const valPct = payload.find((p) => p.dataKey === 'gemProcentueleBesparing')?.value;
  const experimenten = payload[0]?.payload?.experimenten;
  const basisVolume = payload[0]?.payload?.basisVolumePerMaandUur;
  
  const hasHours = valHours !== undefined;
  const isNeg = hasHours && valHours < 0;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm font-medium min-w-[160px]">
      <p className="font-bold text-slate-800 mb-2">{label}</p>
      
      {experimenten !== undefined && (
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <p className="text-slate-600">
            {experimenten} {experimenten === 1 ? t('dashboard.experimentSingular', 'experiment') : t('dashboard.experimentPlural', 'experimenten')}
          </p>
        </div>
      )}

      {basisVolume !== undefined && (
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <p className="text-slate-500">
            {t('dashboard.basisVolume', 'Op {{volume}} u/mnd normaal volume', { volume: formatUren(basisVolume).replace(' u', '').replace('+', '').replace('-', '') })}
          </p>
        </div>
      )}

      {hasHours && (
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isNeg ? '#ef4444' : '#6EB550' }} />
          <p className={isNeg ? 'text-red-600' : 'text-[#6EB550]'}>
            {formatUren(valHours)}/mnd
          </p>
        </div>
      )}
      
      {valPct !== undefined && valPct !== null && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2455A2]" />
          <p className="text-[#2455A2]">
            {valPct > 0 ? '+' : ''}{valPct.toFixed(1).replace('.', ',')}% tijdwinst
          </p>
        </div>
      )}
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { t } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const { experiments, settings, loading } = useStorage();

  const [filterEntiteit, setFilterEntiteit] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#6EB550] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter experimenten
  const filtered: Experiment[] = experiments.filter((e) => {
    const entMatch = !filterEntiteit || e.entiteit === filterEntiteit;
    const toolMatch = !filterTool || e.aiTool === filterTool;
    const catMatch = !filterCategorie || filterCategorie === 'all' || e.taakcategorie === filterCategorie;
    return entMatch && toolMatch && catMatch;
  });

  const m = computeMetrics(filtered);
  const perTool = computePerTool(filtered);
  const perCat = computePerCategory(filtered);

  const isNegativeMaand = m.totaalBespaardPerMaandMin < 0;

  const selectCls = "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] bg-white transition cursor-pointer shadow-sm hover:border-slate-300";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('dashboard.titel')}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">
            {filtered.length === 1 ? t('dashboard.subtitelEen') : t('dashboard.subtitelVeel', { count: filtered.length })}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <select value={filterEntiteit} onChange={(e) => setFilterEntiteit(e.target.value)} className={selectCls}>
          <option value="">{t('dashboard.alleEntiteiten')}</option>
          {settings?.entiteiten && [...settings.entiteiten].sort((a, b) => a.localeCompare(b)).map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filterTool} onChange={(e) => setFilterTool(e.target.value)} className={selectCls}>
          <option value="">{t('dashboard.alleTools')}</option>
          {settings?.aiTools && [...settings.aiTools].sort((a, b) => a.localeCompare(b)).map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className={selectCls}>
          <option value="all">{t('dashboard.alleCategorieen')}</option>
          {settings?.taakcategorieen && [...settings.taakcategorieen].sort((a, b) => (cats[a] || a).localeCompare(cats[b] || b)).map((v) => <option key={v} value={v}>{cats[v] || v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <FlaskConical className="w-16 h-16 text-slate-200 mb-6" />
          <p className="text-slate-500 font-medium text-lg">{t('dashboard.leeg')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* ── BENTO: Kerncijfers (Hero) ── */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-[#1A3F81] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 relative overflow-hidden group">
            {/* Decoratieve achtergrond elementen */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition duration-700 pointer-events-none" />
            <div className="absolute -bottom-24 left-12 w-48 h-48 bg-[#58B3E6]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-xs lg:max-w-sm relative z-10">
              <SectionTitle dark>
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                  <Clock className="w-6 h-6 text-[#58B3E6]" />
                </div>
                {t('dashboard.sectionTijdwinst')}
              </SectionTitle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full lg:w-auto relative z-10 border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0">
              <KpiCard
                label={t('dashboard.kpiPerMaand')}
                value={formatUren(m.totaalBespaardPerJaarUur / 12)}
                sub={isNegativeMaand ? t('dashboard.kpiTijdverliesSub') : t('dashboard.kpiPerMaandSub')}
                big
                dark
                isNegative={isNegativeMaand}
              />
              <KpiCard
                label={t('dashboard.kpiPerJaar')}
                value={formatUren(m.totaalBespaardPerJaarUur)}
                sub={t('dashboard.kpiPerJaarSub')}
                big
                dark
                isNegative={m.totaalBespaardPerJaarUur < 0}
              />
              <KpiCard
                label={t('dashboard.kpiAantal')}
                value={String(m.totaalExperimenten)}
                sub={t('dashboard.kpiAantalSub')}
                big
                dark
              />
            </div>
          </div>

          {/* ── BENTO: Niveau 1 (Technisch) ── */}
          <div className="col-span-1 bg-[#F0F7FF] border border-[#DCEBFE] rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm hover:shadow-md hover:border-[#BFDBFE] transition-all">
            <SectionTitle color="text-[#2455A2]">
              <span className="w-8 h-8 rounded-full bg-[#2455A2]/10 flex items-center justify-center text-sm font-extrabold">1</span>
              {t('dashboard.section1')}
            </SectionTitle>
            <div className="space-y-6 flex-1">
              <KpiCard
                label={t('dashboard.kpiKwaliteit')}
                value={m.gemKwaliteit !== null ? `${m.gemKwaliteit.toFixed(1).replace('.', ',')} / 5` : '-'}
              />
              <KpiCard
                label={t('dashboard.kpiZonderCorrectie')}
                value={m.pctZonderCorrectie !== null ? `${m.pctZonderCorrectie.toFixed(0)}%` : '-'}
              />
            </div>
          </div>

          {/* ── BENTO: Niveau 2 (Adoptie) ── */}
          <div className="col-span-1 bg-[#E6F8F9] border border-[#BDE8E9] rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm hover:shadow-md hover:border-[#99DDDE] transition-all">
            <SectionTitle color="text-[#008C8A]">
              <span className="w-8 h-8 rounded-full bg-[#00A4A8]/10 flex items-center justify-center text-sm font-extrabold">2</span>
              {t('dashboard.section2')}
            </SectionTitle>
            <div className="space-y-6 flex-1">
              <KpiCard
                label={t('dashboard.kpiVerder')}
                value={m.pctVerderGebruiken !== null ? `${m.pctVerderGebruiken.toFixed(0)}%` : '-'}
              />
              <KpiCard
                label={t('dashboard.kpiVertrouwen')}
                value={m.gemVertrouwen !== null ? `${m.gemVertrouwen.toFixed(1).replace('.', ',')} / 5` : '-'}
              />
            </div>
          </div>

          {/* ── BENTO: Niveau 3 (Operationeel) ── */}
          <div className="col-span-1 bg-[#F2FCEE] border border-[#D7EBCB] rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm hover:shadow-md hover:border-[#BFE0AD] transition-all">
            <SectionTitle color="text-[#12A03C]">
              <span className="w-8 h-8 rounded-full bg-[#6EB550]/10 flex items-center justify-center text-sm font-extrabold">3</span>
              {t('dashboard.section3')}
            </SectionTitle>
            <div className="space-y-6 flex-1">
              <KpiCard
                label={t('dashboard.kpiBesparing')}
                value={m.gemProcentueleBesparing !== null ? `${m.gemProcentueleBesparing.toFixed(1).replace('.', ',')}%` : '-'}
                isNegative={(m.gemProcentueleBesparing ?? 0) < 0}
              />
              <KpiCard
                label={t('dashboard.kpiFouten')}
                value={m.pctMinderFouten !== null ? `${m.pctMinderFouten.toFixed(0)}%` : '-'}
              />
            </div>
          </div>

          {/* ── BENTO: Niveau 4 (Werkverrijking) ── */}
          <div className="col-span-1 bg-[#F5F3FA] border border-[#E1DBED] rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm hover:shadow-md hover:border-[#CFC6E6] transition-all">
            <SectionTitle color="text-[#6F65AA]">
              <span className="w-8 h-8 rounded-full bg-[#6F65AA]/10 flex items-center justify-center text-sm font-extrabold">4</span>
              {t('dashboard.section4')}
            </SectionTitle>
            <div className="space-y-6 flex-1">
              <KpiCard
                label={t('dashboard.kpiNieuwWerk')}
                value={m.pctNieuwWerk !== null ? `${m.pctNieuwWerk.toFixed(0)}%` : '-'}
              />
              <KpiCard
                label={t('dashboard.kpiMeertijd')}
                value={m.pctMeertijdAnalyse !== null ? `${m.pctMeertijdAnalyse.toFixed(0)}%` : '-'}
              />
            </div>
          </div>

          {/* ── BENTO: Grafiek 1 (Tijdwinst) ── */}
          {perTool.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <SectionTitle>
                <div className="p-2 bg-slate-50 rounded-xl">
                  {isNegativeMaand ? <TrendingDown className="w-5 h-5 text-[#2455A2]" /> : <TrendingUp className="w-5 h-5 text-[#2455A2]" />}
                </div>
                {t('dashboard.grafiek1Titel')}
              </SectionTitle>
              <p className="text-xs font-medium text-slate-400 mb-6 mt-1 ml-1">{t('dashboard.grafiek1Note')}</p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={perTool} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="tool" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} interval={0} height={50} />
                  
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  
                  <ReferenceLine y={0} yAxisId="left" stroke="#cbd5e1" strokeDasharray="4 2" />
                  
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltip />} />
                  
                  <Bar
                    yAxisId="left"
                    dataKey="bespaardPerMaandUur"
                    radius={[8, 8, 0, 0]}
                    name={t('dashboard.urenPerMaand', 'Uren/maand')}
                  >
                    {perTool.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.bespaardPerMaandUur < 0 ? '#FEF2F2' : '#F2FCEE'} stroke={entry.bespaardPerMaandUur < 0 ? '#ef4444' : '#12A03C'} strokeWidth={1.5} />
                    ))}
                  </Bar>

                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="gemProcentueleBesparing" 
                    name={t('dashboard.kpiBesparing')} 
                    stroke="#2455A2" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#2455A2' }} 
                    activeDot={{ r: 6 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── BENTO: Grafiek 2 (Kwaliteit) ── */}
          {perCat.length > 0 && (
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <SectionTitle>
                <span className="w-4 h-4 rounded-full bg-[#2455A2] inline-block shadow-sm" />
                {t('dashboard.grafiek2Titel')}
              </SectionTitle>
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perCat.filter(c => c.gemKwaliteit !== null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="categorie" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} interval={0} height={50} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: unknown) => `${(v as number).toFixed(1).replace('.', ',')} / 5`} />
                    <Bar dataKey="gemKwaliteit" radius={[8, 8, 0, 0]} fill="#F0F7FF" stroke="#2455A2" strokeWidth={1.5} name={t('dashboard.kpiKwaliteit')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── BENTO: Grafiek 3 (Adoptie) ── */}
          {perTool.length > 0 && (
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <SectionTitle>
                <span className="w-4 h-4 rounded-full bg-[#00A4A8] inline-block shadow-sm" />
                {t('dashboard.grafiek3Titel')}
              </SectionTitle>
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perTool} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="tool" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} interval={0} height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: unknown) => `${(v as number).toFixed(0)}%`} />
                    <Bar dataKey="pctVerderGebruiken" radius={[8, 8, 0, 0]} fill="#E6F8F9" stroke="#008C8A" strokeWidth={1.5} name={t('dashboard.kpiVerder')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── BENTO: Grafiek 4 (Kwaliteit per Tool) ── */}
          {perTool.length > 0 && (
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <SectionTitle>
                <span className="w-4 h-4 rounded-full bg-[#2455A2] inline-block shadow-sm" />
                {t('dashboard.grafiek4Titel', 'Kwaliteit per AI-tool')}
              </SectionTitle>
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perTool.filter(t => t.gemKwaliteit !== null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="tool" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} interval={0} height={50} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: unknown) => `${(v as number).toFixed(1).replace('.', ',')} / 5`} />
                    <Bar dataKey="gemKwaliteit" radius={[8, 8, 0, 0]} fill="#F0F7FF" stroke="#2455A2" strokeWidth={1.5} name={t('dashboard.kpiKwaliteit')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── BENTO: Grafiek 5 (Werkverrijking per Tool) ── */}
          {perTool.length > 0 && (
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <SectionTitle>
                <span className="w-4 h-4 rounded-full bg-[#6F65AA] inline-block shadow-sm" />
                {t('dashboard.grafiek5Titel', 'Werkverrijking per AI-tool')}
              </SectionTitle>
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perTool} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="tool" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} interval={0} height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: unknown) => `${(v as number).toFixed(0)}%`} />
                    <Bar dataKey="pctNieuwWerk" radius={[8, 8, 0, 0]} fill="#F5F3FA" stroke="#6F65AA" strokeWidth={1.5} name={t('dashboard.kpiNieuwWerk')} />
                    <Bar dataKey="pctMeertijdAnalyse" radius={[8, 8, 0, 0]} fill="#E1DBED" stroke="#6F65AA" strokeWidth={1.5} name={t('dashboard.kpiMeertijd')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
