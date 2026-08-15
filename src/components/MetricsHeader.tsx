import React from 'react';
import { DollarSign, TrendingDown, ArrowUpRight, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { LeakageMetrics } from '../types.ts';

interface MetricsHeaderProps {
  metrics: LeakageMetrics;
  companyName: string;
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ metrics, companyName }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
      {/* Total MRR Leakage Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wider">Total MRR at Risk</span>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-650 border border-rose-100">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            ${metrics.totalMrrAtRisk.toLocaleString()}
            <span className="text-xs font-medium text-slate-500 ml-1">/mo</span>
          </div>
          <p className="text-xs text-rose-650 font-medium mt-1 flex items-center gap-1">
            <span>${metrics.totalAnnualLeakage.toLocaleString()} ARR annualized</span>
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Evaluated Accounts</span>
          <span className="font-semibold text-slate-800">{metrics.totalCustomers} subscriptions</span>
        </div>
      </div>

      {/* Involuntary Leakage Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wider">Involuntary Billing Churn</span>
          <div className="p-2 rounded-lg bg-amber-55 text-amber-650 bg-amber-50 border border-amber-100">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            ${metrics.involuntaryChurnMrr.toLocaleString()}
            <span className="text-xs font-medium text-slate-550 ml-1">/mo</span>
          </div>
          <p className="text-xs text-amber-650 font-medium mt-1">
            {metrics.involuntaryPercentage}% of total churned volume
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Root Mechanism</span>
          <span className="font-semibold text-amber-650">Card & 3DS Failures</span>
        </div>
      </div>

      {/* Projected Recoverable MRR Card */}
      <div className="bg-white border border-emerald-200 p-5 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.03)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 tracking-wider">Projected Recoverable MRR</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-650 border border-emerald-100">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight font-display">
            +${metrics.projectedRecoverableMrr.toLocaleString()}
            <span className="text-xs font-medium text-emerald-650 ml-1">/mo</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            +${metrics.projectedAnnualRecovery.toLocaleString()} ARR potential salvage
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-500">
          <span>Salvage Target</span>
          <span className="font-semibold text-emerald-600">
            {metrics.totalMrrAtRisk > 0 ? Math.round((metrics.projectedRecoverableMrr / metrics.totalMrrAtRisk) * 100) : 0}% of lost revenue
          </span>
        </div>
      </div>

      {/* Recovery Confidence Score Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wider">Recovery Confidence</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 border border-indigo-100">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-650 tracking-tight font-display">
              {metrics.recoveryConfidenceScore}%
            </span>
            <span className="text-xs font-semibold text-indigo-500">
              {metrics.recoveryConfidenceScore > 75 ? 'High Viability' : 'Moderate Viability'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200/60">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.recoveryConfidenceScore}%` }}
            />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Triage Model</span>
          <span className="font-semibold text-slate-800">Smart Dunning & Save Flow</span>
        </div>
      </div>
    </div>
  );
};
