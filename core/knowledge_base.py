import json
import os
from typing import Dict, Any, List

# Embedded Fallback Data for Serverless Cloud Environments (Vercel / AWS Lambda)
FALLBACK_BRAND_BIBLE = {
  "brand_name": "Inkloom AI",
  "product_suite": "AegisBrand OS",
  "voice_and_tone": {
    "pillars": [
      {
        "trait": "Confident & Authoritative",
        "description": "Speak with technical depth and credibility without bragging or belittling others.",
        "dos": "State verified achievements, cite audited metrics, highlight robust engineering.",
        "donts": "Do not use hyperbole like 'crushes competitors', 'unbeatable', or 'the undisputed king'."
      },
      {
        "trait": "Approachable & Empowering",
        "description": "Treat creators as partners; educate and elevate rather than dictate.",
        "dos": "Use inclusive pronouns, supportive guidance, and clear explanations.",
        "donts": "Never use dismissive or punitive words like 'forbidden', 'idiotic', or 'rejected without appeal'."
      },
      {
        "trait": "Ethical & Transparent",
        "description": "Be honest about AI capabilities, privacy boundaries, and factual evidence.",
        "dos": "Clearly disclose AI assistance, cite approved sources, maintain modesty.",
        "donts": "Never claim '100% infallible', 'zero-defect guarantee', or unproven magical outcomes."
      }
    ],
    "target_reading_level": "Grade 8-11 (Clear, professional, accessible)",
    "prohibited_tones": ["Aggressive", "Arrogant", "Deceptive", "Sloppy", "Hyperbolic"]
  },
  "prohibited_terms": [
    {
      "term": "crushes competitors",
      "reason": "Violates Brand Tone Pillar 1 (Non-aggressive, respectful positioning).",
      "guideline_ref": "Tone Guide Sec 2.1: Competitive Conduct",
      "suggestion": "outperforms industry benchmarks"
    },
    {
      "term": "cheap",
      "reason": "Cheap devalues the brand image and implies low quality.",
      "guideline_ref": "Brand Positioning Sec 3.4: Value Messaging",
      "suggestion": "cost-effective or accessible"
    },
    {
      "term": "infallible",
      "reason": "Absolute superlatives are legally risky and technologically inaccurate.",
      "guideline_ref": "Legal Compliance Sec 1.2: Absolute Superlatives",
      "suggestion": "industry-leading or high-reliability"
    },
    {
      "term": "guaranteed 10x",
      "reason": "Unsupported promotional ROI guarantees violate FTC and ASCI advertising regulations.",
      "guideline_ref": "Advertising Standards Sec 4.1: Promotional Guarantees",
      "suggestion": "proven up to 10x in verified customer case studies"
    },
    {
      "term": "revolutionary miracle",
      "reason": "Hype-driven marketing cliches degrade engineering credibility.",
      "guideline_ref": "Content Stylebook Sec 5.3: Buzzword Lexicon",
      "suggestion": "groundbreaking or transformative architecture"
    },
    {
      "term": "inkloomAI",
      "reason": "Incorrect brand casing. Must always have a space between Inkloom and AI.",
      "guideline_ref": "Nomenclature Guide Sec 1.1: Trademark Capitalization",
      "suggestion": "Inkloom AI"
    },
    {
      "term": "Aegis Brand",
      "reason": "Product brand must be written as single compound 'AegisBrand' followed by OS or AI.",
      "guideline_ref": "Nomenclature Guide Sec 1.3: Product Branding",
      "suggestion": "AegisBrand OS"
    }
  ],
  "visual_identity": {
    "primary_palette": [
      {"name": "Indigo Core", "hex": "#4F46E5", "role": "Primary Brand Action"},
      {"name": "Cyber Cyan", "hex": "#06B6D4", "role": "Secondary Highlight"},
      {"name": "Emerald Trust", "hex": "#10B981", "role": "Success & Verified Badge"},
      {"name": "Slate Obsidian", "hex": "#0F172A", "role": "Primary Text & Background"},
      {"name": "Pure White", "hex": "#FFFFFF", "role": "Card Canvas & Surface"}
    ],
    "disallowed_colors": [
      {"hex": "#FF0055", "reason": "Neon Magenta clashes with brand trust spectrum", "suggested_hex": "#4F46E5"},
      {"hex": "#FFFF00", "reason": "Pure yellow fails WCAG AA 4.5:1 text contrast", "suggested_hex": "#D97706"}
    ],
    "logo_rules": {
      "aspect_ratio": 1.0,
      "aspect_ratio_tolerance": 0.05,
      "minimum_exclusion_zone_px": 24,
      "minimum_resolution_px": 128
    },
    "accessibility": {
      "wcag_level": "AA",
      "minimum_contrast_normal_text": 4.5,
      "minimum_contrast_large_text": 3.0,
      "alt_text_required": True
    }
  }
}

