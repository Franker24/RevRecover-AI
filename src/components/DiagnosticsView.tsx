import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle, ArrowRight, Sparkles, Shield, Wrench, RefreshCw } from 'lucide-react';
import { DiagnosticFinding } from '../types.ts';

interface DiagnosticsViewProps {
  diagnostics: DiagnosticFinding[];
  executiveSummary: string;
  onOpenActionModal: (finding: DiagnosticFinding) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  diagnostics,
  executiveSummary,
  onOpenActionModal
}) => {
  const getSeverityBadge = (severity: DiagnosticFinding['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-850 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-850 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-750 border border-slate-200">
            <CheckCircle className="w-3 h-3 text-slate-500" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 p-6 rounded-xl relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider font-display">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Executive Forensic Summary</span>
        </div>
        <p className="text-sm sm:text-base text-indigo-900 leading-relaxed font-normal">
          {executiveSummary}
        </p>
      </div>

      {/* Diagnostic Findings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
            <Shield className="w-4 h-4 text-indigo-650" />
            <span>Root-Cause Forensic Churn Triage ({diagnostics.length} Vectors Detected)</span>
          </h3>
          <span className="text-xs text-slate-500">Sorted by financial impact</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {diagnostics.map((diag) => (
            <div
              key={diag.id}
              className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs"
            >
              {/* Top Meta Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(diag.severity)}
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {diag.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    ${diag.affectedMrr.toLocaleString()} MRR at Stake
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {diag.estimatedRecoveryRate}% Win Potential
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h4 className="text-base font-bold text-slate-900 mb-2 font-display">
                {diag.headline}
              </h4>

              {/* Root Cause Analysis */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-4 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Diagnostic Root Cause:</span>
                {diag.rootCauseAnalysis}
              </div>

              {/* Action Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Immediate Actionable Remedy:</span>
                  </div>
                  <p className="text-emerald-800 leading-normal">{diag.immediateRemedy}</p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Systemic Prevention Protocol:</span>
                  </div>
                  <p className="text-indigo-800 leading-normal">{diag.systemicPrevention}</p>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  id={`btn-generate-action-${diag.id}`}
                  onClick={() => onOpenActionModal(diag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Generate Bespoke Outreach & Payload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
