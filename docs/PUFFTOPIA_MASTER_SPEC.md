# PUFFTOPIA — Master Game Development Specification
**Tagline:** Little Puffs. Big Adventures!  
**Document status:** Baseline proposal for approval before implementation.  
**Version:** 1.0  
**Rule:** This document is the source of truth. Do not invent or add features without explicit user approval.

## 1. Product vision
Original fantasy match-3 adventure for portrait-first Android/mobile web, desktop browsers, and future iOS. The player restores a broken Heart Crystal by solving puzzles, collecting magical energy, unlocking characters, and restoring floating islands. Visual inspiration may inform mood/layout only; all final characters, UI, art, audio, and effects must be original.

## 2. Platforms and technology
- MVP: responsive web game; HTML/CSS/JavaScript with Phaser for rendering and input.
- Portrait-first on phones; adapt to tablet/desktop without hiding the board.
- Local-first saves. Cloud accounts, online leaderboards, ads, real-money purchases, and native app packaging are not MVP unless separately approved.
- Suggested architecture: scenes/screens, game rules, board state, level data, progression/save, UI components, animation/VFX/audio, automated tests. Keep gameplay logic separate from presentation.
- Use version control. Do not replace working functionality without tests.

## 3. Core navigation
Launch → Splash → Welcome/Guest → Home → World Map → Level Briefing → Gameplay → Win/Fail → next level/map. Collection, character detail, shop, daily rewards, achievements, restoration, settings, and Endless Mode are separate destinations. Each screen must have a clear back route; leaving a level with unsaved progress requires confirmation.

