import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStorage } from '../context/StorageContext';
import { ExperimentForm } from '../components/experiment/ExperimentForm';
import type { Experiment } from '../types';

export function ExperimentFormPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { service, experiments, settings, loading, refresh } = useStorage();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const existing = id ? experiments.find((e) => e.id === id) : undefined;

  async function handleSubmit(values: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await service.updateExperiment(id, values);
      } else {
        await service.saveExperiment(values);
      }
      await refresh();
      setSaved(true);
      setTimeout(() => navigate('/experimenten'), 800);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#6EB550] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{t('form.neetGevonden')}</p>
        <button onClick={() => navigate('/experimenten')} className="mt-4 text-[#2455A2] underline text-sm">
          {t('common.terug')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/experimenten')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={t('form.terugBtn')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? t('form.bewerkenTitel') : t('form.nieuwTitel')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit ? t('form.bewerkenSubtitel') : t('form.nieuwSubtitel')}
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#6EB550]/10 border border-[#6EB550]/30 text-sm text-[#00833D] font-medium animate-fade-in">
          {t('form.opgeslagen')}
        </div>
      )}

      {settings && (
        <ExperimentForm
          initialValues={existing}
          settings={settings}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
}
