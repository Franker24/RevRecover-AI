import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MetricsHeader } from './components/MetricsHeader.tsx';
import { DatasetIngestionPanel } from './components/DatasetIngestionPanel.tsx';
import { DiagnosticsView } from './components/DiagnosticsView.tsx';
import { PlaybooksView } from './components/PlaybooksView.tsx';
import { AutomationView } from './components/AutomationView.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { ActionGeneratorModal } from './components/ActionGeneratorModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { PRESET_DATASETS } from './data/presets.ts';
import {
  AuditReportResult,
  AuditRequestPayload,
  ChurnEventInput,
  DiagnosticFinding,
  LeakageMetrics,
  PresetDataset
} from './types.ts';
import { Sparkles, Shield, Target, Cpu, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Scenario & Ingestion state
  const [presets, setPresets] = useState<PresetDataset[]>(PRESET_DATASETS);
  const [activePresetId, setActivePresetId] = useState<string | null>(PRESET_DATASETS[0].id);
  const [companyName, setCompanyName] = useState<string>(PRESET_DATASETS[0].defaultCompany);
  const [industry, setIndustry] = useState<string>(PRESET_DATASETS[0].industry);
  const [events, setEvents] = useState<ChurnEventInput[]>(PRESET_DATASETS[0].events);

  // Active Audit Result
  const [auditResult, setAuditResult] = useState<AuditReportResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DIAGNOSTICS' | 'PLAYBOOKS' | 'AUTOMATION'>('DIAGNOSTICS');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History & Modals state
  const [history, setHistory] = useState<AuditReportResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [actionModalFinding, setActionModalFinding] = useState<DiagnosticFinding | null>(null);

  // Server health state
  const [serverStatus, setServerStatus] = useState<'online' | 'checking' | 'error'>('checking');
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Fetch initial health and presets
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerStatus('online');
          setGeminiConfigured(Boolean(data.geminiConfigured));
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        setServerStatus('online'); // fallback to local mock/express
      }
    }

    async function loadPresets() {
      try {
        const res = await fetch('/api/presets');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setPresets(data.data);
          }
        }
      } catch (err) {
        // use default PRESET_DATASETS
      }
    }

    checkHealth();
    loadPresets();
  }, []);

  // Run initial audit automatically on mount for instant wow-moment
  useEffect(() => {
    handleRunAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (preset: PresetDataset) => {
    setActivePresetId(preset.id);
    setCompanyName(preset.defaultCompany);
    setIndustry(preset.industry);
    setEvents(preset.events);
  };

  const handleNewAudit = () => {
    setActivePresetId(null);
    setCompanyName('');
    setIndustry('B2B SaaS');
    setEvents([]);
    setAuditResult(null);
    setErrorMsg(null);
  };

  const handleRunAudit = async () => {
    if (!companyName.trim()) {
      setErrorMsg('Please specify a company or product name.');
      return;
    }
    if (events.length === 0) {
      setErrorMsg('Please add at least one subscription churn record.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const payload: AuditRequestPayload = {
        companyName,
        industry,
        currency: 'USD',
        events
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.data) {
        const newReport = data.data as AuditReportResult;
        setAuditResult(newReport);
        setHistory(prev => [newReport, ...prev.filter(h => h.id !== newReport.id)]);
      } else {
        setErrorMsg(data.error || 'Failed to complete audit.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server connection failed while executing audit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compute live preview metrics even before audit is run
  const liveTotalMrr = events.reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);
  const liveInvoluntaryMrr = events
    .filter(e => e.churnType === 'INVOLUNTARY' || e.primaryReason === 'BILLING_FAILURE')
    .reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);
  const liveVoluntaryMrr = liveTotalMrr - liveInvoluntaryMrr;

  const currentMetrics: LeakageMetrics = auditResult
    ? auditResult.metrics
    : {
        totalMrrAtRisk: liveTotalMrr,
        totalAnnualLeakage: liveTotalMrr * 12,
        totalCustomers: events.length,
        involuntaryChurnMrr: liveInvoluntaryMrr,
        involuntaryPercentage: liveTotalMrr > 0 ? Math.round((liveInvoluntaryMrr / liveTotalMrr) * 100) : 0,
        voluntaryChurnMrr: liveVoluntaryMrr,
        voluntaryPercentage: liveTotalMrr > 0 ? Math.round((liveVoluntaryMrr / liveTotalMrr) * 100) : 0,
        projectedRecoverableMrr: Math.round(liveInvoluntaryMrr * 0.72 + liveVoluntaryMrr * 0.28),
        projectedAnnualRecovery: Math.round((liveInvoluntaryMrr * 0.72 + liveVoluntaryMrr * 0.28) * 12),
        recoveryConfidenceScore: 78
      };

  return (
    <div className="h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        onSelectPreset={handleSelectPreset}
        presets={presets}
        isAnalyzing={isAnalyzing}
        onNewAudit={handleNewAudit}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExport={() => setIsExportOpen(true)}
        historyCount={history.length}
        hasAuditResult={Boolean(auditResult)}
        serverStatus={serverStatus}
        geminiConfigured={geminiConfigured}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 w-full max-w-none">
        {/* Left Column: Ingestion metadata & setup */}
        <div className="lg:w-[42%] flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {errorMsg && (
            <div className="m-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            <DatasetIngestionPanel
              companyName={companyName}
              setCompanyName={setCompanyName}
              industry={industry}
              setIndustry={setIndustry}
              events={events}
              setEvents={setEvents}
              onAnalyze={handleRunAudit}
              isAnalyzing={isAnalyzing}
              presets={presets}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>

          {/* Sub-footer inside Left Column */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
            <span>RevRecover AI • Churn Audit Engine</span>
            <span>HackOnVibe August 2026 • Business Success Track</span>
          </div>
        </div>

        {/* Right Column: Financial summary and AI findings tabs */}
        <div className="lg:w-[58%] flex flex-col h-full gap-5 overflow-hidden">
          {/* Financial Metrics Header */}
          <MetricsHeader metrics={currentMetrics} companyName={companyName || 'B2B SaaS Account'} />

          {/* Audit Results Section */}
          {auditResult ? (
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-h-0">
              {/* Tab Selector */}
              <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex space-x-4">
                  <button
                    id="tab-diagnostics"
                    onClick={() => setActiveTab('DIAGNOSTICS')}
                    className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'DIAGNOSTICS'
                        ? 'border-indigo-650 text-indigo-650'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Shield className={`w-4 h-4 transition-colors ${activeTab === 'DIAGNOSTICS' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>Forensic Triage & Findings ({auditResult.diagnostics.length})</span>
                  </button>

                  <button
                    id="tab-playbooks"
                    onClick={() => setActiveTab('PLAYBOOKS')}
                    className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'PLAYBOOKS'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Target className={`w-4 h-4 transition-colors ${activeTab === 'PLAYBOOKS' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Retention Playbooks ({auditResult.playbooks.length})</span>
                  </button>

                  <button
                    id="tab-automation"
                    onClick={() => setActiveTab('AUTOMATION')}
                    className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'AUTOMATION'
                        ? 'border-indigo-650 text-indigo-650'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 transition-colors ${activeTab === 'AUTOMATION' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>Automated Webhooks ({auditResult.automation.length})</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 pb-2.5 hidden md:block">
                  Evaluated by <strong className="text-indigo-600 font-semibold">{auditResult.modelDiagnostics.modelUsed}</strong> in {auditResult.modelDiagnostics.processingTimeMs}ms
                </div>
              </div>

              {/* Tab Views - Inner Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-white">
                {activeTab === 'DIAGNOSTICS' && (
                  <DiagnosticsView
                    diagnostics={auditResult.diagnostics}
                    executiveSummary={auditResult.executiveSummary}
                    onOpenActionModal={(finding) => setActionModalFinding(finding)}
                  />
                )}

                {activeTab === 'PLAYBOOKS' && (
                  <PlaybooksView playbooks={auditResult.playbooks} />
                )}

                {activeTab === 'AUTOMATION' && (
                  <AutomationView
                    automation={auditResult.automation}
                    companyName={auditResult.companyName}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs">
              <AlertCircle className="w-12 h-12 text-slate-350 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Awaiting Forensic Ingestion</h3>
              <p className="text-xs text-slate-550 max-w-sm mt-1">
                Enter company metadata, load a demo scenario or add churn events, then run the audit to generate forensic analytics.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudit={(audit) => {
          setAuditResult(audit);
          setCompanyName(audit.companyName);
          setIndustry(audit.industry);
        }}
        currentAuditId={auditResult?.id}
      />

      {/* Action Generator Modal */}
      <ActionGeneratorModal
        isOpen={Boolean(actionModalFinding)}
        onClose={() => setActionModalFinding(null)}
        finding={actionModalFinding}
        companyName={companyName}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        report={auditResult}
      />
    </div>
  );
}
