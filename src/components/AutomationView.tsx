import React, { useState } from 'react';
import { Cpu, Webhook, Copy, Check, ExternalLink, Code2, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AutomationWebhookSnippet } from '../types.ts';

interface AutomationViewProps {
  automation: AutomationWebhookSnippet[];
  companyName: string;
}

export const AutomationView: React.FC<AutomationViewProps> = ({ automation, companyName }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (jsonObj: Record<string, unknown>, idx: number) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
          <Cpu className="w-4 h-4 text-indigo-650" />
          <span>Automated Revenue Salvage Webhooks & Integrations</span>
        </h3>
        <p className="text-xs text-slate-505 text-slate-500 mt-0.5">
          Connect your billing platform (Stripe, Chargebee, Paddle) or workflow triggers (Zapier, Customer.io) to intercept churn instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {automation.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between rounded-xl"
          >
            <div>
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 font-bold text-xs">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{item.integrationTarget} Webhook</span>
                    <span className="block text-[10px] text-slate-500 font-mono">Trigger: {item.eventTrigger}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Deploy
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-900 font-semibold block mb-1">Configuration Guide:</strong>
                  {item.instructions}
                </div>

                {/* Payload Preview */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
                      <Code2 className="w-3.5 h-3.5" /> Payload Schema
                    </span>
                    <button
                      onClick={() => handleCopy(item.payloadJson, idx)}
                      className="flex items-center gap-1 text-[11px] text-indigo-650 hover:text-indigo-850 font-medium cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-605">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48 border border-slate-800">
                    {JSON.stringify(item.payloadJson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate font-mono text-slate-600">Target: {item.webhookEndpoint}</span>
              <span className="font-semibold text-slate-700">Auto-Retry: Enabled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
