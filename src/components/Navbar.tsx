import React from 'react';
import { ShieldCheck, Activity, Sparkles, RefreshCw, History, Download, Database } from 'lucide-react';
import { PresetDataset } from '../types.ts';

interface NavbarProps {
  onSelectPreset: (preset: PresetDataset) => void;
  presets: PresetDataset[];
  isAnalyzing: boolean;
  onNewAudit: () => void;
  onOpenHistory: () => void;
  onExport: () => void;
  historyCount: number;
  hasAuditResult: boolean;
  serverStatus: 'online' | 'checking' | 'error';
  geminiConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPreset,
  presets,
  isAnalyzing,
  onNewAudit,
  onOpenHistory,
  onExport,
  historyCount,
  hasAuditResult,
  serverStatus,
  geminiConfigured
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs shrink-0">
      <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-650" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg font-display">RevRecover AI</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-650 border border-indigo-100">
                B2B Audit Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Forensic churn diagnostics & salvage automation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server / AI Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                serverStatus === 'online' ? 'bg-emerald-405' : serverStatus === 'checking' ? 'bg-amber-405' : 'bg-rose-405'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                serverStatus === 'online' ? 'bg-emerald-500' : serverStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </span>
            <span>{geminiConfigured ? 'Gemini 2.5 Flash' : 'Algorithmic Engine'}</span>
          </div>

          {/* Preset Quick Loader */}
          <div className="relative inline-block text-left">
            <select
              id="preset-select"
              aria-label="Load demo B2B scenario"
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer transition-all focus:ring-2 focus:ring-indigo-550 focus:outline-none"
              onChange={(e) => {
                const selected = presets.find(p => p.id === e.target.value);
                if (selected) onSelectPreset(selected);
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-white text-slate-400">Load Demo Scenario...</option>
              {presets.map(p => (
                <option key={p.id} value={p.id} className="bg-white text-slate-800">
                  {p.name} ({p.industry})
                </option>
              ))}
            </select>
          </div>

          {/* History Button */}
          <button
            id="btn-view-history"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-750 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
            title="View audit history"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-650 text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Export Report Button */}
          {hasAuditResult && (
            <button
              id="btn-export-report"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-750 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
              title="Export report"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Reset / New Audit Button */}
          <button
            id="btn-new-audit"
            onClick={onNewAudit}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Reset Form</span>
          </button>
        </div>
      </div>
    </header>
  );
};
