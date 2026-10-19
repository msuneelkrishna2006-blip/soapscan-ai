import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Trash2,
  RotateCcw,
  Download,
  Copy,
  Check,
  Bell,
  Cpu,
  X,
} from 'lucide-react';
import { NotificationPrefs, AIStatus } from '../types';
import { getSchemaSql } from '../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationPrefs: NotificationPrefs;
  onUpdatePrefs: (prefs: NotificationPrefs) => void;
  onResetSampleData: (action: 'restore' | 'purge') => Promise<void>;
  aiStatus: AIStatus | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  notificationPrefs,
  onUpdatePrefs,
  onResetSampleData,
  aiStatus,
}) => {
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'data' | 'schema' | 'alerts'>('privacy');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSchemaSql().then(sql => setSchemaSql(sql));
    }
  }, [isOpen]);

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSchemaFile = () => {
    const blob = new Blob([schemaSql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '001_initial_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white dark:bg-obsidian-800 rounded-2xl border border-slate-200 dark:border-teal-900/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-radiant-teal/15 text-radiant-teal rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Settings & Database Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Camera privacy rules, data seeding, and Supabase PostgreSQL schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-obsidian-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-obsidian-700 bg-slate-100/50 dark:bg-obsidian-950/60 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Privacy & Local AI
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> Alert Preferences
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'data'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> Sample Data
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> Supabase Schema SQL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-radiant-teal/10 border border-radiant-teal/30 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-radiant-teal">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Camera Privacy Guarantee</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  SoapScan AI never transmits your camera feed to external third-party cloud servers.
                  Packaging vision analysis is executed 100% on your local machine via Ollama running{' '}
                  <code className="text-radiant-teal font-mono">gemma4:latest</code> at{' '}
                  <code className="font-mono">http://localhost:11434</code>.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside pt-1">
                  <li>Camera hardware stream is terminated immediately once scanning closes.</li>
                  <li>No biometric, personal facial, or background room data is captured or logged.</li>
                  <li>Packaging images are converted to base64 in-memory and discarded.</li>
                </ul>
              </div>

              {/* Ollama Status Card */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Local AI Engine Status
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                      aiStatus?.online
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        aiStatus?.online ? 'bg-emerald-400 animate-ping' : 'bg-red-400'
                      }`}
                    />
                    {aiStatus?.online ? 'Gemma 4 Online' : 'Offline / Standby'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
                  <div>Model: {aiStatus?.model || 'gemma4:latest'}</div>
                  <div>Endpoint: {aiStatus?.endpoint || 'http://localhost:11434'}</div>
                  <div>
                    Multimodal Vision Support:{' '}
                    <span className="text-radiant-teal font-bold">Enabled (GGUF)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Alert Preferences */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Low Stock Alert Threshold (% of Initial Net Weight)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={notificationPrefs.lowStockThresholdPercent}
                  onChange={e =>
                    onUpdatePrefs({
                      ...notificationPrefs,
                      lowStockThresholdPercent: parseInt(e.target.value, 10) || 20,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers warning banner when soap bar drops below this percentage.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Depletion Warning Horizon (Days Remaining)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={notificationPrefs.depletionWarningDays}
                  onChange={e =>
                    onUpdatePrefs({
                      ...notificationPrefs,
                      depletionWarningDays: parseInt(e.target.value, 10) || 5,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Alerts when average burn rate indicates depletion within N days.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stale Measurement Reminder (Days of Inactivity)
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={notificationPrefs.staleMeasurementAlertDays}
                  onChange={e =>
                    onUpdatePrefs({
                      ...notificationPrefs,
                      staleMeasurementAlertDays: parseInt(e.target.value, 10) || 7,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Reminds you to measure soap on the scale if untouched for N days.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-obsidian-900">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-radiant-teal" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Browser Push Notifications
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.browserNotificationsEnabled}
                  onChange={e =>
                    onUpdatePrefs({
                      ...notificationPrefs,
                      browserNotificationsEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-radiant-teal rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Sample Data Management */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sample & Demo Data Controls
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The application is pre-seeded with verified sample records (Dove, Dettol, Pears,
                  Lifebuoy) to showcase the AI analytics charts and burn rate predictions. You can
                  purge them when ready to start your household from scratch, or restore them anytime.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          'Purge sample data? Only your real scans and logged usage events will remain.'
                        )
                      ) {
                        setIsResetting(true);
                        await onResetSampleData('purge');
                        setIsResetting(false);
                      }
                    }}
                    disabled={isResetting}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Sample Data</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          'Restore demo suite? This will replenish the full suite of sample soaps and historical logs.'
                        )
                      ) {
                        setIsResetting(true);
                        await onResetSampleData('restore');
                        setIsResetting(false);
                      }
                    }}
                    disabled={isResetting}
                    className="px-4 py-2 bg-radiant-teal/10 hover:bg-radiant-teal/20 text-radiant-teal border border-radiant-teal/30 text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Sample Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Supabase Schema SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500">
                    PostgreSQL / Supabase Migration
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    File: <code className="text-radiant-teal">supabase/migrations/001_initial_schema.sql</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copySchemaToClipboard}
                    className="px-3 py-1.5 bg-obsidian-700 hover:bg-obsidian-600 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                  <button
                    onClick={downloadSchemaFile}
                    className="px-3 py-1.5 bg-radiant-teal text-obsidian-950 text-xs font-bold rounded-lg hover:bg-radiant-light transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-700 font-mono text-[11px] text-teal-300 max-h-72 overflow-y-auto leading-relaxed select-all">
                {schemaSql || '-- Loading schema SQL...'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-obsidian-700 hover:bg-slate-300 dark:hover:bg-obsidian-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
