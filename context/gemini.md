---
session_id: SIZ-20260426-1530
date: 2026-04-26
time: 15:30 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.2
current_phase: Phase 3 — Public Launch Prep
---

# Gemini Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is feature-complete for a public launch.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html` (legacy), `privacy.html`, `terms.html`, `roadmap.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Phase 3 Surfaces (Public-Launch)
- Public landing for logged-out visitors (hero + latest intel + mission count + spotlight + top-5 wall of fame + top-3 elite squads + JOIN CTA).
- Public profile pages at `/u/<displayName>` via Hosting rewrite.
- Referrals via `?ref=<displayName>` capture. Net rewards NOT auto-issued (rules block self-increment).
- Privacy / Terms / Roadmap as separate static HTML pages routed via `firebase.json` rewrites.
- Browser tab title badge for unread notifications.
- Native browser notifications via Notification API (FCM push deferred).
- Daily/Weekly resetting leaderboards in the Hub.
- Member-submitted intel posts with admin Approve/Reject.
- Canvas-rendered Achievement cards on streak milestones.

## Firestore Rules — Critical Quirks
- `users`: read public, but email field is intentionally absent on new docs.
- `users`: self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: scoped self-update allows points DECREMENT only when purchasedItems grows by 1 (Black Market). Cannot self-INCREMENT points.
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only.
- `intelPosts`: members create with `status:'pending'`; staff approve.
- `missions`/`events`/`intelPosts` reads require auth — public landing queries fail silently for guests.

## Visual Conventions
- **Silver-only chrome.** Yellow/gold purged. Exceptions: founding-member badge (rare medal), gold leaderboard #1 medal, gold terminal skin (user purchase).
- Briefing-status colors are silver-tone (no green/red except for semantic threat banner).
- Streak flame is silver, not orange.

## Authentication Gotchas
- **API key restrictions are the correct defense.** Firebase Web API keys are PUBLIC identifiers per Firebase docs. Director was confused on this point.
- **App Check is OFF.** reCAPTCHA Enterprise was attempted but rejected (requires GCP billing). Free reCAPTCHA v3 is the future path.
- **Domain restriction not verified** in Google Cloud Console.
- **Local dev** runs at `localhost:5000` via `firebase serve` (Firebase Auth allowlists localhost by default).

## Currency
- "Net" is canon (was "points" before this session). Identifier-mangling bugs from prior global replace were fixed this session.

## Open Issues
- `auth/internal-error` reported on login. CSP currently blocks www.googletagmanager.com (Firebase Analytics needs it). NOT YET PATCHED.
- 26 commits ahead of origin/main, not pushed.
- Public landing 403s for guests are silent but noisy in console.
- Streak/referral Net rewards need a Cloud Function.
- Existing user docs still carry the legacy `email` field; new docs don't.

## Director Preferences
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased or semantic (threat banner).
- No site sounds — removed SFX engine + ambient drone in this session.
- Terminal launcher belongs in the nav next to the search icon, NOT a floating bottom button.
- Director catches security issues fast — be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas in tiers with a "my pick if you do nothing else" recommendation.
