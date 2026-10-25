# Pufftopia — Codex Development Starter

**Source of truth:** `docs/PUFFTOPIA_VISUAL_SCREEN_APPROVAL_PDF_FIXED.pdf` and `docs/PUFFTOPIA_MASTER_SPEC.md`.

This is the first runnable web prototype scaffold, not the final production game. It starts the implementation with a responsive interface and a playable 8×8 match-3 loop while keeping later features clearly scoped.

## Current development status

Phase 9 hardens Extra Moves usage, save-state consistency and navigation during cascades. The save initializer is ordered before game-state creation, and Settings now displays a warning if local persistence is unavailable. Automated validation currently covers 32 tests; real-browser and Android device QA is still required.

The match-3 core is separated into `src/match3-core.js` and covered by automated Node tests. Special Puff clear patterns, distinct CSS idle animation identities, and tested special-clear chain expansion are now included. The browser game loads the shared core. This is an active prototype; it is not production-complete.

## Run tests

- `npm test` — automated match-core tests.
- `npm run check` — JavaScript syntax checks.

## Run locally

- Open `index.html` in a modern browser. For the best local development experience, use VS Code with a local static server.
- No build step is required for this prototype.
- Google Fonts are optional; if offline, the system falls back to local sans-serif fonts.

## Current prototype scope

- Main menu, world map, level selection, character selection, gameplay, win/fail results, daily reward, booster shop, settings and pause screens.
- Original Puff face styling made with CSS; no external character artwork is bundled.
- 8×8 board, adjacent swaps, basic match detection, gravity/refill, score/move/collection goals, special Puff badges, boosters, local save.
- Pogo, Lumi, Bobo, Flora and Nova profile concepts.

## Known prototype limitations (do not describe as production complete)

- Special-match detection and special-combination rules have initial automated coverage, including chain reactions, but still need browser-level QA; this remains a prototype.
- Some objectives are simplified. There are no obstacle/jelly tiles, full infinite generator, full asset animation rig, account system, cloud saves, online leaderboards, advertisements, or real-money purchases.
- Visuals are implementation placeholders guided by the approved PDF; final art assets must be separately approved and integrated.
- Daily reward uses a simple local one-time flag for the prototype, not a production calendar/reset system.
- Phaser is not integrated yet; current foundation uses HTML/CSS/JavaScript to keep the first playable build easy to inspect. Codex should assess migration to Phaser only in a dedicated, reviewed step, preserving working behavior.

## Codex instructions

Read `AGENTS.md` first. Treat the approved PDF as a fixed design reference. Do not invent new screens, characters, worlds, mechanics, currencies, monetization, sign-in providers, or backend services. If a requirement is ambiguous, ask before changing scope. Make changes in small, testable steps, update `CHANGELOG_AND_DECISIONS.md`, and run the manual QA checklist in `docs/QA_CHECKLIST.md` after gameplay changes.


### Phase 10 checkpoint
Save normalization now validates the selected character against unlocked characters and restores the default character when necessary. Regression tests cover save normalization immutability and Extra Moves edge cases. Run `npm test` and `npm run check` before trying the prototype. Android/browser hands-on testing is still outstanding.

### Latest development phase
Phase 11 hardens match-3 coordinate validation. The core legal-swap helper rejects malformed, out-of-range, non-adjacent, and ragged-board inputs safely. Run `npm test` and `npm run check` before manual browser QA. Automated tests do not replace real-device testing.

## Latest development increment — Phase 12
- Defensive board-shape validation for matching, legal-move detection, and gravity/refill.
- Automated validation: 44 tests pass; syntax checks pass.
- Browser and Android manual QA are still outstanding.

