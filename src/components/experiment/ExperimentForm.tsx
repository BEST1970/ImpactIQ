import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import type { Experiment, AppSettings, FrequentieEenheid } from '../../types';
import { frequentiePerMaand as calcFpm } from '../../types';
import { RatingInput } from '../ui/RatingInput';
import { ToggleInput } from '../ui/ToggleInput';
import { SensitiveDataAlert } from '../ui/SensitiveDataAlert';
import { Clock, TrendingDown, TrendingUp, Minus } from 'lucide-react';

// ─── Validation schema factory ────────────────────────────────────────────────

function makeSchema(t: (k: string) => string) {
  return z.object({
    medewerker: z.string().min(2, t('form.medewerkerError')),
    entiteit: z.string().min(1, t('form.entiteitError')),
    aiTool: z.string().min(1, t('form.aiToolError')),
    taakomschrijving: z.string().min(5, t('form.taakomschrijvingError')),
    taakcategorie: z.string().min(1, t('form.categorieError')),
    kwaliteitScore: z.number().min(1).max(5),
    correctieNodig: z.boolean(),
    verderGebruiken: z.boolean(),
    vertrouwen: z.number().min(1).max(5),
    frequentie: z.number().min(0.1, t('form.frequentieError')),
    frequentieEenheid: z.enum(['dag', 'week', 'maand']),
    tijdVoor: z.number().min(1, t('form.tijdVoorError')),
    tijdMet: z.number().min(0, t('form.tijdMetError')),
    minderFouten: z.boolean(),
    nieuwWerkMogelijk: z.boolean(),
    meertijdVoorAnalyse: z.boolean(),
    gewonnenTijdTekst: z.string(),
    besteprompt: z.string(),
    gevoeligeData: z.boolean(),
  });
}

