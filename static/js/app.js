// AegisBrand AI - Complete Client State & Interactive Controller
document.addEventListener("DOMContentLoaded", () => {
    // State
    let currentRole = "creator"; // 'creator', 'manager', 'legal'
    let currentAuditResult = null;
    let sampleCampaigns = [];
    let currentVisualData = null;
    let currentFilter = "all"; // 'all', 'critical', 'warning', 'claims', 'terminology', 'visual'

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
    const charWordCount = document.getElementById("char-word-count");
    const btnBulkAdopt = document.getElementById("btn-bulk-adopt");
    const filterPills = document.querySelectorAll(".filter-pill");
    const formatButtons = document.querySelectorAll(".format-btn");

    // Toast Notification System
    function showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        const icons = {
            success: "fa-circle-check text-emerald-400",
            error: "fa-circle-xmark text-rose-400",
            info: "fa-circle-info text-indigo-400"
        };
        toast.className = `toast-msg toast-${type}`;
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 20);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // Initialize Components
    loadSamples();
    loadGuidelines();
    loadWorkflowQueue();
    loadAnalytics();

    // Word & Character Counter
    contentInput.addEventListener("input", updateCounts);
    function updateCounts() {
        const text = contentInput.value.trim();
        const chars = text.length;
        const words = text ? text.split(/\s+/).length : 0;
        charWordCount.textContent = `${words} words | ${chars} characters`;
    }

    // Format Switcher
    formatButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            formatButtons.forEach(b => {
                b.className = "format-btn px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition";
            });
            btn.className = "format-btn px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 transition";
            showToast(`Content format set to: ${btn.textContent}`, "info");
        });
    });

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
            if (targetTab === "knowledge") loadGuidelines();
        });
    });

    // Role Switching
    roleSelector.addEventListener("change", (e) => {
        currentRole = e.target.value;
        const roleBadge = document.getElementById("active-role-display");
        roleBadge.textContent = e.target.options[e.target.selectedIndex].text;
        showToast(`Switched active perspective to: ${e.target.options[e.target.selectedIndex].text}`, "info");
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

    // Filter Pills Handling
    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => {
                p.className = "filter-pill px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition";
            });
            pill.className = "filter-pill px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold transition";
            currentFilter = pill.getAttribute("data-filter");
            if (currentAuditResult) {
                renderFilteredIssues(currentAuditResult.issues);
            }
        });
    });

    // Load Samples
    async function loadSamples() {
        try {
            const res = await fetch("/api/samples");
            sampleCampaigns = await res.json();
            sampleSelector.innerHTML = '<option value="">-- Quick Load Sample Test Content --</option>';
            sampleCampaigns.forEach((sample) => {
                const opt = document.createElement("option");
                opt.value = sample.id;
                opt.textContent = sample.title;
                sampleSelector.appendChild(opt);
            });

            // Auto-load Sample 1 by default so judges see findings immediately!
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
            showToast(`Loaded ${found.title}`, "info");
        }
    });

    function selectSample(sample) {
        contentInput.value = sample.content;
        currentVisualData = sample.attached_visual || null;
        updateCounts();
        renderVisualAttachmentCard(currentVisualData);
        runAudit();
    }

    function renderVisualAttachmentCard(visual) {
        const box = document.getElementById("visual-inspector-box");
        const statusPill = document.getElementById("visual-status-pill");
        const swatchesContainer = document.getElementById("visual-swatches-container");
        const aspectPill = document.getElementById("visual-aspect-pill");
        const filenameLabel = document.getElementById("visual-filename");

        if (!visual) {
            statusPill.textContent = "No Asset Attached";
            statusPill.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500";
            filenameLabel.textContent = "No image attached";
            swatchesContainer.innerHTML = '<span class="text-[10px] text-slate-400">N/A</span>';
            aspectPill.textContent = "Ratio: N/A";
            return;
        }

        filenameLabel.textContent = visual.filename;
        aspectPill.innerHTML = `Logo Ratio: <strong>${visual.logo_aspect_ratio}:1</strong>`;

        const isRatioValid = Math.abs(visual.logo_aspect_ratio - 1.0) <= 0.05;
        const hasDisallowedColor = visual.colors_detected.some(c => c.toUpperCase() === "#FF0055" || c.toUpperCase() === "#FFFF00");

        if (!isRatioValid || hasDisallowedColor) {
            statusPill.textContent = "Visual Policy Violations";
            statusPill.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300";
        } else {
            statusPill.textContent = "Palette Compliant";
            statusPill.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300";
        }

        swatchesContainer.innerHTML = "";
        visual.colors_detected.forEach(hex => {
            const swatch = document.createElement("span");
            swatch.className = "color-swatch-box cursor-pointer transition hover:scale-110";
            swatch.style.backgroundColor = hex;
            swatch.title = `Color: ${hex} (Click to copy)`;
            swatch.addEventListener("click", () => {
                navigator.clipboard.writeText(hex);
                showToast(`Copied hex code: ${hex}`, "success");
            });
            swatchesContainer.appendChild(swatch);
        });
    }

    // Run Audit
    btnRunAudit.addEventListener("click", () => {
        runAudit();
    });

    async function runAudit() {
        const text = contentInput.value.trim();
        if (!text) {
            showToast("Please input draft copy or select a sample.", "error");
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
            showToast("Error executing brand guardrail audit.", "error");
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

        // Score Styling
        const scoreCircle = document.getElementById("score-circle-container");
        if (res.compliance_score >= 85) {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100";
            statusBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> ' + res.status_label;
            btnBulkAdopt.classList.add("hidden");
        } else if (res.compliance_score >= 60) {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100";
            statusBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> ' + res.status_label;
            btnBulkAdopt.classList.remove("hidden");
        } else {
            scoreCircle.className = "flex items-center justify-center w-24 h-24 rounded-full border-4 border-rose-500 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100";
            statusBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300";
            statusBadge.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> ' + res.status_label;
            btnBulkAdopt.classList.remove("hidden");
        }

        // Tone Progress Bars
        document.getElementById("bar-authority").style.width = `${res.tone_metrics.authority_score}%`;
        document.getElementById("val-authority").textContent = `${res.tone_metrics.authority_score}%`;

        document.getElementById("bar-approachability").style.width = `${res.tone_metrics.approachability_score}%`;
        document.getElementById("val-approachability").textContent = `${res.tone_metrics.approachability_score}%`;

        document.getElementById("bar-claims").style.width = `${res.tone_metrics.claim_grounding_score}%`;
        document.getElementById("val-claims").textContent = `${res.tone_metrics.claim_grounding_score}%`;

        document.getElementById("bar-visual").style.width = `${res.tone_metrics.visual_coherence_score}%`;
        document.getElementById("val-visual").textContent = `${res.tone_metrics.visual_coherence_score}%`;

        // Render with current filter
        renderFilteredIssues(res.issues);
    }

    function renderFilteredIssues(issues) {
        if (!issues || issues.length === 0) {
            issuesContainer.innerHTML = `
                <div class="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl mb-3">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h4 class="font-bold text-emerald-900 text-lg">Zero Compliance Violations Detected</h4>
                    <p class="text-sm text-emerald-700 mt-1 max-w-md mx-auto">This content fully aligns with approved Brand Bible rules, verified claims, tone guidelines, and accessibility standards.</p>
                </div>
            `;
            return;
        }

        let filtered = issues;
        if (currentFilter === "critical") {
            filtered = issues.filter(i => i.severity === "critical");
        } else if (currentFilter === "warning") {
            filtered = issues.filter(i => i.severity === "warning");
        } else if (currentFilter === "claims") {
            filtered = issues.filter(i => i.category.toLowerCase().includes("claim") || i.category.toLowerCase().includes("fact"));
        } else if (currentFilter === "terminology") {
            filtered = issues.filter(i => i.category.toLowerCase().includes("terminology"));
        } else if (currentFilter === "visual") {
            filtered = issues.filter(i => i.category.toLowerCase().includes("visual") || i.category.toLowerCase().includes("accessibility"));
        }

        if (filtered.length === 0) {
            issuesContainer.innerHTML = `
                <div class="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                    No findings in the "${currentFilter}" filter category.
                </div>
            `;
            return;
        }

        issuesContainer.innerHTML = "";
        filtered.forEach((issue) => {
            const card = document.createElement("div");
            const isCritical = issue.severity === "critical";
            const borderCol = isCritical ? "border-l-4 border-l-rose-500 border-rose-200 bg-rose-50/40" : "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/40";
            const badgeCol = isCritical ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-amber-100 text-amber-700 border-amber-300";
            const icon = isCritical ? "fa-circle-xmark text-rose-600" : "fa-triangle-exclamation text-amber-600";

            card.className = `p-4 rounded-xl border ${borderCol} transition duration-200 shadow-sm hover:shadow-md bg-white`;
            card.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${icon}"></i>
                        <span class="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${badgeCol}">${issue.category}</span>
                        <span class="text-xs font-mono text-slate-400 font-bold">${issue.id}</span>
                    </div>
                    <span class="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                        <i class="fa-solid fa-book-bookmark text-indigo-500"></i> ${issue.guideline_ref}
                    </span>
                </div>

                <div class="mt-2.5">
                    <div class="text-[11px] font-bold text-slate-500 uppercase">Flagged Span:</div>
                    <div class="font-mono text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 text-slate-800">
                        <span class="diff-del-inline">${escapeHtml(issue.flagged_text)}</span>
                    </div>
                </div>

                <div class="mt-2 text-xs text-slate-600 leading-relaxed">
                    <strong>Why this was flagged:</strong> ${issue.explanation}
                </div>

                <!-- Intent-Preserving Suggested Diff -->
                <div class="mt-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <i class="fa-solid fa-wand-magic-sparkles text-emerald-600"></i> Intent-Preserving Suggestion
                        </span>
                        <button class="btn-accept-fix px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                                data-flagged="${escapeHtml(issue.flagged_text)}"
                                data-suggested="${escapeHtml(issue.intent_preserving_suggestion)}">
                            <i class="fa-solid fa-check"></i> Adopt Suggestion
                        </button>
                    </div>
                    <div class="mt-2 text-xs font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                        <span class="diff-add-inline">${escapeHtml(issue.intent_preserving_suggestion)}</span>
                    </div>
                </div>
            `;
            issuesContainer.appendChild(card);
        });

        // Attach listeners for single "Adopt Suggestion"
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

    // Apply single suggestion
    function applySuggestion(flagged, suggested) {
        let currentText = contentInput.value;
        if (currentText.includes(flagged)) {
            contentInput.value = currentText.replace(flagged, suggested);
            showToast(`Adopted: "${suggested.substring(0, 30)}..."`, "success");
            updateCounts();
            runAudit();
        } else {
            const regex = new RegExp(escapeRegExp(flagged), "i");
            contentInput.value = currentText.replace(regex, suggested);
            showToast(`Adopted fix inline`, "success");
            updateCounts();
            runAudit();
        }
    }

    // Bulk Adopt All Fixes Action
    btnBulkAdopt.addEventListener("click", () => {
        if (!currentAuditResult || !currentAuditResult.issues) return;
        let text = contentInput.value;
        let count = 0;

        currentAuditResult.issues.forEach(issue => {
            if (issue.flagged_text && issue.intent_preserving_suggestion) {
                if (text.includes(issue.flagged_text)) {
                    text = text.replace(issue.flagged_text, issue.intent_preserving_suggestion);
                    count++;
                }
            }
        });

        // Also fix visual logo and colors if attached
        if (currentVisualData) {
            currentVisualData.colors_detected = ["#4F46E5", "#0F172A", "#FFFFFF"];
            currentVisualData.logo_aspect_ratio = 1.0;
            currentVisualData.has_alt_text = true;
            renderVisualAttachmentCard(currentVisualData);
        }

        contentInput.value = text;
        updateCounts();
        showToast(`Bulk adopted ${count} compliant suggestions!`, "success");
        runAudit();
    });

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Submit into Collaborative Workflow
    btnSubmitWorkflow.addEventListener("click", async () => {
        const text = contentInput.value.trim();
        if (!text) {
            showToast("No content to submit.", "error");
            return;
        }
        const score = currentAuditResult ? currentAuditResult.compliance_score : 50;
        const title = prompt("Enter a campaign title for this review submission:", "Q4 Enterprise Growth Campaign");
        if (!title) return;

        try {
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    creator: currentRole === "creator" ? "Sarah Jenkins (Creator)" : "Marketing Team",
                    content: text,
                    compliance_score: score
                })
            });
            const data = await res.json();
            showToast(`Submitted draft (ID: ${data.id}) to Review Queue!`, "success");
            document.querySelector('[data-tab="workflow"]').click();
        } catch (err) {
            console.error("Submission error:", err);
            showToast("Failed to submit to workflow queue.", "error");
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
            document.getElementById("queue-count-badge").textContent = submissions.length;
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
                    <div class="mt-3 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                        <div>
                            <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-fingerprint"></i> SHA-256 Non-Repudiation Fingerprint:
                            </span>
                            <div class="text-slate-400 truncate max-w-lg mt-0.5 text-[11px]">${sub.sha256_fingerprint}</div>
                        </div>
                        <span class="text-[10px] font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
                            <i class="fa-solid fa-lock"></i> Cryptographic Verified Stamp
                        </span>
                    </div>
                `;
            }

            let managerActions = "";
            if (!isApproved) {
                managerActions = `
                    <div class="manager-approval-panel mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="text-xs text-slate-500">
                            <strong>Manager Action Required:</strong> Verify citations or grant conditional sign-off.
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="btn-request-changes px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition" data-id="${sub.id}">
                                <i class="fa-solid fa-rotate-left mr-1"></i> Request Changes
                            </button>
                            <button class="btn-approve px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5" data-id="${sub.id}">
                                <i class="fa-solid fa-check"></i> Sign-Off & Approve
                            </button>
                        </div>
                    </div>
                `;
            }

            // Timeline history
            let historyHtml = sub.history.map(h => `
                <div class="flex items-start gap-2 text-xs text-slate-600 py-1 border-b border-slate-100 last:border-0">
                    <span class="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">${h.timestamp}</span>
                    <strong class="text-slate-800">${h.user}:</strong>
                    <span>${h.action} — <span class="text-slate-500">${h.note}</span></span>
                </div>
            `).join("");

            // Comments
            let commentsHtml = sub.comments.map(c => `
                <div class="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 mb-2 border border-slate-200">
                    <div class="flex justify-between font-bold text-[11px] text-indigo-700">
                        <span>${c.author} (${c.role})</span>
                        <span class="text-slate-400 font-mono text-[10px]">${c.timestamp}</span>
                    </div>
                    <p class="mt-1 leading-relaxed">${c.text}</p>
                </div>
            `).join("");

            card.className = `p-5 rounded-2xl border ${borderAccent} shadow-sm mb-4 transition duration-200 hover:shadow-md`;
            card.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${sub.id}</span>
                            <h3 class="font-bold text-slate-900 text-base">${sub.title}</h3>
                            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold ${isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                                ${sub.status_badge}
                            </span>
                        </div>
                        <div class="text-xs text-slate-500 mt-1">
                            Submitted by <strong>${sub.creator}</strong> on ${sub.created_at} • Compliance Score: <strong>${sub.compliance_score}/100</strong>
                        </div>
                    </div>
                    ${isApproved ? '<div class="text-xs text-emerald-600 font-bold flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Published Ready</div>' : ''}
                </div>

                <div class="mt-3 p-3.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-mono leading-relaxed border border-slate-200">
                    ${sub.current_content}
                </div>

                ${fingerprintBlock}

                <!-- Timeline Accordion -->
                <div class="mt-4 border-t border-slate-100 pt-3">
                    <div class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <i class="fa-solid fa-clock-rotate-left text-indigo-500"></i> Audit History & Verification Trail:
                    </div>
                    <div class="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
                        ${historyHtml}
                    </div>
                </div>

                <!-- Comments & Collaborative Discussion -->
                <div class="mt-3">
                    <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span><i class="fa-solid fa-comments text-indigo-500 mr-1"></i> Reviewer Comments:</span>
                    </div>
                    <div>${commentsHtml || '<span class="text-xs text-slate-400 italic">No comments yet.</span>'}</div>
                    
                    <!-- Inline Quick Comment Input -->
                    <div class="mt-2 flex items-center gap-2">
                        <input type="text" class="input-comment flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" placeholder="Add a comment or suggestion..." data-id="${sub.id}">
                        <button class="btn-send-comment px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition" data-id="${sub.id}">
                            Comment
                        </button>
                    </div>
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
                    showToast(`Submission ${id} approved & stamped with SHA-256 fingerprint!`, "success");
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
                    showToast(`Changes requested for ${id}. Logged to audit trail.`, "info");
                    loadWorkflowQueue();
                }
            });
        });

        document.querySelectorAll(".btn-send-comment").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const input = document.querySelector(`.input-comment[data-id="${id}"]`);
                const comment = input.value.trim();
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
                showToast("Comment posted.", "info");
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
        // Color Palette Swatches
        const paletteGrid = document.getElementById("brand-palette-grid");
        if (paletteGrid && data.brand_bible.visual_identity) {
            paletteGrid.innerHTML = "";
            data.brand_bible.visual_identity.primary_palette.forEach(c => {
                const item = document.createElement("div");
                item.className = "p-3 bg-white rounded-xl border border-slate-200 shadow-2xs card-hover-lift cursor-pointer";
                item.innerHTML = `
                    <div class="w-full h-10 rounded-lg mb-2 border border-slate-200" style="background-color: ${c.hex}"></div>
                    <div class="font-bold text-xs text-slate-800">${c.name}</div>
                    <div class="font-mono text-[11px] text-slate-500 font-bold">${c.hex}</div>
                    <div class="text-[10px] text-indigo-600 mt-1 font-medium">${c.role}</div>
                `;
                item.addEventListener("click", () => {
                    navigator.clipboard.writeText(c.hex);
                    showToast(`Copied ${c.name} hex code: ${c.hex}`, "success");
                });
                paletteGrid.appendChild(item);
            });
        }

        // Prohibited terms
        const termsList = document.getElementById("prohibited-terms-list");
        termsList.innerHTML = "";
        data.brand_bible.prohibited_terms.forEach(t => {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-100 hover:bg-slate-50/70 transition";
            row.innerHTML = `
                <td class="p-2.5 font-mono text-xs font-bold text-rose-600">${t.term}</td>
                <td class="p-2.5 text-xs text-slate-600">${t.reason}</td>
                <td class="p-2.5 text-xs text-indigo-700 font-medium">${t.guideline_ref}</td>
                <td class="p-2.5 font-mono text-xs text-emerald-700 font-bold bg-emerald-50/40 rounded">${t.suggestion}</td>
            `;
            termsList.appendChild(row);
        });

        // Verified Claims
        const claimsList = document.getElementById("verified-claims-list");
        claimsList.innerHTML = "";
        data.verified_claims.forEach(c => {
            const row = document.createElement("tr");
            row.className = "border-b border-slate-100 hover:bg-slate-50/70 transition";
            row.innerHTML = `
                <td class="p-2.5 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/30 rounded">${c.id}</td>
                <td class="p-2.5 text-xs font-bold text-slate-800">${c.topic}</td>
                <td class="p-2.5 text-xs text-slate-700">${c.approved_statement}</td>
                <td class="p-2.5 text-xs text-slate-500 italic">${c.evidence_source}</td>
            `;
            claimsList.appendChild(row);
        });
    }

    // Add new term form
    const formAddTerm = document.getElementById("form-add-term");
    if (formAddTerm) {
        formAddTerm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const term = document.getElementById("new-term-text").value.trim();
            const reason = document.getElementById("new-term-reason").value.trim();
            const ref = document.getElementById("new-term-ref").value.trim();
            const sugg = document.getElementById("new-term-sugg").value.trim();

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
            showToast(`Added '${term}' to Prohibited Lexicon`, "success");
            formAddTerm.reset();
            loadGuidelines();
        });
    }

    // Add new verified claim form
    const formAddClaim = document.getElementById("form-add-claim");
    if (formAddClaim) {
        formAddClaim.addEventListener("submit", async (e) => {
            e.preventDefault();
            const claimId = document.getElementById("new-claim-id").value.trim();
            const topic = document.getElementById("new-claim-topic").value.trim();
            const stmt = document.getElementById("new-claim-statement").value.trim();
            const src = document.getElementById("new-claim-source").value.trim();

            await fetch("/api/guidelines/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    claim_id: claimId,
                    topic: topic,
                    statement: stmt,
                    source: src,
                    keywords: [topic.toLowerCase()]
                })
            });
            showToast(`Added verified claim: ${claimId}`, "success");
            formAddClaim.reset();
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
            row.className = "mb-3.5";
            row.innerHTML = `
                <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>${cat.category}</span>
                    <span class="font-mono">${cat.count} flags (${cat.percentage}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="h-2 rounded-full transition-all duration-700" style="width: ${cat.percentage}%; background-color: ${cat.color};"></div>
                </div>
            `;
            catContainer.appendChild(row);
        });

        // Recurring Mistakes
        const recContainer = document.getElementById("recurring-mistakes-container");
        recContainer.innerHTML = "";
        data.recurring_violations.forEach(v => {
            const item = document.createElement("div");
            item.className = "p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-2.5 card-hover-lift";
            item.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-slate-900">${v.rule}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">${v.frequency}</span>
                </div>
                <div class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    <strong>Typical Mistake:</strong> ${v.typical_mistake}
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                    <span>Severity: <strong class="text-slate-700">${v.severity}</strong></span>
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
            card.className = "p-4 rounded-xl border border-amber-300 bg-amber-50/70 mb-3 shadow-2xs card-hover-lift";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-amber-950 font-heading">${g.title}</span>
                    <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">${g.dispute_rate}</span>
                </div>
                <div class="text-xs text-slate-700 mt-2">
                    <strong>Why It's Confusing:</strong> ${g.root_cause}
                </div>
                <div class="mt-2.5 p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 shadow-2xs">
                    <div class="font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> AI-Recommended Guideline Amendment:
                    </div>
                    <p class="leading-relaxed text-slate-600">${g.ai_suggested_remedy}</p>
                </div>
            `;
            ambContainer.appendChild(card);
        });
    }
});
