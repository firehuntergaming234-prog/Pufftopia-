# Change log and owner decisions

## Baseline
- Project: Pufftopia — Little Puffs. Big Adventures!
- Approved visual reference: `docs/PUFFTOPIA_VISUAL_SCREEN_APPROVAL_PDF_FIXED.pdf`.
- Initial implementation: responsive HTML/CSS/JavaScript prototype scaffold.
- Scope not yet approved for implementation: online accounts/cloud sync, online leaderboards, ads, real-money purchases, Android packaging, and additional world/obstacle mechanics.

## Prototype initialization
- Added navigation for home, map, level selection, character collection, gameplay, results, rewards, shop, settings, and pause.
- Added basic 8×8 match-3 loop and localStorage persistence.
- Added placeholder CSS-based Puff characters and basic idle/happy/wiggle effects.
- Added Codex scope guardrails and manual QA checklist.
- This prototype requires gameplay QA and is not production-ready.


## 2026-10-25 — Phase 1 core logic work
- Extracted pure 8×8 match detection, legal-move checks, swap validation, and initial-board generation into `src/match3-core.js` so core behavior can be tested without a browser.
- Integrated the tested core into the existing browser prototype.
- Added Node built-in test coverage for horizontal/vertical matches, board immutability during move checks, orthogonal adjacency, and valid initial-board generation.
- Fixed newly created special Puffs being immediately triggered during the same match resolution.
- No new game features or design changes were introduced.
- Remaining Phase 1 work: browser-level QA and fuller special-combination / booster / progression testing.


## 2026-10-25 — Special effects and character motion pass
- Added a pure `specialClearCells` helper for repeatable special-swap rules.
- Implemented clear patterns for Striped, Rainbow, and Burst special swaps and combinations.
- Fixed the resolver to recompute matches after special swaps.
- Updated match resolution to prioritize L/T-shaped intersections as Burst Puffs and reserve Rainbow Puffs for a straight five-match.
- Added pre-clear pop feedback and distinct idle animation identities for Pogo, Lumi, Bobo, Flora, and Nova.
- Added five automated tests covering special Puff clear patterns. Total automated tests: 10 passing.
- No additional screens, currencies, monetization, or unapproved game systems were added.
- Browser smoke test did not finish in the available headless Chromium environment; manual browser QA remains outstanding.

## 2026-10-25 — Phase 3 gameplay reliability increment
- Added a single-special effect helper so a lone Striped Puff clears one row by default, a Burst Puff clears its surrounding 3×3 area, and a Rainbow Puff clears its own type.
- Added recursive special-clear expansion: special Puffs struck by another effect activate once during the same clear chain, and duplicate clear coordinates are prevented.
- Connected special swap effects and cascade resolution to the chain-clear helper.
- Guarded Rainbow activation against empty board cells during cascades.
- Added automated tests for single-stripe behavior, chain activation, duplicate prevention, and empty-cell safety.
- Scope unchanged: no new screens, characters, currencies, account providers, online services, monetization, or unapproved mechanics.

## Phase 4 — Gravity/refill logic hardening (2026-10-25)
- Moved the column-compaction and refill behavior into the testable pure Match-3 core (`applyGravity`).
- Game UI now calls the shared core implementation rather than maintaining a duplicate gravity algorithm.
- The core returns movement/refill counts for future animation and diagnostics without changing existing cell identity or special metadata.
- Added automated tests for falling cells, refill counts, full-board no-op behavior, and preserving special metadata.
- Validation: 15 automated tests passed; JavaScript syntax checks passed.
- Still outstanding: real browser/device playtesting, animation timing checks, and broader end-to-end objective/booster QA.


