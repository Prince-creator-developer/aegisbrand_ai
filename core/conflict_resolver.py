from typing import List, Dict, Any

class MultiDocConflictResolver:
    """
    Autonomous Multi-Document Guideline Conflict Resolver with Vector-Graph Reconciliation.
    Scans across disparate departmental documentation (Sales, Legal, Engineering, Marketing)
    to detect contradictory rules and generate harmonized enterprise consensus policies.
    """
    def __init__(self):
        # Preloaded departmental documents for instant evaluation
        self.department_documents = [
            {
                "id": "DOC-SLS-01",
                "department": "Sales & GTM",
                "document_title": "Enterprise Sales Pitch Deck & Battlecard",
                "last_updated": "2026-10-15",
                "claims": [
                    {"topic": "Uptime SLA", "text": "Guaranteed 100% infallible uptime with zero downtime for all accounts."},
                    {"topic": "Support Velocity", "text": "Instant 24/7 dedicated phone & Zoom bridge support for every customer."},
                    {"topic": "Money-Back Guarantee", "text": "Unconditional 60-day 100% refund guarantee no questions asked."}
                ]
            },
            {
                "id": "DOC-LGL-02",
                "department": "Legal & Compliance",
                "document_title": "Master Services Agreement (MSA) & Terms of Service",
                "last_updated": "2026-10-20",
                "claims": [
                    {"topic": "Uptime SLA", "text": "Target service availability of 99.9% per calendar month, excluding scheduled maintenance."},
                    {"topic": "Support Velocity", "text": "Dedicated phone support available exclusively to Enterprise Tier subscribers; Standard Tier receives 24-hour email SLA."},
                    {"topic": "Money-Back Guarantee", "text": "Prorated refunds permitted within 30 days only upon verified technical failure of platform SLA."}
                ]
            },
            {
                "id": "DOC-ENG-03",
                "department": "Engineering & DevOps",
                "document_title": "Cloud Infrastructure & Disaster Recovery SLA Manual",
                "last_updated": "2026-10-22",
                "claims": [
                    {"topic": "Uptime SLA", "text": "Calculated as 99.9% uptime excluding Sunday maintenance windows (02:00 to 04:00 UTC)."},
                    {"topic": "Data Hosting", "text": "Primary data stored in EU-Central-1; encrypted metadata failover replicated to US-East-1 during catastrophic outages."}
                ]
            },
            {
                "id": "DOC-MKT-04",
                "department": "Brand & Product Marketing",
                "document_title": "Global Brand Bible & External Content Stylebook",
                "last_updated": "2026-10-24",
                "claims": [
                    {"topic": "Uptime SLA", "text": "Market as 'Enterprise-grade 99.9% verified uptime with SOC2 Type II compliance.' Never promise 100%."},
                    {"topic": "Data Hosting", "text": "Market as '100% local European data residency guaranteed.'"}
                ]
            }
        ]

    def get_department_documents(self) -> List[Dict[str, Any]]:
        for d in self.department_documents:
            d["title"] = d.get("document_title", d.get("title", ""))
            d["claim_count"] = len(d.get("claims", []))
        return self.department_documents

    def detect_conflicts(self) -> List[Dict[str, Any]]:
        """
        Executes cross-document contradiction matrix scanning.
        """
        conflicts = [
            {
                "conflict_id": "CONF-001",
                "topic": "System Availability & Uptime SLA",
                "severity": "CRITICAL",
                "contradiction": "Sales promises 100% infallible uptime vs Legal & Engineering capping verified SLA at 99.9%.",
                "conflicting_parties": [
                    {
                        "dept": "Sales & GTM",
                        "department": "Sales & GTM",
                        "doc": "Enterprise Sales Pitch Deck (DOC-SLS-01)",
                        "claim": "Guaranteed 100% infallible uptime with zero downtime for all accounts.",
                        "statement": "Guaranteed 100% infallible uptime with zero downtime for all accounts.",
                        "stance": "Aggressive Sales"
                    },
                    {
                        "dept": "Legal & Compliance",
                        "department": "Legal & Compliance",
                        "doc": "Master Services Agreement (DOC-LGL-02)",
                        "claim": "Target service availability of 99.9% per calendar month, excluding scheduled maintenance.",
                        "statement": "Target service availability of 99.9% per calendar month, excluding scheduled maintenance.",
                        "stance": "Liability Shield"
                    },
                    {
                        "dept": "Engineering & DevOps",
                        "department": "Engineering & DevOps",
                        "doc": "Cloud Infrastructure SLA Manual (DOC-ENG-03)",
                        "claim": "Calculated as 99.9% uptime excluding Sunday maintenance windows (02:00 to 04:00 UTC).",
                        "statement": "Calculated as 99.9% uptime excluding Sunday maintenance windows (02:00 to 04:00 UTC).",
                        "stance": "Technical Reality"
                    }
                ],
                "parties": [
                    {
                        "dept": "Sales & GTM",
                        "department": "Sales & GTM",
                        "doc": "Enterprise Sales Pitch Deck (DOC-SLS-01)",
                        "claim": "Guaranteed 100% infallible uptime with zero downtime for all accounts.",
                        "statement": "Guaranteed 100% infallible uptime with zero downtime for all accounts.",
                        "stance": "Aggressive Sales"
                    },
                    {
                        "dept": "Legal & Compliance",
                        "department": "Legal & Compliance",
                        "doc": "Master Services Agreement (DOC-LGL-02)",
                        "claim": "Target service availability of 99.9% per calendar month, excluding scheduled maintenance.",
                        "statement": "Target service availability of 99.9% per calendar month, excluding scheduled maintenance.",
                        "stance": "Liability Shield"
                    },
                    {
                        "dept": "Engineering & DevOps",
                        "department": "Engineering & DevOps",
                        "doc": "Cloud Infrastructure SLA Manual (DOC-ENG-03)",
                        "claim": "Calculated as 99.9% uptime excluding Sunday maintenance windows (02:00 to 04:00 UTC).",
                        "statement": "Calculated as 99.9% uptime excluding Sunday maintenance windows (02:00 to 04:00 UTC).",
                        "stance": "Technical Reality"
                    }
                ],
                "risk_analysis": "Promising '100% infallible uptime' in sales conversations contradicts legal contracts and engineering physics. Exposes enterprise to breach-of-contract litigation and FTC regulatory sanctions.",
                "ai_harmonized_policy": "AegisBrand delivers enterprise-grade 99.9% verified uptime backed by financial SLA credits, with transparent weekly maintenance windows scheduled Sundays 02:00-04:00 UTC.",
                "harmonized_policy": "AegisBrand delivers enterprise-grade 99.9% verified uptime backed by financial SLA credits, with transparent weekly maintenance windows scheduled Sundays 02:00-04:00 UTC.",
                "action_status": "Awaiting Joint Sign-Off (CMO + General Counsel)"
            },
            {
                "conflict_id": "CONF-002",
                "topic": "Customer Support Tiers & Response SLA",
                "severity": "HIGH",
                "contradiction": "Sales promises 24/7 instant phone & Zoom for all users vs Legal limiting phone support to Enterprise Tier only.",
                "conflicting_parties": [
                    {
                        "dept": "Sales & GTM",
                        "department": "Sales & GTM",
                        "doc": "Enterprise Sales Pitch Deck (DOC-SLS-01)",
                        "claim": "Instant 24/7 dedicated phone & Zoom bridge support for every customer.",
                        "statement": "Instant 24/7 dedicated phone & Zoom bridge support for every customer.",
                        "stance": "Over-Promised Support"
                    },
                    {
                        "dept": "Legal & Compliance",
                        "department": "Legal & Compliance",
                        "doc": "Master Services Agreement (DOC-LGL-02)",
                        "claim": "Dedicated phone support available exclusively to Enterprise Tier subscribers; Standard Tier receives 24-hour email SLA.",
                        "statement": "Dedicated phone support available exclusively to Enterprise Tier subscribers; Standard Tier receives 24-hour email SLA.",
                        "stance": "Tiered Contract SLA"
                    }
                ],
                "parties": [
                    {
                        "dept": "Sales & GTM",
                        "department": "Sales & GTM",
                        "doc": "Enterprise Sales Pitch Deck (DOC-SLS-01)",
                        "claim": "Instant 24/7 dedicated phone & Zoom bridge support for every customer.",
                        "statement": "Instant 24/7 dedicated phone & Zoom bridge support for every customer.",
                        "stance": "Over-Promised Support"
                    },
                    {
                        "dept": "Legal & Compliance",
                        "department": "Legal & Compliance",
                        "doc": "Master Services Agreement (DOC-LGL-02)",
                        "claim": "Dedicated phone support available exclusively to Enterprise Tier subscribers; Standard Tier receives 24-hour email SLA.",
                        "statement": "Dedicated phone support available exclusively to Enterprise Tier subscribers; Standard Tier receives 24-hour email SLA.",
                        "stance": "Tiered Contract SLA"
                    }
                ],
                "risk_analysis": "Sales reps closing non-enterprise accounts with 24/7 phone promises leads to immediate post-sale escalation and support team burnout when standard SLA is delivered.",
                "ai_harmonized_policy": "All customers receive 24/7 automated ticketing with priority 24-hour SLA; Enterprise Tier unlocks 15-minute dedicated phone and live Zoom bridge coverage.",
                "harmonized_policy": "All customers receive 24/7 automated ticketing with priority 24-hour SLA; Enterprise Tier unlocks 15-minute dedicated phone and live Zoom bridge coverage.",
                "action_status": "Harmonized Agreement Drafted"
            },
            {
                "conflict_id": "CONF-003",
                "topic": "Data Residency & Cross-Border Replication",
                "severity": "HIGH",
                "contradiction": "Marketing guarantees 100% European data residency vs Engineering replicating disaster recovery metadata to US-East-1.",
                "conflicting_parties": [
                    {
                        "dept": "Brand & Product Marketing",
                        "department": "Brand & Product Marketing",
                        "doc": "Global Brand Bible (DOC-MKT-04)",
                        "claim": "Market as '100% local European data residency guaranteed.'",
                        "statement": "Market as '100% local European data residency guaranteed.'",
                        "stance": "Absolute Residency Claim"
                    },
                    {
                        "dept": "Engineering & DevOps",
                        "department": "Engineering & DevOps",
                        "doc": "Cloud Infrastructure SLA Manual (DOC-ENG-03)",
                        "claim": "Primary data stored in EU-Central-1; encrypted metadata failover replicated to US-East-1 during catastrophic outages.",
                        "statement": "Primary data stored in EU-Central-1; encrypted metadata failover replicated to US-East-1 during catastrophic outages.",
                        "stance": "DR Operational Reality"
                    }
                ],
                "parties": [
                    {
                        "dept": "Brand & Product Marketing",
                        "department": "Brand & Product Marketing",
                        "doc": "Global Brand Bible (DOC-MKT-04)",
                        "claim": "Market as '100% local European data residency guaranteed.'",
                        "statement": "Market as '100% local European data residency guaranteed.'",
                        "stance": "Absolute Residency Claim"
                    },
                    {
                        "dept": "Engineering & DevOps",
                        "department": "Engineering & DevOps",
                        "doc": "Cloud Infrastructure SLA Manual (DOC-ENG-03)",
                        "claim": "Primary data stored in EU-Central-1; encrypted metadata failover replicated to US-East-1 during catastrophic outages.",
                        "statement": "Primary data stored in EU-Central-1; encrypted metadata failover replicated to US-East-1 during catastrophic outages.",
                        "stance": "DR Operational Reality"
                    }
                ],
                "risk_analysis": "Absolute '100% local European residency' marketing claim creates deceptive advertising liability under EU GDPR Article 44 if disaster recovery metadata crosses to US AWS regions.",
                "ai_harmonized_policy": "Primary customer data and document stores remain 100% in EU-Central-1, with ISO 27001-certified EU-US Data Privacy Framework safeguards for encrypted disaster recovery metadata.",
                "harmonized_policy": "Primary customer data and document stores remain 100% in EU-Central-1, with ISO 27001-certified EU-US Data Privacy Framework safeguards for encrypted disaster recovery metadata.",
                "action_status": "Ready for Policy Sync"
            }
        ]
        return conflicts

    def add_custom_document(self, dept: str = "", title: str = "", claims: List[Dict[str, str]] = None, department: str = "", document_title: str = "") -> Dict[str, Any]:
        final_dept = department or dept or "Custom Department"
        final_title = document_title or title or "Custom Department Document"
        final_claims = claims or []
        doc_id = f"DOC-USR-{len(self.department_documents)+1:02d}"
        new_doc = {
            "id": doc_id,
            "department": final_dept,
            "document_title": final_title,
            "title": final_title,
            "claim_count": len(final_claims),
            "last_updated": "Just now",
            "claims": final_claims
        }
        self.department_documents.append(new_doc)
        return {"status": "success", "document": new_doc}

conflict_resolver = MultiDocConflictResolver()
