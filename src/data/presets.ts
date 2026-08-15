import { PresetDataset } from '../types.ts';

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: 'devtools-api-leak',
    name: 'DevFlow API & Cloud Platform',
    tagline: 'High-frequency billing failures & involuntary developer card expirations',
    industry: 'Developer Tools & Cloud Infrastructure',
    defaultCompany: 'DevFlow Cloud Inc.',
    description: '14 accounts churned in the last 30 days. $12,450 MRR at risk, predominantly driven by unretried 3DS card failures and quiet seat abandonment.',
    events: [
      {
        customerId: 'cus_dev_881',
        customerName: 'NexGen AI Labs',
        planName: 'Scale Engine (Pro)',
        mrr: 2400,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Card charge failed 3 times: "insufficient_funds_or_limit". No secondary payment method configured in portal.',
        lastPaymentStatus: 'FAILED_INSUFFICIENT_FUNDS',
        tenureMonths: 14,
        usageDropPercentage: 0
      },
      {
        customerId: 'cus_dev_904',
        customerName: 'FintechStack Ltd',
        planName: 'Enterprise Dedicated',
        mrr: 3500,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Corporate Mastercard expired at end of month. Automated dunning email got caught in corporate spam filter.',
        lastPaymentStatus: 'FAILED_CARD_EXPIRED',
        tenureMonths: 22,
        usageDropPercentage: 5
      },
      {
        customerId: 'cus_dev_312',
        customerName: 'DataGrid Robotics',
        planName: 'Growth Tier',
        mrr: 1200,
        churnType: 'VOLUNTARY',
        primaryReason: 'PRICE_VALUE',
        detailedFeedback: 'Monthly compute overage fees spiked unpredictably after pipeline scaling. Looked for fixed predictability.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 8,
        usageDropPercentage: 45
      },
      {
        customerId: 'cus_dev_550',
        customerName: 'StreamWave Media',
        planName: 'Scale Engine (Pro)',
        mrr: 1800,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'SCA / 3DS authentication prompt not completed by the engineering lead who left the company.',
        lastPaymentStatus: 'FAILED_AUTHENTICATION',
        tenureMonths: 11,
        usageDropPercentage: 10
      },
      {
        customerId: 'cus_dev_108',
        customerName: 'OctaLogic Games',
        planName: 'Growth Tier',
        mrr: 950,
        churnType: 'VOLUNTARY',
        primaryReason: 'POOR_ONBOARDING',
        detailedFeedback: 'Never managed to configure OpenTelemetry pipeline properly; team shifted back to standard logging.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 3,
        usageDropPercentage: 80
      },
      {
        customerId: 'cus_dev_721',
        customerName: 'HyperScale Systems',
        planName: 'Growth Tier',
        mrr: 1400,
        churnType: 'VOLUNTARY',
        primaryReason: 'COMPETITOR_SWITCH',
        detailedFeedback: 'Switched to AWS native service for unified billing consolidation with their existing AWS EDP commit.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 18,
        usageDropPercentage: 90
      },
      {
        customerId: 'cus_dev_449',
        customerName: 'QuantMetrics AI',
        planName: 'Starter Cloud',
        mrr: 450,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Virtual card single-use limit hit. Automated retry stopped after 2 attempts.',
        lastPaymentStatus: 'FAILED_INSUFFICIENT_FUNDS',
        tenureMonths: 6,
        usageDropPercentage: 0
      },
      {
        customerId: 'cus_dev_663',
        customerName: 'PulseSync IO',
        planName: 'Growth Tier',
        mrr: 750,
        churnType: 'VOLUNTARY',
        primaryReason: 'BUDGET_CUT',
        detailedFeedback: 'Company-wide consolidation of developer tool licenses to cut quarterly OPEX.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 12,
        usageDropPercentage: 35
      }
    ]
  },
  {
    id: 'b2b-saas-onboarding-crisis',
    name: 'OpsPulse B2B Workflow SaaS',
    tagline: 'Early tenure onboarding friction & price-to-seat mismatch',
    industry: 'B2B Workflow & Operations SaaS',
    defaultCompany: 'OpsPulse Inc.',
    description: 'High 90-day cancellation rate ($8,900 MRR) with new accounts citing setup complexity, missing CRM sync, and lack of guided setup.',
    events: [
      {
        customerId: 'cus_ops_101',
        customerName: 'Apex Health Logistics',
        planName: 'Business Pro (15 seats)',
        mrr: 1850,
        churnType: 'VOLUNTARY',
        primaryReason: 'POOR_ONBOARDING',
        detailedFeedback: 'Implementation took over 6 weeks with no response on our custom Salesforce mapping ticket.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 2,
        usageDropPercentage: 85
      },
      {
        customerId: 'cus_ops_102',
        customerName: 'Beacon Commerce',
        planName: 'Business Standard',
        mrr: 950,
        churnType: 'VOLUNTARY',
        primaryReason: 'MISSING_FEATURE',
        detailedFeedback: 'Cannot export custom audit logs to Snowflake directly without paying for custom enterprise tier.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 4,
        usageDropPercentage: 60
      },
      {
        customerId: 'cus_ops_103',
        customerName: 'Clearpath Logistics',
        planName: 'Business Pro (25 seats)',
        mrr: 2900,
        churnType: 'VOLUNTARY',
        primaryReason: 'PRICE_VALUE',
        detailedFeedback: 'Seat pricing forced us to pay for 15 inactive viewers. Wanted consumption or active user billing.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 5,
        usageDropPercentage: 40
      },
      {
        customerId: 'cus_ops_104',
        customerName: 'NorthStar Capital',
        planName: 'Enterprise Core',
        mrr: 2100,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Card declined during auto-renew. Accounts payable required invoice billing instead of credit card.',
        lastPaymentStatus: 'FAILED_AUTHENTICATION',
        tenureMonths: 10,
        usageDropPercentage: 10
      },
      {
        customerId: 'cus_ops_105',
        customerName: 'Vanguard Freight',
        planName: 'Business Standard',
        mrr: 1100,
        churnType: 'VOLUNTARY',
        primaryReason: 'POOR_ONBOARDING',
        detailedFeedback: 'Our non-technical team found the rule builder too complex and reverted to manual spreadsheets.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 1,
        usageDropPercentage: 90
      }
    ]
  },
  {
    id: 'ai-copilot-retention',
    name: 'DocuMind AI Workspace',
    tagline: 'Post-hype churn & credit card fatigue in AI document automation',
    industry: 'Generative AI & Document Automation SaaS',
    defaultCompany: 'DocuMind AI',
    description: '$15,300 MRR leakage after token limits adjustments. 40% of churn is recoverable dunning and unoptimized credit limits.',
    events: [
      {
        customerId: 'cus_ai_901',
        customerName: 'Stratton Legal Partners',
        planName: 'AI Legal Pro (Unlimited)',
        mrr: 4200,
        churnType: 'VOLUNTARY',
        primaryReason: 'TECHNICAL_ISSUE',
        detailedFeedback: 'Latency on 100+ page PDF extraction was too slow during trial court preparation.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 7,
        usageDropPercentage: 70
      },
      {
        customerId: 'cus_ai_902',
        customerName: 'Horizon Insurance Claims',
        planName: 'AI Claims Enterprise',
        mrr: 5500,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Card billing limit exceeded when monthly token surge coincided with regular subscription renewal.',
        lastPaymentStatus: 'FAILED_INSUFFICIENT_FUNDS',
        tenureMonths: 9,
        usageDropPercentage: 0
      },
      {
        customerId: 'cus_ai_903',
        customerName: 'Summit Academic Press',
        planName: 'AI Team Hub',
        mrr: 1600,
        churnType: 'INVOLUNTARY',
        primaryReason: 'BILLING_FAILURE',
        detailedFeedback: 'Card expired in June. Received no SMS or Slack alert, account silently downgraded to Free tier.',
        lastPaymentStatus: 'FAILED_CARD_EXPIRED',
        tenureMonths: 15,
        usageDropPercentage: 15
      },
      {
        customerId: 'cus_ai_904',
        customerName: 'Veloce Marketing Labs',
        planName: 'AI Team Hub',
        mrr: 1800,
        churnType: 'VOLUNTARY',
        primaryReason: 'PRICE_VALUE',
        detailedFeedback: 'Hit monthly token caps too early; cost per additional document was non-viable compared to raw API.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 4,
        usageDropPercentage: 50
      },
      {
        customerId: 'cus_ai_905',
        customerName: 'Kestrel Talent Group',
        planName: 'AI Starter Pro',
        mrr: 2200,
        churnType: 'VOLUNTARY',
        primaryReason: 'COMPETITOR_SWITCH',
        detailedFeedback: 'Switched to Microsoft Copilot integration built directly inside Word & SharePoint.',
        lastPaymentStatus: 'SUCCESSFUL_UNTIL_CANCEL',
        tenureMonths: 11,
        usageDropPercentage: 85
      }
    ]
  }
];
