---
session_id: SIZ-20260426-2330
date: 2026-04-26
time: 23:30 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.3
current_phase: Phase 3 — Public Launch Prep (Stabilization)
---

# Gemini Context — SizNexus Project

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
Major Phase 3 features (public landing guest CTA, profile pages, referrals, leaderboards, intel posts, achievement cards, Ops Map, Operator ID) are all live. This phase is about:
- Fixing production breakage (auth errors, routing conflicts, broken queries)
- Removing features the director has decided are too burdensome right now (Black Market, Operator Title)
- Polishing mobile layout
- Deferring Net reward automation to Cloud Functions

## Phase 3 Surfaces (All Live)
- **Guest CTA section** — shown for logged-out visitors (Enlist Now / Try Demo / Discord). Replaced the prior public landing with intel/leaderboard preview — that approach was removed this session.
- **Public profile pages** — `/u/<displayName>` via Hosting rewrite. `users` readable publicly; email NOT written to new docs.
- **Referrals** — `?ref=<displayName>` capture in localStorage. Net rewards NOT auto-issued (rules block self-increment).
- **Privacy / Terms / Roadmap / About** — static HTML files, all using the same nav + footer + static-page CSS style.
- **Browser tab badge, native notifications, daily/weekly leaderboards, member intel posts, achievement cards** — all live.
- **Activity heatmap** — counts daily activity from `corpLog` entries. `login` type written on first daily login. Composite index deployed.

## Removed Features (Do Not Re-add Without Director Approval)
- **Black Market** — removed this session. All HTML, JS, CSS gone. Firestore data preserved. May return later.
- **Operator Title** — removed this session. `titleHtml()` returns empty string.
- **Public Landing (intel/leaderboard preview)** — replaced with simple Guest CTA.
- **SFX engine** — permanently removed. Do not re-add under any circumstances.
- **Floating terminal launcher** — moved to nav; no floating bottom button.

## Firestore Rules — Critical Quirks
- `users`: read public, email intentionally absent from new docs. Self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: scoped self-update allows points DECREMENT only when purchasedItems grows by exactly one (Black Market rule — now dead code but harmless).
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only.
- `intelPosts`: members create with `status:'pending'`; staff approve.
- `missions`/`events`/`intelPosts` reads require auth — guest queries fail silently.
- `corpLog`: composite index `uid ASC + createdAt DESC` deployed. Do not remove from `firestore.indexes.json`.

## Infrastructure Notes
- **`CNAME` file must NOT exist in the repo.** It caused GitHub Pages to claim `siznexus.org` and break Firebase Hosting rewrites. Custom domain managed solely in the Firebase Hosting console.
- **`siznexus.org` custom domain** must stay active in Firebase Hosting console — was dropped once and required manual re-entry. Monitor.
- **CSP is patched** — `apis.google.com` and `www.googletagmanager.com` added to `script-src`, `connect-src`, `frame-src`. Google sign-in is unblocked.
- Local dev: `firebase serve` at `localhost:5000`.

## Visual Conventions
- **Silver-only chrome.** Yellow/gold purged. Exceptions: founding-member badge, gold #1 leaderboard medal, gold terminal skin (user purchase).
- Briefing-status colors are silver-tone (no green/red except semantic threat banner).
- Streak flame is silver, not orange.

## Authentication Gotchas
- **API key restrictions are the correct defense.** Firebase Web API keys are PUBLIC identifiers per Firebase docs.
- **App Check is OFF.** reCAPTCHA Enterprise rejected (requires GCP billing). Free reCAPTCHA v3 is the future path.
- **Domain restriction not verified** in Google Cloud Console.

## Currency
- "Net" is canon (was "points"). Watch for identifier-mangling regressions from prior global replace (`attemNet`, `oNet`, `mission-Net`, `lb-Net`, `data-Net`) — restore word boundaries if found.

## Open Issues
- Mobile Corp Hub modal and admin panel overhauled — not yet confirmed by director on a real device.
- `siznexus.org` custom domain dropped once today; monitor Firebase Hosting console.
- Net auto-rewards (streaks, referrals) need Cloud Functions. Currently tracking-only.
- Activity heatmap only populates from this session forward; past sessions not retroactively tracked.
- Existing user docs still have legacy `email` field; new docs don't. Cleanup migration deferred.
- Public landing guest 403s are silent but noisy in console; strategy not yet decided.
- App Check not enabled.

## Director Preferences
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased or semantic (threat banner).
- No site sounds — SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon, NOT a floating bottom button.
- Director catches security issues fast — be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas in tiers with a "my pick if you do nothing else" recommendation.
- Do NOT commit a `CNAME` file to the repo.
