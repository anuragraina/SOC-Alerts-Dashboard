export type KpiAccent = 'blue' | 'red' | 'neutral' | 'green';

interface KpiTileProps {
  label: string;
  value: number;
  accent: KpiAccent;
  onClick?: () => void;
}

const ACCENT_BORDER: Record<KpiAccent, string> = {
  blue: 'border-l-blue-500',
  red: 'border-l-red-600',
  neutral: 'border-l-slate-300',
  green: 'border-l-emerald-500',
};

export function KpiTile({ label, value, accent, onClick }: KpiTileProps) {
  const baseClass = `bg-white border border-slate-200 border-l-4 ${ACCENT_BORDER[accent]} rounded-lg p-5 transition-shadow text-left`;

  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </p>
      <p className="text-3xl font-semibold text-slate-900 mt-2">
        {value.toLocaleString()}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} cursor-pointer hover:shadow-md w-full`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
