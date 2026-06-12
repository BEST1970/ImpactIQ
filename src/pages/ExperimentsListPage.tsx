import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FlaskConical } from 'lucide-react';
import { useStorage } from '../context/StorageContext';
import { ExperimentCard } from '../components/experiment/ExperimentCard';

export function ExperimentsListPage() {
  const { t } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const { experiments, settings, loading, refresh } = useStorage();
  const navigate = useNavigate();

  const [zoek, setZoek] = useState('');
  const [filterEntiteit, setFilterEntiteit] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { service } = useStorage();

  const filtered = experiments.filter((e) => {
    const zoekMatch =
      !zoek ||
      e.medewerker.toLowerCase().includes(zoek.toLowerCase()) ||
      e.taakomschrijving.toLowerCase().includes(zoek.toLowerCase()) ||
      e.aiTool.toLowerCase().includes(zoek.toLowerCase());
    const entMatch = !filterEntiteit || e.entiteit === filterEntiteit;
    const toolMatch = !filterTool || e.aiTool === filterTool;
    const catMatch = !filterCategorie || e.taakcategorie === filterCategorie;
    return zoekMatch && entMatch && toolMatch && catMatch;
  });

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await service.deleteExperiment(deleteId);
    await refresh();
    setDeleteId(null);
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#6EB550] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectCls = "rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] bg-white transition";

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('list.titel')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {experiments.length === 1
              ? t('list.aantalEen')
              : t('list.aantalVeel', { count: experiments.length })
            }
          </p>
        </div>
        <button
          id="nieuw-experiment-btn"
          onClick={() => navigate('/experimenten/nieuw')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6EB550] text-white font-semibold text-sm shadow-sm hover:bg-[#5ea042] active:scale-95 transition-all duration-150 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {t('list.nieuwBtn')}
        </button>
      </div>

      {/* ── Filters ── */}
      {experiments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="zoekbalk"
              type="search"
              placeholder={t('list.zoekPlaceholder')}
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
            />
          </div>
          <select id="filter-entiteit" value={filterEntiteit} onChange={(e) => setFilterEntiteit(e.target.value)} className={selectCls}>
            <option value="">{t('list.alleEntiteiten')}</option>
            {settings?.entiteiten && [...settings.entiteiten].sort((a, b) => a.localeCompare(b)).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select id="filter-tool" value={filterTool} onChange={(e) => setFilterTool(e.target.value)} className={selectCls}>
            <option value="">{t('list.alleTools')}</option>
            {settings?.aiTools && [...settings.aiTools].sort((a, b) => a.localeCompare(b)).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select id="filter-categorie" value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className={selectCls}>
            <option value="">{t('list.alleCategorieen')}</option>
            {settings?.taakcategorieen && [...settings.taakcategorieen].sort((a, b) => (cats[a] || a).localeCompare(cats[b] || b)).map((v) => <option key={v} value={v}>{cats[v] || v}</option>)}
          </select>
        </div>
      )}

      {/* ── Lijst ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FlaskConical className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">
            {experiments.length === 0
              ? t('list.leegAlles')
              : t('list.leegFilter')
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <ExperimentCard
              key={e.id}
              experiment={e}
              onEdit={(id) => navigate(`/experimenten/${id}`)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 p-6 space-y-4 animate-slide-down">
            <h2 className="text-base font-bold text-slate-800">{t('list.verwijderTitel')}</h2>
            <p className="text-sm text-slate-500">{t('list.verwijderTekst')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t('common.annuleren')}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? t('common.verwijderenBezig') : t('common.verwijderen')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
