import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  unit?: string;
}

interface ConsumptionChartProps {
  data: ChartDataPoint[];
  type?: 'area' | 'bar';
  colorHex?: string;
  secondaryColorHex?: string;
  dataKey?: string;
  secondaryDataKey?: string;
  height?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  unit?: string;
  className?: string;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-obsidian-950/95 border border-teal-500/40 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-1 font-mono">
        <p className="font-bold text-white mb-1 border-b border-white/10 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span>{entry.name || 'Usage'}:</span>
            </span>
            <span className="font-bold text-teal-300 font-mono">
              {entry.value} {entry.payload.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({
  data,
  type = 'area',
  colorHex = '#14b8a6',
  secondaryColorHex = '#d4af37',
  height = 220,
  isLoading = false,
  emptyMessage = 'No consumption recorded for this period.',
  unit = 'g',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-2xl bg-obsidian-900/60 border border-white/5 flex flex-col justify-end p-4 gap-2 animate-pulse ${className}`}
      >
        <div className="flex items-end justify-between h-3/4 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/10 rounded-t-lg w-full"
              style={{ height: `${30 + (i * 12) % 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-2xl bg-obsidian-950/60 border border-white/5 flex items-center justify-center text-xs font-mono text-slate-400 p-6 text-center ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  const animationDuration = shouldReduceMotion ? 0 : 900;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height }}
      className={`w-full relative ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.35} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Bar
              dataKey="value"
              name="Usage"
              fill={colorHex}
              radius={[6, 6, 0, 0]}
              animationDuration={animationDuration}
            />
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorHex} stopOpacity={0.45} />
                <stop offset="95%" stopColor={colorHex} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.35} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              name="Consumed"
              stroke={colorHex}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGradientPrimary)"
              animationDuration={animationDuration}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
