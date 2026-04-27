---
session_id: SIZ-20260426-2359
date: 2026-04-26
time: 23:59 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.4
current_phase: Phase 3 — Public Launch Prep (Early Access Ready)
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is live, public-facing, and open for public early access. The current focus is early-access monitoring, deferred features (Cloud Functions for Net rewards, App Check), and a hosting architecture migration.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html`, `privacy.html`, `terms.html`, `roadmap.html`
- **Active feature page:** `Commission.html` (direct URL access; do not delete)
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`
- **Firebase config:** `firestore.indexes.json` (deployed composite index; do not delete), `firestore.rules` (canonical source of truth)

## Hosting Architecture — CRITICAL
- **`siznexus.org` is served by GitHub Pages**, NOT Firebase Hosting. Porkbun DNS resolves to GitHub Pages IPs (`185.199.108-111.153`). This was confirmed via `gh api repos/shxdowxxx/siznexus/pages` and DNS lookup.
- **Frontend changes require `git push`** to take effect at `siznexus.org`. `firebase deploy --only hosting` only updates `thesiznexus.web.app`, which no real users reach via the custom domain.
- **`CNAME` file must remain in the repo** until DNS is migrated. It enables GitHub Pages to serve the `siznexus.org` domain. Do NOT delete it.
- **Prior session notes that said to delete `CNAME` are OUTDATED.** That guidance assumed Firebase Hosting was the active host — it is not.
- **Long-term plan:** Update Porkbun DNS A records to Firebase Hosting IPs, then disable GitHub Pages. This requires director access to Porkbun and is deferred.
- **`firebaserules.md`** is the doc copy of Firestore rules for human reference. `firestore.rules` is the canonical deploy source. Keep both in sync.

## Current Phase — Early Access Open
All major Phase 3 features are live. The stabilization sub-phase resolved all production breakage. The platform has been security-hardened and is open for public early access. Active priorities:
- Monitor early-access feedback for hotfix candidates
- Director mobile testing confirmation (Corp Hub modal, admin panel)
- Deferred: Cloud Functions for Net rewards, App Check, Porkbun DNS migration

## Phase 3 Surfaces (All Live)
- **Guest CTA section** — shown for logged-out visitors. Three buttons: Enlist Now, Try Demo, Discord.
- **Public profile pages** — `/u/<displayName>` via Hosting rewrite. `users` readable publicly; email NOT written to new docs.
- **Referrals** — `?ref=<displayName>` capture in localStorage. Net rewards NOT auto-issued (rules block self-increment).
- **Privacy / Terms / Roadmap / About** — static HTML files with matching nav + footer + static-page CSS.
- **Browser tab badge** — prefixes (N) when unread notifs/friend requests exist.
- **Native notifications** — Notification API in-tab when document.hidden. FCM push deferred.
- **Daily/Weekly leaderboards** — scope bar above hub leaderboard; computes from approved missionSubmissions in last 24h/7d.
- **Member-submitted intel** — non-staff create intelPosts with `status:'pending'`. Staff Approve/Reject inline.
- **Achievement cards** — canvas-rendered silver SizNexus card on streak milestones.
- **Activity heatmap** — counts daily activity from `corpLog` entries. `login` type written on first daily login. Composite index deployed (`corpLog uid ASC + createdAt DESC`).

## Removed Features (Do Not Re-add Without Director Approval)
- **Black Market** — removed (stabilization session). All HTML, JS, CSS gone. Firestore data preserved. Director said "too much to take care of right now" — may return later.
- **Operator Title** — removed (stabilization session). `titleHtml()` returns empty string. Firestore data preserved but hidden.
- **Public Landing (intel/leaderboard preview)** — replaced with simple Guest CTA.
- **SFX engine** — permanently removed per director decision. Do not re-add.
- **Floating terminal launcher** — moved to nav; no floating bottom button.
- **IndexMarket.html** — deleted (repo cleanup session). 2023 orphan, wrong Firebase project.
- **reciever.html** — deleted (repo cleanup session). Typo'd dead auth page.

