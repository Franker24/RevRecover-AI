import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { PRESET_DATASETS } from "./src/data/presets.ts";
import {
  AuditReportResult,
  AuditRequestPayload,
  ChurnEventInput,
  LeakageMetrics,
  DiagnosticFinding,
  RecoveryPlaybookItem,
  AutomationWebhookSnippet,
  ActionGenerationRequest,
  GeneratedActionResponse
} from "./src/types.ts";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory audit history store
const auditHistory: AuditReportResult[] = [];

// Helper to compute deterministic financial baseline metrics
function computeBaselineMetrics(events: ChurnEventInput[]): LeakageMetrics {
  const totalMrrAtRisk = events.reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);
  const totalCustomers = events.length;

  const involuntaryEvents = events.filter(e => e.churnType === 'INVOLUNTARY' || e.primaryReason === 'BILLING_FAILURE');
  const voluntaryEvents = events.filter(e => !involuntaryEvents.includes(e));

  const involuntaryChurnMrr = involuntaryEvents.reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);
  const voluntaryChurnMrr = voluntaryEvents.reduce((sum, e) => sum + (Number(e.mrr) || 0), 0);

  const involuntaryPercentage = totalMrrAtRisk > 0 ? Math.round((involuntaryChurnMrr / totalMrrAtRisk) * 100) : 0;
  const voluntaryPercentage = totalMrrAtRisk > 0 ? Math.round((voluntaryChurnMrr / totalMrrAtRisk) * 100) : 0;

  // Involuntary churn has historically 65-80% recovery rate with smart dunning/3DS retry;
  // Early tenure/onboarding voluntary churn has 20-35% recovery rate with proactive save flow.
  const projectedRecoverableInvoluntary = involuntaryChurnMrr * 0.72;
  const projectedRecoverableVoluntary = voluntaryChurnMrr * 0.28;
  const projectedRecoverableMrr = Math.round(projectedRecoverableInvoluntary + projectedRecoverableVoluntary);
  const projectedAnnualRecovery = projectedRecoverableMrr * 12;

  const recoveryConfidenceScore = totalMrrAtRisk > 0
    ? Math.min(96, Math.max(50, Math.round((projectedRecoverableMrr / totalMrrAtRisk) * 100 + (involuntaryPercentage * 0.2))))
    : 0;

  return {
    totalMrrAtRisk,
    totalAnnualLeakage: totalMrrAtRisk * 12,
    totalCustomers,
    involuntaryChurnMrr,
    involuntaryPercentage,
    voluntaryChurnMrr,
    voluntaryPercentage,
    projectedRecoverableMrr,
    projectedAnnualRecovery,
    recoveryConfidenceScore
  };
}

// Group composition by reason
function computeCompositionBreakdown(events: ChurnEventInput[], totalMrr: number) {
  const reasonMap: Record<string, number> = {};
  for (const ev of events) {
    const reason = ev.primaryReason || 'OTHER';
    reasonMap[reason] = (reasonMap[reason] || 0) + (Number(ev.mrr) || 0);
  }

  return Object.entries(reasonMap).map(([category, mrr]) => ({
    category,
    mrr,
    percentage: totalMrr > 0 ? Math.round((mrr / totalMrr) * 100) : 0
  })).sort((a, b) => b.mrr - a.mrr);
}

