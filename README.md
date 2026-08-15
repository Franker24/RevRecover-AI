# RevRecover AI — B2B SaaS Churn & Revenue Leakage Audit Engine

Built for **HackOnVibe August 2026**  
**Track:** Business Success ($150 Prize Pool) — *Best Working Functionality & Functional Backend*

---

## 1. Product Overview

**RevRecover AI** is an AI-powered revenue leakage audit and churn triage engine designed specifically for B2B SaaS founders, finance leads, and growth teams.

Instead of generic chat conversations or mock dashboards, RevRecover AI ingests real or benchmarked subscription cancellation events, failed payment logs, and customer feedback. It calculates exact financial risk metrics, executes root-cause forensic diagnosis, scores recovery probabilities, and generates deployable dunning playbooks and webhook automation snippets.

---

## 2. The Problem & Business Opportunity

* **The Silent Leak:** 20% to 40% of all SaaS revenue churn is involuntary (failed card charges, unconfigured 3DS retries, expired corporate cards, AP invoicing disconnects).
* **Early Onboarding Churn:** High-value customers frequently cancel within 90 days due to setup friction without triggering early intervention.
* **The Opportunity:** Recovering just 15–30% of leaked Monthly Recurring Revenue (MRR) translates directly to thousands of dollars in bottom-line Annual Recurring Revenue (ARR) saved with zero customer acquisition cost (CAC).

---

## 3. Architecture & Tech Stack

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS ]
                       ↓  (JSON REST API)
[ Backend: Node.js + Express + TypeScript (server.ts) ]
                       ↓
  ┌────────────────────┴────────────────────┐
  ↓                                         ↓
[ Deterministic Financial Engine ]     [ Google Gemini 2.5 / 3.7 Flash ]
- MRR at risk calculus                 - Root-cause forensic triage
- Involuntary vs Voluntary split       - Bespoke retention playbooks
- Baseline recovery scoring            - Dynamic Stripe/Zapier automation
```

* **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Motion.
* **Backend:** Node.js, Express, TypeScript (`server.ts`).
* **AI Layer:** Google Gemini API (`@google/genai` TypeScript SDK) utilizing structured JSON schema output and server-side secret isolation.
* **Deployment Workflow:** 
  * Frontend: Automated Cloudflare Pages build via GitHub Actions (`.github/workflows/deploy.yml`).
  * Backend: Express service ready for Node / Cloud Run / Railway / Fly.io.

---

## 4. API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Service status, engine version, and Gemini API key configuration check. |
| `/api/presets` | `GET` | Benchmark SaaS scenarios (DevFlow API Cloud, OpsPulse B2B, DocuMind AI). |
| `/api/analyze` | `POST` | Ingests churn records, performs mathematical calculations, and runs Gemini AI forensic audit. |
| `/api/generate-action` | `POST` | Synthesizes custom email copy, Slack alerts, and webhook triggers for any finding. |
| `/api/history` | `GET` | Returns audit runs and metrics evaluated in the current session. |

---

## 5. Security & Key Management

* **No Client-Side Secrets:** `GEMINI_API_KEY` is loaded strictly on the server (`server.ts`) via environment variables and never bundled into frontend assets.
* **Safe Fallback:** The engine features deterministic algorithmic analysis to guarantee 100% uptime even if the API key is not configured.

---

## 6. Business Model & Monetization

1. **Self-Serve Audit Tier ($49/month):** Automated monthly dunning audits, Stripe integration, and up to $25k evaluated MRR.
2. **Growth Tier ($199/month):** Real-time webhook churn interception, automated founder outreach dispatch, Slack alerting, and up to $100k evaluated MRR.
3. **Enterprise / Revenue Share (15% of Salvaged MRR):** Dedicated CS engineering, custom CRM synchronizations (Salesforce, HubSpot), and custom billing gateway connectors.

---

## 7. How to Run Locally

```bash
# 1. Clone repository
git clone <repo-url>
cd <repo-folder>

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 4. Start local development server
npm run dev
# App will run at http://localhost:3000
```

---

## 8. 2-3 Minute Hackathon Demo Story

1. **Select Benchmark Scenario:** Choose *DevFlow API & Cloud Platform* ($12,450 MRR at risk).
2. **Review Ingested Records:** Inspect the 8 cancellation logs showing a mix of involuntary card halts, compute overage friction, and onboarding stalls.
3. **Execute Forensic Audit:** Click **"Run Forensic Audit"** — the server processes data through Gemini and displays:
   * Executive summary identifying that 60% of leakage is recoverable involuntary churn.
   * Root-cause diagnostic cards with severity ratings and calculated win rates.
4. **Deploy Retention Playbooks:** Review pre-drafted dunning copy with 1-click script copy.
5. **Generate Bespoke Outreach:** Open the **Action Generator** modal to synthesize a tailored founder email and Slack alert.
6. **Deploy Webhook:** Copy the Stripe `invoice.payment_failed` JSON payload to enable automated intervention.
7. **Export Report:** Download the audit as a Markdown or JSON executive report.
