---
session_id: SIZ-20260413-0000
date: 2026-04-13
time: 00:00 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 1 — Foundation & Infrastructure
---

# Claude Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed website built with vanilla HTML, CSS, and JavaScript. Backend is Firebase (Auth + Firestore). No build toolchain — direct file editing. The project is at version 2.1 as of the first real session.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `siznexus.html`, `siznexus.css`, `siznexus.js`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — `main` branch only. `master` exists on remote but is dead; never push to it.
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Current Phase
**Phase 1 — Foundation & Infrastructure**
The project is bootstrapped. Files are in place, bugs from the initial code drop are resolved, the push pipeline to GitHub is verified and clean.

## Key Architectural Decisions
- Vanilla HTML/CSS/JS — no frameworks, no bundlers. Keep it that way unless the director explicitly requests otherwise.
- Firebase handles auth and data. Do not introduce a second backend or auth system.
- The shared knowledge file at `/home/itzzzshxdow/.claude/shared-knowledge.md` is the cross-agent memory layer. Read it at the start of sessions and write relevant discoveries to it.
- The `#resetModal` password reset flow is now fully implemented. Do not duplicate or re-implement it.
- `getElementById('profileActivityStatus')` is a known dead reference, guarded by an if-check. Do not remove it without director confirmation — it signals a planned feature.

## What Claude Should Prioritize Next Session
1. Profile tab performance — the "My Profile" tab has a ~1 second open delay. This is the top pending work item. Coordinate with researcher-assistant first, then implement.
2. Verify shared-knowledge.md is being populated by all agents as sessions progress.

## Constraints & Cautions
- Never push to `master` on the remote. Always target `main`.
- The remote URL contains an embedded PAT token. Do not log or expose it unnecessarily. Treat git remote operations with care.
- The `siznexus-development/` folder contains pre-existing site files (index.html, Commission.html, etc.) beyond the three primary SizNexus files. Do not modify those unless instructed.
- The codebase is cyberpunk-themed — preserve the visual and stylistic identity in all changes.

## Agent Ecosystem
- **siz-developer:** Primary implementation agent. Reads/writes shared-knowledge.md.
- **knowledge-assistant:** Answers questions and documents findings. Reads/writes shared-knowledge.md.
- **researcher-assistant:** Researches techniques and best practices. Reads/writes shared-knowledge.md.
- **session-closeout (this agent):** Closes sessions, writes summaries, commits to GitHub.
- Agent definitions live at `/home/itzzzshxdow/.claude/agents/`.