## Phase 5 — Local save reliability (2026-10-25)
- Added `src/save-state.js` as a separate, testable local-save layer.
- Older saves merge with current defaults so newly introduced settings and booster keys do not disappear.
- Sanitized progress values, coin/life/booster counts, star ratings, and unlocked-character lists to recover safely from malformed or edited save data.
- Storage access and writes now fail safely when browser privacy settings or storage limits block localStorage; gameplay can still initialize with defaults.
- Added five save-state tests. Validation: 20 automated tests passed; syntax checks passed.
- No new gameplay mechanics, screens, online services, or monetization were introduced.
- Still outstanding: browser/mobile QA, and a visible in-game storage warning needs confirmation in the actual UI because this prototype currently has no dedicated save-status element.


## Phase 6 — Reliable playable-board shuffle
- Added a tested pure helper that rearranges existing Puff cells until the board has no automatic matches and at least one legal move.
- Shuffle booster now consumes inventory only after a successful shuffle; failed rearrangement attempts do not charge the player.
- Added a safe board-generation fallback if a playable rearrangement cannot be found.
- No new game features or unapproved visual concepts added.


## Phase 7 — Level outcomes and reward safety
- Centralized level success, star thresholds, and coin rewards in a pure tested Match3 helper.
- Level success requires both the Puff collection goal and score target.
- Added a one-time level completion guard so duplicate asynchronous result checks cannot award the same level twice.
- Prevented boosters from starting after the level has finished.
- Added tests for target combinations, star thresholds, and invalid/missing inputs.
- Automated checks are not a substitute for browser and Android play testing.


## 2026-10-25 — Phase 8 Puff Hammer correctness
- Added a pure `applyHammer` board operation that validates the selected coordinate, clears the selected Puff, and expands effects through any special Puff hit by the hammer.
- Integrated the helper into gameplay, scoring every removed Puff, preserving special-effect scoring, and guarding against repeated clicks while gravity/cascades resolve.
- Added tests for normal removal, Burst activation, and invalid/empty coordinates.
- Scope unchanged: no new gameplay features or monetization were introduced.


## Phase 9 — Booster, save and interaction hardening (2026-10-25)
- Added a pure Extra Moves operation and integrated it so exactly five moves are granted and one booster is consumed only when available.
- Added tests for normal use, empty inventory, and invalid input.
- Corrected save initialization ordering so normalized saved state is loaded before gameplay state is initialized.
- Save status now accurately identifies when local storage is unavailable, with a visible status message in Settings.
- Normalized inconsistent saves so the current level cannot exceed the highest unlocked level.
- Prevented leaving the game while a cascade/booster resolution is still running, avoiding late asynchronous updates after navigation.
- Validation: 32 automated tests passed and JavaScript syntax checks passed. Android/browser manual QA remains outstanding.


## Phase 10 — persistence and booster regression hardening (2026-10-25)
- Hardened save normalization so selected characters must be present in the unlocked-character list; invalid selections fall back to the default.
- Ensured the default character remains available after malformed/partial unlock lists.
- Added regression coverage for normalization immutability and Extra Moves at zero moves, plus invalid fractional inputs.
- No new gameplay features added; approved design scope remains unchanged.
- Browser and Android manual QA is still required and is not claimed as completed.

## Phase 11 — Match interaction input hardening (2026-10-25)
- Added defensive coordinate validation for adjacency and legal-swap checks.
- Legal-swap checks now safely reject missing, out-of-range, non-adjacent, or ragged-board inputs without throwing or leaving cells swapped.
- Added regression tests for malformed coordinates, non-adjacent positions, ragged boards, and non-mutation guarantees.
- No approved gameplay rules, visual designs, or feature scope changed.
- Validation: 40 automated tests passed; JavaScript syntax checks passed. Android and browser manual QA remains outstanding.

## Phase 12 — Board-shape and cascade input safety (2026-10-25)
- Added a shared rectangular-board validator and made match detection/valid-move checks safely reject empty or malformed board shapes.
- Refactored legal-move scanning to use the already defensive legal-swap helper, preserving non-mutation behavior.
- Gravity/refill now validates the entire board before making any changes, so malformed external data cannot be partially mutated.
- Added regression tests for empty/ragged boards, non-mutation, and gravity rejection.
- Validation: 44 automated tests passed; JavaScript syntax checks passed. Browser/Android manual QA remains outstanding.