// Fallback high-fidelity diagnostics if AI fails or key is missing
function generateFallbackDiagnostics(
  companyName: string,
  events: ChurnEventInput[],
  metrics: LeakageMetrics
): {
  executiveSummary: string;
  diagnostics: DiagnosticFinding[];
  playbooks: RecoveryPlaybookItem[];
  automation: AutomationWebhookSnippet[];
} {
  const involuntaryCount = events.filter(e => e.churnType === 'INVOLUNTARY').length;
  const onboardingCount = events.filter(e => e.primaryReason === 'POOR_ONBOARDING').length;
  const priceCount = events.filter(e => e.primaryReason === 'PRICE_VALUE').length;

  const diagnostics: DiagnosticFinding[] = [
    {
      id: 'diag-1',
      category: 'Involuntary Payment Failures',
      severity: metrics.involuntaryPercentage > 30 ? 'CRITICAL' : 'HIGH',
      headline: `Unrecovered Card Declines & Expired 3DS Tokens (${metrics.involuntaryPercentage}% of Leakage)`,
      affectedMrr: metrics.involuntaryChurnMrr,
      affectedCustomersCount: involuntaryCount || 1,
      rootCauseAnalysis: 'Multiple enterprise accounts encountered silent billing halts due to rigid single-attempt card retries, expired corporate virtual cards, and missing secondary billing contact routing.',
      immediateRemedy: 'Deploy dynamic smart retry intervals (Smart Dunning at +24h, +72h, +120h) and automated in-app payment update banners before locking account access.',
      systemicPrevention: 'Integrate pre-expiration card updater webhooks and multi-contact billing notices to Accounts Payable.',
      estimatedRecoveryRate: 74
    },
    {
      id: 'diag-2',
      category: 'Onboarding & Time-to-Value Friction',
      severity: onboardingCount > 0 ? 'HIGH' : 'MEDIUM',
      headline: 'Early-Tenure Drop-Off (<90 Days) in Core Configuration',
      affectedMrr: Math.round(metrics.voluntaryChurnMrr * 0.45),
      affectedCustomersCount: onboardingCount || 1,
      rootCauseAnalysis: 'Customers reported stalling during complex workspace or telemetry setup, experiencing severe usage drops prior to cancellation without proactive intervention.',
      immediateRemedy: 'Trigger automated concierge onboarding intervention when account usage velocity drops by >50% during the first 30 days.',
      systemicPrevention: 'Introduce self-guided sandbox verification and interactive checklist completion incentives.',
      estimatedRecoveryRate: 38
    },
    {
      id: 'diag-3',
      category: 'Pricing & Seat Utilization Mismatch',
      severity: priceCount > 0 ? 'HIGH' : 'LOW',
      headline: 'Shelfware Frustration & Overage Predictability Concerns',
      affectedMrr: Math.round(metrics.voluntaryChurnMrr * 0.35),
      affectedCustomersCount: priceCount || 1,
      rootCauseAnalysis: 'Customers felt penalized by tiered minimum seat commitments or unpredictable compute overages during scaling spikes.',
      immediateRemedy: 'Provide active-seat optimization downgrade paths instead of full account cancellations.',
      systemicPrevention: 'Introduce usage caps and flexible quarterly reconciliation commitments for growing teams.',
      estimatedRecoveryRate: 42
    }
  ];

  const playbooks: RecoveryPlaybookItem[] = [
    {
      id: 'play-1',
      cohort: 'Involuntary Billing Delinquents',
      targetCount: involuntaryCount || 1,
      targetMrr: metrics.involuntaryChurnMrr,
      strategyType: 'AUTOMATED_DUNNING',
      channel: 'EMAIL',
      subjectOrHeader: 'Important update regarding your {{company_name}} access',
      copyOrScript: 'Hi {{first_name}},\n\nWe noticed your recent payment for {{plan_name}} did not go through. Your workspace is currently in grace period so your team is not interrupted.\n\nYou can update your billing details with 1 click here: {{billing_portal_url}}\n\nNeed an invoice sent directly to Accounts Payable? Reply here and our billing team will issue it immediately.',
      incentiveOffer: '7-Day Grace Period Extension + Instant Card Update Portal',
      estimatedWinRate: 72,
      implementationSteps: [
        'Sync invoice.payment_failed webhook to trigger instant frictionless card update link',
        'Suppress disruptive account lockouts for 7 days while displaying sticky top-bar warning',
        'Send follow-up notification to secondary technical contact on day 4'
      ]
    },
    {
      id: 'play-2',
      cohort: 'Early Churn / Onboarding Stalled Accounts',
      targetCount: onboardingCount || 1,
      targetMrr: Math.round(metrics.voluntaryChurnMrr * 0.5),
      strategyType: 'EXECUTIVE_OUTREACH',
      channel: 'FOUNDER_DIRECT',
      subjectOrHeader: 'A quick note from the founder at {{company_name}}',
      copyOrScript: 'Hi {{first_name}},\n\nI saw that your team recently stepped away from {{company_name}}. I reviewed your workspace setup and realized our initial setup may have required more manual tuning than expected.\n\nI would love to have our lead solutions engineer jump on a 15-min pairing session to configure your environment at zero cost, plus extend your current billing cycle by 30 days.\n\nWould this Thursday work for a quick look?',
      incentiveOffer: 'Dedicated 1-on-1 Engineer Setup + 30-Day Free Evaluation Credit',
      estimatedWinRate: 35,
      implementationSteps: [
        'Identify accounts with <90 day tenure where cancellation feedback cited configuration',
        'Dispatch automated high-touch founder email from personal domain',
        'Route calendly link to Tier-2 Customer Success team'
      ]
    }
  ];

  const automation: AutomationWebhookSnippet[] = [
    {
      integrationTarget: 'Stripe',
      eventTrigger: 'customer.subscription.deleted / invoice.payment_failed',
      webhookEndpoint: 'https://api.yourdomain.com/webhooks/rev-recover',
      payloadJson: {
        event: 'invoice.payment_failed',
        data: {
          customer_id: 'cus_12345',
          amount_due_usd: metrics.involuntaryChurnMrr > 0 ? metrics.involuntaryChurnMrr : 1200,
          attempt_count: 2,
          next_retry_at: '2026-08-18T00:00:00Z',
          recovery_action: 'DISPATCH_SMART_DUNNING_SEQUENCE'
        }
      },
      instructions: 'Configure this webhook in your Stripe Dashboard under Developers > Webhooks to immediately intercept failed charges before accounts enter terminal churn.'
    },
    {
      integrationTarget: 'Zapier',
      eventTrigger: 'Slack Alert on High-Value Churn Risk',
      webhookEndpoint: 'https://hooks.zapier.com/hooks/catch/rev-recover-alert',
      payloadJson: {
        alert_type: 'HIGH_MRR_VOLUNTARY_CANCEL',
        company: companyName,
        mrr_at_risk: metrics.totalMrrAtRisk,
        recoverable_projected: metrics.projectedRecoverableMrr,
        recommended_action: 'FOUNDER_DIRECT_INTERVENTION'
      },
      instructions: 'Route this payload to your #revenue-alerts channel in Slack to trigger instantaneous executive outreach.'
    }
  ];

  return {
    executiveSummary: `${companyName} is leaking an estimated $${metrics.totalMrrAtRisk.toLocaleString()} in Monthly Recurring Revenue ($${metrics.totalAnnualLeakage.toLocaleString()} ARR). Forensic analysis reveals that ${metrics.involuntaryPercentage}% of this leakage is involuntary payment failure and can be recovered rapidly through optimized dunning protocols and proactive credit updates. An estimated $${metrics.projectedRecoverableMrr.toLocaleString()}/mo is immediately salvageable.`,
    diagnostics,
    playbooks,
    automation
  };
}

