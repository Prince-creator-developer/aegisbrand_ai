import sys
import io
import json
import hashlib
import unittest

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from core.engine import engine
from core.knowledge_base import kb
from core.workflow import workflow
from core.c2pa_engine import c2pa_engine
from core.conflict_resolver import conflict_resolver
from core.ambiguity_analyzer import analytics

class AegisBrandRegressionTests(unittest.TestCase):

    def test_01_knowledge_base_integrity(self):
        """Verify knowledge base loads without errors and has required fields."""
        bible = kb.get_brand_bible()
        self.assertIn("brand_name", bible)
        self.assertIn("voice_and_tone", bible)
        self.assertIn("prohibited_terms", bible)
        self.assertIn("visual_identity", bible)
        
        claims = kb.get_verified_claims()
        self.assertGreater(len(claims), 0)
        self.assertTrue(all("id" in c and "topic" in c for c in claims))
        
        samples = kb.get_sample_campaigns()
        self.assertGreater(len(samples), 0)
        print("PASS: Knowledge base integrity verified.")

    def test_02_engine_critical_violations(self):
        """Verify non-compliant copy triggers accurate findings and diffs."""
        bad_copy = "We offer infallible 100% uptime with guaranteed 10x ROI and crush competitors."
        visual = {
            "filename": "test.png",
            "colors_detected": ["#FF0055"], # Disallowed neon magenta
            "logo_aspect_ratio": 1.45,       # Non-square lockup
            "has_alt_text": False
        }
        res = engine.inspect_content(bad_copy, visual)
        self.assertLess(res["compliance_score"], 50)
        self.assertGreater(res["critical_count"], 0)
        self.assertGreater(len(res["issues"]), 0)
        
        # Check that diffs exist
        for issue in res["issues"]:
            self.assertIn("flagged_text", issue)
            self.assertIn("intent_preserving_suggestion", issue)
            self.assertIn("diff_preview", issue)
        print("PASS: Engine critical violations and intent-preserving diffs verified.")

    def test_03_engine_empty_and_edge_cases(self):
        """Verify engine handles empty strings, whitespace, and special characters cleanly."""
        res_empty = engine.inspect_content("", None)
        self.assertEqual(res_empty["total_issues"], 0)
        self.assertEqual(res_empty["compliance_score"], 100)

        res_spaces = engine.inspect_content("   \n\t   ", None)
        self.assertEqual(res_spaces["total_issues"], 0)

        special_copy = "!@#$%^&*()_+{}[]:\"<>?~`-="
        res_special = engine.inspect_content(special_copy, None)
        self.assertIsNotNone(res_special["compliance_score"])
        print("PASS: Engine edge cases and empty content handled gracefully.")

    def test_04_c2pa_manifest_generation_and_tamper_detection(self):
        """Verify C2PA manifest conforms to v1.3 standard, verifies clean content, and catches tampering."""
        content = "Secure Cloud delivers enterprise-grade 99.9% uptime backed by audited SLAs."
        title = "Enterprise Q4 Campaign"
        author = "Sarah Jenkins"
        manager = "Marcus Vance (VP Brand)"
        
        # Generate manifest
        manifest = c2pa_engine.generate_manifest(content, title, author, manager, 98)
        self.assertEqual(manifest["@context"], "https://c2pa.org/standards/manifest/v1.3")
        self.assertEqual(manifest["c2pa_version"], "C2PA v1.3 / ISO 20066")
        self.assertEqual(manifest["signing_credentials"]["signer_identity"], manager)

        # 1. Clean verification test
        verify_clean = c2pa_engine.verify_manifest(manifest, content)
        self.assertTrue(verify_clean["valid"])
        self.assertTrue(verify_clean["is_valid"])
        self.assertEqual(verify_clean["digital_signature"], "VERIFIED_VALID")
        self.assertEqual(verify_clean["content_integrity"], "MATCHED_UNALTERED")

        # 2. Tampered verification test (Simulate unauthorized rogue edit)
        tampered_content = content.replace("99.9%", "100% infallible")
        verify_tampered = c2pa_engine.verify_manifest(manifest, tampered_content)
        self.assertFalse(verify_tampered["valid"])
        self.assertFalse(verify_tampered["is_valid"])
        self.assertEqual(verify_tampered["digital_signature"], "INVALID_SIGNATURE")
        self.assertEqual(verify_tampered["content_integrity"], "TAMPER_DETECTED")
        print("PASS: C2PA v1.3 manifest generation, verification, and tamper detection verified.")

    def test_05_conflict_resolver_engine(self):
        """Verify autonomous conflict detection across departmental documentation."""
        docs = conflict_resolver.get_department_documents()
        self.assertGreaterEqual(len(docs), 4)

        conflicts = conflict_resolver.detect_conflicts()
        self.assertGreaterEqual(len(conflicts), 3)

        # Ensure each conflict has topic, contradiction, risk analysis, and harmonized policy
        for c in conflicts:
            self.assertIn("conflict_id", c)
            self.assertIn("topic", c)
            self.assertIn("contradiction", c)
            self.assertIn("risk_analysis", c)
            self.assertIn("harmonized_policy", c)
            self.assertGreater(len(c["parties"]), 1)

        # Test adding a custom departmental document
        new_doc = conflict_resolver.add_custom_document(
            department="Product Operations",
            document_title="Q4 Infrastructure Playbook",
            claims=[{"topic": "Data Backup", "statement": "Daily cold storage snapshots"}]
        )
        self.assertEqual(new_doc["status"], "success")
        updated_docs = conflict_resolver.get_department_documents()
        self.assertTrue(any(d["department"] == "Product Operations" for d in updated_docs))
        print("PASS: Multi-document conflict engine and dynamic document ingestion verified.")

    def test_06_workflow_lifecycle(self):
        """Verify end-to-end review lifecycle: submit, comment, request change, approve with SHA-256."""
        # Create submission
        sub = workflow.create_submission(
            title="Regression Test Asset",
            creator="Alice Author",
            content="Initial draft copy for audit testing.",
            compliance_score=75
        )
        sub_id = sub["id"]
        self.assertEqual(sub["status"], "IN_REVIEW")

        # Add comment
        workflow.add_comment(sub_id, "Bob Reviewer", "LEGAL", "Please double check the trademark casing.")
        sub_updated = workflow.get_submission(sub_id)
        self.assertEqual(len(sub_updated["comments"]), 1)

        # Request changes
        workflow.request_changes(sub_id, "Bob Reviewer", "Needs citation updates.")
        sub_updated = workflow.get_submission(sub_id)
        self.assertEqual(sub_updated["status"], "CHANGES_REQUESTED")

        # Approve and check SHA-256 stamp
        workflow.approve_submission(sub_id, "Marcus Vance", "All guidelines verified.")
        sub_approved = workflow.get_submission(sub_id)
        self.assertEqual(sub_approved["status"], "APPROVED")
        self.assertIsNotNone(sub_approved["sha256_fingerprint"])
        self.assertEqual(len(sub_approved["sha256_fingerprint"]), 64)
        print("PASS: Workflow submission lifecycle, audit history, and SHA-256 stamp verified.")

    def test_07_ambiguity_analytics(self):
        """Verify self-healing ambiguity metrics and category breakdowns."""
        data = analytics.get_analytics_summary()
        self.assertIn("overall_governance_score", data)
        self.assertIn("category_breakdown", data)
        self.assertIn("recurring_violations", data)
        self.assertIn("ambiguous_guidelines", data)
        self.assertGreater(len(data["ambiguous_guidelines"]), 0)
        self.assertTrue(all("ai_suggested_remedy" in g for g in data["ambiguous_guidelines"]))
        print("PASS: Ambiguity analytics and self-healing recommendations verified.")

if __name__ == "__main__":
    unittest.main()
