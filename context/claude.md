---
session_id: SIZ-20260425-1827
date: 2026-04-25
time: 18:27 UTC
project: TheSizCorporation / SizNexus
agent: Codex
version: 1.0
current_phase: Phase 2 — Feature & Optimization Work
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed website built with vanilla HTML, CSS, and JavaScript on top of Firebase Auth and Firestore (`thesiznexus`). The current main surface is no longer a flat card grid. This session reworked `index.html` into a structured dashboard and brought the Corporation Hub modal up to the same product standard.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Project handoff files:** `context/project-state.md`, `context/claude.md`, `context/gemini.md`, `summaries/session-summary.md`
- **Other HTML files:** `Commission.html`, `IndexMarket.html`, `about.html`, `reciever.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`, never `master`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Current Phase
**Phase 2 — Feature & Optimization Work**
Phase 1 is complete. Phase 2 remains open-ended and is currently focused on UX polish, dashboard usefulness, and deeper Firestore-backed member tooling.

## Homepage Dashboard Shape
The landing page now follows a true three-column shell:
- **Left rail:** `Nexus Overview`, `Active Members`, `Socials`
- **Center column:** `Command Board` with access-aware identity, quick actions, and preview tabs
- **Right rail:** `Mission Pulse`, `Featured Member`, `How to Join`

The middle column is intentionally the strongest surface. Do not turn it into decorative filler. It is the functional command area for corp activity, missions, rankings, and intel.

## Corporation Hub State
`#engagementModal` was upgraded to match the homepage:
- Tab-aware hero copy via `updateHubChrome(tab)`
- Per-tab label/count/note via `updateHubSectionInfo(...)`
- Quick stat strip via `loadHubQuickStats()`
- Wider desktop layout and cleaner responsive behavior
- Better alignment between homepage previews and full hub destinations

## Firestore-Backed Surfaces In Active Use
Current homepage and hub work reads from these collections:
- `users`
- `corpLog`
- `missions`
- `missionSubmissions`
- `events`
- `intelPosts`
- `polls`
- `announcements`

Earlier session data structures still matter:
- `commissions`
- `inquiries`

## Important Session Decisions
- The real entry file is `index.html`, not `siznexus.html`.
- Keep the stack vanilla HTML/CSS/JS with Firebase compat APIs. Do not introduce a framework.
- Guest viewers should see useful locked previews, not blank space. `promptGuestRegister(...)` remains the gate.
- The old featured-member placeholder flow is gone. Spotlight content now comes from Firestore `users` and rotates across a scored pool.
- Homepage command previews are driven by `refreshDashboardSurface()`, `loadHomePreview()`, `loadNetworkSnapshot()`, and `loadFeaturedMembers()`.
- `firestore.rules` remains the canonical Firestore rules file, but it still requires manual publish in Firebase Console.
- `getElementById('profileActivityStatus')` remains a known guarded dead reference for a planned feature.

## Current State
- Homepage dashboard and hub polish are implemented locally in `index.html`, `siznexus.css`, and `siznexus.js`
- `node --check siznexus.js` passes
- Local preview was served at `http://127.0.0.1:4173/index.html`
- The current work is local only and was not committed or pushed during this session

## What Claude Should Prioritize Next Session
1. **Director action still pending:** publish `firestore.rules` in Firebase Console
2. Replace heuristic homepage spotlighting and summary copy with admin-curated Firestore content where it improves control
3. Tighten the relationship between homepage preview cards and the full hub tabs so the two surfaces feel like one system
4. Revisit the `profileActivityStatus` placeholder once the director wants that feature surfaced

## Constraints & Cautions
- Always work against `main`
- Do not revert unrelated local changes in this repo
- Preserve the cyberpunk identity, but keep operational surfaces clean and information-dense
- Keep the center dashboard functional; avoid marketing-style hero composition
- Do not bypass existing `esc()` sanitization where user content is rendered

## Resolved Items (do not re-investigate)
- Homepage equal-weight grid was replaced with a real left / center / right dashboard layout
- `Command Board` now has access-aware copy, quick actions, and live preview tabs
- `Mission Pulse` now exposes actionable counts and lead items instead of generic stats
- `Featured Member` now uses real Firestore user data instead of placeholder content
- `Corporation Hub` modal header, summary, quick stats, and section metadata were redesigned
- `Commission.html` Firestore rebuild and `firestore.rules` authoring from the prior session still stand

## Agent Ecosystem
- **siz-developer:** primary implementation agent
- **knowledge-assistant:** documentation and technical answers
- **researcher-assistant:** research and pattern scouting
- **session-closeout / Codex:** session summaries and cross-agent handoff
- Shared memory lives at `/home/itzzzshxdow/.claude/shared-knowledge.md`
