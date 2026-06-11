import { Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Persistent banner shown on every page — makes local storage limitation explicit
export function DataLocalBanner() {
  const { t } = useTranslation();
  return (
    <div className="bg-[#1A3F81] text-white text-xs flex items-center justify-center gap-2 py-1.5 px-4">
      <Database className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{t('banner.tekst')}</span>
    </div>
  );
}
