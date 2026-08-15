import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, Slack, Mail, Gift, Code } from 'lucide-react';
import { DiagnosticFinding, ActionGenerationRequest, GeneratedActionResponse } from '../types.ts';

interface ActionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: DiagnosticFinding | null;
  companyName: string;
}

export const ActionGeneratorModal: React.FC<ActionGeneratorModalProps> = ({
  isOpen,
  onClose,
  finding,
  companyName
}) => {
  const [tone, setTone] = useState<'URGENT_PROFESSIONAL' | 'EMPATHETIC_FOUNDER' | 'VALUE_FOCUSED_INCENTIVE'>('EMPATHETIC_FOUNDER');
  const [customContext, setCustomContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedActionResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !finding) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const payload: ActionGenerationRequest = {
        companyName,
        cohortName: finding.category,
        targetTone: tone,
        specificFeedbackContext: customContext || finding.rootCauseAnalysis,
        mrrValue: finding.affectedMrr
      };

      const res = await fetch('/api/generate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to generate tailored action.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error communicating with AI action engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Bespoke Retention Action Generator</h3>
              <p className="text-xs text-slate-500">Cohort: {finding.category} (${finding.affectedMrr.toLocaleString()} MRR)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-650 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">Select Communication Tone</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTone('EMPATHETIC_FOUNDER')}
                className={`p-3 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                  tone === 'EMPATHETIC_FOUNDER'
                    ? 'border-indigo-550 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-805 text-slate-800'
                }`}
              >
                <div className="font-bold">Empathetic Founder</div>
                <div className={`text-[11px] mt-0.5 ${tone === 'EMPATHETIC_FOUNDER' ? 'text-indigo-900' : 'text-slate-500'}`}>
                  High-touch, relationship-driven
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTone('VALUE_FOCUSED_INCENTIVE')}
                className={`p-3 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                  tone === 'VALUE_FOCUSED_INCENTIVE'
                    ? 'border-indigo-550 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-805 text-slate-800'
                }`}
              >
                <div className="font-bold">Value & Discount</div>
                <div className={`text-[11px] mt-0.5 ${tone === 'VALUE_FOCUSED_INCENTIVE' ? 'text-indigo-900' : 'text-slate-500'}`}>
                  Commercial incentives & credits
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTone('URGENT_PROFESSIONAL')}
                className={`p-3 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                  tone === 'URGENT_PROFESSIONAL'
                    ? 'border-indigo-550 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-805 text-slate-800'
                }`}
              >
                <div className="font-bold">Urgent Professional</div>
                <div className={`text-[11px] mt-0.5 ${tone === 'URGENT_PROFESSIONAL' ? 'text-indigo-900' : 'text-slate-500'}`}>
                  Time-sensitive grace periods
                </div>
              </button>
            </div>
          </div>

          {/* Context Override Input */}
          <div>
            <label htmlFor="custom-context-input" className="block text-xs font-bold text-slate-900 mb-1">
              Customer Context / Specific Feedback (Optional override)
            </label>
            <textarea
              id="custom-context-input"
              rows={2}
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder={`Default: ${finding.rootCauseAnalysis}`}
              className="w-full text-xs p-2.5 bg-white border border-slate-250 text-slate-800 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-550 focus:outline-none"
            />
          </div>

          {/* Generate Trigger Button */}
          <div className="flex justify-end">
            <button
              id="btn-trigger-ai-action"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/20 rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Targeted Package...' : 'Generate Retention Package'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {/* Subject & Email */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Mail className="w-4 h-4 text-indigo-650" />
                    <span>Outreach Subject: {result.subjectLine}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${result.subjectLine}\n\n${result.emailBody}`, 'email')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-650 hover:text-indigo-850 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'email' ? 'Copied' : 'Copy Email'}</span>
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed">
                  {result.emailBody}
                </div>
              </div>

              {/* Commercial Concession & Slack Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-705 text-amber-600 mb-1">
                    <Gift className="w-3.5 h-3.5 text-amber-505 text-amber-600 animate-bounce" />
                    <span>Recommended Concession:</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">{result.recommendedDiscountOrExtension}</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-slate-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Slack className="w-3.5 h-3.5 text-rose-400" /> Slack Notification
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.slackAlertTemplate, 'slack')}
                      className="text-[10px] text-slate-300 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'slack' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                    {result.slackAlertTemplate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
