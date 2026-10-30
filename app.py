import os
import sys
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# Ensure parent directory is in sys.path
CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_FILE_DIR not in sys.path:
    sys.path.insert(0, CURRENT_FILE_DIR)

from core.engine import engine
from core.knowledge_base import kb
from core.workflow import workflow
from core.ambiguity_analyzer import analytics
from core.c2pa_engine import c2pa_engine
from core.conflict_resolver import conflict_resolver

def get_base_dir():
    candidates = [
        CURRENT_FILE_DIR,
        os.path.dirname(CURRENT_FILE_DIR),
        os.getcwd()
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, "templates", "index.html")):
            return c
    return CURRENT_FILE_DIR

BASE_DIR = get_base_dir()

app = FastAPI(
    title="AegisBrand AI — Pre-Publication Brand Governance Platform",
    description="Intelligent Brand Governance & Claim Verification Engine (Inkloom AI Problem Statement — Round 3)",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & Template mounting (Safe for Serverless)
static_dir = os.path.join(BASE_DIR, "static")
if os.path.exists(static_dir):
    try:
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    except Exception as e:
        print(f"Notice: Static mount skipped: {e}")

# Request Models
class AuditRequest(BaseModel):
    text: str
    visual_data: Optional[Dict[str, Any]] = None

class NewSubmissionRequest(BaseModel):
    title: str
    creator: str
    content: str
    compliance_score: int

class ApprovalRequest(BaseModel):
    manager_name: str
    notes: Optional[str] = ""

class ChangesRequest(BaseModel):
    manager_name: str
    feedback: str

class CommentRequest(BaseModel):
    author: str
    role: str
    text: str

class ProhibitedTermRequest(BaseModel):
    term: str
    reason: str
    guideline_ref: str
    suggestion: str

class VerifiedClaimRequest(BaseModel):
    claim_id: str
    topic: str
    statement: str
    source: str
    keywords: List[str]

class C2PAVerifyRequest(BaseModel):
    manifest: Dict[str, Any]
    content: str

class CustomDocRequest(BaseModel):
    department: str
    document_title: str
    claims: List[Dict[str, str]]

# -------------------------------------------------------------
# FRONTEND ROUTES
# -------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
def read_root():
    template_paths = [
        os.path.join(BASE_DIR, "templates", "index.html"),
        os.path.join(CURRENT_FILE_DIR, "templates", "index.html"),
        os.path.join(os.getcwd(), "templates", "index.html")
    ]
    for p in template_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>AegisBrand AI Backend Running</h1>")

@app.get("/static/css/style.css")
def get_css():
    css_paths = [
        os.path.join(BASE_DIR, "static", "css", "style.css"),
        os.path.join(CURRENT_FILE_DIR, "static", "css", "style.css"),
        os.path.join(os.getcwd(), "static", "css", "style.css")
    ]
    for p in css_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                return Response(content=f.read(), media_type="text/css")
    return Response(content="", media_type="text/css")

@app.get("/static/js/app.js")
def get_js():
    js_paths = [
        os.path.join(BASE_DIR, "static", "js", "app.js"),
        os.path.join(CURRENT_FILE_DIR, "static", "js", "app.js"),
        os.path.join(os.getcwd(), "static", "js", "app.js")
    ]
    for p in js_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                return Response(content=f.read(), media_type="application/javascript")
    return Response(content="", media_type="application/javascript")

# -------------------------------------------------------------
# CORE AUDIT API
# -------------------------------------------------------------
@app.post("/api/audit")
def audit_content(req: AuditRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty.")
    result = engine.inspect_content(text=req.text, visual_data=req.visual_data)
    return result

# -------------------------------------------------------------
# KNOWLEDGE BASE & GUIDELINES API
# -------------------------------------------------------------
@app.get("/api/guidelines")
def get_guidelines():
    return {
        "brand_bible": kb.get_brand_bible(),
        "verified_claims": kb.get_verified_claims()
    }

@app.post("/api/guidelines/term")
def add_term(req: ProhibitedTermRequest):
    kb.add_prohibited_term(req.term, req.reason, req.guideline_ref, req.suggestion)
    return {"status": "success", "message": f"Added '{req.term}' to prohibited lexicon."}

@app.post("/api/guidelines/claim")
def add_claim(req: VerifiedClaimRequest):
    kb.add_verified_claim(req.claim_id, req.topic, req.statement, req.source, req.keywords)
    return {"status": "success", "message": f"Added verified claim {req.claim_id}."}

@app.get("/api/samples")
def get_samples():
    return kb.get_sample_campaigns()

# -------------------------------------------------------------
# WORKFLOW & REVIEW API
# -------------------------------------------------------------
@app.get("/api/submissions")
def get_submissions():
    return workflow.get_all_submissions()

@app.get("/api/submissions/{sub_id}")
def get_single_submission(sub_id: str):
    sub = workflow.get_submission(sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return sub

@app.post("/api/submissions")
def create_submission(req: NewSubmissionRequest):
    return workflow.create_submission(
        title=req.title,
        creator=req.creator,
        content=req.content,
        compliance_score=req.compliance_score
    )

@app.post("/api/submissions/{sub_id}/approve")
def approve_submission(sub_id: str, req: ApprovalRequest):
    sub = workflow.approve_submission(sub_id, req.manager_name, req.notes)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return sub

@app.post("/api/submissions/{sub_id}/request-changes")
def request_changes(sub_id: str, req: ChangesRequest):
    sub = workflow.request_changes(sub_id, req.manager_name, req.feedback)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return sub

@app.post("/api/submissions/{sub_id}/comment")
def add_comment(sub_id: str, req: CommentRequest):
    workflow.add_comment(sub_id, req.author, req.role, req.text)
    return {"status": "success"}

# -------------------------------------------------------------
# ROUND 3 IMPROVEMENT 2: C2PA CRYPTOGRAPHIC PROVENANCE API
# -------------------------------------------------------------
@app.get("/api/c2pa/manifest/{sub_id}")
def get_c2pa_manifest(sub_id: str):
    sub = workflow.get_submission(sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")
    manifest = c2pa_engine.generate_manifest(
        content=sub.get("current_content", ""),
        title=sub.get("title", ""),
        author=sub.get("creator", "Content Creator"),
        manager_name=sub.get("approved_by") or "Marcus Vance (VP Brand)",
        compliance_score=sub.get("compliance_score", 95)
    )
    return manifest

@app.post("/api/c2pa/verify")
def verify_c2pa_content(req: C2PAVerifyRequest):
    return c2pa_engine.verify_manifest(req.manifest, req.content)

# -------------------------------------------------------------
# ROUND 3 IMPROVEMENT 3: AUTONOMOUS CONFLICT RESOLVER API
# -------------------------------------------------------------
@app.get("/api/conflicts")
def get_policy_conflicts():
    return {
        "documents": conflict_resolver.get_department_documents(),
        "conflicts": conflict_resolver.detect_conflicts()
    }

@app.post("/api/conflicts/document")
def add_conflict_document(req: CustomDocRequest):
    return conflict_resolver.add_custom_document(req.department, req.document_title, req.claims)

# -------------------------------------------------------------
# GOVERNANCE & AMBIGUITY ANALYTICS API
# -------------------------------------------------------------
@app.get("/api/analytics")
def get_analytics():
    return analytics.get_analytics_summary()

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*70)
    print("AegisBrand AI - Pre-Publication Brand Governance Platform Running!")
    print("Access in browser: http://localhost:8000")
    print("="*70 + "\n")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
