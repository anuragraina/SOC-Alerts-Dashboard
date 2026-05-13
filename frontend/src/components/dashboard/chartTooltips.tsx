import { format, parseISO } from 'date-fns';

export function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TooltipPayloadEntry {
  value?: number;
  payload?: { key?: string; count?: number };
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export function TrendTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const value = payload[0].value ?? 0;
  return (
    <div className="bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-slate-900">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      <p className="text-slate-600 mt-0.5">
        {value} alert{value === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function CategoricalTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const key = entry.payload?.key ?? '';
  const value = entry.payload?.count ?? entry.value ?? 0;
  return (
    <div className="bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-slate-900">{titleCase(key)}</p>
      <p className="text-slate-600 mt-0.5">
        {value} alert{value === 1 ? '' : 's'}
      </p>
    </div>
  );
}
