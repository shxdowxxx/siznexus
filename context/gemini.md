---
session_id: SIZ-20260514-0317
date: 2026-05-14
time: 03:17 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 2.2
current_phase: SizNexus Phase 6 — Performance Optimization & Research
---

# Gemini Context — SizNexus Project

This file mirrors `context/claude.md`. All content is synchronized. See `context/claude.md` for full details.

## Quick Reference — What Changed This Session (2026-05-14)

### Transformative JavaScript Refactor — Monolith Split (commits `9c79461` to `863f3ee`)
**5,156-line `siznexus.js` monolith split into 7 focused modules:**
- `siz-core.js` (349 lines) — Firebase init, helpers, domain lock, SNX namespace
- `siz-auth.js` (1345 lines) — authentication, member directory, profile editing, messaging
- `siz-admin.js` (457 lines) — navigation, admin panel, threat level, roles, badges
- `siz-hub.js` (1532 lines) — Corp Hub, all 10 tabs, squads, corp chat
- `siz-dashboard.js` (404 lines) — command board, featured member, streak
- `siz-misc.js` (1069 lines) — reports, spotlight, terminal, cipher, operator ID, misc
- `siz-tools.js` (684 lines) — Tools Library, Projects Board, Skills

**Result:** Codebase now maintainable. Inter-module communication via `window.SNX` getter/setter proxies (backward-compatible, loose coupling).

### New Major Features
1. **Tools Library (9th hub tab):** Searchable grid with Firestore collection, staff-curated with member contributions
2. **Projects Board (10th hub tab):** Member submissions, likes, dashboard preview panel
3. **Public Showcase Pages:** `/tools` and `/projects` — accessible without auth, drives organic discovery
4. **Real Mission Deliverables:** `submissionType` field → `key`, `link`, `text`, or `key_or_link`
5. **Skills on Profiles:** Customizable with presets (JavaScript, Python, Design, etc.)
6. **UI Overhaul:** Toast variants, skeleton loaders, hub tab fade animation, footer cleanup

### Performance Hardening
- **Eliminated DevTools stutter:** Removed 500ms polling loop causing frame drops
- **Slowed debugger check:** 500ms → 4000ms (less aggressive, still effective)
- **Staggered Firestore queries:** Dashboard batches queries 200ms apart (vs. all at once)
- **User collection cache:** 2-minute in-memory cache (huge improvement to dashboard load time)
- **Reduced particles:** 60 → 40, disabled hover interaction

### Presence Tracking (Confirmed Working)
Previous session's 3-commit fix series (commits `5387147`, `f92aad3`, `863f3ee`) resolved the presence tracking issue. User verified during session SIZ-20260514 that online/offline status is now accurate. No further action needed on this front.

### Performance Optimization Sprint (Session SIZ-20260514-0317)
**Commit:** `887706b` — Major performance hardening:
- **Removed full-screen overlay repaint loop** (body::after scanMove animation) — eliminated largest scroll-lag culprit
- **Replaced `transition: all` with specific properties** (74 uses) — reduces GPU scheduler work on state changes
- **Reduced backdrop-filter complexity** — nav blur 16px→10px, static nav 8px→6px with opacity compensation
- **GPU layer promotion** — added `will-change: transform` to 7 card types
- **Ops Map canvas optimization:**
  - RAF loop stops when user leaves tab
  - Canvas pauses when tab is in background (`document.hidden` check)
  - Continent dot positions pre-cached on resize (eliminated O(w×h) geometry tests per frame)
- **Research report completed** — 187+ findings across performance, features, growth, and platform strategy

