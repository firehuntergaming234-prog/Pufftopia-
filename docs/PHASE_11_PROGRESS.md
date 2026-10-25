# Pufftopia Phase 11 Progress

## Scope
Harden existing match-3 input validation without changing approved gameplay or introducing features.

## Completed
- Validate coordinates before checking legal swaps.
- Reject malformed, out-of-range, non-adjacent, and ragged-board inputs without throwing.
- Guarantee that a legal-swap check restores the original cells even if match detection throws.
- Add regression tests for invalid coordinates and board non-mutation.

## Validation
- `npm test`: 40 passed, 0 failed.
- `npm run check`: passed.
- Browser/Android manual QA: not yet performed.
