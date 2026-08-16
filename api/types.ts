export type ChurnReason = 
  | 'BILLING_FAILURE' 
  | 'PRICE_VALUE' 
  | 'MISSING_FEATURE' 
  | 'POOR_ONBOARDING' 
  | 'COMPETITOR_SWITCH' 
  | 'BUDGET_CUT' 
  | 'TECHNICAL_ISSUE'
  | 'OTHER';

export type ChurnType = 'INVOLUNTARY' | 'VOLUNTARY';

export interface ChurnEventInput {
  customerId: string;
  customerName: string;
  planName: string;
  mrr: number; // in USD
  churnType: ChurnType;
  primaryReason: ChurnReason;
  detailedFeedback: string;
  lastPaymentStatus?: 'FAILED_INSUFFICIENT_FUNDS' | 'FAILED_CARD_EXPIRED' | 'SUCCESSFUL_UNTIL_CANCEL' | 'FAILED_AUTHENTICATION';
  tenureMonths: number;
  usageDropPercentage?: number; // e.g. 75 means dropped by 75% prior to cancel
}

export interface AuditRequestPayload {
  companyName: string;
  currency: string;
  industry: string;
  events: ChurnEventInput[];
}

export interface LeakageMetrics {
  totalMrrAtRisk: number;
  totalAnnualLeakage: number;
  totalCustomers: number;
  involuntaryChurnMrr: number;
  involuntaryPercentage: number;
  voluntaryChurnMrr: number;
  voluntaryPercentage: number;
  projectedRecoverableMrr: number;
  projectedAnnualRecovery: number;
  recoveryConfidenceScore: number; // 0 - 100
}

export interface DiagnosticFinding {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  headline: string;
  affectedMrr: number;
  affectedCustomersCount: number;
  rootCauseAnalysis: string;
  immediateRemedy: string;
  systemicPrevention: string;
  estimatedRecoveryRate: number; // percentage e.g. 65%
}

export interface RecoveryPlaybookItem {
  id: string;
  cohort: string;
  targetCount: number;
  targetMrr: number;
  strategyType: 'AUTOMATED_DUNNING' | 'WIN_BACK_CAMPAIGN' | 'EXECUTIVE_OUTREACH' | 'PRODUCT_SAVE_FLOW';
  channel: 'EMAIL' | 'IN_APP_POPUP' | 'STRIPE_WEBHOOK' | 'FOUNDER_DIRECT';
  subjectOrHeader: string;
  copyOrScript: string;
  incentiveOffer: string;
  estimatedWinRate: number;
  implementationSteps: string[];
}

export interface AutomationWebhookSnippet {
  integrationTarget: 'Stripe' | 'Zapier' | 'PostHog' | 'Customer.io' | 'Custom Webhook';
  eventTrigger: string;
  webhookEndpoint: string;
  payloadJson: Record<string, unknown>;
  instructions: string;
}

export interface AuditReportResult {
  id: string;
  timestamp: string;
  companyName: string;
  industry: string;
  currency: string;
  metrics: LeakageMetrics;
  executiveSummary: string;
  churnCompositionBreakdown: {
    category: string;
    mrr: number;
    percentage: number;
  }[];
  diagnostics: DiagnosticFinding[];
  playbooks: RecoveryPlaybookItem[];
  automation: AutomationWebhookSnippet[];
  modelDiagnostics: {
    modelUsed: string;
    processingTimeMs: number;
    tokensEvaluated?: number;
  };
}

export interface PresetDataset {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  defaultCompany: string;
  description: string;
  events: ChurnEventInput[];
}

export interface ActionGenerationRequest {
  auditId?: string;
  companyName: string;
  cohortName: string;
  targetTone: 'URGENT_PROFESSIONAL' | 'EMPATHETIC_FOUNDER' | 'VALUE_FOCUSED_INCENTIVE';
  specificFeedbackContext: string;
  mrrValue: number;
}

export interface GeneratedActionResponse {
  subjectLine: string;
  emailBody: string;
  slackAlertTemplate: string;
  recommendedDiscountOrExtension: string;
  webhookPayload: Record<string, unknown>;
}
