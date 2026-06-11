// Ja/Nee toggle switch
import { useTranslation } from 'react-i18next';
interface ToggleInputProps {
  value: boolean;
  onChange: (val: boolean) => void;
  labelJa?: string;
  labelNee?: string;
  id?: string;
}

export function ToggleInput({
  value,
  onChange,
  labelJa,
  labelNee,
  id,
}: ToggleInputProps) {
  const { t } = useTranslation();
  const resolvedLabelJa = labelJa ?? t('toggle.ja');
  const resolvedLabelNee = labelNee ?? t('toggle.nee');
  return (
    <div className="flex gap-2">
      <button
        type="button"
        id={id ? `${id}-ja` : undefined}
        onClick={() => onChange(true)}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-1
          ${value
            ? 'bg-[#6EB550] text-white border-[#6EB550] shadow-sm'
            : 'bg-white text-slate-500 border-slate-200 hover:border-[#6EB550] hover:text-[#6EB550]'
          }`}
        aria-pressed={value}
      >
        {resolvedLabelJa}
      </button>
      <button
        type="button"
        id={id ? `${id}-nee` : undefined}
        onClick={() => onChange(false)}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-1
          ${!value
            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
          }`}
        aria-pressed={!value}
      >
        {resolvedLabelNee}
      </button>
    </div>
  );
}
