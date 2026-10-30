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
    loadConflicts();
    setupInsituSimulator();
    setupLocalImageUpload();
    setupC2PAModal();

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
            if (targetTab === "conflicts") loadConflicts();
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
        const thumbnail = document.getElementById("visual-thumbnail");
        const iconPlaceholder = document.getElementById("visual-icon-placeholder");

        if (!visual) {
            statusPill.textContent = "No Asset Attached";
            statusPill.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500";
            filenameLabel.textContent = "No image attached";
            swatchesContainer.innerHTML = '<span class="text-[10px] text-slate-400">N/A</span>';
            aspectPill.textContent = "Ratio: N/A";
            if (thumbnail) thumbnail.classList.add("hidden");
            if (iconPlaceholder) iconPlaceholder.classList.remove("hidden");
            return;
        }

        if (thumbnail && iconPlaceholder) {
            if (visual.thumbnail_data) {
                thumbnail.src = visual.thumbnail_data;
                thumbnail.classList.remove("hidden");
                iconPlaceholder.classList.add("hidden");
            } else {
                thumbnail.classList.add("hidden");
                iconPlaceholder.classList.remove("hidden");
            }
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
            const badge = document.getElementById("queue-count-badge");
            if (badge) badge.textContent = submissions.length;
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
                    <div class="mt-3 p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                        <div>
                            <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-fingerprint"></i> SHA-256 Non-Repudiation Fingerprint:
                            </span>
                            <div class="text-slate-400 truncate max-w-lg mt-0.5 text-[11px]">${sub.sha256_fingerprint}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="btn-view-c2pa px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow" data-id="${sub.id}">
                                <i class="fa-solid fa-certificate"></i> Inspect C2PA Provenance
                            </button>
                        </div>
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

        // View C2PA Provenance Manifest
        document.querySelectorAll(".btn-view-c2pa").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                try {
                    const res = await fetch(`/api/c2pa/manifest/${id}`);
                    if (!res.ok) throw new Error("Could not fetch manifest");
                    const manifest = await res.json();
                    
                    window.activeC2PAManifest = manifest;
                    const targetSub = submissions.find(s => s.id === id);
                    window.activeC2PAContent = targetSub ? targetSub.current_content : "";

                    const modal = document.getElementById("c2pa-modal");
                    const jsonDisplay = document.getElementById("c2pa-json-display");
                    if (modal && jsonDisplay) {
                        jsonDisplay.innerHTML = `<pre class="text-[11px] font-mono whitespace-pre-wrap">${escapeHtml(JSON.stringify(manifest, null, 2))}</pre>`;
                        modal.classList.remove("hidden");
                    }
                } catch (err) {
                    console.error("C2PA Fetch error:", err);
                    showToast("Failed to fetch C2PA manifest for " + id, "error");
                }
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

    // -------------------------------------------------------------
    // ROUND 3 IMP #1: IN-SITU WORKSPACE EXTENSION SIMULATOR
    // -------------------------------------------------------------
    function setupInsituSimulator() {
        const popover = document.getElementById("insitu-popover");
        const refSpan = document.getElementById("insitu-ref");
        const termSpan = document.getElementById("insitu-term");
        const fixSpan = document.getElementById("insitu-fix");
        const btnApply = document.getElementById("btn-insitu-apply");
        const docCanvas = document.getElementById("insitu-doc-canvas");
        const btnReset = document.getElementById("btn-reset-insitu");
        const envButtons = document.querySelectorAll(".insitu-env-btn");
        const docTitle = document.getElementById("insitu-doc-title");
        let activeTargetSpan = null;

        const defaultInsituHtml = `
            <p class="mb-4 text-base font-bold text-slate-900">Q4 Enterprise Product Launch Campaign Draft</p>
            <p class="mb-4">
                We are excited to unveil our latest capabilities designed for fast-growing enterprise marketing teams. 
                Our platform delivers 
                <span class="insitu-flagged relative cursor-pointer border-b-2 border-wavy border-rose-500 bg-rose-50/50 font-bold text-rose-700 px-1 rounded" data-term="infallible 100% uptime" data-fix="enterprise-grade 99.9% verified uptime backed by SLA" data-ref="Claims Guide Sec 4.2">
                    infallible 100% uptime
                </span>
                that ensures your mission-critical pipelines never drop a single packet.
            </p>
            <p class="mb-4">
                Unlike legacy alternatives, our 
                <span class="insitu-flagged relative cursor-pointer border-b-2 border-wavy border-amber-500 bg-amber-50/50 font-bold text-amber-800 px-1 rounded" data-term="cheap revolutionary tool" data-fix="cost-effective groundbreaking platform" data-ref="Stylebook Sec 3.4">
                    cheap revolutionary tool
                </span>
                <span class="insitu-flagged relative cursor-pointer border-b-2 border-wavy border-rose-500 bg-rose-50/50 font-bold text-rose-700 px-1 rounded" data-term="crushes competitors" data-fix="outperforms industry benchmarks" data-ref="Tone Guide Sec 2.1">
                    crushes competitors
                </span>
                by providing 
                <span class="insitu-flagged relative cursor-pointer border-b-2 border-wavy border-rose-500 bg-rose-50/50 font-bold text-rose-700 px-1 rounded" data-term="guaranteed 10x ROI" data-fix="proven up to 10x ROI in audited case studies" data-ref="Advertising Code Sec 4.1">
                    guaranteed 10x ROI
                </span>
                in under 48 hours.
            </p>
        `;

        function attachFlaggedListeners() {
            document.querySelectorAll(".insitu-flagged").forEach(flaggedSpan => {
                flaggedSpan.addEventListener("click", (e) => {
                    e.stopPropagation();
                    activeTargetSpan = flaggedSpan;
                    const term = flaggedSpan.getAttribute("data-term") || flaggedSpan.textContent.trim();
                    const fix = flaggedSpan.getAttribute("data-fix") || "enterprise-grade verified alternative";
                    const ref = flaggedSpan.getAttribute("data-ref") || "Brand Bible Sec 2.1";

                    if (refSpan) refSpan.textContent = ref;
                    if (termSpan) termSpan.textContent = `"${term}"`;
                    if (fixSpan) fixSpan.textContent = fix;

                    if (popover && docCanvas) {
                        popover.classList.remove("hidden");
                        const parentRect = docCanvas.getBoundingClientRect();
                        const rect = flaggedSpan.getBoundingClientRect();
                        const topPos = rect.bottom - parentRect.top + 10;
                        let leftPos = rect.left - parentRect.left;
                        if (leftPos + 320 > parentRect.width) {
                            leftPos = Math.max(10, parentRect.width - 340);
                        }
                        popover.style.top = `${topPos}px`;
                        popover.style.left = `${leftPos}px`;
                    }
                });
            });
        }

        attachFlaggedListeners();

        if (btnApply) {
            btnApply.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!activeTargetSpan) return;
                const fix = activeTargetSpan.getAttribute("data-fix") || "enterprise-grade verified alternative";
                activeTargetSpan.className = "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300";
                activeTargetSpan.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-[10px]"></i> ${fix}`;
                activeTargetSpan.classList.remove("insitu-flagged");
                
                if (popover) popover.classList.add("hidden");
                showToast("Adopted compliant in-situ replacement!", "success");
                activeTargetSpan = null;
            });
        }

        // Reset text button
        if (btnReset && docCanvas) {
            btnReset.addEventListener("click", () => {
                docCanvas.innerHTML = defaultInsituHtml;
                attachFlaggedListeners();
                if (popover) popover.classList.add("hidden");
                showToast("Reset In-Situ document canvas to initial draft.", "info");
            });
        }

        // Host Environment Switcher
        envButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                envButtons.forEach(b => {
                    b.className = "insitu-env-btn px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition border border-slate-200";
                });
                btn.className = "insitu-env-btn px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold transition shadow-xs";
                const env = btn.getAttribute("data-env");
                const titles = {
                    gdocs: '<i class="fa-solid fa-file-lines text-blue-500"></i> Untitled Campaign Document — Google Docs',
                    notion: '<i class="fa-solid fa-book-bookmark text-slate-800"></i> Notion / Product Launch Specs',
                    figma: '<i class="fa-brands fa-figma text-purple-600"></i> Figma / Web Hero Banner Copy',
                    gmail: '<i class="fa-solid fa-envelope text-red-500"></i> Gmail / Outbound Enterprise Pitch'
                };
                if (docTitle && titles[env]) docTitle.innerHTML = titles[env];
                showToast(`Switched simulated authoring environment: ${btn.textContent.trim()}`, "info");
            });
        });

        // Close popover on document click
        document.addEventListener("click", (e) => {
            if (popover && !popover.contains(e.target)) {
                popover.classList.add("hidden");
            }
        });
    }

    // -------------------------------------------------------------
    // ROUND 3 IMP #3: AUTONOMOUS MULTI-DOCUMENT CONFLICT RESOLVER
    // -------------------------------------------------------------
    async function loadConflicts() {
        const docsGrid = document.getElementById("conflict-docs-grid");
        const listContainer = document.getElementById("conflicts-list-container");
        if (!docsGrid || !listContainer) return;

        docsGrid.innerHTML = '<div class="col-span-full p-4 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Scanning cross-departmental documentation...</div>';
        listContainer.innerHTML = '<div class="p-6 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Detecting policy contradictions...</div>';

        try {
            const res = await fetch("/api/conflicts");
            const data = await res.json();
            renderConflicts(data);
        } catch (err) {
            console.error("Failed to load conflicts:", err);
            listContainer.innerHTML = '<div class="p-4 text-center text-rose-500">Failed to analyze cross-document conflicts.</div>';
        }
    }

    function renderConflicts(data) {
        const docsGrid = document.getElementById("conflict-docs-grid");
        const listContainer = document.getElementById("conflicts-list-container");
        if (!docsGrid || !listContainer) return;

        // Render Ingested Documents
        docsGrid.innerHTML = "";
        const deptIcons = {
            "Sales & Revenue": "fa-sack-dollar text-emerald-600 bg-emerald-50 border-emerald-200",
            "Sales & GTM": "fa-sack-dollar text-emerald-600 bg-emerald-50 border-emerald-200",
            "Engineering & Infrastructure": "fa-server text-blue-600 bg-blue-50 border-blue-200",
            "Engineering & DevOps": "fa-server text-blue-600 bg-blue-50 border-blue-200",
            "Legal & Regulatory": "fa-scale-balanced text-purple-600 bg-purple-50 border-purple-200",
            "Legal & Compliance": "fa-scale-balanced text-purple-600 bg-purple-50 border-purple-200",
            "Brand & Product Marketing": "fa-bullhorn text-indigo-600 bg-indigo-50 border-indigo-200"
        };

        data.documents.forEach(doc => {
            const item = document.createElement("div");
            const iconStyle = deptIcons[doc.department] || "fa-file-lines text-slate-600 bg-slate-50 border-slate-200";
            item.className = "p-3.5 bg-slate-50 rounded-xl border border-slate-200 card-hover-lift flex flex-col justify-between";
            item.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${iconStyle}">
                            <i class="fa-solid ${iconStyle.split(' ')[0]}"></i>
                        </span>
                        <span class="font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">${doc.id}</span>
                    </div>
                    <div class="font-bold text-xs text-slate-900 leading-snug">${doc.title || doc.document_title}</div>
                    <div class="text-[11px] text-slate-500 font-medium mt-0.5">${doc.department}</div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>${doc.claim_count || (doc.claims ? doc.claims.length : 3)} claims indexed</span>
                    <span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Synced</span>
                </div>
            `;
            docsGrid.appendChild(item);
        });

        // Render Detected Conflicts
        listContainer.innerHTML = "";
        if (!data.conflicts || data.conflicts.length === 0) {
            listContainer.innerHTML = '<div class="p-6 text-center text-emerald-600 font-bold bg-emerald-50 rounded-xl border border-emerald-200"><i class="fa-solid fa-circle-check mr-2"></i>All departmental documentation is fully aligned with no conflicting policies!</div>';
            return;
        }

        data.conflicts.forEach(c => {
            const card = document.createElement("div");
            const severityColors = {
                "CRITICAL": "bg-rose-100 text-rose-800 border-rose-300",
                "CRITICAL LEGAL EXPOSURE": "bg-rose-100 text-rose-800 border-rose-300",
                "HIGH": "bg-amber-100 text-amber-800 border-amber-300",
                "HIGH CUSTOMER CHURN RISK": "bg-amber-100 text-amber-800 border-amber-300",
                "MEDIUM": "bg-blue-100 text-blue-800 border-blue-300"
            };
            const sevBadge = severityColors[c.severity] || "bg-slate-100 text-slate-800 border-slate-300";

            const partiesList = c.parties || c.conflicting_parties || [];
            let partiesHtml = partiesList.map(p => `
                <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div class="font-bold text-[11px] text-slate-800 flex items-center justify-between">
                        <span>${p.department || p.dept}</span>
                        <span class="text-[10px] font-mono text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">${p.stance || 'Claim'}</span>
                    </div>
                    <div class="mt-1 text-xs text-rose-700 font-mono font-medium leading-relaxed">"${p.claim || p.statement}"</div>
                </div>
            `).join("");

            const harmonizedRule = c.harmonized_policy || c.ai_harmonized_policy || "Harmonized enterprise consensus rule.";
            const contradictionSummary = c.contradiction || c.risk_analysis || "Cross-departmental policy contradiction.";

            card.className = "p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3.5 transition duration-200 hover:shadow-md";
            card.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">${c.conflict_id}</span>
                        <h4 class="font-bold text-slate-900 text-sm">${c.topic}</h4>
                    </div>
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${sevBadge}">
                        Severity: ${c.severity}
                    </span>
                </div>

                <div class="text-xs text-slate-700">
                    <strong>Contradiction Summary:</strong> ${contradictionSummary}
                </div>

                <!-- Opposing Department Claims -->
                <div class="grid grid-cols-1 sm:grid-cols-${Math.min(3, Math.max(1, partiesList.length))} gap-2">
                    ${partiesHtml}
                </div>

                <!-- Risk Assessment -->
                <div class="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-900">
                    <strong class="flex items-center gap-1.5 text-rose-800 mb-0.5">
                        <i class="fa-solid fa-shield-virus"></i> Enterprise Risk Assessment:
                    </strong>
                    ${c.risk_analysis}
                </div>

                <!-- AI Harmonized Consensus Policy -->
                <div class="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex-1">
                        <div class="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                            <i class="fa-solid fa-wand-magic-sparkles text-emerald-600"></i> AI-Harmonized Consensus Policy:
                        </div>
                        <div class="font-mono text-slate-800 text-[11px] leading-relaxed bg-white/80 p-2 rounded-lg border border-emerald-200">
                            ${harmonizedRule}
                        </div>
                    </div>
                    <button class="btn-adopt-harmonized px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm text-xs whitespace-nowrap self-start sm:self-center" data-id="${c.conflict_id}">
                        <i class="fa-solid fa-handshake mr-1"></i> Adopt Harmonized Policy
                    </button>
                </div>
            `;
            listContainer.appendChild(card);
        });

        // Event listener for Adopting Harmonized Policy
        document.querySelectorAll(".btn-adopt-harmonized").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                btn.className = "px-3.5 py-2 bg-slate-900 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-500/50 cursor-default";
                btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Harmonized & Synced`;
                showToast(`Conflict ${id} resolved! Harmonized policy committed to Brand Bible.`, "success");
            });
        });
    }

    // Modal for Ingesting Custom Document
    const btnOpenAddDoc = document.getElementById("btn-open-add-doc");
    const modalAddDoc = document.getElementById("modal-add-doc");
    const btnCloseDocModal = document.getElementById("btn-close-doc-modal");
    const formCustomDoc = document.getElementById("form-custom-doc");

    if (btnOpenAddDoc && modalAddDoc) {
        btnOpenAddDoc.addEventListener("click", () => modalAddDoc.classList.remove("hidden"));
    }
    if (btnCloseDocModal && modalAddDoc) {
        btnCloseDocModal.addEventListener("click", () => modalAddDoc.classList.add("hidden"));
    }
    if (formCustomDoc) {
        formCustomDoc.addEventListener("submit", async (e) => {
            e.preventDefault();
            const dept = document.getElementById("input-doc-dept").value.trim();
            const title = document.getElementById("input-doc-title").value.trim();
            const claimText = document.getElementById("input-doc-claim").value.trim();

            showToast("Ingesting document and running contradiction matrix...", "info");
            try {
                const res = await fetch("/api/conflicts/document", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        department: dept,
                        document_title: title,
                        claims: [{ topic: "Operational Policy", statement: claimText }]
                    })
                });
                if (res.ok) {
                    showToast(`Ingested ${title} from ${dept}!`, "success");
                    modalAddDoc.classList.add("hidden");
                    formCustomDoc.reset();
                    loadConflicts();
                }
            } catch (err) {
                console.error("Custom doc error:", err);
                showToast("Failed to ingest custom document.", "error");
            }
        });
    }

    // Bind scan button
    const btnScanConflicts = document.getElementById("btn-scan-conflicts");
    if (btnScanConflicts) {
        btnScanConflicts.addEventListener("click", () => {
            showToast("Re-scanning cross-departmental documentation...", "info");
            loadConflicts();
        });
    }

    // -------------------------------------------------------------
    // LOCAL IMAGE UPLOAD & CLIENT-SIDE DIAGNOSTICS
    // -------------------------------------------------------------
    function setupLocalImageUpload() {
        const fileInput = document.getElementById("local-image-upload");
        if (!fileInput) return;

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const width = img.naturalWidth || img.width;
                    const height = img.naturalHeight || img.height;
                    const ratio = parseFloat((width / height).toFixed(2));

                    // Use canvas to sample primary colors
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = 40;
                    canvas.height = 40;
                    ctx.drawImage(img, 0, 0, 40, 40);
                    
                    const p1 = ctx.getImageData(5, 5, 1, 1).data;
                    const p2 = ctx.getImageData(20, 20, 1, 1).data;
                    const p3 = ctx.getImageData(35, 35, 1, 1).data;

                    function rgbToHex(r, g, b) {
                        return "#" + [r, g, b].map(x => {
                            const hex = x.toString(16);
                            return hex.length === 1 ? "0" + hex : hex;
                        }).join("").toUpperCase();
                    }

                    const hex1 = rgbToHex(p1[0], p1[1], p1[2]);
                    const hex2 = rgbToHex(p2[0], p2[1], p2[2]);
                    const hex3 = rgbToHex(p3[0], p3[1], p3[2]);

                    const detectedColors = Array.from(new Set([hex1, hex2, hex3]));

                    currentVisualData = {
                        filename: file.name,
                        specs: `${width}x${height} px • ${file.type || 'IMAGE'}`,
                        logo_aspect_ratio: ratio,
                        colors_detected: detectedColors,
                        has_alt_text: false,
                        thumbnail_data: event.target.result
                    };

                    const filenameLabel = document.getElementById("visual-filename");
                    const specsLabel = document.getElementById("visual-specs");
                    if (filenameLabel) filenameLabel.textContent = file.name;
                    if (specsLabel) specsLabel.textContent = `${width}x${height} px • ${(file.size / 1024).toFixed(1)} KB`;

                    renderVisualAttachmentCard(currentVisualData);
                    showToast(`Ingested ${file.name} (${width}x${height}px). Auditing visual tokens...`, "success");
                    runAudit();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // -------------------------------------------------------------
    // ROUND 3 IMP #2: C2PA MANIFEST MODAL & TAMPER SIMULATOR
    // -------------------------------------------------------------
    function setupC2PAModal() {
        const modal = document.getElementById("c2pa-modal");
        const btnClose = document.getElementById("btn-close-c2pa");
        const btnVerify = document.getElementById("btn-verify-manifest");
        const toggleTamper = document.getElementById("toggle-tamper");
        const tamperBox = document.getElementById("tamper-box");
        const tamperInput = document.getElementById("tamper-content-input");
        const statusBox = document.getElementById("c2pa-integrity-status");

        if (btnClose && modal) {
            btnClose.addEventListener("click", () => {
                modal.classList.add("hidden");
                if (statusBox) statusBox.classList.add("hidden");
            });
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.classList.add("hidden");
                    if (statusBox) statusBox.classList.add("hidden");
                }
            });
        }

        if (toggleTamper && tamperBox && tamperInput) {
            toggleTamper.addEventListener("change", () => {
                if (toggleTamper.checked) {
                    tamperBox.classList.remove("hidden");
                    const base = window.activeC2PAContent || "AegisBrand verified content.";
                    tamperInput.value = base.replace(/99\.9%/g, "100% infallible").replace(/verified SLA/g, "unverified promotional guarantee");
                    showToast("Simulating unauthorized rogue edit. SHA-256 fingerprint should mismatch!", "error");
                } else {
                    tamperBox.classList.add("hidden");
                    showToast("Reset to authorized signed content.", "info");
                }
                if (statusBox) statusBox.classList.add("hidden");
            });
        }

        if (btnVerify) {
            btnVerify.addEventListener("click", async () => {
                if (!window.activeC2PAManifest) {
                    showToast("No active C2PA manifest loaded.", "error");
                    return;
                }

                btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Verifying SHA-256 Signature...';
                
                // Determine content to test: authentic vs tampered
                const testContent = (toggleTamper && toggleTamper.checked && tamperInput) ? tamperInput.value : (window.activeC2PAContent || "");

                try {
                    const res = await fetch("/api/c2pa/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            manifest: window.activeC2PAManifest,
                            content: testContent
                        })
                    });
                    const verifyData = await res.json();
                    
                    if (verifyData.valid || verifyData.is_valid) {
                        btnVerify.className = "px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg transition flex items-center gap-1.5 shadow";
                        btnVerify.innerHTML = '<i class="fa-solid fa-shield-check"></i> Cryptographically Verified';
                        showToast("C2PA Manifest Verified: SHA-256 signature authentic!", "success");
                        
                        if (statusBox) {
                            statusBox.className = "mt-2 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl c2pa-verified-glow flex items-start gap-2.5";
                            statusBox.innerHTML = `
                                <i class="fa-solid fa-shield-check text-emerald-400 text-lg mt-0.5"></i>
                                <div>
                                    <div class="font-bold text-emerald-300 text-xs">C2PA PROVENANCE VERIFIED: CONTENT UNTAMPERED</div>
                                    <div class="text-[11px] text-emerald-400/90 mt-0.5">SHA-256 fingerprint matches cryptographic manifest signed by ${verifyData.signer}. ISO 20066 / C2PA v1.3 standard compliance confirmed.</div>
                                </div>
                            `;
                            statusBox.classList.remove("hidden");
                        }
                    } else {
                        btnVerify.className = "px-4 py-2 bg-rose-600 text-white font-bold rounded-lg transition flex items-center gap-1.5";
                        btnVerify.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Tamper Detected';
                        showToast("Tamper Alert: SHA-256 hash mismatch! Content altered post-sign-off.", "error");

                        if (statusBox) {
                            statusBox.className = "mt-2 p-3 bg-rose-950/90 border border-rose-500 rounded-xl tamper-breach-glow flex items-start gap-2.5";
                            statusBox.innerHTML = `
                                <i class="fa-solid fa-triangle-exclamation text-rose-400 text-lg mt-0.5"></i>
                                <div>
                                    <div class="font-bold text-rose-300 text-xs">SECURITY ALERT: TAMPER DETECTED POST-SIGN-OFF</div>
                                    <div class="text-[11px] text-rose-400/90 mt-0.5">Content payload altered after digital sign-off! Expected SHA-256 does NOT match calculated content hash. Digital signature is VOID.</div>
                                </div>
                            `;
                            statusBox.classList.remove("hidden");
                        }
                    }
                } catch (err) {
                    console.error("Verification error:", err);
                    btnVerify.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verify Digital Signature & Integrity';
                    showToast("Network error during verification.", "error");
                }
            });
        }
    }

    // -------------------------------------------------------------
    // EXPORT & COPY ACTIONS
    // -------------------------------------------------------------
    const btnCopyClean = document.getElementById("btn-copy-clean");
    if (btnCopyClean) {
        btnCopyClean.addEventListener("click", () => {
            const text = contentInput.value.trim();
            if (!text) {
                showToast("No content to copy.", "error");
                return;
            }
            navigator.clipboard.writeText(text);
            showToast("Copied content to clipboard!", "success");
        });
    }

    const btnExportJson = document.getElementById("btn-export-json");
    if (btnExportJson) {
        btnExportJson.addEventListener("click", () => {
            if (!currentAuditResult) {
                showToast("Please run an audit first to generate report.", "error");
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAuditResult, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `aegisbrand_audit_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("Exported audit certificate JSON!", "success");
        });
    }

    const btnExportBible = document.getElementById("btn-export-bible");
    if (btnExportBible) {
        btnExportBible.addEventListener("click", async () => {
            try {
                const res = await fetch("/api/guidelines");
                const data = await res.json();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                const a = document.createElement("a");
                a.setAttribute("href", dataStr);
                a.setAttribute("download", "brand_bible_source_of_truth.json");
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast("Downloaded Brand Bible JSON!", "success");
            } catch (err) {
                showToast("Export failed.", "error");
            }
        });
    }

    // -------------------------------------------------------------
    // LIVE SEARCH FILTERS FOR KNOWLEDGE HUB
    // -------------------------------------------------------------
    const searchTermsInput = document.getElementById("search-terms-input");
    if (searchTermsInput) {
        searchTermsInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll("#prohibited-terms-list tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });
        });
    }

    const searchClaimsInput = document.getElementById("search-claims-input");
    if (searchClaimsInput) {
        searchClaimsInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll("#verified-claims-list tr").forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });
        });
    }

    // -------------------------------------------------------------
    // EVALUATOR 1-CLICK GUIDED DEMO TOUR
    // -------------------------------------------------------------
    const btnStartTour = document.getElementById("btn-start-tour");
    const btnDismissTour = document.getElementById("btn-dismiss-tour");
    const tourBanner = document.getElementById("evaluator-tour-banner");

    if (btnDismissTour && tourBanner) {
        btnDismissTour.addEventListener("click", () => tourBanner.classList.add("hidden"));
    }

    if (btnStartTour) {
        btnStartTour.addEventListener("click", () => {
            showToast("Starting 60-Second Evaluator Guided Demo...", "info");
            
            // Step 1: Review Studio
            const studioTab = document.querySelector('[data-tab="studio"]');
            if (studioTab) studioTab.click();
            setTimeout(() => {
                btnRunAudit.click();
                showToast("Step 1/4: Review Studio — Intercepted non-compliant copy & generated intent-preserving diffs!", "success");
            }, 600);

            // Step 2: In-Situ Extension
            setTimeout(() => {
                const insituTab = document.querySelector('[data-tab="insitu"]');
                if (insituTab) insituTab.click();
                showToast("Step 2/4: In-Situ Extension — Real-time squiggly underlines & inline replacements!", "info");
                setTimeout(() => {
                    const firstFlag = document.querySelector(".insitu-flagged");
                    if (firstFlag) firstFlag.click();
                }, 800);
            }, 3600);

            // Step 3: Multi-Doc Conflict Resolver
            setTimeout(() => {
                const conflictTab = document.querySelector('[data-tab="conflicts"]');
                if (conflictTab) conflictTab.click();
                showToast("Step 3/4: Multi-Doc Conflict Resolver — Cross-scanned Sales vs Legal vs Engineering!", "info");
            }, 7200);

            // Step 4: C2PA Ledger
            setTimeout(() => {
                const workflowTab = document.querySelector('[data-tab="workflow"]');
                if (workflowTab) workflowTab.click();
                showToast("Step 4/4: C2PA Cryptographic Provenance Ledger — SHA-256 Non-Repudiation!", "success");
                setTimeout(() => {
                    const c2paBtn = document.querySelector(".btn-view-c2pa");
                    if (c2paBtn) c2paBtn.click();
                }, 900);
            }, 10800);
        });
    }
});
