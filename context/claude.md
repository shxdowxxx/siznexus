---
session_id: SIZ-20260413-1800
date: 2026-04-13
time: 18:00 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 2 — Feature & Optimization Work
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed website built with vanilla HTML, CSS, and JavaScript. Backend is Firebase (Auth + Firestore). No build toolchain — direct file editing. The project is at version 2.1 and is in active Phase 2 feature and optimization work.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js` (note: the main HTML file is `index.html`, not `siznexus.html` — earlier sessions referenced `siznexus.html` based on boilerplate, but the actual file in the repo is `index.html`)
- **Other HTML files:** `Commission.html`, `IndexMarket.html`, `about.html`, `reciever.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — `main` branch only. `master` exists on remote but is dead; never push to it.
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Current Phase
**Phase 2 — Feature & Optimization Work**
Phase 1 is fully complete. The project is stable, bootstrapped, and pushed to GitHub. Phase 2 covers ongoing feature additions, performance improvements, and UX polish. The current session resolved the profile tab performance issue and delivered a favicon overhaul and password reset UX improvements.

## Key Architectural Decisions
- Vanilla HTML/CSS/JS — no frameworks, no bundlers. Keep it that way unless the director explicitly requests otherwise.
- Firebase handles auth and data. Do not introduce a second backend or auth system.
- The shared knowledge file at `/home/itzzzshxdow/.claude/shared-knowledge.md` is the cross-agent memory layer. Read it at the start of sessions and write relevant discoveries to it.
- The `#resetModal` password reset flow is fully implemented with loading spinner, human-readable error messages, spam folder guidance, and `actionCodeSettings`. Do not duplicate or re-implement it.
- `getElementById('profileActivityStatus')` is a known dead reference, guarded by an if-check. Do not remove it without director confirmation — it signals a planned feature.
- Favicon assets live under `favicon/` relative to the project root. `site.webmanifest` canonical name is "TheSizNexus", theme color `#0a0a0f`.

## What Claude Should Prioritize Next Session
1. Director will define the next Phase 2 priority at session start — no specific next feature was locked in.
2. Custom email sending (Resend) is a known deferred item. Resend DNS records are already configured on Porkbun. Revisit when the director approves budget for a paid Resend plan.
3. `getElementById('profileActivityStatus')` dead reference — assess whether to implement or remove once the director is ready to address it.

## Constraints & Cautions
- Never push to `master` on the remote. Always target `main`.
- The remote URL contains an embedded PAT token. Do not log or expose it unnecessarily.
- The `siznexus-development/` folder contains multiple HTML pages and the `favicon/` directory. Do not modify pages other than the one being worked on unless instructed.
- The codebase is cyberpunk-themed — preserve the visual and stylistic identity in all changes.
- Do not change the `site.webmanifest` app name ("TheSizNexus") or theme color (`#0a0a0f`) without director instruction.

## Resolved Items (do not re-investigate)
- Profile tab open delay: fixed. `openModal()` is called before the async friends list fetch; friends list uses `Promise.all()` for parallel Firestore reads.
- Password reset modal: fully wired with all event listeners, loading state, error handling, and spam guidance.
- Favicon: new set deployed under `favicon/`, all HTML files and manifest updated, old files removed.
- Zone.Identifier Windows metadata files: removed.

## Agent Ecosystem
- **siz-developer:** Primary implementation agent. Reads/writes shared-knowledge.md.
- **knowledge-assistant:** Answers questions and documents findings. Reads/writes shared-knowledge.md.
- **researcher-assistant:** Researches techniques and best practices. Reads/writes shared-knowledge.md.
- **session-closeout (this agent):** Closes sessions, writes summaries, commits to GitHub.
- Agent definitions live at `/home/itzzzshxdow/.claude/agents/`.