FALLBACK_CLAIMS = {
  "verified_claims": [
    {
      "id": "CLM-001",
      "topic": "System Availability & Uptime",
      "approved_statement": "Delivers 99.9% verified uptime backed by enterprise SLA guarantee.",
      "evidence_source": "Audited Cloud Architecture SLA Report Q3 2026",
      "valid_keywords": ["99.9%", "uptime", "availability", "sla"],
      "forbidden_unverified_phrases": ["100% uptime", "infallible uptime", "zero downtime forever", "99.999%"],
      "correction_template": "delivers 99.9% verified uptime backed by enterprise SLA"
    },
    {
      "id": "CLM-002",
      "topic": "Customer Adoption & Scale",
      "approved_statement": "Trusted by over 1,200+ growing organizations and marketing teams globally.",
      "evidence_source": "Verified CRM Active Subscriber Ledger (October 2026)",
      "valid_keywords": ["1,200+", "1200", "growing organizations", "customers"],
      "forbidden_unverified_phrases": ["over 50,000 enterprises", "used by millions", "every fortune 500 company"],
      "correction_template": "trusted by over 1,200+ growing organizations worldwide"
    },
    {
      "id": "CLM-003",
      "topic": "Security & Regulatory Compliance",
      "approved_statement": "SOC2 Type II, ISO 27001 certified, and GDPR compliant with zero customer data retention.",
      "evidence_source": "Third-Party AICPA SOC2 Type II Audit & BSI ISO Certificate",
      "valid_keywords": ["soc2", "type ii", "iso 27001", "gdpr"],
      "forbidden_unverified_phrases": ["military grade encryption", "100% hack-proof", "unhackable", "hipaa certified"],
      "correction_template": "SOC2 Type II certified and GDPR compliant with zero-data retention"
    },
    {
      "id": "CLM-004",
      "topic": "Performance & Review Velocity",
      "approved_statement": "Reduces pre-publication brand review turnaround latency by up to 95%.",
      "evidence_source": "Internal Enterprise Cohort Benchmark Study (July–September 2026)",
      "valid_keywords": ["95%", "turnaround", "latency", "bottleneck"],
      "forbidden_unverified_phrases": ["instant 100x speedup", "eliminates all human work", "instant zero-second publishing"],
      "correction_template": "accelerates review velocity by up to 95% while keeping humans in the loop"
    },
    {
      "id": "CLM-005",
      "topic": "Deployment Architecture",
      "approved_statement": "Available as a secure multi-tenant SaaS or private single-tenant VPC deployment.",
      "evidence_source": "Product Architecture Whitepaper v2.4",
      "valid_keywords": ["vpc", "multi-tenant", "private deployment", "cloud"],
      "forbidden_unverified_phrases": ["available on any toaster", "free forever without limits"],
      "correction_template": "deployed via secure cloud SaaS or private VPC infrastructure"
    }
  ]
}