### Git State
- Latest: `887706b` (performance optimizations + research report)
- All commits pushed to `origin/main`
- Working tree clean

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html`, `privacy.html`, `terms.html`, `roadmap.html`
- **Active feature page:** `Commission.html` (direct URL access; do not delete)
- **New files (2026-05-04):** `robots.txt` (AI-crawler block + search crawler allowlist), `site.webmanifest` (PWA manifest)
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

## Current Phase — Early Access Open + Filter Bypass
All major Phase 3 features are live and security-hardened. The current sub-focus is SEO metadata and filter-bypass improvements. Priorities: early-access monitoring, Lightspeed recategorization (pending director manual submission), director mobile testing confirmation, and deferred backlog items.

## SEO / Filter Bypass State (added 2026-05-04)

Changes committed in `b5db458` to combat Lightspeed blocking `siznexus.org` as "games":

### `index.html` changes
- `<title>` → "TheSizNexus — Community Organization Platform"
- `<meta name="description">` — community platform framing
- `<meta name="keywords">` — community, organization, discord, members, platform
- Open Graph: `og:title`, `og:description`, `og:type` (website), `og:url`, `og:image`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`
- Schema.org JSON-LD: `Organization` type with name, description, URL, social links
- `<link rel="canonical">` tag
- `<meta name="theme-color">`
- Hero eyebrow and sub-copy reworded to "Community/Social" framing (no game language)

### `robots.txt` (new file at repo root)
- **Allows:** Googlebot, Bingbot, DuckDuckBot, Yandex
- **Disallows:** GPTBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Bytespider, CCBot
- Includes `Sitemap:` directive

### `site.webmanifest` improvements
- `description` field added
- `orientation: "portrait-primary"` added
- Icon `purpose` fields → `"any maskable"`

### `siznexus.css` polish pass
- Hero `h1` gradient text + larger sizing
- Stats bar: 2-column tablet breakpoint + shimmer top-border animation
- Bubbles: `border-radius: 10px`, richer layered box-shadows
- Nav: `backdrop-filter: saturate()` added
- Splash: gradient text on logo
- Modals: spring entrance animation, `border-radius: 10px`
- Ticker: wider fade edges + `26s` scroll timing
- Footer: top accent line
- Guest CTA: radial glow effect
- Global: 4px silver custom scrollbar (`::-webkit-scrollbar`)

### Outstanding director action
Submit `siznexus.org` to Lightspeed recategorization: `https://www.lightspeedsystems.com/support/submiturl/` — select "Community/Social". Review takes 5–10 business days.

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

## CSS Conventions — Lesson from Prior Session
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

## Open Issues (Session SIZ-20260514-0317)
- **Director action needed:** Submit `siznexus.org` to Lightspeed recategorization at `https://www.lightspeedsystems.com/support/submiturl/` (select "Community/Social").
- **RESOLVED:** Presence tracking confirmed working (user-verified in session SIZ-20260514)
- **RESOLVED:** All commits pushed to GitHub — commit 887706b live on `origin/main`
- **Agentiz GoGuardian bypass** — GoGuardian blocks all uncategorized domains; S3 subdomain doesn't help. Needs a trusted root domain or GoGuardian manual review.
- **Delete orphan AWS bucket `agentiz-organization`** — unnecessary S3 costs.
- Director should test on real device — verify performance optimizations on mobile
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
- **Open issues:** (1) social placeholders (TikTok, X, YouTube) unfilled; (2) bio text may need revision; (3) more songs can be added, pin `cover` URLs for ambiguous tracks.
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
- **Tabs:** Code Editor, AI Chat (GPT-4o-mini), Text Obfuscator (homoglyph + zero-width), Notes, Cloak (tab disguise + panic key)
- **Icons:** PNG at `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`. Manifest references PNGs — Web Store compatible.
- **Package:** `/home/itzzzshxdow/siz-extension.zip` (22.1 KB) — upload artifact for Chrome Web Store.
- **Status:** Feature complete, packaged, Web Store ready. Blocked on $5 developer registration fee.
- **Known behavior:** Does NOT appear on `chrome://newtab` — Chrome blocks extensions on `chrome://` URLs by design. Works on all `https://` pages.
- **Site access:** Must be "On all sites" (not "On click") in `chrome://extensions` for automatic injection.
- **Distribution plan:** (1) Chrome Web Store — $5 developer account at https://chrome.google.com/webstore/devconsole; (2) Bookmarklet on Cloudflare Pages (NOT siznexus.org — blocked on district networks). Bookmarklet not yet built.
- **Next actions:** Pay $5 fee, upload zip, create 1280x800 screenshots, write store description, build bookmarklet.

