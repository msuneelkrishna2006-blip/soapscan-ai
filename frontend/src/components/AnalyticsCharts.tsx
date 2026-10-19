import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { InventoryItem, UsageEvent, FamilyMember } from '../types/soap';
import {
  getProductUsageBreakdown,
  getMemberUsageBreakdown,
  getDailyUsageProgression,
  getMonthOverMonthComparison,
} from '../lib/analyticsEngine';
import { BarChart3, PieChart, TrendingUp, CalendarDays } from 'lucide-react';

interface AnalyticsChartsProps {
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  targetMonth: string;
  includeSample: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  inventory,
  usageEvents,
  familyMembers,
  targetMonth,
  includeSample,
}) => {
  const productData = getProductUsageBreakdown(inventory, usageEvents, targetMonth, includeSample);
  const memberData = getMemberUsageBreakdown(familyMembers, usageEvents, targetMonth, includeSample);
  const dailyData = getDailyUsageProgression(usageEvents, targetMonth, includeSample);
  const monthlyData = getMonthOverMonthComparison(inventory, usageEvents, targetMonth, includeSample);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-obsidian-900 border border-teal-900/60 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-slate-300 font-medium">{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                {entry.value} {entry.payload.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-radiant-teal" />
          Consumption Analytics & Trends ({targetMonth})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual metrics tracking household burn rate, individual usage shares, and historical expenditure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-radiant-teal" />
              Soap Consumption by Product
            </h3>
            <span className="text-[11px] text-slate-400">Current Month</span>
          </div>

          <div className="h-64 w-full">
            {productData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No consumption logged for this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalConsumed"
                    name="Consumed"
                    fill="#14B8A6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-radiant-teal" />
              Consumption by Family Member / Bathroom
            </h3>
            <span className="text-[11px] text-slate-400">Solid vs Liquid</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="memberName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="totalSolidG" name="Solid Bar (g)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalLiquidMl" name="Liquid (mL)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-radiant-teal" />
              Daily Usage Progression ({targetMonth})
            </h3>
            <span className="text-[11px] text-slate-400">Day-by-day burn rate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="solidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="solidG"
                  name="Solid (g)"
                  stroke="#14B8A6"
                  fillOpacity={1}
                  fill="url(#solidGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="liquidMl"
                  name="Liquid (mL)"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#liquidGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              6-Month Spending & Consumption Trend
            </h3>
            <span className="text-[11px] text-slate-400">Cost & volume comparison</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="costInr" name="Estimated Cost (₹)" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solidG" name="Solid Bar (g)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
