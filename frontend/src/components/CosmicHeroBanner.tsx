import React from 'react';
import {
  Sparkles,
  Scale,
  Database,
  Plus,
  Box,
  Layers,
} from 'lucide-react';
import { InventoryItem, AIStatus, UserProfile } from '../types/soap';
import { SoapDigitalTwin3D } from './three/SoapDigitalTwin3D';
import { FloatingSoapHolo } from './ui/FloatingSoapHolo';

interface CosmicHeroBannerProps {
  currentUser: UserProfile;
  activeTwinItem: InventoryItem | null;
  activeSoapsCount: number;
  aiStatus: AIStatus | null;
  onOpenScanModal: () => void;
  onOpenLogModal: () => void;
}

export const CosmicHeroBanner: React.FC<CosmicHeroBannerProps> = ({
  currentUser,
  activeTwinItem,
  activeSoapsCount,
  aiStatus,
  onOpenScanModal,
  onOpenLogModal,
}) => {
  const remainingPct =
    activeTwinItem && activeTwinItem.initialQuantity > 0
      ? Math.round((activeTwinItem.remainingQuantity / activeTwinItem.initialQuantity) * 100)
      : 0;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-teal-900/40 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-obsidian-950 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
      {/* Background Cosmic Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-radiant-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Personalized Household Header & Real Actions */}
        <div className="space-y-5 max-w-2xl">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30 text-xs font-bold font-mono">
              <Database className="w-3.5 h-3.5 text-radiant-teal" />
              <span>AUTHENTIC USER DATA ISOLATED</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${aiStatus?.online ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{aiStatus?.online ? 'Gemma 4 Local AI' : 'Gemma 4 Standby'}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-obsidian-900 text-slate-300 border border-slate-800 text-[11px] font-mono">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{activeSoapsCount} Active Soaps</span>
            </span>
          </div>

          {/* Personalized Title */}
          <div>
            <div className="text-xs uppercase font-extrabold text-radiant-teal tracking-wider mb-1">
              {currentUser.householdName}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-radiant-teal via-cyan-400 to-radiant-light">{currentUser.name}</span>
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Real-time tare-calibrated scale synchronization, procedural 3D volume morphing, and local Gemma 4 consumption intelligence for zero household soap wastage.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenScanModal}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-obsidian-950 bg-gradient-to-r from-radiant-teal via-cyan-400 to-radiant-light hover:brightness-110 shadow-lg shadow-radiant-teal/25 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4 fill-obsidian-950" />
              <span>+ Scan / Register New Soap</span>
            </button>

            <button
              onClick={onOpenLogModal}
              disabled={activeSoapsCount === 0}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-cyan-300 bg-obsidian-900/90 hover:bg-cyan-500/20 border border-cyan-400/40 flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>⚖️ Log Real Weight / Dispense</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Digital Twin Stage or Empty Holographic Blueprint */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-2xl p-4 bg-obsidian-900/80 border border-radiant-teal/30 shadow-xl relative overflow-hidden backdrop-blur flex flex-col items-center">
            {/* Title Bar */}
            <div className="w-full flex items-center justify-between text-xs mb-2 pb-2 border-b border-obsidian-800">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Box className="w-3.5 h-3.5 text-radiant-teal" />
                <span>3D Digital Twin Stage</span>
              </div>
              {activeTwinItem ? (
                <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.2 rounded bg-obsidian-950 border border-cyan-500/30">
                  {remainingPct}% Vol
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-obsidian-950 border border-slate-800">
                  Awaiting Soap
                </span>
              )}
            </div>

            {/* Viewport: Active Soap Twin or Holographic Blueprint */}
            {activeTwinItem ? (
              <>
                <div className="w-full h-48 relative">
                  <SoapDigitalTwin3D
                    item={activeTwinItem}
                    height={190}
                    autoRotate={true}
                    interactive={true}
                  />
                </div>
                <div className="w-full text-center mt-2 pt-2 border-t border-obsidian-800/80">
                  <span className="text-xs font-bold text-white block truncate">
                    {activeTwinItem.brand} {activeTwinItem.name}
                  </span>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="text-radiant-teal font-mono font-bold">
                      {activeTwinItem.remainingQuantity} {activeTwinItem.unit} left
                    </span>
                    <span>•</span>
                    <span>{activeTwinItem.location}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full py-6 flex flex-col items-center justify-center text-center space-y-3">
                <FloatingSoapHolo icon="🧊" size="md" glowColor="#06B6D4" />
                <div>
                  <h4 className="text-xs font-bold text-white">No 3D Twin Active Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Register your first soap to generate a real-time procedural 3D digital twin.
                  </p>
                </div>
                <button
                  onClick={onOpenScanModal}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/40 hover:bg-radiant-teal/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register Your First Soap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
