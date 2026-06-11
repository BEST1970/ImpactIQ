// 1–5 star/number rating input with CFE green active state
interface RatingInputProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
  label?: string;
}

export function RatingInput({ value, onChange, max = 5 }: RatingInputProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-1
            ${value === n
              ? 'bg-[#6EB550] text-white border-[#6EB550] shadow-sm scale-105'
              : 'bg-white text-slate-500 border-slate-200 hover:border-[#6EB550] hover:text-[#6EB550]'
            }`}
          aria-pressed={value === n}
          aria-label={`Beoordeling ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
