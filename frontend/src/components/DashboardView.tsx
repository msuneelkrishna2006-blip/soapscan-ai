import React, { useState, useRef } from 'react';
import {
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
  Minus,
  MessageSquare,
  Bot,
  Sliders,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import {
  InventoryItem,
  UsageEvent,
  FamilyMember,
  NotificationPrefs,
  AIInsight,
  AIStatus,
  UserProfile,
} from '../types/soap';
import {
  calculateDashboardKPIs,
  generateSmartAlerts,
  calculateItemBurnRate,
} from '../lib/analyticsEngine';
import { TiltCard3D } from './ui/TiltCard3D';
import { SoapDigitalTwin3D } from './three/SoapDigitalTwin3D';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { SparklineMini } from './ui/SparklineMini';
import { CosmicHeroBanner } from './CosmicHeroBanner';
import { FloatingSoapHolo } from './ui/FloatingSoapHolo';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/motionVariants';

interface DashboardViewProps {
  currentUser: UserProfile;
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  notificationPrefs: NotificationPrefs;
  targetMonth: string;
  insights: AIInsight[];
  isLoadingInsights: boolean;
  onRefreshInsights: (customPrompt?: string) => void;
  onOpenScanModal: () => void;
  onOpenLogModal: (item?: InventoryItem) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onLogQuickUsage: (
    productId: string,
    amount: number,
    method: 'SCALE' | 'PUMP_ESTIMATE'
  ) => Promise<void>;
  aiStatus: AIStatus | null;
  telemetryLatencyMs?: number;
  isRealtimeConnected?: boolean;
  onQuickAction?: (params: {
    itemId: string;
    action: 'pump' | 'bar_wash' | 'custom_delta' | 'restock';
    amount?: number;
    newQuantity?: number;
  }) => Promise<any>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  inventory,
  usageEvents,
  familyMembers,
  notificationPrefs,
  targetMonth,
  insights,
  isLoadingInsights,
  onRefreshInsights,
  onOpenScanModal,
  onOpenLogModal,
  onUpdateItem,
  onDeleteItem,
  onLogQuickUsage,
  aiStatus,
  telemetryLatencyMs = 12,
  isRealtimeConnected = true,
  onQuickAction,
}) => {
  const kpis = calculateDashboardKPIs(inventory, usageEvents, targetMonth);
  const alerts = generateSmartAlerts(inventory, usageEvents, notificationPrefs);
  const activeItems = inventory.filter(i => i.status === 'active');

  // Active item 3D digital twin preview toggle
  const [activeTwinId, setActiveTwinId] = useState<string | null>(
    activeItems.length > 0 ? activeItems[0].id : null
  );

  // Filter spotlight state
  const [spotlightFilter, setSpotlightFilter] = useState<'all' | 'solid' | 'liquid'>('all');

  const selectedTwinItem =
    activeItems.find(i => i.id === activeTwinId) || activeItems[0] || null;

  // Refs for scrolling to spotlighted sections
  const activeSoapsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const handleKpiClick = (type: 'solid' | 'liquid' | 'inventory' | 'spending' | 'days' | 'top') => {
    if (type === 'solid') {
      setSpotlightFilter('solid');
      activeSoapsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'liquid') {
      setSpotlightFilter('liquid');
      activeSoapsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'days' || type === 'top') {
      insightsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSpotlightFilter('all');
      activeSoapsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayedSoaps = activeItems.filter(item => {
    if (spotlightFilter === 'solid') return item.productType === 'soap_bar';
    if (spotlightFilter === 'liquid') return item.productType !== 'soap_bar';
    return true;
  });

  return (
    <div className="space-y-8 relative z-10">
      {/* REAL-TIME SSE CONNECTION PILL & ACTIVITY BAR */}
      <div className="p-3.5 rounded-2xl bg-obsidian-950/90 border border-teal-500/35 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xl shadow-teal-500/5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-sonar-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_10px_#10B981]" />
          </span>
          <span className="font-bold text-white tracking-wider">LIVE REAL-TIME STREAM (SSE)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
            {telemetryLatencyMs}ms Latency
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <span>
            Gemma 4 Heartbeat: <strong className="text-teal-300">10s Pulse</strong>
          </span>
          <span>•</span>
          <span>
            Zero-Reload Sync: <strong className="text-amber-400">Active</strong>
          </span>
          <button
            onClick={onOpenScanModal}
            className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-obsidian-950 font-black text-[11px] rounded-lg transition shadow-md shadow-teal-500/20 cursor-pointer"
          >
            + Scan Packaging / Barcode
          </button>
        </div>
      </div>

      {/* 1. PERSONALIZED HERO COMMAND CENTER & 3D DIGITAL TWIN STAGE */}
      <CosmicHeroBanner
        currentUser={currentUser}
        activeTwinItem={selectedTwinItem}
        activeSoapsCount={activeItems.length}
        aiStatus={aiStatus}
        onOpenScanModal={onOpenScanModal}
        onOpenLogModal={() => onOpenLogModal(selectedTwinItem || undefined)}
      />

      {/* 2. 6 REAL-TIME USER KPI CARDS WITH LIVE SPARKLINES */}
      <motion.div
        variants={staggerContainer(0.06)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5"
      >
        {/* KPI 1: Solid Soap Used */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('solid')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-radiant-teal/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-radiant-teal transition">
                  Solid Soap
                </span>
                <div className="p-1.5 rounded-lg bg-radiant-teal/15 text-radiant-teal">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={kpis.solidSoapUsedMonthG} decimals={1} />
                    </span>
                    <span className="text-xs font-semibold text-slate-500">g</span>
                  </div>
                  <SparklineMini
                    data={
                      kpis.solidSoapUsedMonthG > 0
                        ? [0, kpis.solidSoapUsedMonthG * 0.4, kpis.solidSoapUsedMonthG * 0.7, kpis.solidSoapUsedMonthG]
                        : [0, 0, 0, 0]
                    }
                    color="#00e5a3"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Used in {targetMonth}</span>
                  <span className="text-radiant-teal font-mono">Spotlight</span>
                </p>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* KPI 2: Liquid Soap Used */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('liquid')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-cyan-400/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-cyan-400 transition">
                  Liquid Soap
                </span>
                <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={kpis.liquidSoapUsedMonthMl} decimals={1} />
                    </span>
                    <span className="text-xs font-semibold text-slate-500">mL</span>
                  </div>
                  <SparklineMini
                    data={
                      kpis.liquidSoapUsedMonthMl > 0
                        ? [0, kpis.liquidSoapUsedMonthMl * 0.3, kpis.liquidSoapUsedMonthMl * 0.8, kpis.liquidSoapUsedMonthMl]
                        : [0, 0, 0, 0]
                    }
                    color="#00f2fe"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Used in {targetMonth}</span>
                  <span className="text-cyan-400 font-mono">Spotlight</span>
                </p>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* KPI 3: Real Active Inventory */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('inventory')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-emerald-400/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-400 transition">
                  Active Soaps
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={kpis.activeItemsCount} />
                    </span>
                    <span className="text-xs text-slate-400">items</span>
                  </div>
                  <SparklineMini
                    data={[0, Math.max(0, kpis.activeItemsCount - 1), kpis.activeItemsCount, kpis.activeItemsCount]}
                    color="#10b981"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {kpis.finishedItemsCount} finished bars
                </p>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* KPI 4: Real Monthly Spending */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('spending')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-gold-400/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-gold-400 transition">
                  Real Spend
                </span>
                <div className="p-1.5 rounded-lg bg-gold-500/15 text-gold-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹<AnimatedCounter value={kpis.monthlySpendingInr} />
                    </span>
                  </div>
                  <SparklineMini
                    data={
                      kpis.monthlySpendingInr > 0
                        ? [0, kpis.monthlySpendingInr * 0.5, kpis.monthlySpendingInr]
                        : [0, 0, 0]
                    }
                    color="#ffd166"
                  />
                </div>
                <div className="flex items-center gap-1 text-[10px] mt-1">
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
                  <span className="text-slate-400 text-[10px]">in {targetMonth}</span>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* KPI 5: Estimated Days Supply */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('days')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-purple-400/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-purple-400 transition">
                  Days Supply
                </span>
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ~<AnimatedCounter value={kpis.estimatedDaysSupplyRemaining} />
                    </span>
                    <span className="text-xs font-semibold text-slate-500">days</span>
                  </div>
                  <SparklineMini data={[30, 25, 20, kpis.estimatedDaysSupplyRemaining || 15]} color="#b388ff" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Household burn pace</p>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* KPI 6: Top Consumed Soap */}
        <motion.div variants={staggerItem}>
          <TiltCard3D>
            <div
              onClick={() => handleKpiClick('top')}
              className="spotlight-card p-4 rounded-2xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-teal-900/40 shadow-lg hover:border-amber-400/60 cursor-pointer backdrop-blur transition flex flex-col justify-between h-full group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-400 transition">
                  Top Soap
                </span>
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
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
        </motion.div>
      </motion.div>

      {/* 3. 3D INTERACTIVE DIGITAL TWIN HERO VIEWER */}
      {selectedTwinItem && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-obsidian-950/95 via-obsidian-900/90 to-obsidian-950/95 border border-radiant-teal/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40">
                  <Box className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      3D Interactive Digital Twin
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-radiant-teal/20 text-radiant-teal font-mono border border-radiant-teal/30">
                      WebGL Morphing Mesh
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time procedural volume depletion calculated from grams &amp; tare weight
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Active Inspection:
                </span>
                <h4 className="text-2xl font-black text-white mt-0.5">
                  {selectedTwinItem.brand} {selectedTwinItem.name}
                </h4>
                <p className="text-xs text-radiant-teal font-medium mt-1">
                  Location: {selectedTwinItem.location} • Initial: {selectedTwinItem.initialQuantity}
                  {selectedTwinItem.unit}
                </p>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-3 rounded-2xl bg-obsidian-950/90 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Remaining</span>
                  <span className="text-base font-black text-white font-mono">
                    {selectedTwinItem.remainingQuantity} {selectedTwinItem.unit}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-obsidian-950/90 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Depletion</span>
                  <span className="text-base font-black text-radiant-teal font-mono">
                    {Math.round(
                      (selectedTwinItem.remainingQuantity / selectedTwinItem.initialQuantity) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-obsidian-950/90 border border-teal-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Tare Calibration</span>
                  <span className="text-base font-black text-gold-400 font-mono">
                    {selectedTwinItem.tareWeightG}g
                  </span>
                </div>
              </div>

              {/* Soap selector chips */}
              {activeItems.length > 1 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
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
                        <span>{item.brand} {item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

      {/* 4. REACTIVE GEMMA 4 CONSUMPTION INSIGHTS PANEL */}
      <div
        ref={insightsRef}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-obsidian-900 border border-radiant-teal/30 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Subtle Holographic Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px] opacity-70 z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Gemma 4 Explainable Consumption Insights
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40 font-mono">
                  gemma4:latest
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% On-device multimodal AI analyzing your real household soap usage &amp; spending
              </p>
            </div>
          </div>

          <button
            onClick={() => onRefreshInsights()}
            disabled={isLoadingInsights}
            className="px-4 py-2.5 bg-obsidian-800 hover:bg-obsidian-700 border border-radiant-teal/40 text-radiant-teal text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50 shrink-0 shadow-md shadow-radiant-teal/15 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
            <span>{isLoadingInsights ? 'Gemma 4 Analyzing...' : 'Analyze Real Consumption'}</span>
          </button>
        </div>

        {/* Quick-Prompt Chips with Animated Pulsing Pills */}
        <div className="relative z-10 mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-radiant-teal" /> Quick AI Queries:
          </span>
          {[
            'Predict next restock date',
            'Analyze soap burn rates',
            'Optimize household soap budget',
            'Explain wastage prevention',
          ].map(prompt => (
            <motion.button
              key={prompt}
              whileHover={{ scale: 1.04, borderColor: 'rgba(16, 185, 129, 0.7)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onRefreshInsights(prompt)}
              disabled={isLoadingInsights}
              className="px-2.5 py-1 rounded-xl bg-obsidian-950/80 hover:bg-radiant-teal/20 border border-teal-900/40 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1 font-mono shadow-xs cursor-pointer"
            >
              <span className="animate-pulse text-radiant-teal">✨</span>
              <span>{prompt}</span>
            </motion.button>
          ))}
        </div>

        {/* Insights Cards Grid or Empty State */}
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map(ins => (
              <div
                key={ins.id}
                className="p-5 rounded-2xl bg-obsidian-950/80 border border-obsidian-800 hover:border-radiant-teal/40 transition flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-radiant-teal uppercase tracking-wider text-[10px]">
                      {ins.category}
                    </span>
                    {ins.metric && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-slate-700">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white mb-1.5">{ins.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ins.message}</p>
                </div>

                {ins.recommendation && (
                  <div className="pt-2.5 border-t border-obsidian-800 text-[11px] text-amber-300/95 flex items-start gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{ins.recommendation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-obsidian-950/60 rounded-2xl border border-teal-900/30 space-y-2">
            <Sparkles className="w-8 h-8 text-radiant-teal mx-auto" />
            <p className="text-sm font-bold text-white">Gemma 4 Ready for Analysis</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Add your household soaps and log weight or pump measurements. Gemma 4 will automatically generate personalized burn-rate and cost recommendations.
            </p>
          </div>
        )}
      </div>

      {/* 5. SMART INVENTORY ALERTS PANEL */}
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

      {/* 6. REAL ACTIVE HOUSEHOLD SOAPS GRID */}
      <div ref={activeSoapsRef} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Active Household Soaps
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-radiant-teal/20 text-radiant-teal font-mono font-bold">
                {displayedSoaps.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 3D digital twins, scale weight updates, and pump logs for your real soaps
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-obsidian-900/80 p-1 rounded-xl border border-teal-900/30 text-[11px]">
              <button
                onClick={() => setSpotlightFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  spotlightFilter === 'all'
                    ? 'bg-radiant-teal text-obsidian-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({activeItems.length})
              </button>
              <button
                onClick={() => setSpotlightFilter('solid')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  spotlightFilter === 'solid'
                    ? 'bg-radiant-teal text-obsidian-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Solid Bars
              </button>
              <button
                onClick={() => setSpotlightFilter('liquid')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  spotlightFilter === 'liquid'
                    ? 'bg-radiant-teal text-obsidian-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Liquid
              </button>
            </div>

            <button
              onClick={onOpenScanModal}
              className="px-4 py-2 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-extrabold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register New Soap
            </button>
          </div>
        </div>

        {displayedSoaps.length === 0 ? (
          <div className="p-10 text-center bg-obsidian-900/50 rounded-3xl border border-teal-900/40 space-y-4">
            <FloatingSoapHolo icon="🧼" size="lg" glowColor="#10B981" />
            <div>
              <p className="text-base font-bold text-white">
                No active soaps registered in your household yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Click &quot;Register New Soap&quot; to scan packaging with Gemma 4 Vision or enter your soap bar details.
              </p>
            </div>
            <button
              onClick={onOpenScanModal}
              className="px-5 py-2.5 bg-gradient-to-r from-radiant-teal to-cyan-400 text-obsidian-950 font-extrabold text-xs rounded-xl hover:brightness-110 transition shadow-lg shadow-radiant-teal/25 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Register Your First Soap
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSoaps.map(item => {
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
              const isLiquid = item.productType.includes('liquid') || item.productType.includes('wash');

              return (
                <TiltCard3D key={item.id} maxTilt={6}>
                  <div className="p-5 rounded-3xl bg-white/95 dark:bg-obsidian-900/95 border border-slate-200 dark:border-teal-900/35 shadow-md hover:shadow-2xl hover:border-radiant-teal/60 transition flex flex-col justify-between h-full group">
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-radiant-teal/15 text-radiant-teal font-mono">
                          {item.productType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.location}
                        </span>
                      </div>

                      {/* Brand & Name */}
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          {item.brand}
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-radiant-teal transition">
                          {item.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-slate-400 line-clamp-1">{item.variant}</p>
                        )}
                      </div>

                      {/* Embedded 3D Mini Digital Twin Preview */}
                      <div className="w-full h-32 rounded-2xl bg-obsidian-950/80 border border-teal-900/30 overflow-hidden relative">
                        <SoapDigitalTwin3D
                          item={item}
                          height={128}
                          autoRotate={true}
                          interactive={false}
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-obsidian-900/90 text-[10px] font-mono text-radiant-teal border border-teal-800/40">
                          3D Twin
                        </div>
                      </div>

                      {/* Depletion Bar with Cosmic Glow */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-800 dark:text-slate-200 font-mono">
                            {item.remainingQuantity} {item.unit}
                          </span>
                          <span
                            className={`font-black font-mono ${
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
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-obsidian-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-obsidian-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                              remainingPct <= 20
                                ? 'bg-red-500 shadow-red-500/50'
                                : remainingPct <= 40
                                ? 'bg-amber-400 shadow-amber-400/50'
                                : 'bg-gradient-to-r from-radiant-teal to-cyan-400 shadow-radiant-teal/50'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Initial: {item.initialQuantity}{item.unit}</span>
                          {daysRemaining < 999 && dailyBurnRate > 0 && (
                            <span className="text-amber-400 font-bold font-mono">
                              ~{daysRemaining}d left
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Real-Time Interactive Micro-Controls & Slider */}
                      <div className="p-3 rounded-2xl bg-obsidian-950/80 border border-slate-800 text-xs space-y-2.5">
                        {isLiquid ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                                <Droplet className="w-3.5 h-3.5" />
                                <span>Micro-Dose Dispenser</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.remainingQuantity} / {item.initialQuantity} mL
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'pump', amount: 1.5 });
                                  } else {
                                    onLogQuickUsage(item.id, 1.5, 'PUMP_ESTIMATE');
                                  }
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40 transition active:scale-95 cursor-pointer"
                              >
                                💧 1 Pump (-1.5 mL)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'pump', amount: 4.5 });
                                  } else {
                                    onLogQuickUsage(item.id, 4.5, 'PUMP_ESTIMATE');
                                  }
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40 transition active:scale-95 cursor-pointer"
                              >
                                💧 3 Pumps (-4.5 mL)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'restock' });
                                  } else {
                                    onUpdateItem(item.id, { remainingQuantity: item.initialQuantity, status: 'active' });
                                  }
                                }}
                                title="Refill back to full volume"
                                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition active:scale-95 cursor-pointer"
                              >
                                + Refill Bottle
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-radiant-teal font-bold flex items-center gap-1">
                                <Scale className="w-3.5 h-3.5" />
                                <span>Real-Time Weight Scrubbing</span>
                              </span>
                              <span className="text-[10px] font-mono text-amber-400 font-bold">
                                {item.remainingQuantity}g left
                              </span>
                            </div>

                            {/* Weight Scrubbing Slider */}
                            <div className="space-y-1">
                              <input
                                type="range"
                                min={0}
                                max={item.initialQuantity}
                                step={0.5}
                                value={item.remainingQuantity}
                                onChange={e => {
                                  const val = parseFloat(e.target.value);
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'custom_delta', newQuantity: val });
                                  }
                                }}
                                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'bar_wash', amount: 4.0 });
                                  } else {
                                    onLogQuickUsage(item.id, 4.0, 'SCALE');
                                  }
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/40 transition active:scale-95 cursor-pointer"
                              >
                                -4g Quick Wash
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'bar_wash', amount: 10.0 });
                                  } else {
                                    onLogQuickUsage(item.id, 10.0, 'SCALE');
                                  }
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/40 transition active:scale-95 cursor-pointer"
                              >
                                -10g Shower
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onQuickAction) {
                                    onQuickAction({ itemId: item.id, action: 'restock' });
                                  } else {
                                    onUpdateItem(item.id, { remainingQuantity: item.initialQuantity, status: 'active' });
                                  }
                                }}
                                title="Reset back to full bar weight"
                                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition active:scale-95 cursor-pointer"
                              >
                                🔄 Restock
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {assignedMem && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{assignedMem.avatar}</span>
                          <span>{assignedMem.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-obsidian-800 flex gap-2">
                      <button
                        onClick={() => onOpenLogModal(item)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-obsidian-800 hover:bg-radiant-teal hover:text-obsidian-950 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-700/60 transition flex items-center justify-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Log Reading</span>
                      </button>

                      <button
                        onClick={() => setActiveTwinId(item.id)}
                        title="Inspect 3D Twin in Hero Stage"
                        className="p-2 bg-obsidian-950/80 hover:bg-radiant-teal/20 text-slate-300 hover:text-radiant-teal rounded-xl border border-teal-900/40 transition"
                      >
                        <Box className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.brand} ${item.name}" from your inventory?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        title="Delete soap"
                        className="p-2 bg-obsidian-950/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-500/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
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
