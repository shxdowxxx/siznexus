---
session_id: SIZ-20260413-1800
date: 2026-04-13
time: 18:00 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 2 — Feature & Optimization Work
---

# Gemini Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed website built with vanilla HTML, CSS, and JavaScript. The backend is Firebase (Authentication + Firestore). There is no build toolchain — all development is direct file editing. The project is at version 2.1 and is in active Phase 2 feature and optimization work.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js` (the main HTML entry point is `index.html`)
- **Other HTML files:** `Commission.html`, `IndexMarket.html`, `about.html`, `reciever.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — all work targets the `main` branch. The `master` branch exists on the remote but is inactive; do not push to it.
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Current Phase
**Phase 2 — Feature & Optimization Work**
Phase 1 (Foundation & Infrastructure) is fully complete as of the first session. Phase 2 covers ongoing feature additions, performance improvements, and UX polish. It has no fixed endpoint and advances each session per the director's priorities.

## Key Architectural Decisions
- Stack: vanilla HTML/CSS/JS only. Do not suggest or introduce frameworks or bundlers unless the director explicitly requests it.
- Backend: Firebase (Auth + Firestore). No additional backend or auth systems should be introduced.
- Cross-agent shared memory: `/home/itzzzshxdow/.claude/shared-knowledge.md`. All agents read from and write to this file. Consult it at the start of each session.
- The password reset modal (`#resetModal`) is fully implemented: event listeners for open/close/backdrop, loading spinner on submit, human-readable auth error messages (`auth/user-not-found`, `auth/invalid-email`, `auth/too-many-requests`), spam folder guidance in modal copy, and `actionCodeSettings` passed to `sendPasswordResetEmail()`. Do not re-implement or duplicate this flow.
- `getElementById('profileActivityStatus')` is a deliberate dead reference, protected by a null-check if-guard. It signals a planned feature. Do not remove it without the director's explicit instruction.
- Favicon assets live under `favicon/` relative to the project root. The `site.webmanifest` canonical app name is "TheSizNexus" with theme color `#0a0a0f`.

## Priority Work for Next Session
1. Director will define the next Phase 2 priority at session start — no specific feature was locked in at the end of the current session.
2. **Custom email sending (deferred):** Resend DNS records are already configured on Porkbun. Revisit when the director approves budget for a paid Resend plan. Goal: send reset emails from a custom domain to avoid spam classification of Firebase's default `noreply@thesiznexus.firebaseapp.com` sender.
3. **`profileActivityStatus` dead reference:** Assess whether to implement the activity status feature or remove the reference entirely.

## Constraints and Cautions
- Always push to `main`. Never push to `master`.
- The remote URL contains an embedded personal access token. Handle git operations carefully and avoid exposing this value unnecessarily.
- The `siznexus-development/` directory contains multiple HTML pages and the `favicon/` subdirectory. Do not modify pages or assets other than those the director specifies.
- Maintain the cyberpunk visual and stylistic identity in all changes to the front end.
- Do not change the `site.webmanifest` app name ("TheSizNexus") or theme color (`#0a0a0f`) without director instruction.

## Resolved Items (do not re-investigate)
- Profile tab open delay: resolved. `openModal()` is called before the async friends list fetch; `renderMyFriendsList()` now uses `Promise.all()` for parallel Firestore reads instead of sequential `for...of await`.
- Password reset modal: fully wired and UX-polished.
- Favicon: new set deployed under `favicon/`, all HTML files and manifest updated, old files removed.
- Zone.Identifier Windows metadata files: removed from workspace.

## Agent Ecosystem
- **siz-developer:** Primary implementation agent for all code changes.
- **knowledge-assistant:** Documents findings, answers technical questions.
- **researcher-assistant:** Investigates techniques and best practices before implementation.
- **session-closeout:** Produces session summaries, updates context files, commits to GitHub at session end.
- Agent definition files: `/home/itzzzshxdow/.claude/agents/`
- Shared knowledge file: `/home/itzzzshxdow/.claude/shared-knowledge.md`
