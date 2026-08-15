import React from 'react';
import { X, History, Clock, ArrowRight, TrendingUp, CheckCircle, Database } from 'lucide-react';
import { AuditReportResult } from '../types.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AuditReportResult[];
  onSelectAudit: (audit: AuditReportResult) => void;
  currentAuditId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudit,
  currentAuditId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-650" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Audit History ({history.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Database className="w-8 h-8 mx-auto mb-2 text-indigo-650" />
              <p className="text-xs">No prior audits recorded in this session yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Run an audit to build up your historical telemetry.</p>
            </div>
          ) : (
            history.map((item) => {
              const isCurrent = item.id === currentAuditId;
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectAudit(item);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/65 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{item.companyName}</span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {dateStr}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {item.industry} • {item.metrics.totalCustomers} churned accounts
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">MRR at Risk</span>
                      <span className="font-bold text-rose-700">${item.metrics.totalMrrAtRisk.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Projected Salvage</span>
                      <span className="font-bold text-emerald-700">+${item.metrics.projectedRecoverableMrr.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
