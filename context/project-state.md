---
last_updated: 2026-05-03 02:44 UTC
session_id: SIZ-20260503-0244
agent: Codex
---

# Project State

## current_phase
Phase 3 — Public Launch Prep (Early Access Open) + Portfolio Sub-project

## Phase Description
Phase 3 launched the main SizNexus platform publicly and is now in early-access monitoring mode. A portfolio sub-project (`shxdow/`) lives inside the same `siznexus-development` repo and remains active. Main platform deferred items (Cloud Functions for Net rewards, App Check, Porkbun DNS migration) remain on the backlog.

## Phase Progress
Main platform: early access open. All Tier 1–5 features remain live, security-hardened, and unchanged this session.

Portfolio sub-project: live at `siznexus.org/shxdow`. Audio playback is fixed and confirmed working. The Discord Activity card is now receiving real data from Sentry’s public `/api/presence` endpoint. The player now has five songs, pinned cover art for the current tracks, explicit broken-asset error messaging, and a `HH:MM:SS` activity elapsed timer. Social placeholders (TikTok, X, YouTube) remain unfilled.

## Last Session Summary
Session `SIZ-20260503-0244` (2026-05-03 UTC / 2026-05-02 PDT) stabilized the portfolio page and closed the two real production issues. Codex confirmed the original MP3 had been corrupted into a 2-byte CRLF text file, replaced it with the real binary, added `*.mp3 -text` to `.gitattributes`, and cache-busted the audio URL. Codex also fixed Sentry bot presence seeding in the companion `discord-bot` repo: `src/utils/presenceCache.js` was added, `ready.js` now calls `seedOwnerPresence()` on startup, and `presenceUpdate.js` now reuses the shared serializer. Playlist expanded to five songs; metadata and cover art were pinned; Discord activity elapsed time now renders as `HH:MM:SS`. Current SizNexus HEAD = `0f639cd`.
