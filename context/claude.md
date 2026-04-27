---
session_id: SIZ-20260426-2330
date: 2026-04-26
time: 23:30 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.3
current_phase: Phase 3 — Public Launch Prep (Stabilization)
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is live and public-facing. The current focus is stabilization, mobile polish, and deferred features (Cloud Functions for Net rewards, App Check).

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html`, `privacy.html`, `terms.html`, `roadmap.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`
- **Firebase Hosting indexes config:** `firestore.indexes.json` (deployed; do not delete)

## Current Phase — Stabilization
The major features from Phase 3 (public landing, profile pages, referrals, leaderboards, intel posts, achievement cards, Ops Map, Operator ID) are all live. This phase is about:
- Fixing breakage found in production (auth errors, routing conflicts, broken queries)
- Removing features the director has decided are too burdensome right now (Black Market, Operator Title)
- Polishing mobile layout
- Deferring Net reward automation to Cloud Functions

## Phase 3 Surfaces (All Live)
- **Guest CTA section** — shown in place of the dashboard for logged-out visitors. Three buttons: Enlist Now, Try Demo, Discord. (Replaced the public landing with intel/leaderboard preview — that approach was removed this session.)
- **Public profile pages** — `/u/<displayName>` resolves via Hosting rewrite, opens profile modal. `users` collection is publicly readable; email is NOT written there.
- **Referrals** — `?ref=<displayName>` capture in localStorage. New signups get `referredBy` field + corpLog announcement. Net rewards NOT auto-issued (rules block self-increment).
- **Privacy / Terms / Roadmap / About** — separate static HTML files routed via `firebase.json` rewrites. All now match the same nav + footer + static-page CSS style.
- **Browser tab badge** — prefixes (N) when unread notifs/friend requests exist.
- **Native notifications** — Notification API in-tab when document.hidden. FCM push deferred.
- **Daily/Weekly leaderboards** — scope bar above hub leaderboard; computes from approved missionSubmissions in last 24h/7d.
- **Member-submitted intel** — non-staff create intelPosts with `status:'pending'`. Staff Approve/Reject inline.
- **Achievement cards** — canvas-rendered silver SizNexus card on streak milestones.
- **Activity heatmap** — counts daily activity from `corpLog` entries. `login` type written on first daily login. Composite index deployed (`corpLog uid ASC + createdAt DESC`).

## Removed Features (Do Not Re-add Without Director Approval)
- **Black Market** — removed this session. Tab button, hub section HTML, JS (`loadBlackMarket`, `buyMarketItem`, `applyTerminalSkin`, `MARKET_ITEMS`), and CSS are all gone. Firestore data preserved. Director said "too much to take care of right now" — may return later.
- **Operator Title** — removed this session. `titleHtml()` returns empty string. Firestore data preserved but hidden.
- **Public Landing (intel/leaderboard preview)** — replaced with simple Guest CTA section.
- **SFX engine** — permanently removed per director decision. Do not re-add.
- **Floating terminal launcher** — moved to nav; no floating bottom button.

## Firestore Rules — Critical Quirks (do not relax without thinking)
- `users`: read public (needed for /u/ + wall of fame + spotlight). Email field is intentionally absent on new docs. Self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: scoped self-update allows points DECREMENT only when purchasedItems grows by exactly one (Black Market rule — now dead code since Black Market UI is gone, but harmless to leave).
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only — holds threatLevel + domain lock config.
- `squads`: leader-managed; members can self-remove only.
- `intelPosts`: members create with `status:'pending'`, staff approve.
- `missions`/`events`/`intelPosts` reads require auth — guest queries fail silently.
- `corpLog`: composite index `uid ASC + createdAt DESC` is deployed. Do not remove from `firestore.indexes.json`.

## Infrastructure Notes
- **`CNAME` file must NOT exist in the repo.** It caused GitHub Pages to claim `siznexus.org` and break Firebase Hosting rewrites. The custom domain is managed solely in the Firebase Hosting console.
- **`siznexus.org` custom domain** must be kept active in the Firebase Hosting console — it was dropped once and required manual re-entry. Monitor it.
- **`firestore.indexes.json`** must remain in the repo and be kept in sync with `firebase.json`'s `firestore.indexes` reference.
- Local dev: `firebase serve` at `localhost:5000` (not `127.0.0.1`).

## Visual Conventions
- **Silver only.** Yellow/gold purged from chrome. Exceptions: founding-member badge (rare medal), gold leaderboard rank icon (#1 medal), purchased gold terminal skin (user choice). All other accents use `var(--color-primary)` or `#D4D8E2`.
- Briefing-status colors are silver-tone variants (no green/red).
- Threat banner (admin-controlled) uses desaturated red/amber gradient — semantic, not chrome.
- Streak flame icon is silver, not orange.

## Authentication Gotchas
- **CSP is now patched** — `apis.google.com` and `www.googletagmanager.com` are in `script-src`, `connect-src`, and `frame-src`. Google sign-in is unblocked.
- **API key restrictions are the right defense, not "hiding" the key.** Web Firebase API keys are public identifiers per Firebase docs. Director was confused on this — explain it again if it comes up.
- **App Check is OFF.** reCAPTCHA Enterprise rejected (requires GCP billing). Free reCAPTCHA v3 is the path forward when director is ready.
- **Domain restriction NOT verified completed** in Google Cloud Console.
- **Localhost dev**: serve via `firebase serve` (port 5000).

## Currency
- "Net" is canon. Do not use "points". Watch for identifier-mangling regressions from prior global replace (e.g., `attemNet`, `oNet`, `mission-Net`, `lb-Net`, `data-Net`) — restore word boundaries if found.

## Open Issues
- Mobile layout for Corp Hub modal and admin panel just overhauled — not yet confirmed by director testing on a real device.
- `siznexus.org` custom domain in Firebase Hosting console — dropped once today; monitor.
- Net auto-rewards (streak milestones, referrals) need Cloud Functions. Currently tracking-only.
- Activity heatmap will only populate from this session forward — past sessions not retroactively tracked.
- Existing user docs still carry legacy `email` field (not a live leak; new docs don't write it). Cleanup migration deferred.
- Public landing guest 403s — `missions`/`events`/`intelPosts` require auth. Queries fail silently but generate console noise. Strategy not yet decided.
- App Check not enabled.

## What Claude Should Prioritize Next Session
1. Confirm director's mobile testing results — fix any Corp Hub modal or admin panel issues found.
2. Decide strategy for public landing guest 403s (loosen rules vs. gate queries on `currentUser`).
3. If director is ready: register free reCAPTCHA v3 site key and re-enable Firebase App Check.
4. Cloud Functions planning for Net auto-rewards when director wants to tackle it.

## Director Preferences (Persistent)
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased (Black Market) or semantic (threat banner).
- No site sounds. SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon — NOT a floating bottom button.
- Director catches security issues fast (e.g., raw uid in operator ID). Be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas presented in tiers with a "my pick if you do nothing else" recommendation. Pragmatism over completeness.
- Do NOT commit a `CNAME` file to the repo under any circumstances.
