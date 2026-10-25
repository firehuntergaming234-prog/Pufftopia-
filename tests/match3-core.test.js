const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/match3-core.js');
const cell = (type, special = null) => ({ type, special });
const blankBoard = (type = 'a') => Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => cell(type)));
const patternedBoard = () => Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => cell(['a','b','c','d','e','f'][(r * 3 + c * 2) % 6])));

test('detects horizontal runs of three and longer', () => {
  const b = patternedBoard();
  for (let c = 0; c < 8; c++) b[0][c] = cell(['a','b','c','d','e','f','a','b'][c]);
  const matches = core.findMatches(b).filter(m => m.r === 0);
  assert.equal(matches.length, 0); // no three adjacent types in row 0
  b[1][2] = cell('x'); b[1][3] = cell('x'); b[1][4] = cell('x'); b[1][5] = cell('x');
  const run = core.findMatches(b).filter(m => m.r === 1);
  assert.equal(run.length, 4);
  assert.ok(run.every(m => m.axis === 'h' && m.len === 4));
});

test('detects vertical runs', () => {
  const b = patternedBoard();
  for (let r = 0; r < 8; r++) b[r][2] = cell(['a','b','c','d','e','f','g','h'][r]);
  b[2][3] = cell('z'); b[3][3] = cell('z'); b[4][3] = cell('z');
  const run = core.findMatches(b).filter(m => m.c === 3);
  assert.equal(run.length, 3);
  assert.ok(run.every(m => m.axis === 'v' && m.len === 3));
});

test('does not mutate the board while checking valid moves', () => {
  const b = patternedBoard();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b[r][c] = cell((r * 3 + c * 2) % 6 ? 'b' : 'a');
  // A special makes a neighboring swap legal by rule.
  b[0][0] = cell('a', 'striped');
  const before = JSON.stringify(b);
  assert.equal(core.hasValidMove(b), true);
  assert.equal(JSON.stringify(b), before);
});

test('only orthogonally adjacent swaps can be legal', () => {
  const b = patternedBoard();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b[r][c] = cell((r * 3 + c * 2) % 6 ? 'b' : 'a');
  b[0][0] = cell('a', 'striped');
  assert.equal(core.isAdjacent({r:0,c:0},{r:0,c:1}), true);
  assert.equal(core.isAdjacent({r:0,c:0},{r:1,c:1}), false);
  assert.equal(core.isLegalSwap(b,{r:0,c:0},{r:1,c:1}), false);
});

test('generates an 8x8 board with no starting matches and at least one valid move', () => {
  let seed = 123456789;
  const random = () => { seed = (1664525 * seed + 1013904223) % 4294967296; return seed / 4294967296; };
  const b = core.makeBoard(['a','b','c','d','e','f'], random, cell);
  assert.equal(b.length, 8);
  assert.ok(b.every(row => row.length === 8));
  assert.equal(core.findMatches(b).length, 0);
  assert.equal(core.hasValidMove(b), true);
});

test('single striped Puff clears exactly its row', () => {
  const b = patternedBoard();
  b[3][4] = cell('a', 'striped');
  const clear = core.specialClearCells(b, {r:3,c:4}, {r:3,c:5});
  assert.equal(clear.length, 8);
  assert.ok(clear.every(p => p.r === 3));
});

test('Rainbow plus normal Puff clears every Puff of the normal Puff type', () => {
  const b = patternedBoard();
  b[0][0] = cell('a', 'rainbow');
  b[0][1] = cell('c');
  const clear = core.specialClearCells(b, {r:0,c:0}, {r:0,c:1});
  assert.ok(clear.length > 8);
  assert.ok(clear.some(p => p.r === 0 && p.c === 1));
  assert.ok(clear.every(p => b[p.r][p.c].type === 'c'));
});

test('Rainbow plus Rainbow clears the complete board', () => {
  const b = patternedBoard();
  b[0][0] = cell('a', 'rainbow');
  b[0][1] = cell('b', 'rainbow');
  const clear = core.specialClearCells(b, {r:0,c:0}, {r:0,c:1});
  assert.equal(clear.length, 64);
});

