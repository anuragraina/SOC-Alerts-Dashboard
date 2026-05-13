import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Category } from '../../types';
import { CategoricalTooltip, titleCase } from './chartTooltips';

interface CategoryChartProps {
  data: { key: Category; count: number }[];
  onBarClick: (category: Category) => void;
}

export function CategoryChart({ data, onBarClick }: CategoryChartProps) {
  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 16, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            type="category"
            dataKey="key"
            width={130}
            tickFormatter={(v: string) => titleCase(v)}
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CategoricalTooltip />} />
          <Bar
            dataKey="count"
            fill="#334155"
            radius={[0, 4, 4, 0]}
            onClick={(d) => {
              const key = (d as { key?: Category })?.key;
              if (key) onBarClick(key);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
