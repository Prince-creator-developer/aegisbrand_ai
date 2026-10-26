import re
from typing import Dict, Any, List
from core.knowledge_base import kb
from core.vision_checker import audit_visual_assets

class BrandGovernanceEngine:
    def __init__(self):
        pass

    def inspect_content(self, text: str, visual_data: Dict[str, Any] = None) -> Dict[str, Any]:
        brand_bible = kb.get_brand_bible()
        verified_claims = kb.get_verified_claims()
        prohibited_terms = brand_bible.get("prohibited_terms", [])
        visual_rules = brand_bible.get("visual_identity", {})

        issues = []
        lowered_text = text.lower()

        # -------------------------------------------------------------
        # 1. TERMINOLOGY & NOMENCLATURE INSPECTION
        # -------------------------------------------------------------
        for item in prohibited_terms:
            term = item["term"]
            pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
            for match in pattern.finditer(text):
                start, end = match.span()
                matched_text = text[start:end]
                issues.append({
                    "id": f"TRM-{len(issues)+1}",
                    "category": "Terminology",
                    "severity": "critical" if item.get("severity") == "critical" or "prohibited" in item["guideline_ref"].lower() or "trademark" in item["guideline_ref"].lower() else "warning",
                    "flagged_text": matched_text,
                    "start_char": start,
                    "end_char": end,
                    "guideline_ref": item["guideline_ref"],
                    "explanation": item["reason"],
                    "intent_preserving_suggestion": item["suggestion"],
                    "diff_preview": {
                        "delete": matched_text,
                        "add": item["suggestion"]
                    }
                })

        # -------------------------------------------------------------
        # 2. FACTS & CLAIM VERIFICATION (GROUNDING ENGINE)
        # -------------------------------------------------------------
        for claim in verified_claims:
            for forbidden_phrase in claim.get("forbidden_unverified_phrases", []):
                pattern = re.compile(rf"\b{re.escape(forbidden_phrase)}\b", re.IGNORECASE)
                for match in pattern.finditer(text):
                    start, end = match.span()
                    matched_text = text[start:end]
                    issues.append({
                        "id": f"CLM-{len(issues)+1}",
                        "category": "Fact Verification",
                        "severity": "critical",
                        "flagged_text": matched_text,
                        "start_char": start,
                        "end_char": end,
                        "guideline_ref": f"Ground Truth ID: {claim['id']} ({claim['topic']})",
                        "explanation": f"Unsubstantiated or exaggerated claim. Approved fact: \"{claim['approved_statement']}\" (Source: {claim['evidence_source']}).",
                        "intent_preserving_suggestion": claim["correction_template"],
                        "diff_preview": {
                            "delete": matched_text,
                            "add": claim["correction_template"]
                        }
                    })

        # Check for unbacked absolute superlatives (#1, fastest, undefeated)
        superlative_patterns = [
            (r"\bundisputed king\b", "Superlative claim violates Advertising Standards Code. Proving industry monopoly requires exhaustive verifiable market research.", "leading platform"),
            (r"\bnever fails\b", "Absolute claim contradicts real-world operational SLAs and creates litigation liability.", "designed for high resilience"),
            (r"\b100% bug-free\b", "Technologically unfeasible claim that degrades engineering trust.", "engineered with rigorous QA testing")
        ]
        for pat, expl, sugg in superlative_patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                start, end = match.span()
                matched_text = text[start:end]
                # Avoid duplicate if already caught
                if not any(i["start_char"] == start for i in issues if "start_char" in i):
                    issues.append({
                        "id": f"CLM-{len(issues)+1}",
                        "category": "Fact Verification",
                        "severity": "critical",
                        "flagged_text": matched_text,
                        "start_char": start,
                        "end_char": end,
                        "guideline_ref": "Regulatory Advertising Code Sec 4.2: Objective Substantiation",
                        "explanation": expl,
                        "intent_preserving_suggestion": sugg,
                        "diff_preview": {"delete": matched_text, "add": sugg}
                    })

        # -------------------------------------------------------------
        # 3. TONE & VOICE EVALUATION
        # -------------------------------------------------------------
        aggressive_phrases = [
            (r"\bstop wasting time\b", "Overly aggressive and condescending toward customer's existing tooling.", "Discover a more streamlined way"),
            (r"\bwithout lifting a finger\b", "Over-promising automated outcome that minimizes customer agency.", "with streamlined automated workflows")
        ]
        for pat, expl, sugg in aggressive_phrases:
            for match in re.finditer(pat, text, re.IGNORECASE):
                start, end = match.span()
                matched_text = text[start:end]
                issues.append({
                    "id": f"TON-{len(issues)+1}",
                    "category": "Tone & Voice",
                    "severity": "warning",
                    "flagged_text": matched_text,
                    "start_char": start,
                    "end_char": end,
                    "guideline_ref": "Brand Voice Pillar 2: Approachable & Empowering",
                    "explanation": expl,
                    "intent_preserving_suggestion": sugg,
                    "diff_preview": {"delete": matched_text, "add": sugg}
                })

        # -------------------------------------------------------------
        # 4. VISUAL & ACCESSIBILITY AUDIT
        # -------------------------------------------------------------
        if visual_data:
            visual_issues = audit_visual_assets(
                visual_data=visual_data,
                brand_palette=visual_rules.get("primary_palette", []),
                disallowed_colors=visual_rules.get("disallowed_colors", [])
            )
            issues.extend(visual_issues)

        # -------------------------------------------------------------
        # 5. OVERALL SCORING & COMPLIANCE HEALTH
        # -------------------------------------------------------------
        critical_count = sum(1 for i in issues if i["severity"] == "critical")
        warning_count = sum(1 for i in issues if i["severity"] == "warning")

        # Score calculation: 100 base, -15 per critical, -5 per warning
        deductions = (critical_count * 15) + (warning_count * 5)
        compliance_score = max(0, 100 - deductions)

        if critical_count > 0:
            status = "ACTION_REQUIRED"
            status_label = "Blocked — Critical Issues Detected"
            status_color = "red"
        elif warning_count > 0:
            status = "WARNINGS_PRESENT"
            status_label = "Needs Review — Soft Warnings"
            status_color = "amber"
        else:
            status = "APPROVED"
            status_label = "Pre-Publication Verified & Compliant"
            status_color = "emerald"

        # Tone dimensional breakdown
        tone_metrics = {
            "authority_score": 92 if "undisputed" not in lowered_text else 60,
            "approachability_score": 88 if "stop wasting" not in lowered_text else 55,
            "claim_grounding_score": 95 if critical_count == 0 else max(30, 95 - (critical_count * 20)),
            "visual_coherence_score": 95 if not any(i["category"] == "Visual Identity" for i in issues) else 50
        }

        return {
            "compliance_score": compliance_score,
            "status": status,
            "status_label": status_label,
            "status_color": status_color,
            "total_issues": len(issues),
            "critical_count": critical_count,
            "warning_count": warning_count,
            "tone_metrics": tone_metrics,
            "issues": issues,
            "raw_text": text
        }

engine = BrandGovernanceEngine()