## Agentiz — Web Proxy on AWS S3 (added 2026-05-05)
A separate project. NOT inside the `siznexus-development` repo.

- **Local path:** `/home/itzzzshxdow/agentiz/`
- **GitHub:** `shxdowxxx/agentiz` (public), branch `main`
- **Primary live URL:** `https://agentiz.s3.amazonaws.com/index.html`
- **Website endpoint:** `http://agentiz.s3-website-us-east-1.amazonaws.com`
- **Stack:** React + Vite + Tailwind (bundled), proxy engines: WebEngine + NetStream + WorkerBus + libcurl WASM + Epoxy (all renamed from Ultraviolet/Scramjet/BareMux originals)
- **Deploy:** `./deploy.sh` from agentiz directory (AWS S3 sync)
- **AWS account:** 329435595007. Active bucket: `agentiz` (us-east-1). Orphan bucket `agentiz-organization` — can be deleted.
- **Filter results (18/20 pass):** Lightspeed=Education, FortiGuard=IT, Palo Alto=Computer-and-Internet-Info, Cisco Umbrella=Cloud and Data Centers, Securly=Other, AristotleK12=Allowed, ContentKeeper=Allowed. GoGuardian=Uncategorized (blocked).
- **Why S3 passes filters:** `amazonaws.com` is pre-categorized as Education/IT — same domain inheritance mechanism as the KoopBin/eastcountywireless.com trick.

## Anti-DevTools Detection (added 2026-05-03)

Client-side developer tools detection added to `siznexus.js`. Runs two methods in parallel via `setInterval` at 500ms:

1. **Window size delta** — triggers if `outerWidth - innerWidth > 160px` OR `outerHeight - innerHeight > 160px`. Catches docked DevTools panels.
2. **Debugger timing trick** — times a `new Function('debugger')` call; triggers if execution exceeds 150ms. Catches undocked/popped-out DevTools windows.

When either method fires, a full-screen overlay appears matching the existing domain-lock style: dark background, silver border, shield icon, message "Developer tools are not permitted on this site." Both intervals clear immediately after triggering.

- **Commit:** `fb1ae5b` — "feat: add anti-DevTools detection overlay"
- **Live at:** `siznexus.org`
- **Limitation:** Client-side only. Determined attackers can bypass. Deters casual inspection.
- **Tuning:** 160px (size delta) and 150ms (timing) thresholds are adjustable if false positives occur.

## siz-ai Command Hub (added 2026-05-03)

A BIOS-style shell command hub. Lives in `~/.local/bin/` — NOT inside any tracked git repo.

- **Command:** `siz-ai` (in PATH via `~/.local/bin/`)
- **Scripts:** `siz-ai` (hub), `siz-claude`, `siz-codex`, `siz-gemini`
- **What it does:** Launches all three AI assistants in separate Windows Terminal tabs, then shows a live BIOS-style control panel with process status (pgrep), uptime, Claude stats, and utility key bindings.
- **Key bindings:** 1/2/3 = close individual AI; A = close all; S = session closeout; L = relaunch all; R = refresh; Q = quit hub.
- **Not version-controlled** — dotfiles backup recommended.

## Director Preferences
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased or semantic (threat banner).
- No site sounds — SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon, NOT a floating bottom button.
- Director catches security issues fast — be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas in tiers with a "my pick if you do nothing else" recommendation.
- Do NOT delete the `CNAME` file from the repo. GitHub Pages depends on it for `siznexus.org`.
