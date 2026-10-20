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
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem, UsageEvent, FamilyMember } from '../types/soap';
import {
  getProductUsageBreakdown,
  getMemberUsageBreakdown,
  getDailyUsageProgression,
  getMonthOverMonthComparison,
} from '../lib/analyticsEngine';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Droplets,
  Layers,
  IndianRupee,
  Package,
} from 'lucide-react';
import { AnimatedMetric } from './animation/AnimatedMetric';
import { ScrollReveal } from './animation/ScrollReveal';

interface AnalyticsChartsProps {
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  targetMonth: string;
  includeSample?: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  inventory,
  usageEvents,
  familyMembers,
  targetMonth,
}) => {
  const productData = getProductUsageBreakdown(inventory, usageEvents, targetMonth);
  const memberData = getMemberUsageBreakdown(familyMembers, usageEvents, targetMonth);
  const dailyData = getDailyUsageProgression(usageEvents, targetMonth);
  const monthlyData = getMonthOverMonthComparison(inventory, usageEvents, targetMonth);

  // Compute real totals for KPI cards
  const totalSolidG = productData
    .filter(p => p.unit === 'g')
    .reduce((sum, p) => sum + (p.totalConsumed || 0), 0);

  const totalLiquidMl = productData
    .filter(p => p.unit === 'mL' || p.unit === 'ml')
    .reduce((sum, p) => sum + (p.totalConsumed || 0), 0);

  const totalCostInr = monthlyData
    .find(m => m.month === targetMonth)?.costInr ||
    productData.reduce((sum, p) => sum + ((p.totalConsumed || 0) * 0.45), 0);

  const activeProducts = inventory.filter(i => i.remainingQuantity > 0).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3.5 bg-obsidian-900/95 border border-teal-500/40 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-white mb-1.5 border-b border-teal-500/20 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full shadow-xs"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
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
      {/* Header with Title and Month Context */}
      <ScrollReveal direction="down" duration={0.6}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-teal-900/30">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-radiant-teal/20 to-teal-900/30 border border-teal-500/30 text-radiant-teal">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span>Consumption Analytics & Trends</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time household burn rate, individual usage shares, and month-over-month consumption
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-full bg-radiant-teal/10 border border-radiant-teal/30 text-radiant-teal font-mono text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target: {targetMonth}</span>
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Real-Data KPI Summary Row with Smooth Count-Up */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal direction="up" delay={0.05}>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-obsidian-900/70 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-radiant-teal/50 hover:shadow-lg hover:shadow-radiant-teal/5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Solid Soap Consumed</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-radiant-teal">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <AnimatedMetric
              value={Math.round(totalSolidG)}
              unit="g"
              decimals={0}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Bathing bars logged</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-obsidian-900/70 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Liquid Soap Pumped</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <AnimatedMetric
              value={Math.round(totalLiquidMl)}
              unit="mL"
              decimals={0}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Dispenser pumps logged</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.15}>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-obsidian-900/70 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Burn Value</span>
              <div className="p-1.5 rounded-lg bg-gold-500/10 text-gold-400">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <AnimatedMetric
              value={Math.round(totalCostInr)}
              prefix="₹"
              decimals={0}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Calculated replacement cost</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-obsidian-900/70 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Products</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <AnimatedMetric
              value={activeProducts}
              unit="items"
              decimals={0}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Tracked in household</p>
          </div>
        </ScrollReveal>
      </div>

      {/* Main Chart Grid with Smooth Animated Month Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={targetMonth}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Chart 1: Soap Consumption by Product */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-obsidian-900/80 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-teal-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-radiant-teal animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Soap Consumption by Product
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{targetMonth}</span>
            </div>

            <div className="h-64 w-full">
              {productData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                  <Package className="w-8 h-8 text-slate-500/40" />
                  <p>No consumption logged for this month yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
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
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Consumption by Family Member */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-obsidian-900/80 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-cyan-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Consumption by Member & Bathroom
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Solid vs Liquid</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="memberName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="totalSolidG" name="Solid Bar (g)" fill="#14B8A6" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
                  <Bar dataKey="totalLiquidMl" name="Liquid (mL)" fill="#38BDF8" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Daily Usage Progression */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-obsidian-900/80 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-teal-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daily Usage Progression
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Day-by-day burn rate</span>
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
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
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
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#solidGrad)"
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidMl"
                    name="Liquid (mL)"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#liquidGrad)"
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: 6-Month Spending & Trend */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-obsidian-900/80 backdrop-blur-md border border-slate-200 dark:border-teal-900/30 shadow-md hover:border-gold-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  6-Month Spending & Consumption Trend
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Cost & volume comparison</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="costInr" name="Estimated Cost (₹)" fill="#D4AF37" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
                  <Bar dataKey="solidG" name="Solid Bar (g)" fill="#14B8A6" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
