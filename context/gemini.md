---
session_id: SIZ-20260503-1700
date: 2026-05-03
time: 17:00 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.8
current_phase: Chrome Extension — Web Store Prep
---

# Gemini Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is live, public-facing, and open for public early access. The current focus is early-access monitoring, deferred features (Cloud Functions for Net rewards, App Check), and a hosting architecture migration.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html`, `privacy.html`, `terms.html`, `roadmap.html`
- **Active feature page:** `Commission.html` (direct URL access; do not delete)
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — target `main`
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`
- **Firebase config:** `firestore.indexes.json` (deployed; do not delete), `firestore.rules` (canonical source of truth)

## Hosting Architecture — CRITICAL
- **`siznexus.org` is served by GitHub Pages**, NOT Firebase Hosting. Porkbun DNS resolves to GitHub Pages IPs (`185.199.108-111.153`).
- **Frontend changes require `git push`** to take effect at `siznexus.org`. `firebase deploy --only hosting` only updates `thesiznexus.web.app`.
- **`CNAME` file must remain in the repo** until DNS is migrated to Firebase Hosting IPs. Do NOT delete it.
- **Prior guidance to delete `CNAME` is OUTDATED.** That assumed Firebase Hosting was the active host — it is not.
- **Long-term plan:** Update Porkbun DNS to Firebase Hosting IPs, then disable GitHub Pages. Requires director Porkbun access. Deferred.
- **`firebaserules.md`** is the doc copy of Firestore rules. `firestore.rules` is the canonical deploy source. Keep both in sync.

## Current Phase — Early Access Open
All major Phase 3 features are live and security-hardened. The platform is open for public early access. Priorities: early-access monitoring, director mobile testing confirmation, and deferred backlog items.

## Phase 3 Surfaces (All Live)
- **Guest CTA section** — shown for logged-out visitors (Enlist Now / Try Demo / Discord).
- **Public profile pages** — `/u/<displayName>` via Hosting rewrite. `users` readable publicly; email NOT written to new docs.
- **Referrals** — `?ref=<displayName>` capture in localStorage. Net rewards NOT auto-issued (rules block self-increment).
- **Privacy / Terms / Roadmap / About** — static HTML files with matching nav + footer + static-page CSS.
- **Browser tab badge, native notifications, daily/weekly leaderboards, member intel posts, achievement cards** — all live.
- **Activity heatmap** — counts daily activity from `corpLog` entries. `login` type written on first daily login. Composite index deployed.

## Removed Features (Do Not Re-add Without Director Approval)
- **Black Market** — removed (stabilization session). All HTML, JS, CSS gone. Firestore data preserved. May return later.
- **Operator Title** — removed (stabilization session). `titleHtml()` returns empty string.
- **Public Landing (intel/leaderboard preview)** — replaced with simple Guest CTA.
- **SFX engine** — permanently removed. Do not re-add under any circumstances.
- **Floating terminal launcher** — moved to nav; no floating bottom button.
- **IndexMarket.html** — deleted (repo cleanup). 2023 orphan, hardcoded to wrong Firebase project.
- **reciever.html** — deleted (repo cleanup). Typo'd dead auth page.

## Firestore Rules — Current State (post security-hardening)
- `users`: read public. Email absent from new docs. Self-update blocks rank/isBanned/points/badges/isOwner/email/referredBy.
- `users`: `referredBy` now rejects self-uid on create.
- `users`: Black Market self-purchase dead-code rule deleted.
- `polls`: update restricted to `votes` field only (HIGH fix).
- `squads`: 5-member cap enforced on both create AND update (MEDIUM fix).
- `friendRequests`: update restricted to `status` field only (MEDIUM fix).
- `_configKEY/featured`: Co-Admin+ write, public read.
- `_configKEY/app`: owner write only.
- `intelPosts`: members create with `status:'pending'`; staff approve.
- `missions`/`events`/`intelPosts` reads require auth — guest queries fail silently.
- `corpLog`: composite index `uid ASC + createdAt DESC` deployed. Do not remove from `firestore.indexes.json`.
- `devKeyHash` publicly readable — deferred (LOW, internal tooling only).

## CSS Conventions — Lesson from This Session
When base styles appear AFTER media queries in a CSS file, the base always wins the cascade. Mobile-first (default rules hide/collapse, min-width media queries expand for desktop) is safer than max-width overrides when declaration order matters. Do not write mobile-specific overrides in max-width blocks if the corresponding base style is declared later in the file.

## Visual Conventions
- **Silver-only chrome.** Yellow/gold purged. Exceptions: founding-member badge, gold #1 leaderboard medal, gold terminal skin (user purchase).
- Briefing-status colors are silver-tone (no green/red except semantic threat banner).
- Streak flame is silver, not orange.

## Authentication Gotchas
- **CSP is patched** — `apis.google.com` and `www.googletagmanager.com` added to `script-src`, `connect-src`, `frame-src`. Google sign-in is unblocked.
- **API key restrictions are the correct defense.** Firebase Web API keys are PUBLIC identifiers per Firebase docs.
- **App Check is OFF.** reCAPTCHA Enterprise rejected (requires GCP billing). Free reCAPTCHA v3 is the future path.

## Currency
- "Net" is canon (was "points"). Watch for identifier-mangling regressions (`attemNet`, `oNet`, `mission-Net`, `lb-Net`, `data-Net`) — restore word boundaries if found.

## Open Issues
- Director has not confirmed mobile fixes on a real device — Corp Hub modal and hero text layout untested on physical hardware.
- Cloud Functions for Net auto-rewards (streaks, referrals) — deferred; rules block client-side self-increment.
- Activity heatmap only populates from the stabilization session forward; past sessions not retroactively tracked.
- Existing user docs carry legacy `email` field; new docs don't. Cleanup migration deferred.
- Public landing guest 403s are silent but noisy in console; strategy not decided.
- App Check not enabled.
- `devKeyHash` publicly readable — deferred (LOW, internal tooling only).
- Hosting migration (Porkbun DNS → Firebase IPs) — deferred; requires director Porkbun access.

## shxdow Portfolio Page — `siznexus.org/shxdow`

Personal portfolio added as a sub-project inside this repo (same GitHub Pages host).

- **File:** `shxdow/index.html` (single file). Avatar: `shxdow/ShxdowKu.jpg`.
- **Songs:** Root-level `songs/` folder (NOT inside `shxdow/`). URL: `https://siznexus.org/songs/{encodeURIComponent(filename)}.mp3`.
- **Design:** Pure black `#090909`, silver/white, Orbitron + Share Tech Mono, 620px max-width.
- **Discord Activity:** Polls Sentry bot `/api/presence` (Railway: `https://sentry-production-60e4.up.railway.app`) every 15s. Public endpoint.
- **MP3 handling:** `.gitattributes` includes `*.mp3 -text`. Keep it. A prior bad commit normalized an MP3 into a 2-byte CRLF text file; if playback fails again, verify the song is a real binary.
- **Music player:** Real `<audio>` element. Current tracks use pinned Apple-hosted cover URLs for reliable artwork. On audio failure, shows "Track file is unavailable. Re-upload the MP3 to /songs."
- **Current playlist (5 songs):** "Al Compás De Mi Caballo" (Los Imperial's), "Distractions" (Haiti Babii), "Hot In Herre" (Nelly), "It's On" (Eazy-E), "KLK (feat. Victor Rivera Y Su Nuevo Estilo)" (Victor Mendivil / El Padrinito Toys / Kevin AMF).
- **Open issues:** (1) social placeholders (TikTok, X, YouTube) unfilled; (2) bio text may need revision; (3) more songs can be added, and ambiguous tracks should pin `cover` URLs directly in `PLAYLIST`.
- **Song upload rule:** Strip any Windows ` (1)` suffix from filename before committing to `songs/`.

## Sentry Bot — Presence Architecture (as of 2026-05-02)
- `src/utils/presenceCache.js` — centralizes presence serialization; writes to `data/presence.json`.
- `src/events/ready.js` — seeds owner presence on startup via `guild.members.fetch({ user: [OWNER_ID], withPresences: true })`.
- `src/events/presenceUpdate.js` — uses shared serializer from `presenceCache.js`.
- `GET /api/presence` — public, no auth, CORS `*`.
- **Director Discord UID:** `1173035520708845666`

## Chrome Extension — `siz-extension/` (updated 2026-05-03)
A parallel project built 2026-05-03. Lives outside the `siznexus-development` repo.

- **Local path:** `/home/itzzzshxdow/siz-extension/`
- **Type:** Chrome Extension MV3 — Grammarly-style hidden right-edge sidebar
- **Tabs:** Code Editor (JS/HTML/CSS/Python, sandbox run), AI Chat (GPT-4o-mini, key in chrome.storage.local), Text Obfuscator (homoglyph + zero-width injection), Notes (auto-save to storage), Cloak (disguise tab as Docs/Canvas/Khan, panic key)
- **Icons:** PNG at `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`. Manifest references PNGs — Web Store compatible.
- **Package:** `/home/itzzzshxdow/siz-extension.zip` (22.1 KB) — upload artifact for Chrome Web Store.
- **Status:** Feature complete, packaged, Web Store ready. Blocked on $5 developer registration fee.
- **Known behavior:** Does NOT appear on `chrome://newtab` — Chrome blocks extensions on `chrome://` URLs by design. Works on all `https://` pages.
- **Site access:** Must be "On all sites" (not "On click") in `chrome://extensions` for automatic injection.
- **Distribution plan:** (1) Chrome Web Store — $5 developer account at https://chrome.google.com/webstore/devconsole; (2) Bookmarklet on Cloudflare Pages (NOT siznexus.org — blocked on district networks). Bookmarklet not yet built.
- **Next actions:** Pay $5 fee, upload zip, create 1280x800 screenshots, write store description, build bookmarklet.

## Director Preferences
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased or semantic (threat banner).
- No site sounds — SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon, NOT a floating bottom button.
- Director catches security issues fast — be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas in tiers with a "my pick if you do nothing else" recommendation.
- Do NOT delete the `CNAME` file from the repo. GitHub Pages depends on it for `siznexus.org`.