## 4. Screen-by-screen specification
| ID | Screen | Required behavior | Navigation | Phase |
| --- | --- | --- | --- | --- |
| SCR-01 | App Icon | Rounded-square icon: Pogo's original face + gold star pendant, sky-blue/turquoise floating-island background; no tiny text. | Launch app / browser shortcut | Phase 3 |
| SCR-02 | Splash / Loading | Pufftopia logo; tagline; subtle clouds/islands; loading indicator; load saved progress and assets; handle failure with retry. | On successful load -> SCR-03; load error -> retry/friendly error | Phase 3 |
| SCR-03 | Welcome / Guest Entry | Buttons: Play as Guest, Sign In, Create Account (account options may be disabled until backend exists); Privacy and Terms links only when real documents exist. | Guest -> SCR-05; sign-in/sign-up only when backend implemented | Phase 3 |
| SCR-04 | Sign In / Create Account | Email, password, show/hide password, validation, loading/error/success. Password reset only if backend supports it. | Success -> SCR-05; cancel -> SCR-03 | Later backend |
| SCR-05 | Home / Main Menu | Top: profile/guest, coins, lives, settings. Center: Pogo full-body, Play. Bottom: Map, Collection, Shop, Rewards. Restore-island story progress shown subtly. | Play -> SCR-06; Map -> SCR-07; Collection -> SCR-12; Shop -> SCR-14; Rewards -> SCR-15; Settings -> SCR-18 | Phase 3 |
| SCR-06 | Level Briefing / Select | Level number, objective(s), move limit, difficulty, reward preview, Start, back to map. Separate map path nodes select a level. | Start -> SCR-08; back -> SCR-07 | Phase 3 |
| SCR-07 | World Map | Six world regions; level path nodes; locked/unlocked/completed states; star totals; current position. World 1 open at start; later worlds unlock by defined star/level thresholds. | Select available node -> SCR-06; Home -> SCR-05 | Phase 3 |
| SCR-08 | Gameplay | 8x8 board; level, objective counters, moves, score, pause; 6 base Puff types; 3 boosters; board is visually dominant; full-character animated pieces, not only face tiles. | Win -> SCR-09; moves exhausted / no feasible objective -> SCR-10; pause -> SCR-11 | Phase 1-2 |
| SCR-09 | Level Complete | 1-3 stars by configured thresholds; score; coins; objective confirmation; Next Level and Map buttons. | Next -> SCR-06 for next level; Map -> SCR-07 | Phase 2 |
| SCR-10 | Level Failed | Show unmet objectives, score, retry, map, remaining lives. Extra moves may appear only if earned/approved; no forced purchase. | Retry -> restart same level; Map -> SCR-07 | Phase 2 |
| SCR-11 | Pause / In-Game Settings | Resume, restart level, music/sfx toggles, reduce motion; quit to map with confirmation if progress is at risk. | Resume -> SCR-08; restart -> SCR-08 fresh; map -> SCR-07 | Phase 2 |
| SCR-12 | Character Collection | Grid/list of unlocked and locked characters, rarity, collection progress, filter; select character for details. | Card -> SCR-13; back -> prior screen | Phase 4 |
| SCR-13 | Character Detail / Selection | Large full-body character, name, personality, rarity, animation preview controls, Select/Equip, owned status. | Select -> SCR-05 or collection; back -> SCR-12 | Phase 4 |
| SCR-14 | Shop | Tabs: Boosters, Cosmetics, Coins (coin purchases disabled unless monetization approved); item name, cost, balance, confirmation, success/failure. | Purchase -> same screen; back -> SCR-05 | Phase 4 |
| SCR-15 | Daily Rewards | Seven-day reward calendar; Claim button; next claim timer based on local date; display already-claimed state. | Claim -> save reward; back -> SCR-05 | Phase 4 |
| SCR-16 | Achievements | Achievement list, progress, claimed/unclaimed rewards; examples: first match, cascade chain, island explorer, collector. | Claim -> reward then mark claimed; back -> prior screen | Phase 4 |
| SCR-17 | Island Restoration | Island condition, magical-energy meter, milestones, next unlock; energy from specified level goals. | Continue -> map; back -> map | Phase 4 |
| SCR-18 | Settings / Accessibility | Music, SFX, vibration, language, reduced motion, privacy/help/about; save instantly. | Back -> prior screen | Phase 3-4 |
| SCR-19 | Endless Mode | Separate mode entry; no Adventure objectives; score, multiplier, best score, pause/end run. | End -> results panel; retry -> new run | Phase 5 |
| SCR-20 | Endless Results | Current score, personal best, replay, home/map. | Replay -> SCR-19; Home -> SCR-05 | Phase 5 |
| SCR-21 | Special Puff Reference | Explain Striped, Rainbow, Burst and approved combo effects with clear diagrams and concise copy. | Close -> previous screen | Phase 2 |
| SCR-22 | First-Time Tutorial | Teach swap, match 3, gravity/cascade, special Puff; one step at a time; allow skip/replay. | Finish -> SCR-08; skip -> SCR-08 | Phase 1-2 |
| SCR-23 | Connection / Save Status (later) | Only if backend is approved: last sync, retry, conflict resolution, account link. | Retry sync or return | Later backend |

## 5. Character bible
| Character | Personality | Design identity | Distinctive movement / animation | Required animation states | Signature FX |
| --- | --- | --- | --- | --- | --- |
| Pogo | Friendly, brave guide | Sky blue body, distinctive white face, large expressive eyes, small gold star pendant; original silhouette. | Blink/look around; breathing; ear wiggle; happy hop; run; fall wobble; match pop; star spin; win dance; sleep. | Blue star burst; tiny star particles. | Primary guide; do not turn into a generic white cat or resemble existing mascots. |
| Lumi | Calm, magical | Lavender body, turquoise glowing markings, distinct soft antenna/ear shape. | Gentle float; markings pulse; twirl; magic charge; match dissolve; victory hover; sleep float. | Purple spiral and turquoise glow. | Use low-intensity glow so small pieces remain readable. |
| Bobo | Funny, energetic | Golden-yellow round body, oversized cheeks, distinctive little tuft/ear shape. | Squash-stretch; cheek wiggle; comic roll; quick bounce; match pop; laughing win dance. | Golden sunburst and warm particles. | Comedic timing, but animation duration must not delay gameplay. |
| Flora | Kind, nature-loving | Mint-green body, leaf-shaped ears, tiny flower details. | Leaf-ear sway; blink; flower bloom; small dance; leaf spin; gentle landing. | Leaf swirl and flower particles. | Nature motifs must be distinct from other green characters. |
| Nova | Mysterious, cosmic | Violet body, original star-map markings, asymmetrical cosmic accents. | Hover; markings pulse; short teleport; slow turn; cosmic match flash; floating victory pose. | Violet ring and star pulse. | Avoid excessive screen flashes; reduced-motion alternative required. |

