# AegisBrand AI — In-Situ Browser & Workspace Extension
### Round 3 Finalist Improvement #1: Live In-Situ Guardrail

This directory contains the unpacked Google Chrome Extension (Manifest V3) that brings pre-publication brand governance directly into authoring environments like Google Docs, Notion, Gmail, and CMS tools.

---

## Architecture Overview
- **`manifest.json`**: Manifest V3 declaration with declarative content scripts, storage permissions, and action popups.
- **`content.js`**: DOM observer that monitors editable elements (`contenteditable`, `textarea`, `input`) for prohibited terminology, ungrounded superlatives, and claim violations in real time, rendering wavy non-destructive squiggly indicators and inline replacement popovers.
- **`popup.html`**: Extension popup interface showing real-time Brand Health Score, active workspace status, and direct synchronization to the AegisBrand knowledge base.
- **`styles.css`**: Non-invasive inline squiggly underlines (`.insitu-flagged`) and floating popover tooltips that match the parent application's styling.

---

## How to Install & Test in Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select this directory: `c:\Users\Prince kumar\OneDrive\Desktop\dsih\aegisbrand_ai\extension`.
5. The **AegisBrand AI Sentinel** icon will appear in your Chrome toolbar.
6. Open any Google Doc or web editor — AegisBrand intercepts violations as you type, preserving 90%+ authentic author intent!