type FormValues = {
  medewerker: string;
  entiteit: string;
  aiTool: string;
  taakomschrijving: string;
  taakcategorie: string;
  kwaliteitScore: number;
  correctieNodig: boolean;
  verderGebruiken: boolean;
  vertrouwen: number;
  frequentie: number;
  frequentieEenheid: 'dag' | 'week' | 'maand';
  tijdVoor: number;
  tijdMet: number;
  minderFouten: boolean;
  nieuwWerkMogelijk: boolean;
  meertijdVoorAnalyse: boolean;
  gewonnenTijdTekst: string;
  besteprompt: string;
  gevoeligeData: boolean;
};

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-9 h-9 rounded-full bg-[#1A3F81] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, hint, children, required }: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-[#2455A2] ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── ExperimentForm ───────────────────────────────────────────────────────────

interface ExperimentFormProps {
  initialValues?: Partial<Experiment>;
  settings: AppSettings;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

const defaultValues: FormValues = {
  medewerker: '',
  entiteit: '',
  aiTool: '',
  taakomschrijving: '',
  taakcategorie: '',
  kwaliteitScore: 3,
  correctieNodig: false,
  verderGebruiken: true,
  vertrouwen: 3,
  frequentie: 1,
  frequentieEenheid: 'week' as FrequentieEenheid,
  tijdVoor: 60,
  tijdMet: 30,
  minderFouten: false,
  nieuwWerkMogelijk: false,
  meertijdVoorAnalyse: false,
  gewonnenTijdTekst: '',
  besteprompt: '',
  gevoeligeData: false,
};

export function ExperimentForm({ initialValues, settings, onSubmit, isSubmitting }: ExperimentFormProps) {
  const { t } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const schema = makeSchema(t);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
      ? { ...defaultValues, ...initialValues }
      : defaultValues,
  });

  // Live preview van tijdwinst
  const tijdVoor = watch('tijdVoor');
  const tijdMet = watch('tijdMet');
  const frequentie = watch('frequentie');
  const frequentieEenheid = watch('frequentieEenheid');
  const fpm = calcFpm({ frequentie: frequentie || 0, frequentieEenheid: frequentieEenheid || 'maand' });
  const bespaard = (tijdVoor || 0) - (tijdMet || 0);
  const bespaardMaand = bespaard * fpm;
  const bespaardJaar = (bespaardMaand * 12) / 60;
  const pct = tijdVoor > 0 ? (bespaard / tijdVoor) * 100 : null;
  const isNegative = bespaard < 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* ── Sectie 0: Identificatie ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up">
        <SectionHeader num={0} title={t('form.s0titel')} subtitle={t('form.s0sub')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t('form.medewerkerLabel')} error={errors.medewerker?.message} required>
            <input
              id="medewerker"
              {...register('medewerker')}
              placeholder={t('form.medewerkerPlaceholder')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
            />
          </Field>

          <Field label={t('form.entiteitLabel')} error={errors.entiteit?.message} required>
            <select
              id="entiteit"
              {...register('entiteit')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition bg-white"
            >
              <option value="">{t('form.entiteitPlaceholder')}</option>
              {[...settings.entiteiten].sort((a, b) => a.localeCompare(b)).map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>

          <Field label={t('form.aiToolLabel')} error={errors.aiTool?.message} required>
            <select
              id="aiTool"
              {...register('aiTool')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition bg-white"
            >
              <option value="">{t('form.aiToolPlaceholder')}</option>
              {[...settings.aiTools].sort((a, b) => a.localeCompare(b)).map((tool) => <option key={tool} value={tool}>{tool}</option>)}
            </select>
          </Field>

          <Field label={t('form.categorieLabel')} error={errors.taakcategorie?.message} required>
            <select
              id="taakcategorie"
              {...register('taakcategorie')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition bg-white"
            >
              <option value="">{t('form.categoriePlaceholder')}</option>
              {[...settings.taakcategorieen].sort((a, b) => (cats[a] || a).localeCompare(cats[b] || b)).map((c) => <option key={c} value={c}>{cats[c] || c}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label={t('form.taakomschrijvingLabel')} error={errors.taakomschrijving?.message} required>
              <textarea
                id="taakomschrijving"
                {...register('taakomschrijving')}
                rows={2}
                placeholder={t('form.taakomschrijvingPlaceholder')}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition resize-none"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Niveau 1: Technisch ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '40ms' }}>
        <SectionHeader num={1} title={t('form.s1titel')} subtitle={t('form.s1sub')} />
        <div className="space-y-5">
          <Field label={t('form.kwaliteitLabel')} error={errors.kwaliteitScore?.message} hint={t('form.kwaliteitHint')} required>
            <Controller
              name="kwaliteitScore"
              control={control}
              render={({ field }) => (
                <RatingInput value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label={t('form.correctieLabel')} error={errors.correctieNodig?.message} required>
            <Controller
              name="correctieNodig"
              control={control}
              render={({ field }) => (
                <ToggleInput value={field.value} onChange={field.onChange} id="correctieNodig" />
              )}
            />
          </Field>
        </div>
      </div>

      {/* ── Niveau 2: Adoptie ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <SectionHeader num={2} title={t('form.s2titel')} subtitle={t('form.s2sub')} />
        <div className="space-y-5">
          <Field label={t('form.verderLabel')} error={errors.verderGebruiken?.message} required>
            <Controller
              name="verderGebruiken"
              control={control}
              render={({ field }) => (
                <ToggleInput value={field.value} onChange={field.onChange} id="verderGebruiken" />
              )}
            />
          </Field>
          <Field label={t('form.vertrouwenLabel')} error={errors.vertrouwen?.message} hint={t('form.vertrouwenHint')} required>
            <Controller
              name="vertrouwen"
              control={control}
              render={({ field }) => (
                <RatingInput value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label={t('form.frequentieLabel')} error={errors.frequentie?.message} required>
            <div className="flex items-center gap-2">
              <input
                id="frequentie"
                type="number"
                min={1}
                step={1}
                {...register('frequentie', { valueAsNumber: true })}
                className="w-24 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
              />
              <span className="text-sm text-slate-500">×</span>
              <select
                id="frequentieEenheid"
                {...register('frequentieEenheid')}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition bg-white"
              >
                <option value="dag">{t('form.freqDag')}</option>
                <option value="week">{t('form.freqWeek')}</option>
                <option value="maand">{t('form.freqMaand')}</option>
              </select>
              {fpm > 0 && (
                <span className="text-xs text-slate-400">{t('form.freqCalc', { value: fpm.toFixed(1).replace('.', ',') })}</span>
              )}
            </div>
          </Field>
        </div>
      </div>

      {/* ── Niveau 3: Operationeel ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <SectionHeader num={3} title={t('form.s3titel')} subtitle={t('form.s3sub')} />
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('form.tijdVoorLabel')} error={errors.tijdVoor?.message} required>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="tijdVoor"
                  type="number"
                  min={1}
                  {...register('tijdVoor', { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
                />
              </div>
            </Field>
            <Field label={t('form.tijdMetLabel')} error={errors.tijdMet?.message} required>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="tijdMet"
                  type="number"
                  min={0}
                  {...register('tijdMet', { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
                />
              </div>
            </Field>
          </div>

          {/* Live berekening preview */}
          <div className={`rounded-xl border p-4 ${isNegative ? 'bg-red-50 border-red-200' : 'bg-[#6EB550]/5 border-[#6EB550]/20'}`}>
            <div className="flex items-center gap-2 mb-3">
              {isNegative
                ? <TrendingDown className="w-4 h-4 text-red-500" />
                : bespaard === 0
                  ? <Minus className="w-4 h-4 text-slate-400" />
                  : <TrendingUp className="w-4 h-4 text-[#6EB550]" />
              }
              <span className={`text-sm font-semibold ${isNegative ? 'text-red-700' : 'text-slate-700'}`}>
                {isNegative ? t('form.previewTijdverlies') : t('form.previewTijdwinst')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t('form.previewPerTaak'), value: `${bespaard > 0 ? '+' : ''}${bespaard} min` },
                { label: t('form.previewPerMaand'), value: `${bespaardMaand > 0 ? '+' : ''}${Math.round(bespaardMaand)} min` },
                { label: t('form.previewPerJaar'), value: `${bespaardJaar > 0 ? '+' : ''}${Math.round(bespaardJaar).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} u` },
                { label: t('form.previewBesparing'), value: pct !== null ? `${pct.toFixed(1).replace('.', ',')}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className={`text-sm font-bold ${isNegative ? 'text-red-600' : bespaard === 0 ? 'text-slate-500' : 'text-[#00833D]'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Field label={t('form.minderFoutenLabel')} error={errors.minderFouten?.message} required>
            <Controller
              name="minderFouten"
              control={control}
              render={({ field }) => (
                <ToggleInput value={field.value} onChange={field.onChange} id="minderFouten" />
              )}
            />
          </Field>
        </div>
      </div>

      {/* ── Niveau 4: Werkverrijking ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <SectionHeader num={4} title={t('form.s4titel')} subtitle={t('form.s4sub')} />
        <div className="space-y-5">
          <Field label={t('form.nieuwWerkLabel')} error={errors.nieuwWerkMogelijk?.message} required>
            <Controller
              name="nieuwWerkMogelijk"
              control={control}
              render={({ field }) => (
                <ToggleInput value={field.value} onChange={field.onChange} id="nieuwWerkMogelijk" />
              )}
            />
          </Field>
          <Field label={t('form.meertijdLabel')} error={errors.meertijdVoorAnalyse?.message} required>
            <Controller
              name="meertijdVoorAnalyse"
              control={control}
              render={({ field }) => (
                <ToggleInput value={field.value} onChange={field.onChange} id="meertijdVoorAnalyse" />
              )}
            />
          </Field>
          <Field label={t('form.gewonnenLabel')}>
            <textarea
              id="gewonnenTijdTekst"
              {...register('gewonnenTijdTekst')}
              rows={2}
              placeholder={t('form.gewonnenPlaceholder')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition resize-none"
            />
          </Field>
        </div>
      </div>

      {/* ── Extra ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader num={5} title={t('form.s5titel')} subtitle={t('form.s5sub')} />
        <div className="space-y-5">
          <Field label={t('form.promptLabel')} hint={t('form.promptHint')}>
            <textarea
              id="besteprompt"
              {...register('besteprompt')}
              rows={3}
              placeholder={t('form.promptPlaceholder')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition resize-none"
            />
          </Field>

          <Field label={t('form.gevoeligLabel')} error={errors.gevoeligeData?.message} required>
            <Controller
              name="gevoeligeData"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <ToggleInput
                    value={field.value}
                    onChange={field.onChange}
                    id="gevoeligeData"
                    labelJa="Ja"
                    labelNee="Nee"
                  />
                  <SensitiveDataAlert />
                </div>
              )}
            />
          </Field>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          type="submit"
          disabled={isSubmitting}
          id="submit-experiment"
          className="px-8 py-3 rounded-xl bg-[#6EB550] text-white font-semibold text-sm shadow-sm hover:bg-[#5ea042] active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('form.submitBtnBezig') : t('form.submitBtn')}
        </button>
      </div>
    </form>
  );
}