### Animation rule
Full-body character art is required for collection and selection. In the puzzle board, use readable small character sprites (not merely generic face tiles). Every character needs consistent silhouette, palette, face, markings, and animation timing. Required states: idle/breathe, blink/look, happy, run/jump/float, swap reaction, fall, match, special, win, sleep. Use simplified small-board animations if needed, but retain identity. Block input while resolution animations are running; provide reduced-motion alternatives.

## 6. Six base puzzle types
| Type | Palette | Non-color cue | Role |
| --- | --- | --- | --- |
| Aqua | Blue/turquoise | Wave mark + unique eye/ear silhouette | Base match type 1 |
| Berry | Pink/coral | Heart/berry mark + unique cheek/ear silhouette | Base match type 2 |
| Sunny | Yellow/gold | Sun mark + unique tuft/silhouette | Base match type 3 |
| Mint | Green | Leaf mark + leaf-ear silhouette | Base match type 4 |
| Dream | Purple | Moon/star mark + soft antenna silhouette | Base match type 5 |
| Ember | Orange | Flame mark + pointed tuft silhouette | Base match type 6 |

## 7. Gameplay rules (authoritative)
| System | Exact rule |
| --- | --- |
| Board | 8 columns × 8 rows; exactly 64 occupied cells except during a resolving animation; touch/mouse swap only orthogonally adjacent pieces. |
| Match rule | Three or more same base type in a horizontal/vertical line. Diagonal-only groups do not match. |
| Invalid swap | If swap creates no match and is not an approved special-combo action, reverse it and do not spend a move. |
| Move accounting | Spend one move only after a valid player action is accepted. Cascades do not cost extra moves. |
| Gravity/refill | After clears, pieces above fall into gaps; new pieces spawn from top. Resolve all cascades before accepting another input. |
| Striped Puff | Four in a straight line creates a Striped Puff. On activation clears one full row or column; orientation is deterministic based on match direction. |
| Rainbow Puff | Five in a straight line creates a Rainbow Puff. Swap with a normal Puff to clear all Puffs of that base type. |
| Burst Puff | L/T match creates Burst Puff; activation clears a 3×3 area and may trigger chain effects. |
| Special combos | Only implement combinations explicitly specified in the combo matrix; never invent extra effects. MVP combo set: Striped+Striped cross-clear; Rainbow+normal color clear; Burst+Burst larger blast. Other combinations are later scope. |
| Objectives | Support collect N of a type, clear corrupted/jelly tiles, create N specials, reach score target within moves, mixed goals, restore island energy. |
| Win/lose | Win when every required objective reaches target. Fail when moves are zero and goals incomplete, after all animations resolve. |
| No valid moves | Detect absence of legal swaps; reshuffle while preserving blockers/objective state; verify at least one valid move afterward. |
| Generation | Start boards must not contain accidental auto-matches unless deliberately configured; ensure at least one valid move; test objectives for feasibility. |
| Scoring | Match 3 baseline 60 points; each additional Puff in same match +20; special activation 150 base; cascade multiplier starts at ×1.0 and increases by ×0.5 per cascade, configurable in level data. |
| Stars | Three stars use per-level score thresholds configured in data; never hard-code one universal threshold for all levels. |
| Boosters | Hammer removes one selectable Puff; Extra Moves adds five moves once per level; Shuffle reorders movable pieces and verifies a legal move. Inventory count is saved. |
| Input lock | Disable board input while swap validation, fall, match clear, cascade, or special effects are resolving. |
| Persistence | Local save: level unlocks, stars, coins, lives, characters, cosmetics, boosters, achievements, endless best, settings. Save at stable checkpoints and after rewards. |

## 8. Level data
Each level must be data-driven and contain: level ID, world ID, board layout, initial piece rules, objective list, move limit, obstacle configuration, star score thresholds, reward, difficulty label, tutorial flags, and generator seed for reproducible bug reports. Do not generate levels using uncontrolled random values alone. A generated level must pass validity and solvability checks before being presented.

