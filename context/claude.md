---
session_id: SIZ-20260426-1530
date: 2026-04-26
time: 15:30 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.2
current_phase: Phase 3 — Public Launch Prep
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is feature-complete for a public launch.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html` (legacy), `privacy.html`, `terms.html`, `roadmap.html`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Phase 3 Surfaces (Public-Launch)
- **Public landing** — visible to logged-out visitors. Hero + latest intel + live mission count + spotlight + top-5 wall of fame + top-3 elite squads + JOIN CTA banner.
- **Public profile pages** — `/u/<displayName>` resolves via Hosting rewrite, opens existing profile modal. `users` collection is publicly readable; email is NOT written there anymore.
- **Referrals** — `?ref=<displayName>` capture in localStorage. New signups get `referredBy` field + corpLog announcement. Net rewards are NOT auto-issued (rules block self-increment).
- **Privacy / Terms / Roadmap** — separate static HTML files routed via `firebase.json` rewrites. About.html is legacy 973-line page kept as-is.
- **Browser tab badge** — prefixes (N) when there are unread notifs/friend requests.
- **Native notifications** — Notification API in-tab when document.hidden. FCM push deferred (needs Cloud Functions).
- **Daily/Weekly leaderboards** — scope bar above hub leaderboard; computes from approved missionSubmissions in last 24h/7d.
- **Member-submitted intel** — non-staff create intelPosts with `status:'pending'`. Staff Approve/Reject inline.
- **Achievement cards** — canvas-rendered silver SizNexus card on streak milestones.

## Firestore Rules — Critical Quirks (do not relax without thinking)
- `users`: read public (needed for /u/ + wall of fame + spotlight). Email field is intentionally absent on new docs. Self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: scoped self-update allowed for points DECREMENT only when purchasedItems grows by exactly one (Black Market). Cannot self-INCREMENT points.
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only — holds threatLevel + domain lock config.
- `squads`: leader-managed; members can self-remove only.
- `intelPosts`: members create with `status:'pending'`, staff approve.
- `missions`/`events`/`intelPosts` reads require auth → public landing queries fail silently for guests.

## Visual Conventions
- **Silver only.** Yellow/gold purged from chrome. Exceptions: founding-member badge (rare medal), gold leaderboard rank icon (#1 medal), purchased gold terminal skin (user choice). All other accents use `var(--color-primary)` or `#D4D8E2`.
- Briefing-status colors are silver-tone variants (no green/red).
- Threat banner (admin-controlled) uses desaturated red/amber gradient — semantic, not chrome.
- Streak flame icon was orange; now silver.

## Authentication Gotchas
- **API key restrictions are the right defense, not "hiding" the key.** Web Firebase API keys are public identifiers per Firebase docs. Director was confused on this — explain it again if it comes up.
- **App Check is OFF.** reCAPTCHA Enterprise was attempted but rejected (requires GCP billing). Free reCAPTCHA v3 is the path forward when director is ready.
- **Domain restriction NOT verified completed** in Google Cloud Console. Walk through it again if asked.
- **Localhost dev**: serve via `firebase serve` (port 5000) — Firebase Auth's default authorized domains list includes localhost but not 127.0.0.1.

## Currency
- "Net" is canon. The rebrand was done by Gemini in a prior session. Identifier-mangling bugs from a sloppy global replace ('pts'→'Net' without word boundaries) were fixed this session — if you see anything like `attemNet`, `oNet`, `mission-Net`, `lb-Net`, `data-Net`, that's the regression to undo.

## Open Issues
- Director reported `auth/internal-error` near end of session. CSP currently blocks www.googletagmanager.com (Firebase Analytics). NOT YET PATCHED. Add `googletagmanager.com`, `*.google-analytics.com`, `apis.google.com` to script-src + connect-src first thing next session.
- 26 commits ahead of origin/main, not pushed.
- Public landing 403s for guests are silent but noisy in console.
- Streak/referral Net rewards need a Cloud Function.
- Existing user docs still carry the `email` field; new ones don't.

## What Claude Should Prioritize Next Session
1. Patch CSP to unblock Firebase Analytics → resolves auth/internal-error.
2. Decide public-landing 403 strategy (loosen rules vs. gate queries on currentUser).
3. Push the 26 local commits to GitHub once director gives the OK.
4. If director has time: register a free reCAPTCHA v3 site key and re-enable Firebase App Check.

## Director Preferences (Persistent)
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless it's user-purchased (Black Market) or semantic (threat banner).
- No site sounds. Removed SFX engine (mouseover bleeps), ambient drone, and any tone-on-action.
- Terminal launcher belongs in the nav next to the search icon — NOT a floating bottom button (conflicts with corp chat).
- Director catches security issues fast (e.g., raw uid in operator ID). Be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas presented in tiers with a "my pick if you do nothing else" recommendation. They appreciate pragmatism over completeness.