test('Striped plus Striped clears both intersecting rows and columns without duplicates', () => {
  const b = patternedBoard();
  b[2][2] = cell('a', 'striped');
  b[5][6] = cell('b', 'striped');
  const clear = core.specialClearCells(b, {r:2,c:2}, {r:5,c:6});
  assert.equal(clear.length, 28);
  assert.ok(clear.some(p => p.r === 2 && p.c === 0));
  assert.ok(clear.some(p => p.r === 5 && p.c === 0));
  assert.ok(clear.some(p => p.r === 0 && p.c === 2));
  assert.ok(clear.some(p => p.r === 0 && p.c === 6));
});

test('Burst plus Burst creates expanded 5x5 blasts around both Puffs', () => {
  const b = patternedBoard();
  b[2][2] = cell('a', 'burst');
  b[5][5] = cell('b', 'burst');
  const clear = core.specialClearCells(b, {r:2,c:2}, {r:5,c:5});
  assert.ok(clear.length > 25);
  assert.ok(clear.some(p => p.r === 0 && p.c === 0));
  assert.ok(clear.some(p => p.r === 7 && p.c === 7));
});

test('single striped effect clears one row, not a row and column', () => {
  const b = patternedBoard();
  b[3][4] = cell('a', 'striped');
  const clear = core.specialEffectCells(b, {r:3,c:4});
  assert.equal(clear.length, 8);
  assert.ok(clear.every(p => p.r === 3));
});

test('special clear expands into a second special hit by the first blast', () => {
  const b = patternedBoard();
  b[3][3] = cell('a', 'burst');
  b[3][4] = cell('b', 'striped');
  const expanded = core.expandSpecialClear(b, [{r:3,c:3}]);
  assert.ok(expanded.some(p => p.r === 3 && p.c === 4));
  // The burst hits the stripe, which then clears its entire row.
  assert.ok(expanded.some(p => p.r === 3 && p.c === 0));
  assert.ok(expanded.some(p => p.r === 3 && p.c === 7));
});

test('chain expansion is unique and safely handles empty cells', () => {
  const b = patternedBoard();
  b[0][0] = null;
  b[0][1] = cell('a', 'burst');
  const expanded = core.expandSpecialClear(b, [{r:0,c:1}, {r:0,c:1}, {r:0,c:0}]);
  const keys = expanded.map(p => `${p.r},${p.c}`);
  assert.equal(keys.length, new Set(keys).size);
  assert.ok(keys.length <= 10);
});

test('gravity drops surviving Puffs down and refills empty cells', () => {
  const board = Array.from({ length: 4 }, () => Array(3).fill(null));
  const a = { type: 'a', special: null, id: 'a' };
  const b = { type: 'b', special: 'striped', id: 'b' };
  const c = { type: 'c', special: null, id: 'c' };
  board[0][0] = a; board[2][0] = b; board[3][0] = c;
  let fresh = 0;
  const stats = core.applyGravity(board, () => ({ type: 'new', special: null, id: `new${++fresh}` }));
  assert.equal(board[3][0].id, 'c');
  assert.equal(board[2][0].id, 'b');
  assert.equal(board[1][0].id, 'a');
  assert.equal(board[0][0].type, 'new');
  assert.equal(board.flat().filter(Boolean).length, 12);
  assert.equal(stats.refilled, 9);
  assert.equal(stats.moved, 1);
});

test('gravity preserves special Puff metadata and handles a full board without refill', () => {
  const board = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => ({ type: 'x', special: r === 0 && c === 1 ? 'rainbow' : null, id: `${r}-${c}` })));
  const before = board.flat().map(x => x.id);
  let calls = 0;
  const stats = core.applyGravity(board, () => { calls++; return { type: 'new', special: null }; });
  assert.equal(calls, 0);
  assert.equal(stats.refilled, 0);
  assert.equal(board[0][1].special, 'rainbow');
  assert.deepEqual(board.flat().map(x => x.id), before);
});