FALLBACK_SAMPLES = [
  {
    "id": "sample-1",
    "title": "🚨 Flagship Launch Copy (High Brand & Claim Violations)",
    "description": "Exhibits hallucinated 100% uptime, unsupported 10x ROI promises, aggressive tone, and trademark casing errors.",
    "format": "text",
    "content": "Introducing the all-new inkloomAI release powered by Aegis Brand! Our cheap revolutionary miracle tool crushes competitors by delivering infallible 100% uptime that never fails under any condition. Marketing teams get a guaranteed 10x ROI within 48 hours without lifting a finger. Stop wasting time with outdated competitors and switch to the undisputed king of brand governance today.",
    "attached_visual": {
      "filename": "hero_banner_draft.png",
      "colors_detected": ["#FF0055", "#0F172A", "#FFFFFF"],
      "logo_aspect_ratio": 1.34,
      "has_alt_text": False
    }
  },
  {
    "id": "sample-2",
    "title": "⚠️ Social Carousel Draft (Terminology & Accessibility Drift)",
    "description": "Mild violations: contains deprecated branding, off-palette color usage, and insufficient contrast.",
    "format": "text",
    "content": "Discover how inkloomAI helps modern marketing leaders safeguard their assets. By automating repetitive proofreading, teams scale publication velocity while eliminating cheap off-brand errors. Check out our SOC2 Type II compliance report to learn how we protect your confidential creative files.",
    "attached_visual": {
      "filename": "social_carousel_slide1.png",
      "colors_detected": ["#4F46E5", "#FFFF00", "#FFFFFF"],
      "logo_aspect_ratio": 1.02,
      "has_alt_text": True
    }
  },
  {
    "id": "sample-3",
    "title": "✅ Enterprise Security Whitepaper (Fully Brand Compliant)",
    "description": "Clean, authoritative tone, verified metrics, proper trademark nomenclature, and verified claims.",
    "format": "text",
    "content": "Inkloom AI is proud to announce that AegisBrand OS has achieved audited SOC2 Type II certification and ISO 27001 compliance. Trusted by over 1,200+ growing organizations, our platform delivers 99.9% verified uptime backed by enterprise SLAs. By pairing intelligent multimodal guardrails with sovereign human oversight, we help organizations accelerate review velocity by up to 95% without compromising brand integrity.",
    "attached_visual": {
      "filename": "security_badge_verified.png",
      "colors_detected": ["#4F46E5", "#0F172A", "#FFFFFF"],
      "logo_aspect_ratio": 1.0,
      "has_alt_text": True
    }
  }
]

def find_data_dir():
    candidates = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"),
        os.path.join(os.getcwd(), "data"),
        os.path.join(os.path.dirname(os.getcwd()), "data"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isdir(c):
            return c
    return candidates[0]

class KnowledgeBase:
    def __init__(self):
        self.data_dir = find_data_dir()
        self.brand_bible_path = os.path.join(self.data_dir, "brand_bible.json")
        self.verified_claims_path = os.path.join(self.data_dir, "verified_claims.json")
        self.sample_campaigns_path = os.path.join(self.data_dir, "sample_campaigns.json")
        
        # Initialize with robust fallbacks
        self.brand_bible = FALLBACK_BRAND_BIBLE
        self.claims_data = FALLBACK_CLAIMS
        self.samples = FALLBACK_SAMPLES
        
        self.load_all()

    def load_all(self):
        try:
            if os.path.exists(self.brand_bible_path):
                with open(self.brand_bible_path, "r", encoding="utf-8") as f:
                    self.brand_bible = json.load(f)
        except Exception as e:
            print(f"Notice: Using embedded brand bible ({e})")

        try:
            if os.path.exists(self.verified_claims_path):
                with open(self.verified_claims_path, "r", encoding="utf-8") as f:
                    self.claims_data = json.load(f)
        except Exception as e:
            print(f"Notice: Using embedded verified claims ({e})")

        try:
            if os.path.exists(self.sample_campaigns_path):
                with open(self.sample_campaigns_path, "r", encoding="utf-8") as f:
                    self.samples = json.load(f)
        except Exception as e:
            print(f"Notice: Using embedded samples ({e})")

    def get_brand_bible(self) -> Dict[str, Any]:
        return self.brand_bible

    def get_verified_claims(self) -> List[Dict[str, Any]]:
        return self.claims_data.get("verified_claims", [])

    def get_sample_campaigns(self) -> List[Dict[str, Any]]:
        return self.samples

    def add_prohibited_term(self, term: str, reason: str, guideline_ref: str, suggestion: str):
        self.brand_bible["prohibited_terms"].append({
            "term": term,
            "reason": reason,
            "guideline_ref": guideline_ref,
            "suggestion": suggestion
        })
        try:
            if os.path.exists(self.data_dir):
                with open(self.brand_bible_path, "w", encoding="utf-8") as f:
                    json.dump(self.brand_bible, f, indent=2)
        except Exception as e:
            print(f"Notice: In-memory term added (read-only filesystem: {e})")

    def add_verified_claim(self, claim_id: str, topic: str, statement: str, source: str, keywords: List[str]):
        new_claim = {
            "id": claim_id,
            "topic": topic,
            "approved_statement": statement,
            "evidence_source": source,
            "valid_keywords": keywords,
            "forbidden_unverified_phrases": [],
            "correction_template": statement
        }
        self.claims_data["verified_claims"].append(new_claim)
        try:
            if os.path.exists(self.data_dir):
                with open(self.verified_claims_path, "w", encoding="utf-8") as f:
                    json.dump(self.claims_data, f, indent=2)
        except Exception as e:
            print(f"Notice: In-memory claim added (read-only filesystem: {e})")

kb = KnowledgeBase()