## 9. Worlds
1. Cloud Meadow — sunny grass islands, waterfalls, small castles; introductory mechanics.
2. Crystal Valley — crystal caves, blue lakes, energy shards; crystal obstacles.
3. Rainbow Forest — colorful trees and nature magic; leaf/flower obstacles.
4. Frostfall Peaks — snowy mountains, frozen lakes; ice obstacles.
5. Starfall Islands — cosmic sky, star portals; advanced portal mechanics only when approved.
6. Shadow Realm — violet ruins and corrupted energy; advanced puzzles.  
World unlock thresholds must be data-configured and visible to the player. World 1 starts unlocked.

## 10. Economy and progression
Coins are earned from levels, daily rewards, achievements, and island restoration. In MVP coins are an in-game earnable currency only. No real-money purchases, ads, or pay-to-win. Booster inventory: Hammer, Extra Moves (+5), Shuffle. Purchases require sufficient coins, confirmation, and a single atomic transaction. Rewards are granted once. Character rarity tiers: Common, Rare, Epic, Legendary, Mythical; unlock sources must be configured and must not make paid purchase mandatory for core progress.

## 11. Save data
Persist: current level, unlocked/completed levels, star ratings, coins, lives, unlocked characters, equipped character/cosmetics, booster inventory, achievements and claimed flags, daily reward date/streak, Endless personal best, audio/accessibility settings, schema version. Use versioned save schema and safe migration. Test corrupt/empty save fallback. Cloud sync is a separate later phase.

## 12. UI / art direction
- Palette: sky blue, turquoise, lavender, emerald, warm gold, coral pink; deep navy panels for readable gameplay.
- Rounded panels and clear hierarchy; consistent spacing, button states, typography, icon language.
- Keep board high contrast and large; backgrounds must not compete with pieces.
- Characters should feel deliberately art-directed, not generic AI mascots or copied IP.
- App icon: Pogo face + star pendant + simple floating island silhouette; no tiny text.
- Final approved screens should be delivered as separate assets, not only one collage.

## 13. Asset list
| Asset ID | Asset | Format | Size/notes | Requirement |
| --- | --- | --- | --- | --- |
| AST-001 | Logo | Vector master + transparent PNG | 1024px+ | Original Pufftopia lettering and star mark; readable at small sizes. |
| AST-002 | App Icon | PNG exports | 1024×1024 master; platform exports | Pogo face + gold star + floating-island hint; no tiny text. |
| AST-003 | Character full-body masters | Layered source + transparent PNG | 1024px+ per character | Five approved designs; consistent front/3/4 view. |
| AST-004 | Character animation sheets | Sprite sheets + JSON atlas | Per character; frame size decided after art test | Idle, blink/look, happy, run/jump/float, swap reaction, match, fall, special, win, sleep. |
| AST-005 | Six base Puff types | Transparent sprites | Board-scale and collection-scale | Distinct silhouette/marking; never rely on color alone. |
| AST-006 | Special Puffs | Transparent sprites + effects | Board-scale | Striped, Rainbow, Burst; distinct from base pieces. |
| AST-007 | World backgrounds | Layered images | Portrait 9:16 target, responsive crop variants | Six separate original environments. |
| AST-008 | UI kit | SVG/PNG + tokens | 9-slice where applicable | Buttons, panels, tabs, counters, progress bars, modal, badges, icons. |
| AST-009 | Particles/VFX | Sprite sheets or procedural particles | Multiple scales | Match pop, fall dust, star, leaf, rainbow, burst, island restore. |
| AST-010 | Audio | OGG/WAV source | Short effects; looped music | Original swap, match, cascade, special, reward, win/fail; home and world music. |
| AST-011 | World map nodes | SVG/PNG | Multiple states | Locked, current, completed, 1/2/3 stars. |
| AST-012 | Tutorial illustrations | SVG/PNG or in-engine | Board overlays | Swap, match, special, objective, booster instructions. |
| AST-013 | Accessibility icons | SVG/PNG | Scalable | Music, SFX, vibration, reduce motion, language. |

## 14. Audio and accessibility
Original short SFX: swap, invalid swap, match, cascade, special activation, reward, win/fail, unlock. Music loops: home and world/gameplay theme. Audio toggles persist. Reduced motion lowers screen shake, flashes, particles, and nonessential movement. Use non-color cues and readable text; respect device safe areas and touch target sizes.

