/* Pufftopia Match-3 core. Pure board logic so it can be tested without a browser. */
(function (root) {
  'use strict';
  const SIZE = 8;
  function cloneBoard(board) { return Array.isArray(board) ? board.map(row => Array.isArray(row) ? row.map(cell => cell ? { ...cell } : null) : []) : []; }
  function isRectangularBoard(board) {
    if (!Array.isArray(board) || board.length === 0 || !Array.isArray(board[0]) || board[0].length === 0) return false;
    const width = board[0].length;
    return board.every(row => Array.isArray(row) && row.length === width);
  }
  function swap(board, a, b) {
    const value = board[a.r][a.c];
    board[a.r][a.c] = board[b.r][b.c];
    board[b.r][b.c] = value;
  }
  function findMatches(board) {
    if (!isRectangularBoard(board)) return [];
    const out = new Map();
    for (let r = 0; r < board.length; r++) {
      let c = 0;
      while (c < board[r].length) {
        const cell = board[r][c];
        if (!cell) { c++; continue; }
        let end = c + 1;
        while (end < board[r].length && board[r][end] && board[r][end].type === cell.type) end++;
        if (end - c >= 3) for (let k = c; k < end; k++) out.set(`${r},${k}`, { r, c: k, len: end - c, axis: 'h' });
        c = end;
      }
    }
    for (let c = 0; c < board[0].length; c++) {
      let r = 0;
      while (r < board.length) {
        const cell = board[r][c];
        if (!cell) { r++; continue; }
        let end = r + 1;
        while (end < board.length && board[end][c] && board[end][c].type === cell.type) end++;
        if (end - r >= 3) for (let k = r; k < end; k++) out.set(`${k},${c}`, { r: k, c, len: end - r, axis: 'v' });
        r = end;
      }
    }
    return [...out.values()];
  }
  function hasValidMove(board) {
    if (!isRectangularBoard(board)) return false;
    for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) {
      for (const [rr, cc] of [[r, c + 1], [r + 1, c]]) {
        if (rr >= board.length || cc >= board[r].length) continue;
        if (isLegalSwap(board, { r, c }, { r: rr, c: cc })) return true;
      }
    }
    return false;
  }
  function makeBoard(types, random = Math.random, makeCell = (type) => ({ type, special: null })) {
    if (!Array.isArray(types) || types.length < 3) throw new Error('At least three Puff types are required.');
    for (let attempt = 0; attempt < 500; attempt++) {
      const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
        let type, tries = 0;
        do {
          type = types[Math.floor(random() * types.length)];
          tries++;
        } while (tries < 100 && ((c >= 2 && board[r][c - 1].type === type && board[r][c - 2].type === type) || (r >= 2 && board[r - 1][c].type === type && board[r - 2][c].type === type)));
        board[r][c] = makeCell(type);
      }
      if (!findMatches(board).length && hasValidMove(board)) return board;
    }
    throw new Error('Unable to generate a valid board after 500 attempts.');
  }
  // Rearrange existing cells until the board has no automatic matches and at least one legal move.
  // Returns null if a playable arrangement cannot be found within the attempt limit.
  function shufflePlayable(board, random = Math.random, maxAttempts = 200) {
    if (!Array.isArray(board) || !board.length || !board[0]?.length) return null;
    const rows = board.length, cols = board[0].length;
    if (board.some(row => !Array.isArray(row) || row.length !== cols) || board.flat().some(cell => !cell)) return null;
    const cells = board.flat();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const shuffled = cells.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const candidate = Array.from({ length: rows }, (_, r) => shuffled.slice(r * cols, (r + 1) * cols));
      if (!findMatches(candidate).length && hasValidMove(candidate)) return candidate;
    }
    return null;
  }

  // Compact each column downward and refill every empty cell with a fresh cell.
  // Existing cells retain their identity and special state; the input board is mutated.
  function applyGravity(board, createCell) {
    if (!isRectangularBoard(board) || typeof createCell !== 'function') throw new Error('A non-empty rectangular board and createCell are required.');
    let moved = 0, refilled = 0;
    for (let c = 0; c < board[0].length; c++) {
      let write = board.length - 1;
      for (let r = board.length - 1; r >= 0; r--) {
        if (board[r][c] !== null && board[r][c] !== undefined) {
          const cell = board[r][c];
          if (write !== r) { board[write][c] = cell; board[r][c] = null; moved++; }
          write--;
        }
      }
      for (let r = write; r >= 0; r--) { board[r][c] = createCell(); refilled++; }
    }
    return { moved, refilled };
  }

  function validPosition(board, pos) {
    return Array.isArray(board) && !!pos && Number.isInteger(pos.r) && Number.isInteger(pos.c) &&
      pos.r >= 0 && pos.r < board.length && Array.isArray(board[pos.r]) &&
      pos.c >= 0 && pos.c < board[pos.r].length && !!board[pos.r][pos.c];
  }
  function isAdjacent(a, b) {
    if (!a || !b || !Number.isInteger(a.r) || !Number.isInteger(a.c) || !Number.isInteger(b.r) || !Number.isInteger(b.c)) return false;
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }
  function isLegalSwap(board, a, b) {
    if (!validPosition(board, a) || !validPosition(board, b) || !isAdjacent(a, b)) return false;
    // Reject ragged boards before match detection; malformed external/test data
    // must not throw or leave the board in a swapped state.
    if (!isRectangularBoard(board)) return false;
    swap(board, a, b);
    let legal = false;
    try { legal = findMatches(board).length > 0 || !!board[a.r][a.c]?.special || !!board[b.r][b.c]?.special; }
    finally { swap(board, a, b); }
    return legal;
  }

  // Returns the unique coordinates affected by swapping special Puffs.
  // Coordinates are calculated after the two cells have been swapped.
  function specialClearCells(board, a, b) {
    const ca = board[a.r][a.c], cb = board[b.r][b.c];
    const out = new Set();
    const add = (r, c) => { if (r >= 0 && r < board.length && c >= 0 && c < board[r].length) out.add(`${r},${c}`); };
    const line = (r, c) => {
      for (let k = 0; k < board.length; k++) { add(r, k); add(k, c); }
    };
    const blast = (r, c, radius = 1) => {
      for (let rr = r - radius; rr <= r + radius; rr++)
        for (let cc = c - radius; cc <= c + radius; cc++) add(rr, cc);
    };
    const rainbowA = ca && ca.special === 'rainbow';
    const rainbowB = cb && cb.special === 'rainbow';
    if (rainbowA && rainbowB) {
      for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) add(r, c);
    } else if (rainbowA || rainbowB) {
      const target = rainbowA ? cb : ca;
      if (target) for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] && board[r][c].type === target.type) add(r, c);
      }
    } else if (ca && cb && ca.special === 'striped' && cb.special === 'striped') {
      line(a.r, a.c); line(b.r, b.c);
    } else if (ca && cb && ca.special === 'burst' && cb.special === 'burst') {
      blast(a.r, a.c, 2); blast(b.r, b.c, 2);
    } else if (ca && cb && ((ca.special === 'striped' && cb.special === 'burst') || (ca.special === 'burst' && cb.special === 'striped'))) {
      line(a.r, a.c); line(b.r, b.c); blast(a.r, a.c, 1); blast(b.r, b.c, 1);
    } else {
      for (const [cell, pos] of [[ca, a], [cb, b]]) {
        if (!cell || !cell.special) continue;
        if (cell.special === 'striped') { for (let c = 0; c < board[pos.r].length; c++) add(pos.r, c); }
        else if (cell.special === 'burst') blast(pos.r, pos.c, 1);
        else if (cell.special === 'rainbow') {
          for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) if (board[r][c] && board[r][c].type === cell.type) add(r, c);
        }
      }
    }
    return [...out].map(key => { const [r, c] = key.split(',').map(Number); return { r, c }; });
  }

  // Effect of one already-created special Puff. Kept separate from swap combos
  // so chain reactions never accidentally interpret one Puff as a double combo.
  function specialEffectCells(board, pos) {
    const cell = board?.[pos.r]?.[pos.c];
    if (!cell || !cell.special) return [];
    const out = new Set();
    const add = (r, c) => { if (r >= 0 && r < board.length && c >= 0 && c < board[r].length) out.add(`${r},${c}`); };
    if (cell.special === 'striped') {
      // The approved baseline uses a horizontal stripe unless an orientation is stored.
      if (cell.orientation === 'vertical') {
        for (let r = 0; r < board.length; r++) add(r, pos.c);
      } else {
        for (let c = 0; c < board[pos.r].length; c++) add(pos.r, c);
      }
    } else if (cell.special === 'burst') {
      for (let r = pos.r - 1; r <= pos.r + 1; r++)
        for (let c = pos.c - 1; c <= pos.c + 1; c++) add(r, c);
    } else if (cell.special === 'rainbow') {
      for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++)
        if (board[r][c] && board[r][c].type === cell.type) add(r, c);
    }
    return [...out].map(key => { const [r, c] = key.split(',').map(Number); return { r, c }; });
  }

  // Expand a starting clear through any special Puffs hit by it. Each special
  // activates at most once per resolution, preventing infinite chain loops.
  function expandSpecialClear(board, startingCells) {
    const clear = new Set();
    const queued = new Set();
    const queue = (startingCells || []).map(p => ({ r: p.r, c: p.c }));
    const keyOf = p => `${p.r},${p.c}`;
    while (queue.length) {
      const pos = queue.shift();
      const key = keyOf(pos);
      if (clear.has(key)) continue;
      clear.add(key);
      const cell = board?.[pos.r]?.[pos.c];
      if (!cell || !cell.special || queued.has(key)) continue;
      queued.add(key);
      for (const affected of specialEffectCells(board, pos)) {
        if (!clear.has(keyOf(affected))) queue.push(affected);
      }
    }
    return [...clear].map(key => { const [r, c] = key.split(',').map(Number); return { r, c }; });
  }


  // Remove one selected Puff and activate any special Puff hit by the hammer.
  // Returns snapshots of removed cells so the game can score/collect them after clearing.
  function applyHammer(board, pos) {
    if (!Array.isArray(board) || !pos || !Number.isInteger(pos.r) || !Number.isInteger(pos.c) || !board[pos.r] || pos.c < 0 || pos.c >= board[pos.r].length || !board[pos.r][pos.c]) return [];
    const cells = expandSpecialClear(board, [pos]);
    const removed = [];
    for (const cellPos of cells) {
      const cell = board[cellPos.r]?.[cellPos.c];
      if (cell) {
        removed.push({ r: cellPos.r, c: cellPos.c, cell: { ...cell } });
        board[cellPos.r][cellPos.c] = null;
      }
    }
    return removed;
  }

  // Apply the Extra Moves booster without mutating caller state. Inventory is
  // consumed only when the move count and booster count are valid.
  function applyExtraMoves(moves, inventory, amount = 5) {
    const valid = Number.isInteger(moves) && moves >= 0 && Number.isInteger(inventory) && inventory >= 0 && Number.isInteger(amount) && amount > 0;
    if (!valid || inventory < 1) return { used: false, moves: Number.isInteger(moves) && moves >= 0 ? moves : 0, inventory: Number.isInteger(inventory) && inventory >= 0 ? inventory : 0 };
    return { used: true, moves: moves + amount, inventory: inventory - 1 };
  }

  function evaluateLevelResult({ collected, goal, score, targetScore } = {}) {
    const valid = [collected, goal, score, targetScore].every(value => Number.isFinite(value) && value >= 0);
    if (!valid) return { won: false, stars: 0, coins: 5 };
    const won = collected >= goal && score >= targetScore;
    const stars = won ? (score >= targetScore * 1.8 ? 3 : score >= targetScore * 1.3 ? 2 : 1) : 0;
    return { won, stars, coins: won ? 25 + stars * 10 : 5 };
  }
  const api = { SIZE, cloneBoard, isRectangularBoard, swap, findMatches, hasValidMove, makeBoard, shufflePlayable, applyGravity, isAdjacent, isLegalSwap, specialClearCells, specialEffectCells, expandSpecialClear, applyHammer, applyExtraMoves, evaluateLevelResult };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PufftopiaMatch3 = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
