## Automated checks (run before manual QA)
- [ ] Run `npm test`; all match-core tests pass.
- [ ] Run `npm run check`; JavaScript syntax checks pass.

# Pufftopia manual QA checklist

## Navigation and responsive UI
- [ ] Open `index.html` at 360×800, 390×844, 768×1024, 1366×768.
- [ ] Home → Level Select → Game works; Home, Map, Collection, Rewards, Shop, Settings, Pause and Resume work.
- [ ] No clipped controls, horizontal overflow, unreadable labels, or unresponsive touch targets.

## Match-3 correctness
- [ ] Board starts as 8×8 and has no automatic matches on initial load.
- [ ] Only orthogonally adjacent cells can swap.
- [ ] Invalid swap restores original positions and does not consume a move.
- [ ] Valid swap consumes exactly one move.
- [ ] Horizontal and vertical runs of 3+ clear.
- [ ] Gravity/refill works for all columns and cascades resolve without hanging.
- [ ] Board has at least one legal move; otherwise it reshuffles.
- [ ] Four-match Striped, straight five-match Rainbow, L/T Burst and all special combinations behave according to approved rules.
- [x] Automated special-clear logic: single Striped, Rainbow + normal, Rainbow + Rainbow, Striped + Striped, Burst + Burst. (Unit tests only; browser interaction still needs manual QA.)
- [ ] Score, collect objective, move counter, and win/fail conditions update correctly.

## Boosters and persistence
- [ ] Hammer removes the selected Puff and consumes one booster.
- [ ] Extra Moves adds exactly five moves and consumes one booster.
- [ ] Shuffle rearranges the board and leaves a valid move.
- [ ] Shop purchases correctly deduct coins and add a booster; insufficient coins do not change data.
- [ ] Refresh preserves level progress, stars, coins, boosters, selected character, and settings.

## Accessibility and polish
- [ ] Reduced motion disables/reduces animations.
- [ ] Puffs remain distinguishable beyond color alone.
- [ ] Settings persist after refresh.
- [ ] No console errors during normal navigation and play.

## Special-Puff chain regression checks
- [x] A single Striped Puff's default effect clears one row, not an unintended row-plus-column.
- [x] A special hit by another special effect activates within the same chain.
- [x] Chain expansion returns unique coordinates and safely handles empty cells.
- [ ] In-browser test: swap special Puffs and visually verify every affected cell clears, gravity/refill completes, and no animation lock remains.
- [ ] In-browser test: create a special through a match, then hit it with another special in a cascade.

## Gravity/refill regression tests
- [x] Existing Puffs fall to the lowest available cells in their column.
- [x] Empty cells are refilled using the provided cell factory.
- [x] Special Puff metadata survives gravity movement.
- [x] A full board does not create unnecessary new cells.
- [x] Automated suite passes after integrating core gravity into the game.
- [ ] Browser/device test: confirm refill animation timing and repeated cascades visually.


### Phase 5 — persistence checks
- [ ] Refresh the page and confirm coins, level progress, character selection, boosters, stars, and settings persist.
- [ ] Load an older partial save and confirm missing fields use defaults.
- [ ] Test malformed save data; confirm the app opens without a crash.
- [ ] Test in a browser with storage blocked/full; confirm gameplay can still start and the save limitation is communicated.


### Phase 6 — Shuffle booster
- [x] Unit test confirms shuffled board contains no automatic matches.
- [x] Unit test confirms shuffled board has at least one legal move.
- [x] Unit test confirms existing Puff cells/special metadata are preserved.
- [x] Unit test confirms malformed boards fail safely.
- [ ] Manual browser/Android testing of Shuffle booster animation and inventory display.


## Phase 7 checks
- [x] Level outcome helper requires both objective and score target.
- [x] Star thresholds and win/fail coin rewards have unit tests.
- [x] Duplicate level completion is guarded in game flow.
- [x] Booster activation is blocked after level completion.
- [ ] Manually test asynchronous cascades and result screen on mobile browsers.


## Phase 8 — Puff Hammer
- [ ] In browser: use Puff Hammer on a normal Puff; verify one Puff clears, gravity/refill runs, and the booster count decreases once.
- [ ] In browser: use Puff Hammer on a special Puff; verify its effect resolves and every cleared Puff contributes to collection/score.
- [ ] Verify rapid taps cannot start overlapping cascades or consume multiple hammers.
- [ ] Verify Hammer cannot be used after a level result screen is reached.


## Phase 9 — Extra Moves and save/progression hardening
- [x] Extra Moves logic is pure and tested: exactly five moves added, one booster consumed only on success.
- [x] Missing/invalid booster inventory does not consume inventory or add moves.
- [x] Save normalization clamps current level to the highest unlocked level.
- [x] Storage-unavailable mode is reported accurately and the settings screen has a visible status area.
- [x] Leaving the game during a resolving cascade is blocked to avoid a late async board update.
- [ ] Manual Android browser test: rotate/resize while playing and confirm board controls remain usable.
- [ ] Manual Android browser test: disable site storage and confirm the warning appears and gameplay remains usable.
- [ ] Manual browser test: use Extra Moves, refresh, and verify the remaining booster count persists.


## Phase 10 — save character validation and booster regression
- [x] Invalid or no-longer-unlocked saved character selection safely falls back to the default.
- [x] Default character is restored to the unlock list if a malformed save omits it.
- [x] Save normalization does not mutate the supplied raw save object.
- [x] Extra Moves can be applied at zero moves when a booster remains, and inventory cannot go below zero.
- [x] Fractional/invalid Extra Moves inputs are rejected safely.
- [ ] Manual Android/browser regression pass remains outstanding.

## Phase 11 — match input hardening
- [x] Invalid/missing coordinates are rejected safely by the core legal-swap helper.
- [x] Non-adjacent and out-of-range positions do not mutate the board.
- [x] Ragged malformed boards are rejected without throwing.
- [ ] Manual browser/Android test: tap rapidly on edge tiles and verify no stuck selection, move loss, or console error.
- [ ] Manual browser/Android test: verify touch targets remain comfortable at 360px viewport width.

## Phase 12 — board-shape safety
- [x] Empty and ragged boards are rejected by match detection and valid-move checks without throwing.
- [x] Valid-move scanning does not mutate board cells.
- [x] Gravity rejects malformed boards before mutating them.
- [x] Automated regression suite passes (44 tests).
- [ ] Browser/Android manual gameplay pass remains outstanding.
