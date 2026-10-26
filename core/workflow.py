import hashlib
import time
from typing import Dict, Any, List, Optional

class ReviewWorkflowManager:
    def __init__(self):
        # Pre-seed realistic active review queue
        self.submissions: Dict[str, Dict[str, Any]] = {
            "SUB-101": {
                "id": "SUB-101",
                "title": "Q4 Enterprise Security Launch Press Release",
                "creator": "Sarah Jenkins (Lead Content Specialist)",
                "created_at": "2026-10-26 09:15:00",
                "status": "APPROVED",
                "status_badge": "Ready for Publication",
                "status_color": "emerald",
                "compliance_score": 98,
                "current_content": "Inkloom AI is proud to announce that AegisBrand OS has achieved audited SOC2 Type II certification and ISO 27001 compliance. Trusted by over 1,200+ growing organizations, our platform delivers 99.9% verified uptime backed by enterprise SLAs. By pairing intelligent multimodal guardrails with sovereign human oversight, we help organizations accelerate review velocity by up to 95% without compromising brand integrity.",
                "approved_by": "Marcus Vance (VP of Brand)",
                "approved_at": "2026-10-26 10:45:00",
                "sha256_fingerprint": hashlib.sha256("Q4 Enterprise Security Launch Press Release v2".encode()).hexdigest(),
                "history": [
                    {"action": "Submitted for Review", "user": "Sarah Jenkins", "timestamp": "09:15:00", "note": "Initial draft submitted with SOC2 claims."},
                    {"action": "Automated Audit Passed", "user": "AegisBrand Sentinel", "timestamp": "09:15:02", "note": "Score 98/100. Zero critical claim violations."},
                    {"action": "Final Publication Sign-Off", "user": "Marcus Vance (VP Brand)", "timestamp": "10:45:00", "note": "Verified against AICPA SOC2 audit certificate. Approved."}
                ],
                "comments": [
                    {"author": "Marcus Vance", "role": "Brand Manager", "timestamp": "10:30:15", "text": "Great job citing the official 99.9% SLA rather than the previous draft's 100% claim."}
                ]
            },
            "SUB-102": {
                "id": "SUB-102",
                "title": "Outbound Paid Ad Copy — Performance Scaling",
                "creator": "Agency Partner (GrowthX Media)",
                "created_at": "2026-10-26 11:30:00",
                "status": "IN_REVIEW",
                "status_badge": "Action Required — Critical Flags",
                "status_color": "rose",
                "compliance_score": 45,
                "current_content": "Introducing the all-new inkloomAI release powered by Aegis Brand! Our cheap revolutionary miracle tool crushes competitors by delivering infallible 100% uptime that never fails under any condition. Marketing teams get a guaranteed 10x ROI within 48 hours without lifting a finger.",
                "approved_by": None,
                "approved_at": None,
                "sha256_fingerprint": None,
                "history": [
                    {"action": "Submitted by Agency", "user": "GrowthX Media", "timestamp": "11:30:00", "note": "Weekly paid ads batch." },
                    {"action": "Automated Guardrail Intercept", "user": "AegisBrand Sentinel", "timestamp": "11:30:01", "note": "Flagged 5 critical issues: 100% SLA, guaranteed 10x ROI, trademark casing."}
                ],
                "comments": [
                    {"author": "Elena Rostova", "role": "Legal Reviewer", "timestamp": "11:42:00", "text": "Cannot approve 'guaranteed 10x ROI' or 'infallible 100% uptime'. Please accept AegisBrand's inline suggestions or provide audited case study."}
                ]
            }
        }

    def get_all_submissions(self) -> List[Dict[str, Any]]:
        return list(self.submissions.values())

    def get_submission(self, sub_id: str) -> Optional[Dict[str, Any]]:
        return self.submissions.get(sub_id)

    def create_submission(self, title: str, creator: str, content: str, compliance_score: int) -> Dict[str, Any]:
        sub_id = f"SUB-{len(self.submissions)+101}"
        status = "APPROVED" if compliance_score >= 90 else ("CHANGES_REQUESTED" if compliance_score < 60 else "IN_REVIEW")
        status_color = "emerald" if status == "APPROVED" else ("rose" if status == "CHANGES_REQUESTED" else "amber")
        
        fingerprint = hashlib.sha256(content.encode()).hexdigest() if status == "APPROVED" else None

        new_sub = {
            "id": sub_id,
            "title": title,
            "creator": creator,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": status,
            "status_badge": "Approved & Fingerprinted" if status == "APPROVED" else "Under Review",
            "status_color": status_color,
            "compliance_score": compliance_score,
            "current_content": content,
            "approved_by": "Auto-Verified" if status == "APPROVED" else None,
            "approved_at": time.strftime("%Y-%m-%d %H:%M:%S") if status == "APPROVED" else None,
            "sha256_fingerprint": fingerprint,
            "history": [
                {"action": "Created Draft", "user": creator, "timestamp": time.strftime("%H:%M:%S"), "note": f"Initial scan compliance score: {compliance_score}/100."}
            ],
            "comments": []
        }
        self.submissions[sub_id] = new_sub
        return new_sub

    def approve_submission(self, sub_id: str, manager_name: str, notes: str = "") -> Dict[str, Any]:
        sub = self.submissions.get(sub_id)
        if not sub:
            return None
        sub["status"] = "APPROVED"
        sub["status_badge"] = "Manager Approved for Publish"
        sub["status_color"] = "emerald"
        sub["approved_by"] = manager_name
        sub["approved_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        sub["sha256_fingerprint"] = hashlib.sha256((sub["current_content"] + manager_name).encode()).hexdigest()
        sub["history"].append({
            "action": "Manager Approval Granted",
            "user": manager_name,
            "timestamp": time.strftime("%H:%M:%S"),
            "note": notes or "All brand guidelines verified and cleared for public distribution."
        })
        return sub

    def request_changes(self, sub_id: str, manager_name: str, feedback: str) -> Dict[str, Any]:
        sub = self.submissions.get(sub_id)
        if not sub:
            return None
        sub["status"] = "CHANGES_REQUESTED"
        sub["status_badge"] = "Revisions Required"
        sub["status_color"] = "rose"
        sub["history"].append({
            "action": "Changes Requested",
            "user": manager_name,
            "timestamp": time.strftime("%H:%M:%S"),
            "note": feedback
        })
        sub["comments"].append({
            "author": manager_name,
            "role": "Brand Manager",
            "timestamp": time.strftime("%H:%M:%S"),
            "text": feedback
        })
        return sub

    def add_comment(self, sub_id: str, author: str, role: str, text: str):
        sub = self.submissions.get(sub_id)
        if sub:
            sub["comments"].append({
                "author": author,
                "role": role,
                "timestamp": time.strftime("%H:%M:%S"),
                "text": text
            })

workflow = ReviewWorkflowManager()
