import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Scale,
  Droplet,
  PackageCheck,
  IndianRupee,
  Clock,
  Award,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Flame,
  Box,
  Eye,
} from 'lucide-react';
import {
  InventoryItem,
  UsageEvent,
  FamilyMember,
  NotificationPrefs,
  AIInsight,
} from '../types/soap';
import {
  calculateDashboardKPIs,
  generateSmartAlerts,
  calculateItemBurnRate,
} from '../lib/analyticsEngine';
import { TiltCard3D } from './ui/TiltCard3D';
import { SoapDigitalTwin3D } from './three/SoapDigitalTwin3D';

interface DashboardViewProps {
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  notificationPrefs: NotificationPrefs;
  targetMonth: string;
  includeSample: boolean;
  insights: AIInsight[];
  isLoadingInsights: boolean;
  onRefreshInsights: () => void;
  onOpenScanModal: () => void;
  onOpenLogModal: (item: InventoryItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventory,
  usageEvents,
  familyMembers,
  notificationPrefs,
  targetMonth,
  includeSample,
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onOpenScanModal,
  onOpenLogModal,
}) => {
  const kpis = calculateDashboardKPIs(inventory, usageEvents, targetMonth, includeSample);
  const alerts = generateSmartAlerts(inventory, usageEvents, notificationPrefs, includeSample);
  const activeItems = inventory.filter(
    i => (includeSample || !i.isSampleData) && i.status === 'active'
  );

  // Active item 3D digital twin preview toggle
  const [activeTwinId, setActiveTwinId] = useState<string | null>(
    activeItems.length > 0 ? activeItems[0].id : null
  );

  const selectedTwinItem = activeItems.find(i => i.id === activeTwinId) || activeItems[0] || null;

  return (
    <div className="space-y-8 relative z-10">
      {/* 6 3D Perspective Tilt KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Solid Soap */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Solid Soap</span>
              <div className="p-1.5 rounded-lg bg-radiant-teal/10 text-radiant-teal">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {kpis.solidSoapUsedMonthG}
                </span>
                <span className="text-xs font-semibold text-slate-500">g</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Used in {targetMonth}</p>
            </div>
          </div>
        </TiltCard3D>

        {/* KPI 2: Liquid Soap */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Liquid Soap</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {kpis.liquidSoapUsedMonthMl}
                </span>
                <span className="text-xs font-semibold text-slate-500">mL</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Used in {targetMonth}</p>
            </div>
          </div>
        </TiltCard3D>

        {/* KPI 3: Inventory Stock */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Inventory</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {kpis.activeItemsCount}
                </span>
                <span className="text-xs text-slate-400">active</span>
                <span className="text-xs font-mono text-slate-500">({kpis.finishedItemsCount} done)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tracked soaps</p>
            </div>
          </div>
        </TiltCard3D>

        {/* KPI 4: Monthly Spending */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Spending</span>
              <div className="p-1.5 rounded-lg bg-gold-500/10 text-gold-500">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ₹{kpis.monthlySpendingInr}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-1">
                {kpis.spendingChangePercent >= 0 ? (
                  <span className="text-emerald-500 flex items-center font-semibold">
                    <ArrowUpRight className="w-3 h-3" />+{kpis.spendingChangePercent}%
                  </span>
                ) : (
                  <span className="text-radiant-teal flex items-center font-semibold">
                    <ArrowDownRight className="w-3 h-3" />
                    {kpis.spendingChangePercent}%
                  </span>
                )}
                <span className="text-slate-400 text-[10px]">vs prev mo</span>
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* KPI 5: Days Supply */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Days Supply</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ~{kpis.estimatedDaysSupplyRemaining}
                </span>
                <span className="text-xs font-semibold text-slate-500">days</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Estimated burn pace</p>
            </div>
          </div>
        </TiltCard3D>

        {/* KPI 6: Top Soap */}
        <TiltCard3D>
          <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800/90 border border-slate-200 dark:border-teal-900/40 shadow-lg backdrop-blur h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Top Soap</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              {kpis.mostUsedProduct ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {kpis.mostUsedProduct.brand}
                  </div>
                  <p className="text-[11px] text-radiant-teal font-semibold truncate">
                    {kpis.mostUsedProduct.consumed} {kpis.mostUsedProduct.unit} logged
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">No logs this month</p>
              )}
            </div>
          </div>
        </TiltCard3D>
      </div>

      {/* 3D INTERACTIVE DIGITAL TWIN HERO VIEWER */}
      {selectedTwinItem && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-obsidian-900/90 via-obsidian-800/80 to-obsidian-950/95 border border-radiant-teal/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40">
                  <Box className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      3D Interactive Digital Twin
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-radiant-teal/20 text-radiant-teal font-mono border border-radiant-teal/30">
                      WebGL Live Mesh
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time procedural 3D volume & height morphing as soap is consumed
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Selected Soap Inspection:
                </span>
                <h4 className="text-2xl font-black text-white mt-0.5">
                  {selectedTwinItem.brand} {selectedTwinItem.name}
                </h4>
                <p className="text-xs text-radiant-teal font-medium mt-1">
                  Location: {selectedTwinItem.location} • Initial: {selectedTwinItem.initialQuantity}{selectedTwinItem.unit}
                </p>
              </div>

              {/* Progress and numbers */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block">Remaining</span>
                  <span className="text-base font-extrabold text-white">
                    {selectedTwinItem.remainingQuantity} {selectedTwinItem.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block">Depletion</span>
                  <span className="text-base font-extrabold text-radiant-teal">
                    {Math.round((selectedTwinItem.remainingQuantity / selectedTwinItem.initialQuantity) * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block">Dish Tare</span>
                  <span className="text-base font-extrabold text-gold-400">
                    {selectedTwinItem.tareWeightG}g
                  </span>
                </div>
              </div>

              {/* Soap selector chips */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  Select Soap to Inspect in 3D:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTwinId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        selectedTwinItem.id === item.id
                          ? 'bg-radiant-teal text-obsidian-950 font-bold shadow-md shadow-radiant-teal/20'
                          : 'bg-obsidian-950/70 text-slate-300 hover:text-white border border-teal-900/30'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{item.brand}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3D WebGL Canvas Container */}
            <div className="w-full lg:w-96">
              <SoapDigitalTwin3D
                item={selectedTwinItem}
                height={280}
                autoRotate={true}
                interactive={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* GEMMA 4 EXPLAINABLE INSIGHTS PANEL */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-obsidian-800 to-obsidian-900 border border-radiant-teal/30 shadow-xl relative overflow-hidden backdrop-blur">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Gemma 4 Explainable Consumption Insights
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40 font-mono">
                  gemma4:latest
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI reasoning on household soap burn rate, wastage prevention & cost efficiency
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshInsights}
            disabled={isLoadingInsights}
            className="px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 border border-radiant-teal/30 text-radiant-teal text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
            <span>{isLoadingInsights ? 'Analyzing...' : 'Ask Gemma 4 for Deeper Analysis'}</span>
          </button>
        </div>

        {/* Insights Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map(ins => (
            <div
              key={ins.id}
              className="p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-700/80 hover:border-radiant-teal/40 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-radiant-teal uppercase tracking-wider text-[10px]">
                    {ins.category}
                  </span>
                  {ins.metric && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-300">
                      {ins.metric}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{ins.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{ins.message}</p>
              </div>

              {ins.recommendation && (
                <div className="pt-2 border-t border-obsidian-800 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{ins.recommendation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SMART INVENTORY ALERTS PANEL */}
      {alerts.length > 0 && (
        <div className="rounded-2xl p-5 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 space-y-3 backdrop-blur">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Smart Inventory Alerts ({alerts.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 bg-white dark:bg-obsidian-800/80 rounded-xl border border-amber-500/20 shadow-sm flex items-start gap-3"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/10 text-red-500'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {alert.severity === 'critical' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : alert.severity === 'warning' ? (
                    <Flame className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {alert.productName}
                  </div>
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {alert.message}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {alert.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE HOUSEHOLD SOAPS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Active Household Soaps
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-tap scale, manual, or pump consumption tracking with 3D digital twins
            </p>
          </div>
          <button
            onClick={onOpenScanModal}
            className="px-4 py-2 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Scan / Add Soap
          </button>
        </div>

        {activeItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-obsidian-800 rounded-2xl border border-slate-200 dark:border-obsidian-700 space-y-3">
            <PackageCheck className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active soaps in inventory
            </p>
            <p className="text-xs text-slate-500">
              Click &quot;Scan / Add Soap&quot; to scan packaging with Gemma 4 Vision.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeItems.map(item => {
              const remainingPct =
                item.initialQuantity > 0
                  ? Math.round((item.remainingQuantity / item.initialQuantity) * 100)
                  : 0;
              const { daysRemaining, dailyBurnRate } = calculateItemBurnRate(
                item,
                usageEvents,
                14
              );
              const assignedMem = familyMembers.find(m => m.id === item.assignedMemberId);

              return (
                <TiltCard3D key={item.id} maxTilt={8}>
                  <div className="p-5 rounded-2xl bg-white dark:bg-obsidian-800/95 border border-slate-200 dark:border-teal-900/30 shadow-md hover:shadow-xl hover:border-radiant-teal/50 transition flex flex-col justify-between h-full group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-radiant-teal/15 text-radiant-teal">
                          {item.productType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.location}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {item.brand}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-radiant-teal transition">
                          {item.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-slate-400 line-clamp-1">{item.variant}</p>
                        )}
                      </div>

                      {/* Depletion Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {item.remainingQuantity} {item.unit}
                          </span>
                          <span
                            className={`font-semibold font-mono ${
                              remainingPct <= 20
                                ? 'text-red-400'
                                : remainingPct <= 40
                                ? 'text-amber-400'
                                : 'text-radiant-teal'
                            }`}
                          >
                            {remainingPct}% left
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-obsidian-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-obsidian-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              remainingPct <= 20
                                ? 'bg-red-500'
                                : remainingPct <= 40
                                ? 'bg-amber-400'
                                : 'bg-gradient-to-r from-radiant-teal to-radiant-light'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Original: {item.initialQuantity}{item.unit}</span>
                          {daysRemaining < 999 && dailyBurnRate > 0 && (
                            <span className="text-amber-500/90 font-medium">
                              ~{daysRemaining}d left
                            </span>
                          )}
                        </div>
                      </div>

                      {assignedMem && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                          <span>{assignedMem.avatar}</span>
                          <span>{assignedMem.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-obsidian-700/60 flex gap-2">
                      <button
                        onClick={() => setActiveTwinId(item.id)}
                        title="View 3D Digital Twin"
                        className="p-2 bg-obsidian-950/60 hover:bg-radiant-teal/20 text-slate-300 hover:text-radiant-teal rounded-xl border border-teal-900/40 transition"
                      >
                        <Box className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenLogModal(item)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-obsidian-700 hover:bg-radiant-teal hover:text-obsidian-950 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" /> Log Usage
                      </button>
                    </div>
                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
