import { format, parseISO } from 'date-fns';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendTooltip } from './chartTooltips';

interface TrendChartProps {
  data: { date: string; count: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 16, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => format(parseISO(v), 'MMM d')}
          interval={1}
          stroke="#94a3b8"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          hide={!hasData}
          allowDecimals={false}
          stroke="#94a3b8"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
          width={32}
        />
        <Tooltip content={<TrendTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#0f172a"
          fill="#0f172a"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
