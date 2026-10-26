from typing import Dict, Any, List

class GovernanceAnalyticsEngine:
    def __init__(self):
        # Realistic aggregated telemetry data
        self.category_breakdown = [
            {"category": "Unsupported Claims & Facts", "percentage": 38, "count": 142, "color": "#EF4444"},
            {"category": "Trademark & Terminology Casing", "percentage": 27, "count": 101, "color": "#F59E0B"},
            {"category": "Off-Brand Voice & Aggressive Tone", "percentage": 20, "count": 75, "color": "#0284C7"},
            {"category": "Visual Palette & Contrast Issues", "percentage": 15, "count": 56, "color": "#8B5CF6"}
        ]

        self.recurring_violations = [
            {
                "rule": "Claims Guide Sec 4.2: Uptime SLA Guarantees",
                "frequency": "64 instances this month",
                "typical_mistake": "Claiming '100% infallible uptime' instead of verified '99.9%' metric.",
                "severity": "High Legal Risk",
                "trend": "+12% (Driven by new agency contractors)"
            },
            {
                "rule": "Nomenclature Guide Sec 1.1: Trademark Capitalization",
                "frequency": "48 instances this month",
                "typical_mistake": "Writing 'inkloomAI' or 'Inkloom.ai' without standard spacing.",
                "severity": "Brand Dilution",
                "trend": "-8% (Improved after automated linter)"
            },
            {
                "rule": "Advertising Code Sec 4.1: Unsupported 10x ROI",
                "frequency": "32 instances this month",
                "typical_mistake": "Promising unconditional 'guaranteed 10x growth' in outbound ad copies.",
                "severity": "Regulatory FTC Exposure",
                "trend": "+5% (Common in SDR outbound scripts)"
            },
            {
                "rule": "Tone Pillar 1: Non-Aggressive Competitive Conduct",
                "frequency": "29 instances this month",
                "typical_mistake": "Using combative phrases like 'crushes competitors' or 'undisputed king'.",
                "severity": "Brand Reputation",
                "trend": "Stable"
            }
        ]

        self.ambiguous_guidelines = [
            {
                "rule_id": "RULE-AMB-01",
                "title": "Voice Guideline Sec 3.4: 'Bold but Approachable'",
                "dispute_rate": "42% manager override rate (38 creator disputes)",
                "root_cause": "The boundary between 'bold' and 'aggressive' is subjective without concrete negative exemplars.",
                "ai_suggested_remedy": "Add 3 explicit negative examples. Specify that 'bold' refers to technical confidence, while comparative attacks against competitors are prohibited."
            },
            {
                "rule_id": "RULE-AMB-02",
                "title": "Visual Guide Sec 2.2: 'Modern Gradient Usage'",
                "dispute_rate": "31% manager override rate (22 creator disputes)",
                "root_cause": "Rule permits 'subtle modern gradients' without defining strict start/end hex boundaries, causing neon saturation drift.",
                "ai_suggested_remedy": "Codify two approved gradient CSS presets (#4F46E5 to #06B6D4) and prohibit unlisted color transitions."
            }
        ]

    def get_analytics_summary(self) -> Dict[str, Any]:
        return {
            "overall_governance_score": 92,
            "total_assets_audited": 374,
            "pre_publication_interceptions": 89,
            "avg_review_turnaround_mins": "1.8 mins (vs 48 hrs baseline)",
            "category_breakdown": self.category_breakdown,
            "recurring_violations": self.recurring_violations,
            "ambiguous_guidelines": self.ambiguous_guidelines
        }

analytics = GovernanceAnalyticsEngine()
