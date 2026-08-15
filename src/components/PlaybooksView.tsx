import React, { useState } from 'react';
import { Mail, MessageSquare, Copy, Check, Target, ChevronRight, Zap, Gift, Award } from 'lucide-react';
import { RecoveryPlaybookItem } from '../types.ts';

interface PlaybooksViewProps {
  playbooks: RecoveryPlaybookItem[];
}

export const PlaybooksView: React.FC<PlaybooksViewProps> = ({ playbooks }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStrategyBadge = (type: RecoveryPlaybookItem['strategyType']) => {
    switch (type) {
      case 'AUTOMATED_DUNNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Smart Dunning</span>;
      case 'EXECUTIVE_OUTREACH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Founder Outreach</span>;
      case 'WIN_BACK_CAMPAIGN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Win-Back Sequence</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">In-App Save Flow</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Ready-to-Deploy Retention Playbooks</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tailored email templates, dunning cadences, and intervention steps for at-risk cohorts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {playbooks.map((play) => (
          <div
            key={play.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {getStrategyBadge(play.strategyType)}
                <span className="text-xs font-bold text-slate-900">
                  Target Cohort: <span className="text-indigo-600">{play.cohort}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                  ${play.targetMrr.toLocaleString()} Target MRR
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                  {play.estimatedWinRate}% Estimated Recovery
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Offer Banner */}
              <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
                <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-900">Tactical Incentive:</span>
                <span className="text-amber-800">{play.incentiveOffer}</span>
              </div>

              {/* Email / Copy Box */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 font-sans text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Subject: <strong className="text-slate-200 font-semibold">{play.subjectOrHeader}</strong></span>
                  </div>
                  <button
                    onClick={() => handleCopy(`${play.subjectOrHeader}\n\n${play.copyOrScript}`, play.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === play.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-300" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="whitespace-pre-line text-slate-200 font-sans leading-relaxed text-xs">
                  {play.copyOrScript}
                </div>
              </div>

              {/* Implementation Steps */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Execution Protocol:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {play.implementationSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
