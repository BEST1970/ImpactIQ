import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, ShieldCheck, BarChart3, Users, AlertTriangle, ChevronRight, Mail } from 'lucide-react';

function Section({
  id,
  icon: Icon,
  color,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function InfoPage() {
  const { t } = useTranslation();
  const levels = t('info.levels', { returnObjects: true }) as Array<{
    num: number; titel: string; desc: string; velden: string[];
  }>;
  const s4Items = t('info.s4Items', { returnObjects: true }) as string[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">{t('info.paginaTitel')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('info.paginaSubtitel')}</p>
      </div>

      {/* ── 1. Wat is ImpactIQ? ── */}
      <Section id="wat-is-impactiq" icon={BookOpen} color="bg-[#6EB550]/10 text-[#00833D]" title={t('info.s1Titel')}>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('info.s1P1').split(t('info.s1P1Sterk')).map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<strong>{t('info.s1P1Sterk')}</strong></span>
              : <span key={i}>{part}</span>
          )}
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">{t('info.s1P2')}</p>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#6EB550]/8 border border-[#6EB550]/20">
          <Users className="w-5 h-5 text-[#00833D] shrink-0 mt-0.5" />
          <p className="text-sm text-[#00833D]">
            <strong>{t('info.s1BannerSterk')}</strong>{' '}
            {t('info.s1Banner').replace(t('info.s1BannerSterk'), '').trim()}
          </p>
        </div>
      </Section>

      {/* ── 2. Hoe invullen? ── */}
      <Section id="hoe-invullen" icon={Clock} color="bg-[#2455A2]/10 text-[#2455A2]" title={t('info.s2Titel')}>
        <p className="text-sm text-slate-600">
          {t('info.s2Intro')} <strong>{t('info.s2IntroSterk')}</strong>{t('info.s2IntroEind')}
        </p>
        <div className="space-y-3">
          {levels.map((level) => (
            <div key={level.num} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#1A3F81] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {level.num}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{level.titel}</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">{level.desc}</p>
                <ul className="space-y-1">
                  {level.velden.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <ChevronRight className="w-3 h-3 text-[#6EB550] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Gegevens ── */}
      <Section id="data-gebruik" icon={BarChart3} color="bg-[#00A4A8]/10 text-[#00A4A8]" title={t('info.s3Titel')}>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p><strong>{t('info.s3Verzameling')}</strong> {t('info.s3VerzamelingTekst')}</p>
          <p><strong>{t('info.s3Analyse')}</strong> {t('info.s3AnalyseTekst')}</p>
          <p>
            <strong>{t('info.s3Rapportage')}</strong>{' '}
            {t('info.s3RapportageTekst').split(t('info.s3RapportageSterk')).map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<strong>{t('info.s3RapportageSterk')}</strong></span>
                : <span key={i}>{part}</span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { label: t('info.s3Toegang'), value: t('info.s3ToegangWaarde') },
            { label: t('info.s3Rapportagelabel'), value: t('info.s3RapportageWaarde') },
            { label: t('info.s3Doel'), value: t('info.s3DoelWaarde') },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. Privacy ── */}
      <Section id="privacy" icon={ShieldCheck} color="bg-amber-100 text-amber-700" title={t('info.s4Titel')}>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-2">
            <p className="font-semibold">{t('info.s4WaarschuwingTitel')}</p>
            <ul className="space-y-1 ml-1">
              {s4Items.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{t('info.s4Tekst')}</p>
      </Section>

      {/* ── 5. Contact ── */}
      <Section id="contact" icon={Mail} color="bg-[#1A3F81]/10 text-[#1A3F81]" title={t('info.s5Titel')}>
        <p className="text-sm text-slate-600 leading-relaxed">{t('info.s5Tekst')}</p>
        <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">{t('info.s5Footer')}</p>
      </Section>
    </div>
  );
}
