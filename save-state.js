/* Defensive local save handling for Pufftopia. */
(function (root) {
  'use strict';
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function normalizeState(raw, defaults) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const merged = {
      ...clone(defaults), ...source,
      settings: { ...defaults.settings, ...(source.settings && typeof source.settings === 'object' ? source.settings : {}) },
      boosters: { ...defaults.boosters, ...(source.boosters && typeof source.boosters === 'object' ? source.boosters : {}) },
      stars: source.stars && typeof source.stars === 'object' && !Array.isArray(source.stars) ? { ...source.stars } : {},
      unlockedCharacters: Array.isArray(source.unlockedCharacters) ? [...new Set(source.unlockedCharacters.filter(x => typeof x === 'string'))] : [...defaults.unlockedCharacters]
    };
    const boundedInt = (value, fallback, min, max) => Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
    merged.level = boundedInt(merged.level, defaults.level, 1, 100000);
    merged.highestLevel = boundedInt(merged.highestLevel, defaults.highestLevel, 1, 100000);
    merged.level = Math.min(merged.level, merged.highestLevel);
    merged.coins = boundedInt(merged.coins, defaults.coins, 0, 1000000000);
    merged.lives = boundedInt(merged.lives, defaults.lives, 0, 5);
    merged.endlessBest = boundedInt(merged.endlessBest, defaults.endlessBest, 0, 1000000000);
    for (const key of Object.keys(defaults.boosters)) merged.boosters[key] = boundedInt(merged.boosters[key], defaults.boosters[key], 0, 9999);
    for (const key of Object.keys(defaults.settings)) merged.settings[key] = Boolean(merged.settings[key]);
    merged.dailyClaimed = Boolean(merged.dailyClaimed);
    // A save may refer to a character that is no longer valid or unlocked.
    // Fall back to the default character rather than leaving the UI in an invalid state.
    if (typeof merged.selectedCharacter !== 'string' || !merged.unlockedCharacters.includes(merged.selectedCharacter)) {
      merged.selectedCharacter = defaults.selectedCharacter;
    }
    // Keep the default character available even if a malformed save omitted it.
    if (!merged.unlockedCharacters.includes(defaults.selectedCharacter)) {
      merged.unlockedCharacters.unshift(defaults.selectedCharacter);
    }
    for (const key of Object.keys(merged.stars)) {
      const value = merged.stars[key];
      if (!/^\d+$/.test(key) || !Number.isFinite(value)) delete merged.stars[key];
      else merged.stars[key] = boundedInt(value, 0, 0, 3);
    }
    return merged;
  }
  function load(storage, key, defaults) {
    try {
      const raw = storage && storage.getItem(key);
      return { state: normalizeState(raw ? JSON.parse(raw) : {}, defaults), persistent: !!storage, recovered: false };
    } catch (_) {
      return { state: clone(defaults), persistent: false, recovered: true };
    }
  }
  function save(storage, key, state) {
    try { if (!storage) return false; storage.setItem(key, JSON.stringify(state)); return true; }
    catch (_) { return false; }
  }
  const api = { normalizeState, load, save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PufftopiaSaveState = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
