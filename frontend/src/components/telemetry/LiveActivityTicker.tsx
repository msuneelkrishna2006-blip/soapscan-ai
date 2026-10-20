import React from 'react';
import { Radio, Droplet, Scale, Thermometer, Wind, CheckCircle2 } from 'lucide-react';

export interface TelemetryFeedItem {
  id: string;
  type: 'dispense' | 'scale' | 'sensor' | 'system';
  title: string;
  details: string;
  timestamp: string;
  badge?: string;
}

interface LiveActivityTickerProps {
  feed: TelemetryFeedItem[];
  autoStreamActive: boolean;
  onToggleAutoStream?: () => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  feed,
  autoStreamActive,
  onToggleAutoStream,
}) => {
  return (
    <div className="w-full rounded-2xl bg-obsidian-900/90 border border-teal-900/40 p-3 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs overflow-hidden">
      {/* Title & Live Status Indicator */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-radiant-teal/15 text-radiant-teal font-bold font-mono text-[11px] border border-radiant-teal/30">
          <Radio className={`w-3.5 h-3.5 ${autoStreamActive ? 'animate-pulse text-radiant-teal' : 'text-slate-500'}`} />
          <span>LIVE TELEMETRY FEED</span>
        </div>
        <span className="hidden lg:inline text-slate-400 text-[11px]">
          Real-time IoT smart scale & dispenser event stream
        </span>
      </div>

      {/* Scrolling / Animated Event Items */}
      <div className="flex-1 overflow-x-auto w-full flex items-center gap-2 py-0.5 no-scrollbar">
        {feed.slice(0, 4).map((item, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={item.id}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all duration-300 ${
                isLatest
                  ? 'bg-radiant-teal/15 border-radiant-teal/40 text-white font-medium shadow-sm shadow-radiant-teal/20 animate-fade-in'
                  : 'bg-obsidian-950/70 border-obsidian-800 text-slate-300'
              }`}
            >
              {item.type === 'dispense' ? (
                <Droplet className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : item.type === 'scale' ? (
                <Scale className="w-3.5 h-3.5 text-radiant-teal shrink-0" />
              ) : item.type === 'sensor' ? (
                <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              )}
              <span className="font-semibold">{item.title}</span>
              <span className="text-slate-400 text-[10px]">{item.details}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-obsidian-800 text-slate-300 font-mono">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-Stream Toggle Chip */}
      {onToggleAutoStream && (
        <button
          onClick={onToggleAutoStream}
          className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
            autoStreamActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-obsidian-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle automatic sensor heartbeat stream"
        >
          <span className="relative flex h-2 w-2">
            {autoStreamActive && <span className="animate-sonar-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${autoStreamActive ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-slate-500'}`} />
          </span>
          <span>{autoStreamActive ? 'Auto-Stream ON' : 'Auto-Stream Paused'}</span>
        </button>
      )}
    </div>
  );
};