## 15. Development phases
| Phase | Scope | Out of scope / guardrail |
| --- | --- | --- |
| P1 — Playable Core | Board, six piece types, swap validation, match detection, gravity, refill, cascades, score, moves, legal-move check, basic win/fail. | No shop, online account, leaderboard, or full world art required. |
| P2 — Special Mechanics | Striped/Rainbow/Burst pieces, approved combos, objectives, tutorial, pause, win/fail results. | All special effects must match this specification. |
| P3 — Navigation & Visual Shell | Splash, guest welcome, home, map, level briefing, settings, app icon, UI kit. | Screens may use approved placeholder art until final assets are approved. |
| P4 — Progression | Local saving, collection, character detail, boosters inventory, coins, rewards, achievements, island restoration. | No real-money purchases or ads in MVP. |
| P5 — Endless & Balance | Endless mode, personal best, procedural level data, difficulty progression, test harness. | Global leaderboards are out of scope. |
| P6 — Art/Audio/Polish | Final character sheets, animation integration, environments, VFX, audio, reduced motion, performance. | Art and animation must preserve approved designs. |
| P7 — QA & Release | Device tests, save/restore tests, gameplay test suite, browser packaging, release checklist. | No public release before acceptance tests pass. |
| P8 — Optional Online Expansion | Accounts, cloud saves, leaderboards, optional monetization only after separate approval. | Requires backend, privacy review, and explicit scope approval. |

## 16. Acceptance tests
| ID | Pass condition |
| --- | --- |
| AC-01 | A valid swap that forms 3+ identical pieces clears them and awards configured points. |
| AC-02 | An invalid swap returns pieces to original positions and does not consume a move. |
| AC-03 | Gravity, refill, and cascades resolve completely before new input is accepted. |
| AC-04 | Four-in-line creates a Striped Puff; five-in-line creates Rainbow; L/T creates Burst. |
| AC-05 | Striped clears its row/column; Rainbow clears selected type; Burst clears a 3×3 area. |
| AC-06 | All objective types can be completed; win/fail state is correct and cannot trigger twice. |
| AC-07 | No-legal-move boards reshuffle and are verified to contain a legal move. |
| AC-08 | Progress and settings persist after refresh and browser restart. |
| AC-09 | Coin/reward transactions cannot be claimed twice by repeating taps or refreshing. |
| AC-10 | Every visible button is functional, or explicitly disabled with a reason; no fake sign-in/social buttons. |
| AC-11 | Character designs remain consistent across home, collection, character detail, and gameplay. |
| AC-12 | Reduced-motion setting reduces flashes, shake, and nonessential movement. |
| AC-13 | Portrait Android layout keeps board cells touch-friendly and text readable. |
| AC-14 | All gameplay logic has automated tests for swaps, match patterns, special activation, objectives, and save/load. |
| AC-15 | No unapproved feature, screen, character, purchase, ad, online service, or visual style is added. |

## 17. Strict change control — no AI improvisation
1. Treat this pack as the baseline specification and source of truth.
2. Do not add screens, currencies, characters, boosters, worlds, mechanics, monetization, login providers, or backend services without written user approval.
3. If a requirement is ambiguous, stop and ask; do not silently invent a behavior.
4. If a technical constraint requires a change, explain the constraint and present options before changing scope.
5. Every approved change must be recorded in CHANGELOG_AND_DECISIONS.md with date, decision, reason, and affected requirements.
6. Keep implemented features aligned to the screen IDs, mechanic rules, asset IDs, and acceptance criteria in this pack.
7. Before each phase, list the planned files and requirements being implemented; after the phase, report what works, what was tested, and any remaining gaps.
8. Do not claim features are complete unless implemented and tested in the running build.
## 18. Approval gate
Before coding beyond the first prototype, the owner approves: (a) visual style, (b) screen inventory, (c) character designs, (d) exact MVP mechanics, (e) MVP scope and exclusions. Record approval and any edits in `CHANGELOG_AND_DECISIONS.md`. Development should stop and ask when a requested feature is missing from this specification.
