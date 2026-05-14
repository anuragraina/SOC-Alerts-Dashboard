import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Severity } from '../../types';
import { CategoricalTooltip } from './chartTooltips';

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#2563eb',
  info: '#94a3b8',
};

interface SeverityChartProps {
  data: { key: Severity; count: number }[];
  onSliceClick: (severity: Severity) => void;
}

export function SeverityChart({ data, onSliceClick }: SeverityChartProps) {
  return (
    <div className="[&_.recharts-pie-sector]:cursor-pointer [&_.recharts-legend-item]:cursor-pointer">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="key"
            innerRadius={60}
            outerRadius={90}
            stroke="#fff"
            strokeWidth={2}
            onClick={(d) => {
              const key = (d as { key?: Severity })?.key;
              if (key) onSliceClick(key);
            }}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={SEVERITY_COLORS[d.key]} />
            ))}
          </Pie>
          <Tooltip content={<CategoricalTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(_value, entry) => {
              const payload = (entry?.payload ?? {}) as {
                key?: Severity;
                count?: number;
              };
              if (!payload.key) return null;
              return (
                <span
                  className="text-xs text-slate-700 capitalize"
                  onClick={() => onSliceClick(payload.key as Severity)}
                >
                  {payload.key} ({(payload.count ?? 0).toLocaleString()})
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
