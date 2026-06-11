import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Prominent amber alert block for sensitive data, with CFE privacy policy reminder
export function SensitiveDataAlert() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800 mb-1">{t('sensitive.titel')}</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          {t('sensitive.tekst')}
        </p>
      </div>
    </div>
  );
}
