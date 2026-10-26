import json
import os
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

class KnowledgeBase:
    def __init__(self):
        self.brand_bible_path = os.path.join(DATA_DIR, "brand_bible.json")
        self.verified_claims_path = os.path.join(DATA_DIR, "verified_claims.json")
        self.sample_campaigns_path = os.path.join(DATA_DIR, "sample_campaigns.json")
        self.load_all()

    def load_all(self):
        with open(self.brand_bible_path, "r", encoding="utf-8") as f:
            self.brand_bible = json.load(f)
        with open(self.verified_claims_path, "r", encoding="utf-8") as f:
            self.claims_data = json.load(f)
        with open(self.sample_campaigns_path, "r", encoding="utf-8") as f:
            self.samples = json.load(f)

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
        with open(self.brand_bible_path, "w", encoding="utf-8") as f:
            json.dump(self.brand_bible, f, indent=2)

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
        with open(self.verified_claims_path, "w", encoding="utf-8") as f:
            json.dump(self.claims_data, f, indent=2)

kb = KnowledgeBase()
