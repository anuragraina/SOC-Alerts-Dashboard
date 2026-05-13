import type { Status } from '../../types';
import { titleCase } from './chartTooltips';

const STATUS_COLORS: Record<Status, string> = {
  new: '#3b82f6',
  investigating: '#f59e0b',
  resolved: '#10b981',
  false_positive: '#94a3b8',
};

interface StatusTileProps {
  status: Status;
  count: number;
  percent: number;
  onClick: () => void;
}

export function StatusTile({ status, count, percent, onClick }: StatusTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-md border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
          {titleCase(status)}
        </p>
      </div>
      <p className="text-2xl font-semibold text-slate-900 mt-2">
        {count.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{percent}%</p>
    </button>
  );
}
