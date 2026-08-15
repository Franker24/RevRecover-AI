import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Building2, UploadCloud, AlertCircle, FileText, Layers } from 'lucide-react';
import { ChurnEventInput, ChurnReason, ChurnType, PresetDataset } from '../types.ts';

interface DatasetIngestionPanelProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  events: ChurnEventInput[];
  setEvents: React.Dispatch<React.SetStateAction<ChurnEventInput[]>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  presets: PresetDataset[];
  onSelectPreset: (p: PresetDataset) => void;
  activePresetId: string | null;
}

const CHURN_REASONS: { value: ChurnReason; label: string }[] = [
  { value: 'BILLING_FAILURE', label: 'Billing / Card Failure' },
  { value: 'PRICE_VALUE', label: 'Pricing / Value Perception' },
  { value: 'MISSING_FEATURE', label: 'Missing Feature / Capability' },
  { value: 'POOR_ONBOARDING', label: 'Onboarding & Setup Friction' },
  { value: 'COMPETITOR_SWITCH', label: 'Competitor Switch' },
  { value: 'BUDGET_CUT', label: 'Budget Cut / OPEX Consolidation' },
  { value: 'TECHNICAL_ISSUE', label: 'Performance / Reliability Issue' },
  { value: 'OTHER', label: 'Other / Unspecified' },
];

