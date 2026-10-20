import React from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { AIStatus, UserProfile } from '../types/soap';

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
  cosmicIntensity: 'low' | 'medium' | 'high';
  onChangeCosmicIntensity: (val: 'low' | 'medium' | 'high') => void;
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
  const cycleCosmicIntensity = () => {
    if (cosmicIntensity === 'low') onChangeCosmicIntensity('medium');
    else if (cosmicIntensity === 'medium') onChangeCosmicIntensity('high');
    else onChangeCosmicIntensity('low');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-md border-b border-slate-200 dark:border-teal-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 flex items-center justify-center text-obsidian-950 shadow-lg shadow-teal-500/20">
            <span className="text-xl">🧼</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                SoapScan <span className="text-teal-400 font-extrabold">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono tracking-wider">
                Apple visionOS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              {currentUser.householdName} • Smart Soap Usage &amp; 3D Digital Twin Consumption
            </p>
          </div>
        </div>

        {/* Dynamic Island Live Scanner Pill (Center) */}
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

        {/* Right Action Tools */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* AI Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              aiStatus?.online
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}
            title={`Ollama model: soapscan-gemma4 / ${aiStatus?.model || 'gemma4:latest'}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px] hidden md:inline">
              {aiStatus?.online ? 'soapscan-gemma4 Online' : 'Gemma 4 Standby'}
            </span>
            <span className="font-mono text-[11px] md:hidden">
              {aiStatus?.online ? 'soapscan-gemma4' : 'Offline'}
            </span>
          </div>

          {/* Cosmic 3D Ambient Stars Intensity Toggle */}
          <button
            onClick={cycleCosmicIntensity}
            title={`Cosmic 3D Starfield: ${cosmicIntensity.toUpperCase()} (Click to cycle)`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-obsidian-900/80 border border-teal-900/40 text-[11px] text-radiant-teal hover:border-radiant-teal transition font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-radiant-teal" />
            <span className="hidden sm:inline">3D Stars:</span>
            <span className="uppercase font-bold">{cosmicIntensity}</span>
          </button>

          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-obsidian-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-obsidian-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={targetMonth}
              onChange={e => onTargetMonthChange(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* CSV Export */}
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            <Download className="w-4 h-4 text-radiant-teal" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettingsModal}
            title="Settings & Schema"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Scan Soap Button */}
          <button
            onClick={onOpenScanModal}
            className="px-3.5 py-2 bg-gradient-to-r from-radiant-teal to-cyan-400 text-obsidian-950 font-bold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/25 flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Soap</span>
          </button>

          {/* Real User Profile Pill & Sign Out */}
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
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-obsidian-900 border border-slate-800 hover:border-red-400/50 transition flex items-center justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
          {[
            { id: 'home', label: 'Cosmic Home', icon: Sparkles, iconClass: 'text-amber-400' },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'inventory', label: 'Inventory & 3D Twins', icon: Package },
            { id: 'history', label: 'Usage History & Audit', icon: History },
            { id: 'analytics', label: 'Analytics Charts', icon: BarChart3 },
            { id: 'family', label: 'Family & Bathrooms', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id as any)}
                className={`relative px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-teal-300 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-emerald-500/15 dark:bg-emerald-400/20 border border-emerald-500/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    transition={springPhysics}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${tab.iconClass || (isActive ? 'text-emerald-400' : 'text-slate-400')}`} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
