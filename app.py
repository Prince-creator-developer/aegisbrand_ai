import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from core.engine import engine
from core.knowledge_base import kb
from core.workflow import workflow
from core.ambiguity_analyzer import analytics

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(
    title="AegisBrand AI — Pre-Publication Brand Governance Platform",
    description="Intelligent Brand Governance & Claim Verification Engine (Inkloom AI Problem Statement)",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & Template mounting
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

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

# -------------------------------------------------------------
# FRONTEND ROUTE
# -------------------------------------------------------------
@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

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
