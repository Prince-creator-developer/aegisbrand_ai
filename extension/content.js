// AegisBrand AI Workspace Content Script
console.log("[AegisBrand AI] In-Situ Workspace Guardrail Injected.");

const badge = document.createElement("div");
badge.className = "aegis-in-situ-floating-badge";
badge.innerHTML = "🛡️ AegisBrand Sentinel: Active";
badge.title = "AegisBrand AI is guarding this canvas against unverified claims and tone drift.";
document.body.appendChild(badge);