test('shufflePlayable preserves every cell and returns a match-free board with a legal move', () => {
  const original = patternedBoard();
  // Make the source contain a match so the shuffled result must actually change.
  original[0][0] = cell('same', 'striped');
  original[0][1] = cell('same');
  original[0][2] = cell('same');
  const before = original.flat();
  let seed = 8675309;
  const random = () => { seed = (1664525 * seed + 1013904223) % 4294967296; return seed / 4294967296; };
  const shuffled = core.shufflePlayable(original, random, 500);
  assert.ok(shuffled);
  assert.equal(core.findMatches(shuffled).length, 0);
  assert.equal(core.hasValidMove(shuffled), true);
  assert.deepEqual(shuffled.flat().slice().sort((a,b) => String(a.type).localeCompare(String(b.type))), before.slice().sort((a,b) => String(a.type).localeCompare(String(b.type))));
  assert.equal(original[0][0].special, 'striped');
});

test('shufflePlayable returns null for an invalid board rather than throwing', () => {
  assert.equal(core.shufflePlayable(null), null);
  assert.equal(core.shufflePlayable([[cell('a'), null]]), null);
});


test('level win requires both collection goal and score target', () => {
  assert.deepEqual(core.evaluateLevelResult({ collected: 12, goal: 12, score: 1499, targetScore: 1500 }), { won: false, stars: 0, coins: 5 });
  assert.deepEqual(core.evaluateLevelResult({ collected: 11, goal: 12, score: 3000, targetScore: 1500 }), { won: false, stars: 0, coins: 5 });
  assert.deepEqual(core.evaluateLevelResult({ collected: 12, goal: 12, score: 1500, targetScore: 1500 }), { won: true, stars: 1, coins: 35 });
});

test('level rewards award one, two, or three stars at the configured score thresholds', () => {
  assert.equal(core.evaluateLevelResult({ collected: 12, goal: 12, score: 1949, targetScore: 1500 }).stars, 1);
  assert.equal(core.evaluateLevelResult({ collected: 12, goal: 12, score: 1950, targetScore: 1500 }).stars, 2);
  assert.equal(core.evaluateLevelResult({ collected: 12, goal: 12, score: 2700, targetScore: 1500 }).stars, 3);
  assert.equal(core.evaluateLevelResult({ collected: 0, goal: 12, score: 9000, targetScore: 1500 }).coins, 5);
});

test('level outcome evaluation safely handles missing and non-numeric inputs', () => {
  assert.deepEqual(core.evaluateLevelResult({}), { won: false, stars: 0, coins: 5 });
  assert.equal(core.evaluateLevelResult({ collected: '12', goal: 12, score: '2000', targetScore: 1500 }).won, false);
});


test('Puff Hammer removes a normal selected Puff only', () => {
  const board = patternedBoard();
  const before = board.flat().filter(Boolean).length;
  const removed = core.applyHammer(board, { r: 2, c: 3 });
  assert.equal(removed.length, 1);
  assert.equal(removed[0].r, 2);
  assert.equal(removed[0].c, 3);
  assert.ok(removed[0].cell.type);
  assert.equal(board.flat().filter(Boolean).length, before - 1);
  assert.equal(board[2][3], null);
});

test('Puff Hammer activates a special and records every cleared Puff', () => {
  const board = patternedBoard();
  board[4][3] = cell('mint', 'burst');
  const removed = core.applyHammer(board, { r: 4, c: 3 });
  assert.equal(removed.length, 9);
  assert.ok(removed.some(item => item.cell.special === 'burst'));
  assert.equal(board[4][3], null);
  assert.ok(removed.every(item => board[item.r][item.c] === null));
});

test('Puff Hammer safely rejects invalid or empty coordinates', () => {
  const board = patternedBoard();
  assert.deepEqual(core.applyHammer(board, { r: -1, c: 0 }), []);
  assert.deepEqual(core.applyHammer(board, { r: 0, c: 99 }), []);
  board[1][1] = null;
  assert.deepEqual(core.applyHammer(board, { r: 1, c: 1 }), []);
});


