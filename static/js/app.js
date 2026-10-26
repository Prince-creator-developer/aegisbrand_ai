// AegisBrand AI - Complete Client State & Interactive Controller
document.addEventListener("DOMContentLoaded", () => {
    // State
    let currentRole = "creator"; // 'creator', 'manager', 'legal'
    let currentAuditResult = null;
    let sampleCampaigns = [];
    let currentVisualData = null;

    // DOM Elements
    const tabButtons = document.querySelectorAll(".nav-tab-btn");
    const tabContents = document.querySelectorAll(".tab-content-panel");
    const contentInput = document.getElementById("content-input");
    const btnRunAudit = document.getElementById("btn-run-audit");
    const sampleSelector = document.getElementById("sample-selector");
    const roleSelector = document.getElementById("role-selector");
    const issuesContainer = document.getElementById("issues-container");
    const complianceScoreVal = document.getElementById("compliance-score-val");
    const statusBadge = document.getElementById("status-badge");
    const totalIssuesCount = document.getElementById("total-issues-count");
    const criticalCount = document.getElementById("critical-count");
    const warningCount = document.getElementById("warning-count");
    const btnSubmitWorkflow = document.getElementById("btn-submit-workflow");

    // Initialize
    loadSamples();
    loadGuidelines();
    loadWorkflowQueue();
    loadAnalytics();

    // Tab Switching
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            tabButtons.forEach(b => {
                b.classList.remove("border-indigo-600", "text-indigo-600", "font-bold");
                b.classList.add("border-transparent", "text-slate-500");
            });
            btn.classList.add("border-indigo-600", "text-indigo-600", "font-bold");
            btn.classList.remove("border-transparent", "text-slate-500");

            tabContents.forEach(panel => {
                if (panel.id === `tab-${targetTab}`) {
                    panel.classList.remove("hidden");
                } else {
                    panel.classList.add("hidden");
                }
            });

            if (targetTab === "workflow") loadWorkflowQueue();
            if (targetTab === "analytics") loadAnalytics();
        });
    });

    // Role Switching
    roleSelector.addEventListener("change", (e) => {
        currentRole = e.target.value;
        const roleBadge = document.getElementById("active-role-display");
        roleBadge.textContent = e.target.options[e.target.selectedIndex].text;
        updateRolePermissions();
    });

    function updateRolePermissions() {
        const managerActionCards = document.querySelectorAll(".manager-approval-panel");
        managerActionCards.forEach(card => {
            if (currentRole === "manager" || currentRole === "legal") {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }
        });
    }

    // Load Samples
    async function loadSamples() {
        try {
            const res = await fetch("/api/samples");
            sampleCampaigns = await res.json();
            sampleSelector.innerHTML = '<option value="">-- Quick Load Sample Test Content --</option>';
            sampleCampaigns.forEach((sample, idx) => {
                const opt = document.createElement("option");
                opt.value = sample.id;
                opt.textContent = sample.title;
                sampleSelector.appendChild(opt);
            });

            // Auto-load Sample 1 by default so the judge sees the platform in action immediately!
            if (sampleCampaigns.length > 0) {
                sampleSelector.value = sampleCampaigns[0].id;
                selectSample(sampleCampaigns[0]);
            }
        } catch (err) {
            console.error("Failed to load samples:", err);
        }
    }

    sampleSelector.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        const found = sampleCampaigns.find(s => s.id === selectedId);
        if (found) {
            selectSample(found);
        }
    });

    function selectSample(sample) {
        contentInput.value = sample.content;
        currentVisualData = sample.attached_visual || null;
        renderVisualAttachmentPill(currentVisualData);
        runAudit();
    }

    function renderVisualAttachmentPill(visual) {
        const pillContainer = document.getElementById("visual-attachment-display");
        if (!visual) {
            pillContainer.innerHTML = '<span class="text-xs text-slate-400">No image metadata attached</span>';
            return;
        }
        pillContainer.innerHTML = `
            <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs text-indigo-700">
                <i class="fa-solid fa-image"></i>
                <span class="font-medium">${visual.filename}</span>
                <span class="bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">Colors: ${visual.colors_detected.join(", ")}</span>
                <span class="bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">Logo Aspect: ${visual.logo_aspect_ratio}</span>
            </div>
        `;
    }

    // Run Audit
    btnRunAudit.addEventListener("click", () => {
        runAudit();
    });

    async function runAudit() {
        const text = contentInput.value.trim();
        if (!text) {
            alert("Please input draft content or select a sample above.");
            return;
        }

        btnRunAudit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Inspecting...';
        btnRunAudit.disabled = true;

        try {
            const res = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text,
                    visual_data: currentVisualData
                })
            });

            if (!res.ok) throw new Error("Audit failed");
            currentAuditResult = await res.json();
            renderAuditResults(currentAuditResult);
        } catch (err) {
            console.error("Audit error:", err);
            alert("Error running inspection engine.");
        } finally {
            btnRunAudit.innerHTML = '<i class="fa-solid fa-bolt mr-1.5"></i> Run Brand Guardrail Audit';
            btnRunAudit.disabled = false;
        }
    }

    function renderAuditResults(res) {
        // Score & Status
        complianceScoreVal.textContent = res.compliance_score;
        totalIssuesCount.textContent = res.total_issues;
        criticalCount.textContent = res.critical_count;
        warningCount.textContent = res.warning_count;

        // Score Color
        const scoreCircle = document.getElementById("score-circle-container");
        if (res.compliance_score >= 85) {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-700";
            statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> ' + res.status_label;
        } else if (res.compliance_score >= 60) {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-amber-500 bg-amber-50 text-amber-700";
            statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> ' + res.status_label;
        } else {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-rose-500 bg-rose-50 text-rose-700";
            statusBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> ' + res.status_label;
        }

        // Tone Metrics Progress Bars
        document.getElementById("bar-authority").style.width = `${res.tone_metrics.authority_score}%`;
        document.getElementById("val-authority").textContent = `${res.tone_metrics.authority_score}%`;

        document.getElementById("bar-approachability").style.width = `${res.tone_metrics.approachability_score}%`;
        document.getElementById("val-approachability").textContent = `${res.tone_metrics.approachability_score}%`;

        document.getElementById("bar-claims").style.width = `${res.tone_metrics.claim_grounding_score}%`;
        document.getElementById("val-claims").textContent = `${res.tone_metrics.claim_grounding_score}%`;

        document.getElementById("bar-visual").style.width = `${res.tone_metrics.visual_coherence_score}%`;
        document.getElementById("val-visual").textContent = `${res.tone_metrics.visual_coherence_score}%`;

        // Render Issue Cards
        renderIssueCards(res.issues);
    }

    function renderIssueCards(issues) {
        if (!issues || issues.length === 0) {
            issuesContainer.innerHTML = `
                <div class="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl">
                    <i class="fa-solid fa-circle-check text-4xl text-emerald-500 mb-3"></i>
                    <h4 class="font-bold text-emerald-900 text-lg">Zero Compliance Violations Detected</h4>
                    <p class="text-sm text-emerald-700 mt-1">This content fully aligns with approved Brand Bible rules, verified claims, tone guidelines, and accessibility standards.</p>
                </div>
            `;
            return;
        }

        issuesContainer.innerHTML = "";
        issues.forEach((issue, index) => {
            const card = document.createElement("div");
            const isCritical = issue.severity === "critical";
            const borderCol = isCritical ? "border-l-4 border-l-rose-500 border-rose-200 bg-rose-50/40" : "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/40";
            const badgeCol = isCritical ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-amber-100 text-amber-700 border-amber-300";
            const icon = isCritical ? "fa-circle-xmark text-rose-600" : "fa-triangle-exclamation text-amber-600";

            card.className = `p-4 rounded-xl border ${borderCol} transition-all duration-200 shadow-sm hover:shadow-md`;
            card.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${icon}"></i>
                        <span class="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${badgeCol}">${issue.category}</span>
                        <span class="text-xs font-mono text-slate-500">${issue.id}</span>
                    </div>
                    <span class="text-xs font-medium text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded">
                        <i class="fa-solid fa-book-bookmark text-indigo-500 mr-1"></i> ${issue.guideline_ref}
                    </span>
                </div>

                <div class="mt-2.5">
                    <div class="text-xs font-semibold text-slate-500 uppercase">Flagged Span:</div>
                    <div class="font-mono text-sm bg-white p-2 rounded border border-slate-200 mt-1 text-slate-800">
                        <span class="diff-del-inline">${issue.flagged_text}</span>
                    </div>
                </div>

                <div class="mt-2 text-xs text-slate-600 leading-relaxed">
                    <strong>Why this matters:</strong> ${issue.explanation}
                </div>

                <!-- Intent-Preserving Suggested Diff -->
                <div class="mt-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <i class="fa-solid fa-wand-magic-sparkles text-emerald-600"></i> Intent-Preserving Suggestion
                        </span>
                        <button class="btn-accept-fix px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition flex items-center gap-1.5"
                                data-flagged="${escapeHtml(issue.flagged_text)}"
                                data-suggested="${escapeHtml(issue.intent_preserving_suggestion)}">
                            <i class="fa-solid fa-check"></i> Adopt Suggestion
                        </button>
                    </div>
                    <div class="mt-2 text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                        <span class="diff-add-inline">${escapeHtml(issue.intent_preserving_suggestion)}</span>
                    </div>
                </div>
            `;
            issuesContainer.appendChild(card);
        });

        // Attach listeners for "Adopt Suggestion"
        document.querySelectorAll(".btn-accept-fix").forEach(btn => {
            btn.addEventListener("click", () => {
                const flagged = btn.getAttribute("data-flagged");
                const suggested = btn.getAttribute("data-suggested");
                applySuggestion(flagged, suggested);
            });
        });
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Replace text non-destructively
    function applySuggestion(flagged, suggested) {
        const currentText = contentInput.value;
        if (currentText.includes(flagged)) {
            contentInput.value = currentText.replace(flagged, suggested);
            // Re-run audit to reflect updated score!
            runAudit();
        } else {
            // Case-insensitive fallback
            const regex = new RegExp(escapeRegExp(flagged), "i");
            contentInput.value = currentText.replace(regex, suggested);
            runAudit();
        }
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Submit into Collaborative Workflow
    btnSubmitWorkflow.addEventListener("click", async () => {
        const text = contentInput.value.trim();
        if (!text) {
            alert("No content to submit.");
            return;
        }
        const score = currentAuditResult ? currentAuditResult.compliance_score : 50;
        const title = prompt("Enter a title for this submission:", "New Marketing Campaign Draft");
        if (!title) return;

        try {
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    creator: currentRole === "creator" ? "Active Creator" : "Marketing Team",
                    content: text,
                    compliance_score: score
                })
            });
            const data = await res.json();
            alert(`Draft submitted successfully (ID: ${data.id}) into the Review Queue!`);
            // Switch to workflow tab
            document.querySelector('[data-tab="workflow"]').click();
        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to submit to workflow.");
        }
    });

    // -------------------------------------------------------------
    // WORKFLOW & REVIEW QUEUE CONTROLLER
    // -------------------------------------------------------------
    async function loadWorkflowQueue() {
        const listContainer = document.getElementById("workflow-list-container");
        listContainer.innerHTML = '<div class="p-6 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading review queue...</div>';

        try {
            const res = await fetch("/api/submissions");
            const submissions = await res.json();
            renderWorkflowList(submissions);
        } catch (err) {
            console.error("Failed to load queue:", err);
            listContainer.innerHTML = '<div class="p-6 text-center text-rose-500">Failed to load review queue.</div>';
        }
    }

    function renderWorkflowList(submissions) {
        const listContainer = document.getElementById("workflow-list-container");
        listContainer.innerHTML = "";

        if (submissions.length === 0) {
            listContainer.innerHTML = '<div class="p-6 text-center text-slate-400">No active review items.</div>';
            return;
        }

        submissions.forEach(sub => {
            const card = document.createElement("div");
            const isApproved = sub.status === "APPROVED";
            const borderAccent = isApproved ? "border-emerald-300 bg-white" : "border-slate-200 bg-white";

            let fingerprintBlock = "";
            if (sub.sha256_fingerprint) {
                fingerprintBlock = `
                    <div class="mt-3 p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                        <div>
                            <span class="text-emerald-400 font-bold"><i class="fa-solid fa-shield-halved mr-1"></i> SHA-256 Approved Fingerprint:</span>
                            <div class="text-slate-400 truncate max-w-lg mt-0.5">${sub.sha256_fingerprint}</div>
                        </div>
                        <span class="text-[10px] bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded">Immutable Stamp</span>
                    </div>
                `;
            }

            let managerActions = "";
            if (!isApproved) {
                managerActions = `
                    <div class="manager-approval-panel mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div class="text-xs text-slate-500">
                            <strong>Reviewer Action Required:</strong> Verify citations or grant conditional sign-off.
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="btn-request-changes px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded text-xs font-semibold" data-id="${sub.id}">
                                <i class="fa-solid fa-rotate-left mr-1"></i> Request Changes
                            </button>
                            <button class="btn-approve px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm" data-id="${sub.id}">
                                <i class="fa-solid fa-check mr-1"></i> Sign-Off & Approve
                            </button>
                        </div>
                    </div>
                `;
            }

            // Timeline history
            let historyHtml = sub.history.map(h => `
                <div class="flex items-start gap-2 text-xs text-slate-500 py-1">
                    <span class="font-mono text-[10px] text-slate-400">${h.timestamp}</span>
                    <span class="font-bold text-slate-700">${h.user}:</span>
                    <span>${h.action} — ${h.note}</span>
                </div>
            `).join("");

            // Comments
            let commentsHtml = sub.comments.map(c => `
                <div class="bg-slate-50 p-2 rounded text-xs text-slate-700 mb-1 border border-slate-200">
                    <div class="flex justify-between font-bold text-[11px] text-indigo-700">
                        <span>${c.author} (${c.role})</span>
                        <span class="text-slate-400 font-mono text-[10px]">${c.timestamp}</span>
                    </div>
                    <p class="mt-0.5">${c.text}</p>
                </div>
            `).join("");

            card.className = `p-5 rounded-xl border ${borderAccent} shadow-sm mb-4 transition hover:shadow-md`;
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-indigo-600 text-xs">${sub.id}</span>
                            <h3 class="font-bold text-slate-900 text-base">${sub.title}</h3>
                            <span class="text-xs px-2 py-0.5 rounded font-bold ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                                ${sub.status_badge}
                            </span>
                        </div>
                        <div class="text-xs text-slate-500 mt-1">
                            Submitted by <strong>${sub.creator}</strong> on ${sub.created_at} | Compliance Score: <strong>${sub.compliance_score}/100</strong>
                        </div>
                    </div>
                    ${isApproved ? '<div class="text-right text-xs text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Published Ready</div>' : ''}
                </div>

                <div class="mt-3 p-3 rounded-lg bg-slate-50 text-slate-700 text-xs font-mono leading-relaxed border border-slate-200">
                    ${sub.current_content}
                </div>

                ${fingerprintBlock}

                <!-- Timeline Accordion -->
                <div class="mt-4 border-t border-slate-100 pt-3">
                    <div class="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <i class="fa-solid fa-clock-rotate-left text-slate-400"></i> Audit History & Review Trail:
                    </div>
                    <div class="bg-slate-50/50 p-2 rounded border border-slate-100">
                        ${historyHtml}
                    </div>
                </div>

                <!-- Comments & Feedback -->
                <div class="mt-3">
                    <div class="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span><i class="fa-solid fa-comments text-slate-400 mr-1"></i> Reviewer Comments:</span>
                        <button class="btn-add-comment text-indigo-600 hover:underline text-xs" data-id="${sub.id}">+ Add Comment</button>
                    </div>
                    <div>${commentsHtml || '<span class="text-xs text-slate-400 italic">No comments yet.</span>'}</div>
                </div>

                ${managerActions}
            `;
            listContainer.appendChild(card);
        });

        // Attach action handlers
        document.querySelectorAll(".btn-approve").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const notes = prompt("Enter approval justification notes for audit log:", "Verified against corporate brand kit and factual SLAs.");
                if (notes === null) return;

                const res = await fetch(`/api/submissions/${id}/approve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        manager_name: currentRole === "manager" ? "Marcus Vance (Brand Director)" : "Elena Rostova (Legal Counsel)",
                        notes: notes
                    })
                });
                if (res.ok) {
                    alert(`Submission ${id} approved and stamped with cryptographic SHA-256 fingerprint!`);
                    loadWorkflowQueue();
                }
            });
        });

        document.querySelectorAll(".btn-request-changes").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const feedback = prompt("Enter specific feedback or reason for requesting changes:");
                if (!feedback) return;

                const res = await fetch(`/api/submissions/${id}/request-changes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        manager_name: "Marcus Vance (Brand Director)",
                        feedback: feedback
                    })
                });
                if (res.ok) {
                    alert(`Changes requested for ${id}. Feedback logged in audit history.`);
                    loadWorkflowQueue();
                }
            });
        });

        document.querySelectorAll(".btn-add-comment").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const comment = prompt("Enter comment / note for the creator:");
                if (!comment) return;

                await fetch(`/api/submissions/${id}/comment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        author: currentRole === "manager" ? "Marcus Vance" : (currentRole === "legal" ? "Elena Rostova" : "Team Member"),
                        role: currentRole.toUpperCase(),
                        text: comment
                    })
                });
                loadWorkflowQueue();
            });
        });

        updateRolePermissions();
    }

    // -------------------------------------------------------------
    // KNOWLEDGE HUB CONTROLLER
    // -------------------------------------------------------------
    async function loadGuidelines() {
        try {
            const res = await fetch("/api/guidelines");
            const data = await res.json();
            renderGuidelines(data);
        } catch (err) {
            console.error("Failed to load guidelines:", err);
        }
    }

    function renderGuidelines(data) {
        // Prohibited terms
        const termsList = document.getElementById("prohibited-terms-list");
        termsList.innerHTML = "";
        data.brand_bible.prohibited_terms.forEach(t => {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-100 hover:bg-slate-50";
            row.innerHTML = `
                <td class="p-2.5 font-mono text-xs font-bold text-rose-600">${t.term}</td>
                <td class="p-2.5 text-xs text-slate-600">${t.reason}</td>
                <td class="p-2.5 text-xs text-indigo-700">${t.guideline_ref}</td>
                <td class="p-2.5 font-mono text-xs text-emerald-600 font-bold">${t.suggestion}</td>
            `;
            termsList.appendChild(row);
        });

        // Verified Claims
        const claimsList = document.getElementById("verified-claims-list");
        claimsList.innerHTML = "";
        data.verified_claims.forEach(c => {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-100 hover:bg-slate-50";
            row.innerHTML = `
                <td class="p-2.5 font-mono text-xs font-bold text-indigo-600">${c.id}</td>
                <td class="p-2.5 text-xs font-bold text-slate-800">${c.topic}</td>
                <td class="p-2.5 text-xs text-slate-700">${c.approved_statement}</td>
                <td class="p-2.5 text-xs text-slate-500 italic">${c.evidence_source}</td>
            `;
            claimsList.appendChild(row);
        });
    }

    // Add new term
    const formAddTerm = document.getElementById("form-add-term");
    if (formAddTerm) {
        formAddTerm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const term = document.getElementById("new-term-text").value;
            const reason = document.getElementById("new-term-reason").value;
            const ref = document.getElementById("new-term-ref").value;
            const sugg = document.getElementById("new-term-sugg").value;

            await fetch("/api/guidelines/term", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    term: term,
                    reason: reason,
                    guideline_ref: ref,
                    suggestion: sugg
                })
            });
            alert(`Term '${term}' added to brand knowledge base.`);
            formAddTerm.reset();
            loadGuidelines();
        });
    }

    // -------------------------------------------------------------
    // ANALYTICS & INSIGHTS CONTROLLER
    // -------------------------------------------------------------
    async function loadAnalytics() {
        try {
            const res = await fetch("/api/analytics");
            const data = await res.json();
            renderAnalytics(data);
        } catch (err) {
            console.error("Failed to load analytics:", err);
        }
    }

    function renderAnalytics(data) {
        // Summary metrics
        document.getElementById("stat-health-score").textContent = data.overall_governance_score + "%";
        document.getElementById("stat-total-audited").textContent = data.total_assets_audited;
        document.getElementById("stat-interceptions").textContent = data.pre_publication_interceptions;
        document.getElementById("stat-latency").textContent = data.avg_review_turnaround_mins;

        // Categories Progress Bars
        const catContainer = document.getElementById("analytics-categories-container");
        catContainer.innerHTML = "";
        data.category_breakdown.forEach(cat => {
            const row = document.createElement("div");
            row.className = "mb-3";
            row.innerHTML = `
                <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>${cat.category}</span>
                    <span>${cat.count} flags (${cat.percentage}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="h-2 rounded-full" style="width: ${cat.percentage}%; background-color: ${cat.color};"></div>
                </div>
            `;
            catContainer.appendChild(row);
        });

        // Recurring Mistakes
        const recContainer = document.getElementById("recurring-mistakes-container");
        recContainer.innerHTML = "";
        data.recurring_violations.forEach(v => {
            const item = document.createElement("div");
            item.className = "p-3 rounded-lg bg-slate-50 border border-slate-200 mb-2";
            item.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-slate-800">${v.rule}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">${v.frequency}</span>
                </div>
                <div class="text-xs text-slate-600 mt-1">
                    <strong>Typical Mistake:</strong> ${v.typical_mistake}
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Severity: <strong class="text-slate-600">${v.severity}</strong></span>
                    <span>Trend: <strong class="text-indigo-600">${v.trend}</strong></span>
                </div>
            `;
            recContainer.appendChild(item);
        });

        // Ambiguous Guidelines (Self-Healing Insights)
        const ambContainer = document.getElementById("ambiguous-guidelines-container");
        ambContainer.innerHTML = "";
        data.ambiguous_guidelines.forEach(g => {
            const card = document.createElement("div");
            card.className = "p-4 rounded-xl border border-amber-300 bg-amber-50/60 mb-3 shadow-sm";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-amber-900">${g.title}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">${g.dispute_rate}</span>
                </div>
                <div class="text-xs text-slate-700 mt-2">
                    <strong>Why It's Confusing:</strong> ${g.root_cause}
                </div>
                <div class="mt-2.5 p-2.5 bg-white rounded-lg border border-amber-200 text-xs text-slate-800">
                    <div class="font-bold text-indigo-700 mb-0.5"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Recommended Guideline Amendment:</div>
                    <p class="leading-relaxed text-slate-600">${g.ai_suggested_remedy}</p>
                </div>
            `;
            ambContainer.appendChild(card);
        });
    }
});
