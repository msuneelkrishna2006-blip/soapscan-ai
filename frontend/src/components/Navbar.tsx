import React from 'react';
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
  Box,
} from 'lucide-react';
import { AIStatus } from '../types/soap';

interface NavbarProps {
  currentView: 'dashboard' | 'inventory' | 'history' | 'analytics' | 'family';
  onSelectView: (view: 'dashboard' | 'inventory' | 'history' | 'analytics' | 'family') => void;
  onOpenScanModal: () => void;
  onOpenSettingsModal: () => void;
  onExportCSV: () => void;
  aiStatus: AIStatus | null;
  targetMonth: string;
  onTargetMonthChange: (month: string) => void;
  includeSample: boolean;
  onToggleIncludeSample: (val: boolean) => void;
  isDark: boolean;
  onToggleTheme: () => void;
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
  includeSample,
  onToggleIncludeSample,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-md border-b border-slate-200 dark:border-teal-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-radiant-teal to-radiant-dark flex items-center justify-center text-obsidian-950 shadow-md shadow-radiant-teal/20">
            <span className="text-xl">🧼</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                SoapScan <span className="text-radiant-teal">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-500 border border-gold-500/30 font-mono">
                3D WebGL + Gemma 4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart Soap Usage & 3D Digital Twin Consumption Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              aiStatus?.online
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}
            title={`Ollama endpoint: ${aiStatus?.endpoint || 'http://localhost:11434'} (model: gemma4:latest)`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px] hidden md:inline">
              {aiStatus?.online ? 'Gemma 4 Local AI (Online)' : 'Gemma 4 Standby'}
            </span>
            <span className="font-mono text-[11px] md:hidden">
              {aiStatus?.online ? 'Gemma 4' : 'Offline'}
            </span>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-obsidian-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-obsidian-700">
            <input
              type="checkbox"
              checked={includeSample}
              onChange={e => onToggleIncludeSample(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-radiant-teal focus:ring-0"
            />
            <span className="text-[11px] font-medium hidden sm:inline">Include Sample Data</span>
            <span className="text-[11px] font-medium sm:hidden">Sample</span>
          </label>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-obsidian-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-obsidian-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={targetMonth}
              onChange={e => onTargetMonthChange(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            <Download className="w-4 h-4 text-radiant-teal" />
          </button>

          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={onOpenSettingsModal}
            title="Settings & Schema"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenScanModal}
            className="px-4 py-2 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/25 flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Soap</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              currentView === 'dashboard'
                ? 'bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onSelectView('inventory')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              currentView === 'inventory'
                ? 'bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Inventory & 3D Twins
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              currentView === 'history'
                ? 'bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Usage History & Audit
          </button>

          <button
            onClick={() => onSelectView('analytics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              currentView === 'analytics'
                ? 'bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics Charts
          </button>

          <button
            onClick={() => onSelectView('family')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              currentView === 'family'
                ? 'bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Family & Bathrooms
          </button>
        </div>
      </div>
    </header>
  );
};