export const DatasetIngestionPanel: React.FC<DatasetIngestionPanelProps> = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  events,
  setEvents,
  onAnalyze,
  isAnalyzing,
  presets,
  onSelectPreset,
  activePresetId
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INVOLUNTARY' | 'VOLUNTARY'>('ALL');
  const [isManualAdding, setIsManualAdding] = useState(false);

  // New item form state
  const [newCustomer, setNewCustomer] = useState<Partial<ChurnEventInput>>({
    customerName: '',
    planName: 'Pro Tier',
    mrr: 500,
    churnType: 'INVOLUNTARY',
    primaryReason: 'BILLING_FAILURE',
    detailedFeedback: '',
    tenureMonths: 6,
    lastPaymentStatus: 'FAILED_INSUFFICIENT_FUNDS'
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.customerName || !newCustomer.mrr) return;

    const item: ChurnEventInput = {
      customerId: `cus_custom_${Date.now()}`,
      customerName: newCustomer.customerName,
      planName: newCustomer.planName || 'Standard Plan',
      mrr: Number(newCustomer.mrr),
      churnType: newCustomer.churnType as ChurnType || 'INVOLUNTARY',
      primaryReason: newCustomer.primaryReason as ChurnReason || 'BILLING_FAILURE',
      detailedFeedback: newCustomer.detailedFeedback || 'No additional comment provided.',
      tenureMonths: Number(newCustomer.tenureMonths) || 1,
      lastPaymentStatus: newCustomer.lastPaymentStatus as any
    };

    setEvents(prev => [item, ...prev]);
    setNewCustomer({
      customerName: '',
      planName: 'Pro Tier',
      mrr: 500,
      churnType: 'INVOLUNTARY',
      primaryReason: 'BILLING_FAILURE',
      detailedFeedback: '',
      tenureMonths: 6,
      lastPaymentStatus: 'FAILED_INSUFFICIENT_FUNDS'
    });
    setIsManualAdding(false);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.customerId !== id));
  };

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.churnType === filterType;
  });

  const totalMrr = events.reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Meta Inputs */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/30 shrink-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Building2 className="w-4 h-4 text-indigo-650" />
              <span>Subscription Churn Ingestion & Scenario Setup</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input cancellation logs, failed invoice events, or load a curated B2B SaaS benchmark dataset.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="company-name-input" className="block text-[11px] font-semibold text-slate-650 mb-1">Company / Product</label>
              <input
                id="company-name-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Cloud"
                className="text-xs font-medium bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-44"
              />
            </div>
            <div>
              <label htmlFor="industry-input" className="block text-[11px] font-semibold text-slate-650 mb-1">Industry Vertical</label>
              <input
                id="industry-input"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Developer Tools"
                className="text-xs font-medium bg-white text-slate-800 border border-slate-250 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-44"
              />
            </div>
          </div>
        </div>

        {/* Preset Cards Selector */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block mb-2">
            1-Click Benchmark Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presets.map(p => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  id={`preset-btn-${p.id}`}
                  onClick={() => onSelectPreset(p)}
                  className={`text-left p-3 rounded-lg border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 text-indigo-950 font-medium'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-350 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-600' : 'text-slate-500'}`}>
                    {p.tagline}
                  </div>
                  <div className={`text-[10px] mt-1 font-mono ${isSelected ? 'text-emerald-700' : 'text-emerald-600 font-semibold'}`}>
                    {p.events.length} records • ${p.events.reduce((s, e) => s + e.mrr, 0).toLocaleString()} MRR
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Filter View:</span>
          <div className="inline-flex rounded-lg border border-slate-250 p-0.5 bg-slate-100 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-550 hover:text-slate-905'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilterType('INVOLUNTARY')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'INVOLUNTARY' ? 'bg-white text-amber-900 font-semibold shadow-xs' : 'text-slate-550 hover:text-slate-905'
              }`}
            >
              Involuntary ({events.filter(e => e.churnType === 'INVOLUNTARY').length})
            </button>
            <button
              onClick={() => setFilterType('VOLUNTARY')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'VOLUNTARY' ? 'bg-white text-indigo-950 font-semibold shadow-xs' : 'text-slate-550 hover:text-slate-905'
              }`}
            >
              Voluntary ({events.filter(e => e.churnType === 'VOLUNTARY').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-add-record"
            onClick={() => setIsManualAdding(!isManualAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isManualAdding ? 'Cancel' : 'Add Churn Record'}</span>
          </button>

          <button
            id="btn-run-audit"
            onClick={onAnalyze}
            disabled={isAnalyzing || events.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-600/10 rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Executing Forensic Audit...' : 'Run Forensic Audit'}</span>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      {isManualAdding && (
        <form onSubmit={handleAddEvent} className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 font-display">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Subscription Churn Record</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="new-customer-name" className="block text-[11px] font-semibold text-slate-655 mb-1">Customer / Account Name</label>
              <input
                id="new-customer-name"
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={newCustomer.customerName || ''}
                onChange={e => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-plan-name" className="block text-[11px] font-semibold text-slate-655 mb-1">Plan / Tier</label>
              <input
                id="new-plan-name"
                type="text"
                placeholder="e.g. Growth Tier"
                value={newCustomer.planName || ''}
                onChange={e => setNewCustomer({ ...newCustomer, planName: e.target.value })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-mrr" className="block text-[11px] font-semibold text-slate-655 mb-1">MRR ($ USD)</label>
              <input
                id="new-mrr"
                type="number"
                required
                min="1"
                placeholder="500"
                value={newCustomer.mrr || ''}
                onChange={e => setNewCustomer({ ...newCustomer, mrr: Number(e.target.value) })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-churn-type" className="block text-[11px] font-semibold text-slate-655 mb-1">Churn Classification</label>
              <select
                id="new-churn-type"
                value={newCustomer.churnType}
                onChange={e => setNewCustomer({ ...newCustomer, churnType: e.target.value as ChurnType })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="INVOLUNTARY" className="bg-white">Involuntary (Billing/Card Halt)</option>
                <option value="VOLUNTARY" className="bg-white">Voluntary (User Requested Cancel)</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-primary-reason" className="block text-[11px] font-semibold text-slate-655 mb-1">Primary Reason</label>
              <select
                id="new-primary-reason"
                value={newCustomer.primaryReason}
                onChange={e => setNewCustomer({ ...newCustomer, primaryReason: e.target.value as ChurnReason })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CHURN_REASONS.map(r => (
                  <option key={r.value} value={r.value} className="bg-white">{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-tenure-months" className="block text-[11px] font-semibold text-slate-655 mb-1">Tenure (Months)</label>
              <input
                id="new-tenure-months"
                type="number"
                min="1"
                value={newCustomer.tenureMonths || 1}
                onChange={e => setNewCustomer({ ...newCustomer, tenureMonths: Number(e.target.value) })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="new-detailed-feedback" className="block text-[11px] font-semibold text-slate-655 mb-1">Detailed Feedback / Dunning Log</label>
              <input
                id="new-detailed-feedback"
                type="text"
                placeholder="e.g. Card expired; tried 2 retries; customer wanted invoice..."
                value={newCustomer.detailedFeedback || ''}
                onChange={e => setNewCustomer({ ...newCustomer, detailedFeedback: e.target.value })}
                className="w-full text-xs bg-white text-slate-800 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsManualAdding(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-semibold bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Records Table */}
      <div className="overflow-x-auto flex-1 overflow-y-auto custom-tbody-scrollbar min-h-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-4">Account / Customer</th>
              <th className="py-2.5 px-3">Plan</th>
              <th className="py-2.5 px-3">MRR</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Primary Factor</th>
              <th className="py-2.5 px-4">Feedback / Diagnostic Log</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-550">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <span>No churn records matching this filter.</span>
                </td>
              </tr>
            ) : (
              filteredEvents.map(item => (
                <tr key={item.customerId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    <div>{item.customerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.customerId} • {item.tenureMonths}m tenure</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    {item.planName}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    ${item.mrr.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.churnType === 'INVOLUNTARY'
                        ? 'bg-amber-50 text-amber-800 border border-amber-100'
                        : 'bg-slate-100 text-slate-750 border border-slate-200'
                    }`}>
                      {item.churnType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-medium">{item.primaryReason.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={item.detailedFeedback}>
                    {item.detailedFeedback}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRemoveEvent(item.customerId)}
                      className="p-1 text-slate-450 hover:text-rose-650 rounded transition-colors cursor-pointer"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-650 shrink-0">
        <div>
          Showing <span className="font-semibold text-slate-900">{filteredEvents.length}</span> of <span className="font-semibold text-slate-900">{events.length}</span> total churn records
        </div>
        <div className="font-bold text-slate-900 font-display">
          Total Ingested Churn: <span className="text-indigo-650">${totalMrr.toLocaleString()}</span> MRR
        </div>
      </div>
    </div>
  );
};