// Multi-model resilience helper for Gemini API handling transient 503/429/high demand spikes
const CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash"];

async function executeGeminiWithFailover(
  ai: GoogleGenAI,
  prompt: string,
  schema: any
): Promise<{ text: string; modelName: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        if (response.text) {
          return { text: response.text, modelName: `Google ${model}` };
        }
      } catch (err: any) {
        const errorMsg = String(err?.message || "");
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errorMsg.includes("503") ||
          errorMsg.includes("UNAVAILABLE") ||
          errorMsg.includes("high demand") ||
          errorMsg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          // Short backoff before retrying this model
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        // Break to try next candidate model
        break;
      }
    }
  }
  return null;
}

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    service: "RevRecover AI Engine",
    version: "1.0.0",
    geminiConfigured: hasGeminiKey,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/presets", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: PRESET_DATASETS
  });
});

app.get("/api/history", (req: Request, res: Response) => {
  res.json({
    success: true,
    count: auditHistory.length,
    data: auditHistory
  });
});

app.post("/api/analyze", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const payload = req.body as AuditRequestPayload;

    if (!payload || !payload.companyName || !Array.isArray(payload.events) || payload.events.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request payload. Please provide companyName and an array of churn events."
      });
    }

    const { companyName, industry = "B2B SaaS", currency = "USD", events } = payload;
    const metrics = computeBaselineMetrics(events);
    const compositionBreakdown = computeCompositionBreakdown(events, metrics.totalMrrAtRisk);

    let executiveSummary = "";
    let diagnostics: DiagnosticFinding[] = [];
    let playbooks: RecoveryPlaybookItem[] = [];
    let automation: AutomationWebhookSnippet[] = [];
    let modelUsed = "Algorithmic & Statistical Engine";

    const apiKey = process.env.GEMINI_API_KEY;
    const canUseGemini = Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.length > 5);

    if (canUseGemini) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `You are the RevRecover AI forensic revenue engineer and B2B SaaS retention expert.
Analyze the following real B2B subscription cancellation records, financial metrics, and customer feedback.
Perform rigorous root cause analysis, prioritize high-leverage revenue recovery opportunities, and generate tailored, actionable retention playbooks and automation configurations.

Input Details:
- Company Name: ${companyName}
- Industry: ${industry}
- Total MRR at Risk: $${metrics.totalMrrAtRisk}
- Involuntary Churn MRR: $${metrics.involuntaryChurnMrr} (${metrics.involuntaryPercentage}%)
- Voluntary Churn MRR: $${metrics.voluntaryChurnMrr} (${metrics.voluntaryPercentage}%)
- Churn Records: ${JSON.stringify(events, null, 2)}

Requirements:
1. Executive Summary: 2-3 crisp sentences highlighting key leakage vectors and salvageable MRR.
2. Diagnostics: 2-4 comprehensive findings categorized by severity (CRITICAL, HIGH, MEDIUM, LOW) with root causes, affected MRR, immediate remedies, and systemic preventions.
3. Playbooks: 2-3 specific win-back/dunning playbooks with subject lines, empathetic yet high-converting copy, incentive offers, and estimated win rates.
4. Automation: 2 webhook payload configurations (e.g. Stripe, Zapier, Customer.io) to automate revenue salvage workflows.`;

        const analysisSchema = {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            diagnostics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                  headline: { type: Type.STRING },
                  affectedMrr: { type: Type.NUMBER },
                  affectedCustomersCount: { type: Type.NUMBER },
                  rootCauseAnalysis: { type: Type.STRING },
                  immediateRemedy: { type: Type.STRING },
                  systemicPrevention: { type: Type.STRING },
                  estimatedRecoveryRate: { type: Type.NUMBER }
                },
                required: ["id", "category", "severity", "headline", "affectedMrr", "rootCauseAnalysis", "immediateRemedy", "systemicPrevention", "estimatedRecoveryRate"]
              }
            },
            playbooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  cohort: { type: Type.STRING },
                  targetCount: { type: Type.NUMBER },
                  targetMrr: { type: Type.NUMBER },
                  strategyType: { type: Type.STRING, enum: ["AUTOMATED_DUNNING", "WIN_BACK_CAMPAIGN", "EXECUTIVE_OUTREACH", "PRODUCT_SAVE_FLOW"] },
                  channel: { type: Type.STRING, enum: ["EMAIL", "IN_APP_POPUP", "STRIPE_WEBHOOK", "FOUNDER_DIRECT"] },
                  subjectOrHeader: { type: Type.STRING },
                  copyOrScript: { type: Type.STRING },
                  incentiveOffer: { type: Type.STRING },
                  estimatedWinRate: { type: Type.NUMBER },
                  implementationSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "cohort", "strategyType", "channel", "subjectOrHeader", "copyOrScript", "incentiveOffer", "estimatedWinRate", "implementationSteps"]
              }
            },
            automation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  integrationTarget: { type: Type.STRING, enum: ["Stripe", "Zapier", "PostHog", "Customer.io", "Custom Webhook"] },
                  eventTrigger: { type: Type.STRING },
                  webhookEndpoint: { type: Type.STRING },
                  payloadJson: { type: Type.OBJECT },
                  instructions: { type: Type.STRING }
                },
                required: ["integrationTarget", "eventTrigger", "webhookEndpoint", "payloadJson", "instructions"]
              }
            }
          },
          required: ["executiveSummary", "diagnostics", "playbooks", "automation"]
        };

        const aiResult = await executeGeminiWithFailover(ai, systemPrompt, analysisSchema);

        if (aiResult && aiResult.text) {
          const parsed = JSON.parse(aiResult.text);
          executiveSummary = parsed.executiveSummary || "";
          diagnostics = (parsed.diagnostics || []).map((d: DiagnosticFinding, idx: number) => ({
            ...d,
            id: d.id || `diag-${idx + 1}`
          }));
          playbooks = (parsed.playbooks || []).map((p: RecoveryPlaybookItem, idx: number) => ({
            ...p,
            id: p.id || `play-${idx + 1}`
          }));
          automation = parsed.automation || [];
          modelUsed = aiResult.modelName;
        }
      } catch (geminiError) {
        console.warn("Gemini failover completed with algorithmic fallback mode:", geminiError);
      }
    }

    // Fallback if AI response was empty or failed
    if (!executiveSummary || diagnostics.length === 0) {
      const fallback = generateFallbackDiagnostics(companyName, events, metrics);
      executiveSummary = fallback.executiveSummary;
      diagnostics = fallback.diagnostics;
      playbooks = fallback.playbooks;
      automation = fallback.automation;
    }

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const result: AuditReportResult = {
      id: auditId,
      timestamp: new Date().toISOString(),
      companyName,
      industry,
      currency,
      metrics,
      executiveSummary,
      churnCompositionBreakdown: compositionBreakdown,
      diagnostics,
      playbooks,
      automation,
      modelDiagnostics: {
        modelUsed,
        processingTimeMs: Date.now() - startTime
      }
    };

    // Store in session history (latest first, max 20)
    auditHistory.unshift(result);
    if (auditHistory.length > 20) auditHistory.pop();

    res.json({
      success: true,
      data: result,
      error: null
    });
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during audit execution."
    });
  }
});

