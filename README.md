# AegisBrand AI — Pre-Publication Brand Governance Platform
### Intelligent Brand Compliance, Claim Verification & Explainable Intent Refactoring

**Competition:** CodeStar 30 (National-Level Hackathon) — Round 2: The Build  
**Challenge Track:** Problem Statement by Inkloom AI  
**Team Name:** PRINCE OF VALERIA  
**Team Members:** Prince Kumar (Team Leader & Lead Architect) & Yash Sharma (Frontend & Vision Engineer)  
**Submission Portal:** [CodeStar 30 Round 2 Form](https://forms.gle/gyRiHtQT3AnC3MdV6)

---

## 🌟 Executive Overview
High-growth organizations publish high-velocity content through distributed employees, external agencies, and generative AI tools, making it difficult to maintain a consistent and trustworthy brand identity. Outdated specs, hallucinated metrics, off-brand visuals, and aggressive tone damage corporate equity and trigger severe regulatory penalties (FTC/ASCI).

**AegisBrand AI** is a fully functional, pre-publication brand governance platform that intercepts content before publication. It continuously validates copy, visual metadata, and campaign assets against an organization's approved Single Source of Truth:
- **Brand Bible** (Tone, Voice Pillars, Prohibited Terms)
- **Verified Claims Database** (Audited SLAs, Customer Metrics, Legal Certifications)
- **Visual Identity Tokens** (Palette Hexes, Contrast Ratios, Logo Geometry)

Instead of simply rejecting content, AegisBrand **explains each issue**, cites the exact guideline, and **generates intent-preserving corrections** with one-click adoption, backed by a collaborative review workflow and self-healing ambiguity diagnostics.

---

## 🚀 Quick Start Guide (Run Locally in 10 Seconds)

### Prerequisites
- Python 3.9+ installed.

### 1. Installation
```bash
cd aegisbrand_ai
pip install -r requirements.txt
```

### 2. Start Application
```bash
python app.py
```
*(Or double-click `run.bat` on Windows)*

### 3. Open in Browser
Visit **`http://localhost:8000`** in any web browser.

---

## 🎮 Judge Evaluation Walkthrough (Zero Walkthrough Required)

The platform is designed so judges can test every feature instantly without any setup:

### Step 1: Pre-Publish Review Studio (The Core Product Journey)
1. In the top bar, use the **Quick Load Sample** dropdown:
   - Select **"Sample 1: Flagship Launch Copy (High Brand & Claim Violations)"**.
   - Notice the editor automatically populates with realistic, non-compliant ad copy containing hallucinated 100% uptime, unverified 10x ROI guarantees, combative tone ("crushes competitors"), trademark casing errors ("inkloomAI"), and an off-palette banner graphic.
2. Click **"Run Brand Guardrail Audit"**:
   - Within milliseconds, the engine calculates a **0/100 Compliance Score** and marks the draft **Blocked — Critical Issues Detected**.
   - Review the **15 Detailed Findings Cards** categorized by category: *Terminology*, *Fact Verification*, *Tone & Voice*, *Visual Identity*, and *Accessibility (WCAG)*.
   - Each card provides:
     - The **Flagged Text**
     - The **Source Rule Citation** (e.g. *Ground Truth ID: CLM-001* or *Tone Guide Sec 2.1*)
     - The **Risk Explanation** (Why this creates liability)
     - The **Intent-Preserving Suggestion** (e.g. replacing "100% infallible uptime" with "delivers 99.9% verified uptime backed by enterprise SLA")
3. Click **"Adopt Suggestion"** on any card:
   - Watch the editor immediately update the exact span non-destructively while preserving surrounding sentence structure.
   - Notice the compliance score dynamically updates!
4. Click **"Submit to Queue"** to push the draft into the Collaborative Review Workflow.

### Step 2: Collaborative Review & Approval Workflow
1. Click the **"Review & Approval Queue"** tab.
2. Switch your role using the top right toggle to **"Role: Brand Manager"** or **"Role: Legal / Compliance"**.
3. View the audit trail timeline and reviewer discussion thread.
4. Click **"Sign-Off & Approve"**:
   - Provide an approval justification.
   - The platform stamps the approved content with an **immutable cryptographic SHA-256 fingerprint** for regulatory non-repudiation and marks it *Published Ready*.

### Step 3: Brand Knowledge Hub (Single Source of Truth)
1. Click the **"Brand Knowledge Hub"** tab.
2. Inspect the **Restricted Terminology & Negative Lexicon** table.
3. Use the inline form to dynamically add new prohibited terms or view the **Audited Factual Claims Database**.

### Step 4: Governance Insights & Self-Healing Ambiguity Diagnostic
1. Click the **"Governance Insights & Ambiguity"** tab.
2. View enterprise telemetry:
   - Total Assets Audited & Interceptions
   - Violation Categories Breakdown (Claims vs Terminology vs Tone vs Visuals)
   - Top Recurring Mistakes Leaderboard
   - **Self-Healing Guideline Ambiguity Diagnostic**: Displays rules causing frequent manager overrides/disputes and provides AI-recommended amendments to clarify the Brand Bible.

---

## 🏗️ Technical Architecture & Key Technical Decisions

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   Tailwind CSS + HTML5 + Lucide / FontAwesome Icons + Vanilla JS SPA   │
│   - Multi-Tab Reactive Workspace (Studio, Workflow, Knowledge, Stats)  │
│   - Character-level Inline Diff Replacement                            │
│   - Real-time Multi-Role State Machine Toggle                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                    FASTAPI BACKEND ORCHESTRATOR                        │
│   Python 3.11 + Pydantic v2 + Asynchronous Endpoint Routing            │
│   - /api/audit (Multi-Dimensional Pre-Publish Inspection)              │
│   - /api/submissions (Role Workflow & SHA-256 Ledger)                  │
│   - /api/guidelines (Living Brand Bible & Claims Knowledge Base)       │
│   - /api/analytics (Recurring Error Clustering & Ambiguity Engine)     │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼──────────────┐   ┌─────────────▼──────────────────┐
│   DETERMINISTIC RULE ENGINE      │   │   COGNITIVE MULTIMODAL AGENTS  │
│   - Regex / Trie Lexicon Matcher │   │   - Tone & Aggression Scorer   │
│   - CIELAB / Euclidean Color Dist│   │   - Ground Truth Claim Matcher │
│   - WCAG 2.2 Contrast Calculator │   │   - Minimal-Span Diff Rewriter │
│   - Logo Aspect Ratio Tolerance  │   │   - Guideline Ambiguity Clust. │
└──────────────────────────────────┘   └────────────────────────────────┘
```

### Why This Architecture?
1. **Sub-50ms Deterministic Filtering**: Avoids costly and hallucinatory LLM round-trips for trademark casing, disallowed words, and mathematical WCAG contrast formulas.
2. **Zero-Data Retention (ZDR)**: Operates completely on enterprise boundaries; confidential pre-release press releases and patent drafts are never leaked to public model training pools.
3. **Intent-Preserving Semantic Diffing**: Solves the #1 creator complaint about AI reviewers ("It rewrote my entire article!") by refactoring only the minimal violating span.

---

## 🔄 Explanation of Changes Made from the Original Plan (Round 1)

During development in Round 2, we made two key architectural enhancements to maximize real-world usability:
1. **Integrated Lightweight Single-Process Runtime**:
   - *Original Plan*: Separated frontend (Next.js 14) and backend (FastAPI + Celery + Redis).
   - *Refined Implementation*: To ensure **judges can evaluate the working product instantly with a single command (`python app.py`)** without setting up local Redis workers or Node packaging, we built a zero-latency responsive single-page architecture served directly through FastAPI.
2. **Instant One-Click Sample Presets**:
   - Added preloaded, highly realistic corporate campaign datasets (Sample 1: Violations, Sample 2: Minor Drift, Sample 3: Compliant) so judges don't have to fabricate test text to experience the full end-to-end journey.

---

## 🚀 Three Major Improvements Planned for Round 3 (The Finish)

As required by the Round 2 evaluation rubric (15 points), these are three substantial functional additions scheduled for delivery in Round 3:

1. **Improvement 1: Browser Extension & Google Docs / Figma Live In-Situ Guardrail**:
   - Build a Chrome / Workspace plugin that brings AegisBrand's explainable diff suggestions directly into Google Docs and Figma canvases, intercepting off-brand copy and stretched logos while the designer/copywriter is actively typing.
2. **Improvement 2: C2PA Cryptographic Content Provenance Watermarking**:
   - Embed Coalition for Content Provenance and Authenticity (C2PA) standard metadata into approved image assets and PDFs, providing verifiable cryptographic proof of human manager sign-off and AI assistance disclosure for FTC/ASCI compliance.
3. **Improvement 3: Autonomous Guideline Conflict Resolver with Vector-Graph Reconciliation**:
   - Expand the Self-Healing Ambiguity module into an autonomous multi-document reconciler that scans updated corporate PDFs, detects contradictory policy rules across departments (e.g. Sales SLA vs Legal disclaimer), and automatically drafts harmonized amendments.

---

## 👥 Team Roles & Contributions

| Member | Primary Responsibility | Round 2 Contributions |
| :--- | :--- | :--- |
| **Prince Kumar** (Team Leader & Lead Architect) | Backend Architecture & Guardrail Engine | Engineered the FastAPI orchestrator, Multi-Dimensional Inspection Engine (`engine.py`), Verified Claims Grounding pipeline, and Intent-Preserving Diff generation. |
| **Yash Sharma** (Frontend & Vision Engineer) | UI/UX & Visual Asset Verification | Designed the interactive single-page studio, WCAG 2.2 contrast and CIELAB color math (`vision_checker.py`), and Collaborative Workflow queue. |

---
*Built with precision for CodeStar 30 by Team VALERION CODERS.*
