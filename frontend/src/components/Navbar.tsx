import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springPhysics } from '../lib/motionVariants';
import {
  Camera,
  Sun,
  Moon,
  Download,
  Calendar,
  Settings,
  Users,
  BarChart3,
  History,
  Package,
  LayoutDashboard,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  X,
  Scan,
} from 'lucide-react';
import { AIStatus, UserProfile } from '../types/soap';

export type CosmicIntensityMode = 'low' | 'medium' | 'high' | 'warp';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'inventory' | 'history' | 'analytics' | 'family';
  onSelectView: (view: 'home' | 'dashboard' | 'inventory' | 'history' | 'analytics' | 'family') => void;
  onOpenScanModal: () => void;
  onOpenSettingsModal: () => void;
  onExportCSV: () => void;
  aiStatus: AIStatus | null;
  targetMonth: string;
  onTargetMonthChange: (month: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
  cosmicIntensity: CosmicIntensityMode;
  onChangeCosmicIntensity: (val: CosmicIntensityMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenScanModal,
  onOpenSettingsModal,
  onExportCSV,
  aiStatus,
  targetMonth,
  onTargetMonthChange,
  isDark,
  onToggleTheme,
  currentUser,
  onLogout,
  cosmicIntensity,
  onChangeCosmicIntensity,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const cycleCosmicIntensity = () => {
    if (cosmicIntensity === 'low') onChangeCosmicIntensity('medium');
    else if (cosmicIntensity === 'medium') onChangeCosmicIntensity('high');
    else if (cosmicIntensity === 'high') onChangeCosmicIntensity('warp');
    else onChangeCosmicIntensity('low');
  };

  const navTabs = [
    { id: 'home' as const, label: 'Home', fullLabel: 'Cosmic Home', icon: Sparkles, iconClass: 'text-amber-400' },
    { id: 'dashboard' as const, label: 'Dash', fullLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as const, label: 'Twins', fullLabel: 'Inventory & 3D Twins', icon: Package },
    { id: 'history' as const, label: 'Audit', fullLabel: 'Usage History & Audit', icon: History },
    { id: 'analytics' as const, label: 'Charts', fullLabel: 'Analytics Charts', icon: BarChart3 },
    { id: 'family' as const, label: 'Rooms', fullLabel: 'Family & Bathrooms', icon: Users },
  ];

  return (
    <>
      {/* Primary Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-md border-b border-slate-200 dark:border-teal-900/30 select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand */}
          <div
            onClick={() => onSelectView('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 flex items-center justify-center text-obsidian-950 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <span className="text-lg sm:text-xl">🧼</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  SoapScan <span className="text-teal-400 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono tracking-wider">
                  visionOS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden lg:block font-medium">
                {currentUser.householdName} • 3D Digital Twin Consumption Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Center: Dynamic Island Live Scanner Pill */}
          <div
            onClick={onOpenScanModal}
            className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/90 dark:bg-[#0c1822]/90 border border-slate-300 dark:border-teal-500/30 shadow-md hover:border-teal-400 transition cursor-pointer backdrop-blur-xl group"
            title="Click to open Live Camera Scanner with Gemma 4 Vision"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-sonar-radar absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400 shadow-[0_0_8px_#10B981]" />
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-teal-400 transition">
                soapscan-gemma4
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                Live Vision Ready
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 font-bold border border-teal-500/30">
              Scan
            </span>
          </div>

          {/* Desktop Right Action Tools */}
          <div className="hidden md:flex items-center flex-wrap gap-2.5">
            {/* AI Status Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                aiStatus?.online
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}
              title={`AI Engine: ${aiStatus?.model || 'gemma4:latest'} (${aiStatus?.mode || 'cloud'})`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px]">
                {aiStatus?.online ? 'soapscan-gemma4 Online' : 'Gemma 4 Standby'}
              </span>
            </div>

            {/* Cosmic 3D Ambient Stars Intensity Toggle */}
            <button
              onClick={cycleCosmicIntensity}
              title={`Cosmic 3D Starfield: ${cosmicIntensity.toUpperCase()} (Click to cycle)`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-obsidian-900/80 border border-teal-900/40 text-[11px] text-radiant-teal hover:border-radiant-teal transition font-mono cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-radiant-teal" />
              <span>3D Stars:</span>
              <span className="uppercase font-bold text-amber-300">{cosmicIntensity}</span>
            </button>

            {/* Month Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-obsidian-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-obsidian-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="month"
                value={targetMonth}
                onChange={e => onTargetMonthChange(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* CSV Export */}
            <button
              onClick={onExportCSV}
              title="Export CSV Telemetry"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-radiant-teal" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Settings Modal */}
            <button
              onClick={onOpenSettingsModal}
              title="Settings & Schema"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary Desktop Scan Soap Button */}
            <button
              onClick={onOpenScanModal}
              className="px-3.5 py-2 bg-gradient-to-r from-radiant-teal to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-obsidian-950 font-bold text-xs rounded-xl transition shadow-lg shadow-radiant-teal/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Soap</span>
            </button>

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-obsidian-800">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-xs text-white"
                title={`Logged in as ${currentUser.name} (${currentUser.householdName})`}
              >
                <span>👤</span>
                <span className="font-bold text-[11px] hidden lg:inline">{currentUser.name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out & Lock Workspace"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-obsidian-900 border border-slate-800 hover:border-red-400/50 transition flex items-center justify-center cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Right Controls: Compact Quick Scanner CTA + Drawer Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Prominent Mobile Scan CTA */}
            <button
              onClick={onOpenScanModal}
              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-obsidian-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-500/25 active:scale-95 transition-transform"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan</span>
            </button>

            {/* Mobile Control Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(prev => !prev)}
              aria-label="Toggle Mobile Controls Drawer"
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isMobileDrawerOpen
                  ? 'bg-teal-500 text-obsidian-950 border-teal-400 shadow-md shadow-teal-500/30'
                  : 'bg-obsidian-900 text-slate-300 border-teal-900/50 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar (6 Tabs) */}
        <div className="hidden md:block border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectView(tab.id)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
                    isActive
                      ? 'text-teal-300 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPillDesktop"
                      className="absolute inset-0 bg-emerald-500/15 dark:bg-emerald-400/20 border border-emerald-500/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      transition={springPhysics}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${tab.iconClass || (isActive ? 'text-emerald-400' : 'text-slate-400')}`} />
                    {tab.fullLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Control Drawer (Expandable secondary tools) */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-teal-900/40 bg-obsidian-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-teal-900/30 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Control Center &amp; Environment</span>
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Mobile Secondary Tools */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 3D Stars Cycling */}
                <button
                  onClick={cycleCosmicIntensity}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-slate-200 active:scale-95 transition"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>3D Stars:</span>
                  </span>
                  <span className="font-bold uppercase text-amber-300 font-mono text-[11px]">
                    {cosmicIntensity}
                  </span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={onToggleTheme}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-slate-200 active:scale-95 transition"
                >
                  <span className="flex items-center gap-1.5 text-[11px]">
                    {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-teal-400" />}
                    <span>Theme:</span>
                  </span>
                  <span className="font-bold font-mono text-[11px] text-cyan-300">
                    {isDark ? 'Dark' : 'Light'}
                  </span>
                </button>

                {/* Month Selector */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-slate-200 col-span-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Month:</span>
                  </span>
                  <input
                    type="month"
                    value={targetMonth}
                    onChange={e => onTargetMonthChange(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-teal-300 focus:outline-none"
                  />
                </div>

                {/* CSV Export */}
                <button
                  onClick={() => {
                    onExportCSV();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-slate-200 active:scale-95 transition"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[11px] font-bold">Export CSV</span>
                </button>

                {/* Settings & Schema */}
                <button
                  onClick={() => {
                    onOpenSettingsModal();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-obsidian-900 border border-teal-900/40 text-slate-200 active:scale-95 transition"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold">Settings</span>
                </button>
              </div>

              {/* User Profile & Sign Out Bar */}
              <div className="pt-2 border-t border-teal-900/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400">{currentUser.householdName}</div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Apple VisionOS-inspired Fixed Frosted Glass Bottom Navigation Bar (< 768px Mobile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/85 backdrop-blur-2xl border-t border-teal-500/25 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] px-2 py-1.5 select-none"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
                  isActive ? 'text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator Halo */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabHalo"
                    className="absolute inset-0 bg-gradient-to-t from-teal-500/20 to-transparent rounded-xl -z-10"
                    transition={springPhysics}
                  />
                )}
                <div className="relative">
                  <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-teal-300 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-slate-400'}`} />
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveDot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf]"
                    />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
