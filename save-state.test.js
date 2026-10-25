const test = require('node:test');
const assert = require('node:assert/strict');
const SaveState = require('../src/save-state.js');
const defaults = { level:1, highestLevel:1, coins:120, lives:5, selectedCharacter:'pogo', unlockedCharacters:['pogo','bobo'], stars:{}, boosters:{hammer:3,extra:3,shuffle:3}, dailyClaimed:false, settings:{music:true,sfx:true,vibration:true,reducedMotion:false}, endlessBest:0 };
function memoryStorage(initial={}) { const data=new Map(Object.entries(initial)); return { getItem:key=>data.has(key)?data.get(key):null, setItem:(key,value)=>data.set(key,value), data }; }
test('loads defaults when there is no saved game',()=>{ const result=SaveState.load(memoryStorage(),'save',defaults); assert.deepEqual(result.state,defaults); assert.equal(result.persistent,true); assert.equal(result.recovered,false); });
test('merges older partial saves with newly introduced defaults',()=>{ const storage=memoryStorage({save:JSON.stringify({coins:42,settings:{reducedMotion:true},boosters:{hammer:1}})}); const state=SaveState.load(storage,'save',defaults).state; assert.equal(state.coins,42); assert.equal(state.settings.reducedMotion,true); assert.equal(state.settings.music,true); assert.equal(state.boosters.hammer,1); assert.equal(state.boosters.extra,3); });
test('sanitizes corrupted or out-of-range values from a save',()=>{ const storage=memoryStorage({save:JSON.stringify({coins:-9,lives:999,highestLevel:'bad',boosters:{hammer:-4},stars:{'2':9,nope:2},unlockedCharacters:['pogo','pogo',7]})}); const state=SaveState.load(storage,'save',defaults).state; assert.equal(state.coins,0); assert.equal(state.lives,5); assert.equal(state.highestLevel,1); assert.equal(state.boosters.hammer,0); assert.equal(state.stars['2'],3); assert.equal(state.stars.nope,undefined); assert.deepEqual(state.unlockedCharacters,['pogo']); });
test('invalid JSON safely falls back to defaults and marks recovery',()=>{ const result=SaveState.load(memoryStorage({save:'{not json'}),'save',defaults); assert.deepEqual(result.state,defaults); assert.equal(result.recovered,true); });
test('saving succeeds when storage is available and fails safely when blocked',()=>{ const storage=memoryStorage(); assert.equal(SaveState.save(storage,'save',{coins:20}),true); assert.deepEqual(JSON.parse(storage.getItem('save')),{coins:20}); assert.equal(SaveState.save({setItem(){throw new Error('quota');}},'save',{}),false); assert.equal(SaveState.save(null,'save',{}),false); });

test('level is clamped to unlocked progression when a save is inconsistent',()=>{ const state=SaveState.load(memoryStorage({save:JSON.stringify({level:12,highestLevel:4})}),'save',defaults).state; assert.equal(state.level,4); assert.equal(state.highestLevel,4); });
test('reports non-persistent mode when storage is unavailable',()=>{ const result=SaveState.load(null,'save',defaults); assert.equal(result.persistent,false); assert.equal(result.recovered,false); assert.deepEqual(result.state,defaults); });


test('falls back to a valid unlocked character when the saved selection is invalid',()=>{
  const state=SaveState.load(memoryStorage({save:JSON.stringify({selectedCharacter:'nova',unlockedCharacters:['pogo','bobo']})}),'save',defaults).state;
  assert.equal(state.selectedCharacter,'pogo');
  assert.ok(state.unlockedCharacters.includes('pogo'));
});

test('restores the default character if a malformed save omits it from unlocks',()=>{
  const state=SaveState.load(memoryStorage({save:JSON.stringify({selectedCharacter:'bobo',unlockedCharacters:['bobo']})}),'save',defaults).state;
  assert.ok(state.unlockedCharacters.includes('pogo'));
  assert.equal(state.selectedCharacter,'bobo');
});

test('save helper does not mutate the caller state while normalizing',()=>{
  const raw={level:8,highestLevel:3,unlockedCharacters:['pogo','pogo'],boosters:{extra:2}};
  const before=JSON.stringify(raw);
  SaveState.normalizeState(raw,defaults);
  assert.equal(JSON.stringify(raw),before);
});
