---
session_id: SIZ-20260507-2200
date: 2026-05-07
time: 22:00 UTC
project: TheSizCorporation / ClaudeAA
agent: SessionCloseoutAgent
version: 2.0
current_phase: ClaudeAA — Initial Build
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed intelligence-corp member platform built with vanilla HTML/CSS/JS on Firebase Auth + Firestore (project `thesiznexus`). The platform is live, public-facing, and open for public early access. Current focus: early-access monitoring, deferred features (Cloud Functions for Net rewards, App Check), hosting architecture migration, and ongoing filter-bypass work to keep `siznexus.org` accessible on school networks.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `index.html`, `siznexus.css`, `siznexus.js`
- **Static pages:** `about.html`, `privacy.html`, `terms.html`, `roadmap.html`
- **Active feature page:** `Commission.html` (direct URL access; do not delete)
- **New files (2026-05-04):** `robots.txt` (AI-crawler block + search crawler allowlist), `site.webmanifest` (PWA manifest)
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

## Current Phase — Early Access Open + Filter Bypass
All major Phase 3 features are live. The current sub-focus is on improving `siznexus.org` accessibility and search visibility:
- SEO metadata and schema.org markup live as of commit `b5db458`
- Lightspeed recategorization pending (director must submit manually)
- Early-access monitoring continues
- Deferred: Cloud Functions for Net rewards, App Check, Porkbun DNS migration

## SEO / Filter Bypass State (added 2026-05-04)

Changes committed in `b5db458` to combat Lightspeed blocking `siznexus.org` as "games":

### `index.html` changes
- `<title>` → "TheSizNexus — Community Organization Platform"
- `<meta name="description">` — community platform framing, no game language
- `<meta name="keywords">` — community, organization, discord, members, platform
- Open Graph: `og:title`, `og:description`, `og:type` (website), `og:url`, `og:image`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`
- Schema.org JSON-LD: `Organization` type with name, description, URL, social links array
- `<link rel="canonical">` tag
- `<meta name="theme-color">`
- Hero eyebrow and sub-copy reworded to "Community/Social" framing

### `robots.txt` (new file at repo root)
- **Allows:** Googlebot, Bingbot, DuckDuckBot, Yandex
- **Disallows (AI training crawlers):** GPTBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Bytespider, CCBot
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
Submit `siznexus.org` to Lightspeed recategorization: `https://www.lightspeedsystems.com/support/submiturl/` — select "Community/Social". Review takes 5–10 business days. No guarantee of approval but the metadata now supports the submission strongly.

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