app.post("/api/generate-action", async (req: Request, res: Response) => {
  try {
    const payload = req.body as ActionGenerationRequest;
    const { companyName, cohortName, targetTone, specificFeedbackContext, mrrValue } = payload;

    const apiKey = process.env.GEMINI_API_KEY;
    const canUseGemini = Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.length > 5);

    let actionResult: GeneratedActionResponse;

    if (canUseGemini) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate a high-converting retention outreach package for a B2B SaaS customer:
- Company: ${companyName}
- Cohort: ${cohortName}
- Tone: ${targetTone}
- Customer Feedback / Scenario: ${specificFeedbackContext}
- MRR at Stake: $${mrrValue}

Return JSON with:
1. subjectLine: Email subject line.
2. emailBody: Full personalized email copy with placeholders like {{first_name}} and {{account_name}}.
3. slackAlertTemplate: Internal Slack alert formatted with Markdown for the sales/CS team.
4. recommendedDiscountOrExtension: Clear tactical commercial offer.
5. webhookPayload: JSON object to trigger this action via Stripe/Zapier.`;

        const actionSchema = {
          type: Type.OBJECT,
          properties: {
            subjectLine: { type: Type.STRING },
            emailBody: { type: Type.STRING },
            slackAlertTemplate: { type: Type.STRING },
            recommendedDiscountOrExtension: { type: Type.STRING },
            webhookPayload: { type: Type.OBJECT }
          },
          required: ["subjectLine", "emailBody", "slackAlertTemplate", "recommendedDiscountOrExtension", "webhookPayload"]
        };

        const aiResult = await executeGeminiWithFailover(ai, prompt, actionSchema);

        if (aiResult && aiResult.text) {
          actionResult = JSON.parse(aiResult.text);
          return res.json({ success: true, data: actionResult });
        }
      } catch (err) {
        console.warn("Gemini action generator fallback applied:", err);
      }
    }

    // High quality fallback action
    actionResult = {
      subjectLine: `Quick question regarding your ${companyName} workspace`,
      emailBody: `Hi {{first_name}},\n\nI noticed that your team recently stepped back from ${companyName}. Given the critical nature of your workflow, I wanted to personally ensure nothing blocked your progress.\n\nContext noted: "${specificFeedbackContext}"\n\nI would like to offer a 50% discount on your next 3 billing cycles and schedule 15 minutes with our engineering team to ensure this is completely resolved for you.\n\nWould you be open to a quick chat this week?\n\nBest regards,\nFounder & CEO, ${companyName}`,
      slackAlertTemplate: `🚨 *High MRR Churn Save Triggered*\n• *Account*: {{first_name}} (MRR: $${mrrValue})\n• *Issue*: ${specificFeedbackContext}\n• *Action*: Founder direct outreach dispatched with 50% retention credit.`,
      recommendedDiscountOrExtension: "50% off next 3 months or complimentary 1-on-1 technical onboarding",
      webhookPayload: {
        event: "retention.outreach_dispatched",
        cohort: cohortName,
        mrr: mrrValue,
        offer: "RECOVERY_50_PCT_3M",
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: actionResult
    });
  } catch (error: any) {
    console.error("Error in /api/generate-action:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate action"
    });
  }
});

// Vite Integration & Server Bootstrapping
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RevRecover AI] Server is running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
