import { useTranslation } from 'react-i18next';
import type { Experiment } from '../../types';
import { deriveMetrics, frequentieLabel } from '../../types';
import { Clock, Pencil, Trash2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface ExperimentCardProps {
  experiment: Experiment;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExperimentCard({ experiment: e, onEdit, onDelete }: ExperimentCardProps) {
  const { t, i18n } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const { bespaardPerMaandMin, procentueleBesparing } = deriveMetrics(e);
  const maandUur = bespaardPerMaandMin / 60;
  const isNegative = bespaardPerMaandMin < 0;
  const freqLabel = frequentieLabel(e);

  const datum = new Date(e.createdAt).toLocaleDateString(
    i18n.language === 'fr' ? 'fr-BE' : i18n.language === 'en' ? 'en-GB' : 'nl-BE',
    { day: '2-digit', month: 'short', year: 'numeric' }
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 group animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1A3F81]/10 text-[#1A3F81]">
              {e.aiTool}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {cats[e.taakcategorie] || e.taakcategorie}
            </span>
            {e.gevoeligeData && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <AlertTriangle className="w-3 h-3" />{t('card.gevoelig')}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate">{e.taakomschrijving}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{e.medewerker} · {e.entiteit} · {datum}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(e.id)}
            title={t('card.bewerken')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2455A2] hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(e.id)}
            title={t('card.verwijderen')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-50">
        {/* Tijdwinst per maand */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isNegative ? 'bg-red-50' : 'bg-[#6EB550]/8'}`}>
          {isNegative
            ? <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            : <TrendingUp className="w-3.5 h-3.5 text-[#6EB550]" />
          }
          <span className={`text-xs font-semibold ${isNegative ? 'text-red-600' : 'text-[#00833D]'}`}>
            {isNegative ? '' : '+'}{Math.round(maandUur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} u/mnd
          </span>
        </div>

        {/* Procentuele besparing */}
        {procentueleBesparing !== null && (
          <span className={`text-xs font-medium ${procentueleBesparing < 0 ? 'text-red-500' : 'text-slate-500'}`}>
            {procentueleBesparing >= 0 ? '+' : ''}{procentueleBesparing.toFixed(1).replace('.', ',')}%
          </span>
        )}

        {/* Kwaliteitsscore */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">{t('card.kwaliteit')}:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`w-2 h-2 rounded-full ${n <= e.kwaliteitScore ? 'bg-[#6EB550]' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Tijden */}
        <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>{e.tijdVoor}→{e.tijdMet} min · {freqLabel}</span>
        </div>
      </div>
    </div>
  );
}
