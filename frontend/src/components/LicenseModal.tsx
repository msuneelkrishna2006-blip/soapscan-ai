import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Cpu,
  Database,
  Copy,
  Check,
  Download,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdName?: string;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  householdName = "Suneel's Smart Household",
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const licenseSummaryText = `SOAPSCAN AI SOFTWARE LICENSE & TELEMETRY GOVERNANCE AGREEMENT
Version: 2.6 (October 2026 Edition)
Licensee: ${householdName}
Classification: Proprietary Consumer IoT & Edge AI Telemetry System
Copyright (c) 2026 SoapScan AI. All Rights Reserved.

1. GRANT OF LICENSE
SoapScan AI grants the authorized household a non-exclusive, non-transferable license to utilize the SoapScan AI platform for personal, private household telemetry, barcode visual decoding, and tare-calibrated consumption intelligence.

2. PROPRIETARY 3D DIGITAL TWIN INTELLECTUAL PROPERTY
The procedural 3D geometric depletion shaders, erosion mechanics, FMCG barcode identification pipelines, and local Gemma 4 multimodal vision integrations constitute proprietary trade secrets and intellectual property of SoapScan AI.

3. RESTRICTIONS ON REVERSE ENGINEERING
Unauthorized reproduction, distribution, decompilation, model extraction, or reverse engineering of the SoapScan AI client, serverless engine, or SSE telemetry pipelines is strictly prohibited.

4. USER DATA ISOLATION & PRIVACY
All household consumption events, digital scale readings, and bathroom audit records are strictly isolated to the licensee's household domain with zero unauthorized third-party commercial data brokering.`;

  const copyLicenseToClipboard = () => {
    navigator.clipboard.writeText(licenseSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLicenseFile = () => {
    const blob = new Blob([licenseSummaryText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SOAPSCAN_AI_PROPRIETARY_LICENSE.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-obsidian-950 border border-teal-500/35 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-900/40 bg-obsidian-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/15 text-teal-400 rounded-xl border border-teal-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>SoapScan AI Software License</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  v2.6 Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Proprietary Telemetry &amp; Digital Twin Software Agreement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-obsidian-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 font-sans leading-relaxed">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-obsidian-900/80 border border-teal-900/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Licensee Entity
              </span>
              <span className="font-bold text-white text-xs truncate block">{householdName}</span>
            </div>
            <div className="p-3 rounded-2xl bg-obsidian-900/80 border border-teal-900/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Jurisdiction &amp; Year
              </span>
              <span className="font-bold text-teal-300 text-xs block">Global • 2026</span>
            </div>
            <div className="p-3 rounded-2xl bg-obsidian-900/80 border border-teal-900/40 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Protection Status
              </span>
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Proprietary IP
              </span>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-obsidian-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>1. Permitted Household Scope &amp; Consumption Telemetry</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                SoapScan AI grants the registered household an exclusive, authenticated instance for real-time soap inventory tracking, precision digital scale calibrations, dispenser pump micro-dosing estimations, and family member allocation audits.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>2. 3D Digital Twin Shader &amp; Multimodal AI Protection</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The procedural 3D geometric depletion shaders, bevel and curvature wear calculations, dual-engine FMCG packaging visual detectors, and edge Gemma 4 vision pipelines constitute proprietary intellectual property of SoapScan AI.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>3. Strict Reverse Engineering &amp; Redistribution Ban</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Decompilation, disassembly, unauthorized API extraction, or redistribution of telemetry communication schemas and local AI model weights without express written authorization is strictly prohibited under international copyright conventions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>4. Cryptographic Isolation &amp; Zero Telemetry Brokerage</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All consumer measurements, product timestamps, and bathroom logs are cryptographic properties of the licensee. Zero telemetry data is ever sold, leased, or distributed to advertisers or data brokers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-teal-900/40 bg-obsidian-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={copyLicenseToClipboard}
              className="px-3 py-1.5 bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 hover:border-teal-400/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Terms'}</span>
            </button>
            <button
              onClick={downloadLicenseFile}
              className="px-3 py-1.5 bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 hover:border-teal-400/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-obsidian-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 transition cursor-pointer"
          >
            I Acknowledge &amp; Accept
          </button>
        </div>
      </div>
    </div>
  );
};
