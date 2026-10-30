# AegisBrand AI — Pre-Publication Brand Governance Platform
### Autonomous Pre-Publication Brand Governance, Content Provenance & Multi-Document Reconciliation

[![Live Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://aegisbrand-ai.vercel.app)
[![C2PA Standard](https://img.shields.io/badge/C2PA-v1.3%20%2F%20ISO%2020066-blue?style=flat)](https://c2pa.org)
[![Hackathon](https://img.shields.io/badge/CodeStar%2030-Round%203%20Finalist%20(Top%2050)-gold?style=flat)]()
[![Problem Statement](https://img.shields.io/badge/Challenge-Inkloom%20AI-purple?style=flat)]()

**Competition:** CodeStar 30 (National-Level Hackathon) — **Round 3: The Final Build (Top 50 Finalist)**  
**Challenge Track:** Problem Statement by Inkloom AI  
**Team Name:** **PRINCE OF VALERIA**  
**Team Members:** 
- **Prince Kumar (Team Leader & Lead Architect)**: System Architecture, C2PA Provenance Engine, Core Guardrails & Vercel Serverless Deployment
- **Yash Sharma (Frontend & Visual Systems Engineer)**: In-Situ Workspace Extension, Multi-Doc Conflict Resolver, UI/UX & Data Grounding  
**Live Application URL:** [https://aegisbrand-ai.vercel.app](https://aegisbrand-ai.vercel.app)  
**Source Code Repository:** [https://github.com/Prince-creator-developer/aegisbrand_ai](https://github.com/Prince-creator-developer/aegisbrand_ai)  
**Round 3 Project Dossier PDF:** [AegisBrand_AI_CodeStar30_Round3_Final_Finish_Dossier.pdf](AegisBrand_AI_CodeStar30_Round3_Final_Finish_Dossier.pdf)

---

## 🌟 Executive Overview
High-growth organizations publish high-velocity content through distributed employees, external agencies, and generative AI tools, making it difficult to maintain a consistent and trustworthy brand identity. Outdated specs, hallucinated metrics, off-brand visuals, and combative tone damage corporate equity and trigger severe regulatory penalties (FTC/ASCI).

**AegisBrand AI** is a pre-publication brand governance platform that intercepts content before publication. It continuously validates copy, visual metadata, and campaign assets against an organization's approved Single Source of Truth:
- **Brand Bible** (Tone, Voice Pillars, Prohibited Terms)
- **Verified Claims Database** (Audited SLAs, Customer Metrics, Legal Certifications)
- **Visual Identity Tokens** (Palette Hexes, Contrast Ratios, Logo Geometry)

Instead of simply rejecting content, AegisBrand **explains each issue**, cites the exact guideline, and **generates intent-preserving corrections** with one-click adoption, backed by a collaborative review workflow and self-healing ambiguity diagnostics.

---

## 🏆 Round 3: The Three Promised Improvements (100% Delivered)

In Round 2, Team **PRINCE OF VALERIA** committed to delivering three major capabilities in Round 3. All three have been fully implemented, tested, and integrated:

### 1. In-Situ Workspace Extension & Interactive Simulator (Improvement #1)
- **What it is:** Brings real-time brand governance directly into the creator's natural authoring environment (Google Docs, Figma, Notion, CMS).
- **Chrome Extension (Manifest V3):** Authored in the [`extension/`](extension/) directory with declarative content scripts, popup interface, and background observers.
- **Interactive Web Simulator:** Tab 2 (*In-Situ Workspace Extension*) simulates a live Google Docs authoring canvas with real-time wavy squiggly underlines (`.insitu-flagged`) and hovering inline popovers, allowing one-click inline replacements.

### 2. C2PA Cryptographic Content Provenance Ledger (Improvement #2)
- **What it is:** Implements the Coalition for Content Provenance and Authenticity (C2PA v1.3 / ISO 20066) standard for post-approval tamper detection and provenance auditing.
- **SHA-256 Non-Repudiation Fingerprint:** Binds the approved content, author, approving director, compliance score, and UTC timestamp into an immutable cryptographic hash.
- **Digital Signature & Verification:** Endpoint `GET /api/c2pa/manifest/{sub_id}` generates JSON-LD manifests; `POST /api/c2pa/verify` validates content integrity and detects unauthorized post-approval tampering.
- **Live Modal Inspector:** Tab 4 includes an *Inspect C2PA Provenance* inspector modal with one-click cryptographic verification.

### 3. Autonomous Multi-Document Guideline Conflict Resolver (Improvement #3)
- **What it is:** Resolves policy contradictions across disparate departmental documentation silos (Sales Pitch Decks vs Engineering SLA Specs vs Legal Terms of Service vs Marketing Stylebooks).
- **Vector-Graph Reconciliation Engine:** Endpoint `GET /api/conflicts` cross-scans documents across 4 departments, flags contradictions (e.g., Sales 100% uptime vs Legal 99.9% liability caps), calculates enterprise risk ratings, and synthesizes AI-harmonized consensus policies.
- **One-Click Harmonization:** Tab 3 (*Multi-Doc Conflict Resolver*) allows users to review conflicting stances and adopt the harmonized policy directly into the organizational Brand Bible.

---

## 🎮 3-Minute Judge Evaluation Walkthrough

A judge can test every core feature and all three Round 3 improvements immediately without any walkthrough or login:

### Step 1: Core Workflow (Review Studio)
1. Open [https://aegisbrand-ai.vercel.app](https://aegisbrand-ai.vercel.app).
2. Sample 1 is auto-loaded in the editor with typical violations (unverified 100% uptime, combative tone, off-brand magenta graphics).
3. Click **"Run Brand Guardrail Audit"**.
4. Review the **0/100 Compliance Score**, dimensional tone meters, and explainable diff cards with guideline citations.
5. Click **"Adopt All Compliant Fixes"** to see the draft instantly transform into compliant copy (100/100 score).

### Step 2: Improvement #1 (In-Situ Workspace Simulator)
1. Switch to the **"In-Situ Workspace Extension"** tab.
2. In the simulated Google Docs canvas, click on any red squiggly phrase (e.g., `"infallible 100% uptime"`).
3. In the hovering popover, review the citation (*Claims Guide Sec 4.2*) and click **"Adopt Fix Inline"**.
4. The text updates in-place and turns green with a verified checkmark!

### Step 3: Improvement #3 (Multi-Doc Conflict Resolver)
1. Switch to the **"Multi-Doc Conflict Resolver"** tab.
2. View the 4 ingested departmental documents (Sales, Engineering, Legal, Marketing).
3. Review the 3 detected policy contradictions (e.g., *CONF-001: SLA & Availability Guarantees*).
4. Click **"Adopt Harmonized Policy"** on any conflict card to sync the consensus rule to the Brand Bible.

### Step 4: Improvement #2 (Review Queue & C2PA Ledger)
1. Switch to the **"Review Queue & C2PA Ledger"** tab.
2. Locate approved campaign **SUB-101** stamped with a SHA-256 fingerprint.
3. Click **"Inspect C2PA Provenance"** to inspect the C2PA v1.3 JSON-LD manifest.
4. Click **"Verify Digital Signature & Integrity"** to trigger cryptographic signature and hash validation!

---

## 🛠️ Technology Stack & Architecture

- **Backend Framework:** Python 3.11, FastAPI, Pydantic, Hashlib, Uvicorn.
- **Serverless Cloud Hosting:** Vercel Serverless (`@vercel/python` builder) with zero external database dependencies.
- **Frontend UI/UX:** Responsive Tailwind CSS, JetBrains Mono, FontAwesome 6, HTML5 Canvas API for live palette extraction.
- **Provenance Standard:** Coalition for Content Provenance and Authenticity (C2PA v1.3 / ISO 20066).
- **Extension Architecture:** Google Chrome Extension (Manifest V3), Declarative Content Scripts, DOM Mutation Observers.
- **Zero-Data Retention:** Ephemeral in-memory execution; customer copy is never stored in third-party LLM training silos.

---

## 🚀 Running Locally (Optional)

```bash
# Clone the repository
git clone https://github.com/Prince-creator-developer/aegisbrand_ai.git
cd aegisbrand_ai

# Install dependencies
pip install -r requirements.txt

# Start local server
python app.py
```
Visit `http://localhost:8000` in your browser.

---

## 👥 Team & Submission Information

- **Team Name:** PRINCE OF VALERIA
- **Team Leader:** Prince Kumar (`Prince-creator-developer@users.noreply.github.com`)
- **Core Member:** Yash Sharma
- **Hackathon:** CodeStar 30 (Inkloom AI Problem Statement)
- **Finalist Round:** Round 3 Final Build (Top 50 Finalist)
- **Seat Confirmation:** Completed via KonfHub