## CSS Conventions — Lesson from Prior Session
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
- **Director action needed:** Submit `siznexus.org` to Lightspeed recategorization at `https://www.lightspeedsystems.com/support/submiturl/` (select "Community/Social").
- Director has not yet confirmed mobile fixes on a real device — Corp Hub modal scroll and hero text layout not tested on physical hardware.
- Cloud Functions for Net auto-rewards (streaks, referrals) — deferred. Rules block client-side self-increment; server-side required.
- Activity heatmap only populates from the stabilization session forward — past sessions not retroactively tracked.
- Existing user docs still carry legacy `email` field (not a live leak; new docs don't write it). Cleanup migration deferred.
- Public landing guest 403s — `missions`/`events`/`intelPosts` require auth. Queries fail silently but generate console noise. Strategy not decided.
- App Check not enabled.
- `devKeyHash` publicly readable — deferred (LOW, internal tooling only).
- Hosting migration: Porkbun DNS currently points to GitHub Pages. Long-term goal is Firebase Hosting IPs. Requires director Porkbun access.

## shxdow Portfolio Page — `siznexus.org/shxdow`

A personal portfolio page for the director, added as a sub-project inside this repo.

- **File:** `shxdow/index.html` (single file)
- **Avatar:** `shxdow/ShxdowKu.jpg`
- **Songs:** `songs/` folder at repo root (NOT inside `shxdow/`). URL: `https://siznexus.org/songs/{encodeURIComponent(filename)}.mp3`
- **Design:** Pure black (`#090909`), silver/white accents, Orbitron + Share Tech Mono, 620px max-width
- **Discord Activity:** Polls `https://sentry-production-60e4.up.railway.app/api/presence` every 15s. Public endpoint, no auth.
- **MP3 handling:** `.gitattributes` includes `*.mp3 -text`. Keep it. A prior bad commit normalized an MP3 into a 2-byte CRLF text file; if playback breaks again, verify the asset is a real binary.
- **Music player:** Real `<audio>` element. Current tracks use pinned Apple-hosted cover URLs for reliable artwork. On audio load failure, player shows "Track file is unavailable. Re-upload the MP3 to /songs."
- **Current playlist (5 songs):**
  - "Al Compás De Mi Caballo" — Los Imperial's
  - "Distractions" — Haiti Babii
  - "Hot In Herre" — Nelly
  - "It's On" — Eazy-E
  - "KLK (feat. Victor Rivera Y Su Nuevo Estilo)" — Victor Mendivil / El Padrinito Toys / Kevin AMF
- **Open issues:**
  1. Social placeholders (TikTok, X, YouTube) still use `#` hrefs — director has not provided real links.
  2. Bio text — director may want to revise.
  3. More songs can be added as the director provides them. If metadata is ambiguous, pin the `cover` URL directly in `PLAYLIST` instead of relying on the iTunes search fallback.
- **Song upload rule:** Remove any Windows ` (1)` suffix from filename before uploading to `songs/` folder.

## Sentry Bot — Presence Architecture (as of 2026-05-02)
- `src/utils/presenceCache.js` — serializes presence (status, activities, timestamps) and writes to `data/presence.json`. Source of truth for both startup seed and live updates.
- `src/events/ready.js` — calls `seedOwnerPresence(client, logger)` on startup. Uses `guild.members.fetch({ user: [OWNER_ID], withPresences: true })` to capture current presence before any `presenceUpdate` event fires.
- `src/events/presenceUpdate.js` — imports `OWNER_ID` and `saveOwnerPresenceSnapshot` from `presenceCache.js`. Fires on every presence change for the owner.
- `GET /api/presence` — public endpoint, no auth, CORS `*`. Returns presence JSON. Lives in `dashboard/routes/api.js`.
- **Director Discord UID:** `1173035520708845666`

## Chrome Extension — `siz-extension/` (updated 2026-05-03)
A parallel project built 2026-05-03. NOT inside the `siznexus-development` repo.

- **Local path:** `/home/itzzzshxdow/siz-extension/`
- **Type:** Chrome Extension MV3 — Grammarly-style hidden right-edge sidebar
- **Tabs:** Code Editor (JS/HTML/CSS/Python, sandbox run), AI Chat (GPT-4o-mini, key in chrome.storage.local), Text Obfuscator (homoglyph + zero-width injection), Notes (auto-save to storage), Cloak (disguise tab as Docs/Canvas/Khan, panic key)
- **Icons:** PNG icons at `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`. SVG originals also present but unused by manifest.
- **Manifest:** `manifest.json` references `.png` icons — Web Store compatible.
- **Package:** `/home/itzzzshxdow/siz-extension.zip` (22.1 KB) — ready for Chrome Web Store upload.
- **Status:** Feature complete, packaged, Web Store ready. Blocked on $5 developer registration fee.
- **Known behavior:** Extension does NOT appear on `chrome://newtab` — this is Chrome's design (extensions blocked on `chrome://` URLs). Works correctly on all `https://` pages.
- **Site access setting:** Must be "On all sites" (not "On click") in `chrome://extensions` for automatic content script injection.
- **Distribution plan:** (1) Chrome Web Store listing — requires $5 developer account at https://chrome.google.com/webstore/devconsole; (2) Bookmarklet hosted on Cloudflare Pages (NOT siznexus.org — blocked on district networks). Bookmarklet not yet built.
- **Store listing still needed:** 1280x800 screenshots of sidebar open on a real `https://` page, and a written description (132 char short + full body).

## Agentiz — Web Proxy on AWS S3 (updated 2026-05-05)
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

When either method fires, a full-screen overlay appears matching the existing domain-lock style: dark background, silver border, shield icon (`fas fa-shield-alt`), message "Developer tools are not permitted on this site." Both intervals are cleared immediately after triggering to stop polling.

- **Commit:** `fb1ae5b` — "feat: add anti-DevTools detection overlay"
- **Live at:** `siznexus.org`
- **Limitation:** Client-side only. Determined attackers can bypass. This deters casual inspection, not expert analysis.
- **Tuning:** 160px threshold (size check) and 150ms threshold (timing check) can be adjusted if false positives are reported.

## siz-ai Command Hub (added 2026-05-03)

A BIOS-style shell command hub built this session. Lives in `~/.local/bin/` — NOT inside any tracked git repo.

- **Command:** `siz-ai` (in PATH via `~/.local/bin/`)
- **Scripts:** `siz-ai` (hub), `siz-claude`, `siz-codex`, `siz-gemini`
- **What it does:** Launches all three AI assistants in separate Windows Terminal tabs (`wt.exe -w 0 new-tab`), then shows a live BIOS-style control panel with process status, uptime, Claude stats, and utility key bindings.
- **Key bindings in hub:** 1/2/3 = close individual AI; A = close all; S = session closeout (opens new WT tab running claude with closeout prompt); L = relaunch all; R = refresh; Q = quit hub.
- **Uptime tracking:** `/tmp/siz-ai-{claude|codex|gemini}-start` files hold epoch seconds written at launch. Deleted on close.
- **Claude stats:** Reads `~/.claude/history.jsonl` directly for entry count, file size, and today's message count.
- **Visual identity:** Ultramarine blue truecolor `\033[38;2;82;130;255m`, MR BIOS aesthetic (double-rule headers, BANK rows, W=87 centered via `tput cols`).
- **Background fallback:** If `wt.exe` is not found, AI processes launch in background within the same terminal.
- **Not version-controlled.** A dotfiles backup is recommended.

## ClaudeAA — New Project (added 2026-05-07)
A new standalone Windows desktop AI assistant built in a single session.

- **Local path (Windows):** `C:\Users\itzzz\ClaudeAA\`
- **Local path (WSL):** `/mnt/c/Users/itzzz/ClaudeAA/`
- **GitHub:** NOT configured yet — no remote, not pushed
- **Stack:** Python + PyQt6, Anthropic SDK (streaming + tool loop), pynput, mss
- **Concept:** Dynamic Island-style always-on-top widget at top-center of screen. Animated orb (3 Lissajous light trails, additive QPainter blending, 5 states). Expands to streaming chat panel.
- **Tools:** 12 system tools wired (open_app, run_powershell, create/read/delete/move file, list_directory, search_files, browse_web, web_search, system_info, screenshot)
- **Shortcuts:** Ctrl+Alt+Space (toggle), Ctrl+Alt+V (Vision), Ctrl+Alt+N (new conv), Ctrl+Alt+E (screenshot→Claude), Ctrl+Alt+Q (collapse)
- **Status:** Fully written. setup.bat NOT run yet (dependencies not installed). No real tray icon. Voice deferred. History panel skeleton only.
- **Color:** Ultramarine blue #3D5AFE throughout
- **Key reminder:** Rotate the Anthropic API key in `config.json` — it was entered live during the session.

## What Claude Should Prioritize Next Session
1. **ClaudeAA — Run `setup.bat`** from `C:\Users\itzzz\ClaudeAA\` to install dependencies and test the app for the first time.
2. **ClaudeAA — Create GitHub remote** — `git init`, `git remote add origin`, initial push so the project is version-controlled.
3. **ClaudeAA — Rotate API key** in `config.json` — the key entered during the session should be refreshed.
4. **Director action reminder:** Lightspeed recategorization submission at `https://www.lightspeedsystems.com/support/submiturl/`.
5. **Agentiz GoGuardian bypass** — GoGuardian blocks all uncategorized domains. Options: find a trusted root domain with DNS write access, or research other cloud storage providers.
6. **Delete orphan AWS bucket `agentiz-organization`** to avoid unnecessary costs.
7. **Test Agentiz end-to-end** on a real device — open the S3 URL, enter a URL, verify proxy works.
8. Monitor early-access user bug reports on the main SizNexus platform.
9. **Backup siz-ai scripts** — copy from `~/.local/bin/` into a tracked dotfiles or tools repo.
10. **Chrome Extension — Web Store submission:** Confirm $5 fee is paid, then upload `siz-extension.zip`. Create 1280x800 screenshots and write description.
11. Add social links (TikTok, X, YouTube) on `shxdow/index.html` when the director provides them.
12. Cloud Functions planning for Net auto-rewards (streaks, referrals) when the director is ready.

## Director Preferences (Persistent)
- Silver theme is a hard rule. No yellow/gold/violet/cyan/red in site chrome unless user-purchased (Black Market) or semantic (threat banner).
- No site sounds. SFX engine removed permanently. Do not re-add.
- Terminal launcher belongs in the nav next to the search icon — NOT a floating bottom button.
- Director catches security issues fast. Be proactive about non-reversible hashing for any user-facing identifier.
- Director wants ideas presented in tiers with a "my pick if you do nothing else" recommendation. Pragmatism over completeness.
- Do NOT delete the `CNAME` file from the repo. GitHub Pages depends on it for `siznexus.org`.