## Firestore Rules — Current State (post security-hardening)
- `users`: read public. Email intentionally absent from new docs. Self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: `referredBy` now rejects self-uid on create.
- `users`: Black Market self-purchase dead-code rule deleted (was granting cost-free purchasedItems + badges; now gone entirely).
- `polls`: update restricted to `votes` field only (HIGH fix — previously any auth user could rewrite question/options/vote counts).
- `squads`: 5-member cap enforced on both create AND update (MEDIUM fix — previously update had no cap).
- `friendRequests`: update restricted to `status` field only (MEDIUM fix — previously either party could rewrite any field including `from`).
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only (threatLevel, domain lock).
- `intelPosts`: members create with `status:'pending'`; staff approve.
- `missions`/`events`/`intelPosts` reads require auth — guest queries fail silently (console noise only).
- `corpLog`: composite index `uid ASC + createdAt DESC` deployed. Do not remove from `firestore.indexes.json`.
- `devKeyHash` (LOW/DEFERRED): publicly readable. Deferred per director decision — only impacts internal tooling.

## CSS Conventions — Lesson from This Session
When base styles appear AFTER media queries in a CSS file, the base always wins the cascade regardless of specificity. Mobile-first (default rules hide/collapse, min-width media queries expand for desktop) is safer than max-width overrides when the file is long and declaration order matters. Do not write mobile-specific overrides in max-width blocks if the corresponding base style is declared later in the file.

## Visual Conventions
- **Silver only.** Yellow/gold purged from chrome. Exceptions: founding-member badge (rare medal), gold leaderboard rank icon (#1 medal), purchased gold terminal skin (user choice). All other accents use `var(--color-primary)` or `#D4D8E2`.
- Briefing-status colors are silver-tone variants (no green/red).
- Threat banner (admin-controlled) uses desaturated red/amber gradient — semantic, not chrome.
- Streak flame icon is silver, not orange.

## Authentication Gotchas
- **CSP is patched** — `apis.google.com` and `www.googletagmanager.com` are in `script-src`, `connect-src`, and `frame-src`. Google sign-in is unblocked.
- **API key restrictions are the right defense, not "hiding" the key.** Web Firebase API keys are public identifiers per Firebase docs.
- **App Check is OFF.** reCAPTCHA Enterprise rejected (requires GCP billing). Free reCAPTCHA v3 is the path forward when director is ready.
- **Domain restriction NOT verified completed** in Google Cloud Console.
- **Local dev**: serve via `firebase serve` at `localhost:5000`.

## Currency
- "Net" is canon. Do not use "points". Watch for identifier-mangling regressions from prior global replace (`attemNet`, `oNet`, `mission-Net`, `lb-Net`, `data-Net`) — restore word boundaries if found.

## Open Issues
- Director has not yet confirmed mobile fixes on a real device — Corp Hub modal scroll and hero text layout not tested on physical hardware.
- Cloud Functions for Net auto-rewards (streaks, referrals) — deferred. Rules block client-side self-increment; server-side required.
- Activity heatmap only populates from the stabilization session forward — past sessions not retroactively tracked.
- Existing user docs still carry legacy `email` field (not a live leak; new docs don't write it). Cleanup migration deferred.
- Public landing guest 403s — `missions`/`events`/`intelPosts` require auth. Queries fail silently but generate console noise. Strategy not decided.
- App Check not enabled.
- `devKeyHash` publicly readable — deferred (LOW, internal tooling only).
- Hosting migration: Porkbun DNS currently points to GitHub Pages. Long-term goal is Firebase Hosting IPs. Requires director Porkbun access.

## What Claude Should Prioritize Next Session
1. Collect and triage any early-access user bug reports or feedback.
2. Confirm director's mobile testing results — fix any Corp Hub modal or admin panel issues found on a real device.
3. Cloud Functions planning for Net auto-rewards if director is ready to tackle it.
4. Hosting migration planning: walkthrough for updating Porkbun DNS when director has access.

## Director Preferences (Persistent)
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased (Black Market) or semantic (threat banner).
- No site sounds. SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon — NOT a floating bottom button.
- Director catches security issues fast. Be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas presented in tiers with a "my pick if you do nothing else" recommendation. Pragmatism over completeness.
- Do NOT delete the `CNAME` file from the repo. GitHub Pages depends on it for `siznexus.org`.
