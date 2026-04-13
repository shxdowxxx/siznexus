---
session_id: SIZ-20260413-0000
date: 2026-04-13
time: 00:00 UTC
project: TheSizCorporation / SizNexus
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 1 — Foundation & Infrastructure
---

# Gemini Context — SizNexus Project

## Project Overview
SizNexus is a cyberpunk-themed website built with vanilla HTML, CSS, and JavaScript. The backend is Firebase (Authentication + Firestore). There is no build toolchain — all development is direct file editing. The project is at version 2.1 as of the first active development session.

## Repository
- **Local path:** `/home/itzzzshxdow/siznexus-development/`
- **Primary files:** `siznexus.html`, `siznexus.css`, `siznexus.js`
- **GitHub:** `https://github.com/shxdowxxx/siznexus` — all work targets the `main` branch. The `master` branch exists on the remote but is inactive; do not push to it.
- **Git identity:** name `ItzzzShxdow`, email `itzzzshxdow@gmail.com`

## Current Phase
**Phase 1 — Foundation & Infrastructure**
The project is fully bootstrapped as of 2026-04-13. The three primary files are in place, the initial bugs from the director's code integration have been resolved, and the GitHub push pipeline is clean and verified.

## Key Architectural Decisions
- Stack: vanilla HTML/CSS/JS only. Do not suggest or introduce frameworks or bundlers unless the director explicitly requests it.
- Backend: Firebase (Auth + Firestore). No additional backend or auth systems should be introduced.
- Cross-agent shared memory: `/home/itzzzshxdow/.claude/shared-knowledge.md`. All agents read from and write to this file. Consult it at the start of each session.
- The password reset modal (`#resetModal`) is fully implemented with open, close, backdrop click, and send button handlers. Do not re-implement or duplicate this flow.
- `getElementById('profileActivityStatus')` is a deliberate dead reference, protected by a null-check if-guard. It signals a planned feature. Do not remove it without the director's explicit instruction.

## Priority Work for Next Session
1. **Profile tab performance:** The "My Profile" tab takes approximately 1 second to open; all other tabs are near-instant. This is the top pending issue. The plan is for researcher-assistant to research optimization approaches first, then siz-developer to implement.
2. **Shared knowledge audit:** Confirm all agents are actively writing useful discoveries to `shared-knowledge.md`.

## Constraints and Cautions
- Always push to `main`. Never push to `master`.
- The remote URL contains an embedded personal access token. Handle git operations carefully and avoid exposing this value unnecessarily.
- The `siznexus-development/` directory contains pre-existing files (index.html, Commission.html, favicon assets, etc.) that are not part of the SizNexus v2.1 work. Do not modify them unless directed.
- Maintain the cyberpunk visual and stylistic identity in all changes to the front end.

## Agent Ecosystem
- **siz-developer:** Primary implementation agent for all code changes.
- **knowledge-assistant:** Documents findings, answers technical questions.
- **researcher-assistant:** Investigates techniques and best practices before implementation.
- **session-closeout:** Produces session summaries, updates context files, commits to GitHub at session end.
- Agent definition files: `/home/itzzzshxdow/.claude/agents/`
- Shared knowledge file: `/home/itzzzshxdow/.claude/shared-knowledge.md`