test('Extra Moves consumes one booster and adds exactly five moves', () => {
  assert.deepEqual(core.applyExtraMoves(7, 2), { used: true, moves: 12, inventory: 1 });
});

test('Extra Moves does not consume inventory when unavailable or given invalid input', () => {
  assert.deepEqual(core.applyExtraMoves(4, 0), { used: false, moves: 4, inventory: 0 });
  assert.deepEqual(core.applyExtraMoves(-1, 2), { used: false, moves: 0, inventory: 2 });
  assert.deepEqual(core.applyExtraMoves(4, 2, 0), { used: false, moves: 4, inventory: 2 });
});


test('Extra Moves works when the player has zero moves and does not over-consume inventory', () => {
  assert.deepEqual(core.applyExtraMoves(0, 1, 5), { used: true, moves: 5, inventory: 0 });
  assert.deepEqual(core.applyExtraMoves(0, 0, 5), { used: false, moves: 0, inventory: 0 });
});

test('Extra Moves rejects fractional inventory, moves, and booster amounts', () => {
  assert.equal(core.applyExtraMoves(3.5, 2).used, false);
  assert.equal(core.applyExtraMoves(3, 1.5).used, false);
  assert.equal(core.applyExtraMoves(3, 2, 1.5).used, false);
});

test('isLegalSwap safely rejects missing, out-of-range, and non-adjacent positions without mutating board', () => {
  const board = patternedBoard();
  const before = JSON.stringify(board);
  assert.equal(core.isLegalSwap(board, null, { r: 0, c: 1 }), false);
  assert.equal(core.isLegalSwap(board, { r: -1, c: 0 }, { r: 0, c: 0 }), false);
  assert.equal(core.isLegalSwap(board, { r: 0, c: 0 }, { r: 7, c: 7 }), false);
  assert.equal(core.isLegalSwap(board, { r: 0, c: 0 }, { r: 0, c: 99 }), false);
  assert.equal(JSON.stringify(board), before);
});

test('isLegalSwap rejects ragged boards safely without changing their cells', () => {
  const board = [[cell('a'), cell('b')], [cell('c')]];
  const before = JSON.stringify(board);
  assert.equal(core.isLegalSwap(board, { r: 0, c: 0 }, { r: 0, c: 1 }), false);
  assert.equal(JSON.stringify(board), before);
});

test('isAdjacent rejects malformed coordinates instead of throwing', () => {
  assert.equal(core.isAdjacent(null, { r: 0, c: 1 }), false);
  assert.equal(core.isAdjacent({ r: 0.5, c: 1 }, { r: 0, c: 1 }), false);
  assert.equal(core.isAdjacent({ r: 2, c: 2 }, { r: 2, c: 3 }), true);
});

test('findMatches and hasValidMove safely reject empty and ragged boards', () => {
  assert.deepEqual(core.findMatches([]), []);
  assert.deepEqual(core.findMatches([[]]), []);
  assert.equal(core.hasValidMove([]), false);
  assert.equal(core.hasValidMove([[cell('a'), cell('b')], [cell('c')]]), false);
});

test('hasValidMove does not mutate a rectangular board containing empty cells', () => {
  const board = patternedBoard();
  board[0][0] = null;
  const before = JSON.stringify(board);
  core.hasValidMove(board);
  assert.equal(JSON.stringify(board), before);
});

test('applyGravity rejects malformed boards before mutating them', () => {
  const board = [[cell('a'), cell('b')], [cell('c')]];
  const before = JSON.stringify(board);
  assert.throws(() => core.applyGravity(board, () => cell('new')), /rectangular board/);
  assert.equal(JSON.stringify(board), before);
});

test('isRectangularBoard identifies only non-empty rectangular arrays', () => {
  assert.equal(core.isRectangularBoard(blankBoard()), true);
  assert.equal(core.isRectangularBoard([]), false);
  assert.equal(core.isRectangularBoard([[cell('a')], []]), false);
  assert.equal(core.isRectangularBoard(null), false);
});
