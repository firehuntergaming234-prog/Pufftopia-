# Instructions for Codex — Pufftopia

## Authority and scope
1. `docs/PUFFTOPIA_VISUAL_SCREEN_APPROVAL_PDF_FIXED.pdf` is the approved visual reference. `docs/PUFFTOPIA_MASTER_SPEC.md` and `docs/SCREEN_INVENTORY.csv` provide behavior and scope. If they conflict, stop and ask the owner; do not silently choose.
2. Preserve the approved name, tagline, character identities, palette, screen inventory, and feature boundaries. Do not add unapproved features.
3. This repository is a web-first game prototype for Android phones, tablets, and desktop browsers. Prioritize mobile portrait usability.
4. Do not add real-money purchases, ads, analytics trackers, accounts, cloud services, leaderboards, or new currencies without explicit owner approval.
5. Never claim a feature is complete unless it works and has been tested. Call out known defects and incomplete systems.

## Implementation rules
- Keep gameplay logic separate from UI and persistence where possible.
- Keep character identities consistent: Pogo (sky blue guide), Lumi (lavender light-keeper), Bobo (golden giggle-maker), Flora (mint nature friend), Nova (violet cosmic friend).
- All Puffs need recognizable silhouettes and non-color identity cues; do not rely on color alone.
- Required character animation states include idle/breathing, blink, happy, sad, swap, fall, match, special activation, victory, and collection reaction. Use distinct timing/behavior per character.
- Board is 8×8. Only horizontal/vertical adjacent swaps. Invalid swaps must return without spending a move. Gravity/refill/cascades, objectives, score, special Puffs, boosters, win/fail, and saves require repeatable tests.
- Respect reduced-motion and audio settings. Touch targets must work on mobile.
- Avoid dependencies unless necessary; explain and ask before introducing a major framework migration.

## Working procedure
1. Read the approved PDF and all files in `docs/` before changing design.
2. Inspect the current code and run the existing app before editing.
3. Work in small phases. Start with correctness of core board logic, then visual polish, then assets/animations, then progression systems.
4. Add or update tests for each gameplay rule. Keep `docs/QA_CHECKLIST.md` current.
5. Update `CHANGELOG_AND_DECISIONS.md` for every approved scope/design decision.
6. Before finishing, report changed files, tests run, results, limitations, and any decision needed from the owner.
