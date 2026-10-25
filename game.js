(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const PUFFS = [
    {id:'aqua',name:'Aqua Puff',color:'#63d8ff',dark:'#1688d3',mark:'✦'},
    {id:'berry',name:'Berry Puff',color:'#ff8ac2',dark:'#d7428e',mark:'♥'},
    {id:'sunny',name:'Sunny Puff',color:'#ffd36c',dark:'#e89422',mark:'☀'},
    {id:'mint',name:'Mint Puff',color:'#86efad',dark:'#23a978',mark:'✿'},
    {id:'dream',name:'Dream Puff',color:'#c2a2ff',dark:'#7850d8',mark:'✧'},
    {id:'ember',name:'Ember Puff',color:'#ff9b65',dark:'#e65d38',mark:'◆'}
  ];
  const CHARACTERS = [
    {id:'pogo',name:'Pogo',subtitle:'The friendly guide',desc:'Sky-blue and brave. Pogo celebrates every little win with a happy hop.',puff:'aqua',rarity:'Guide',accessory:'✦',personality:'Curious and kind'},
    {id:'lumi',name:'Lumi',subtitle:'Keeper of little lights',desc:'Lavender glow-marks sparkle whenever Lumi discovers a new bit of magic.',puff:'dream',rarity:'Rare',accessory:'✧',personality:'Gentle and clever'},
    {id:'bobo',name:'Bobo',subtitle:'The giggle-maker',desc:'A golden bundle of giggles, cheek-puffs, and surprisingly good puzzle instincts.',puff:'sunny',rarity:'Common',accessory:'★',personality:'Silly and fearless'},
    {id:'flora',name:'Flora',subtitle:'Friend of growing things',desc:'Mint-green leaf ears flutter when Flora brings a fading island back to life.',puff:'mint',rarity:'Epic',accessory:'❀',personality:'Patient and caring'},
    {id:'nova',name:'Nova',subtitle:'Dreamer of the stars',desc:'Cosmic patterns shimmer across Nova when a big combo lights up the board.',puff:'berry',rarity:'Legendary',accessory:'☄',personality:'Mysterious and bold'}
  ];
  const Match3 = window.PufftopiaMatch3;
  const SaveState = window.PufftopiaSaveState;
  const SAVE_KEY='pufftopia-save-v1';
  const defaults={level:1,highestLevel:1,coins:120,lives:5,selectedCharacter:'pogo',unlockedCharacters:['pogo','bobo'],stars:{},boosters:{hammer:3,extra:3,shuffle:3},dailyClaimed:false,settings:{music:true,sfx:true,vibration:true,reducedMotion:false},endlessBest:0};
  let storage = null;
  try { storage = window.localStorage; } catch (_) { /* Some browser privacy modes block storage access. */ }
  const initialLoad = SaveState.load(storage, SAVE_KEY, defaults);
  let state=initialLoad.state, board=[], selected=null, moves=24, score=0, collected=0, goal=12, targetScore=1500, activeLevel=1, busy=false, boosterMode=null, toastTimer=null, gameStartTime=0, levelFinished=false;
  const clone = obj => JSON.parse(JSON.stringify(obj));
  function saveState(){
    const saved = SaveState.save(storage, SAVE_KEY, state);
    updateHeader();
    if (!saved) { const status = $('#save-status'); if (status) status.textContent = 'Local save unavailable — progress may not persist after closing this page.'; }
    return saved;
  }
  function updateHeader(){$('#coins').textContent=state.coins;$('#lives').textContent=state.lives;$('#map-progress').textContent=`Level ${state.highestLevel}`;$('#hammer-count').textContent=state.boosters.hammer;$('#extra-count').textContent=state.boosters.extra;$('#shuffle-count').textContent=state.boosters.shuffle}
  function puffMarkup(type, character=null){const p=PUFFS.find(x=>x.id===type)||PUFFS[0];const c=character?CHARACTERS.find(x=>x.id===character):null;return `<span class="puff-character ${c?'character-'+c.id:''}" style="--puff:${p.color};--puff-dark:${p.dark}" aria-hidden="true"><span class="eyes"><i></i><i></i></span><span class="cheek left"></span><span class="cheek right"></span><span class="mouth"></span>${c?`<span class="accessory">${c.accessory}</span>`:''}</span>`}
  function characterMarkup(id, happy=false){const c=CHARACTERS.find(x=>x.id===id)||CHARACTERS[0];return puffMarkup(c.puff,c.id)}
  function showScreen(name){$$('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${name}`));if(name==='map')renderMap();if(name==='level')renderLevels();if(name==='characters')renderCharacters();if(name==='rewards')renderRewards();if(name==='settings')syncSettings();window.scrollTo({top:0,behavior:state.settings.reducedMotion?'auto':'smooth'})}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
  function initHome(){const hero=$('#hero-puffs');hero.innerHTML=['pogo','bobo','flora','lumi'].map((id,i)=>`<span class="hero-friend" data-friend="${id}">${characterMarkup(id)}</span>`).join('');$('#objective-character').innerHTML=characterMarkup(state.selectedCharacter);$('#result-mascot').innerHTML=characterMarkup(state.selectedCharacter)}
  function renderMap(){$$('.world-node').forEach((n,i)=>{if(i===0){n.classList.remove('locked');n.classList.add('unlocked')}})}
  function renderLevels(){const wrap=$('#level-grid');wrap.innerHTML='';for(let i=1;i<=30;i++){const b=document.createElement('button');b.className='level-button'+(i<state.highestLevel?' done':'')+(i===state.highestLevel?' current':'')+(i>state.highestLevel?' locked':'');b.innerHTML=`${i}${state.stars[i]?`<small>${'★'.repeat(state.stars[i])}</small>`:''}`;b.disabled=i>state.highestLevel;b.addEventListener('click',()=>startGame(i));wrap.append(b)}}
  function renderCharacters(){const wrap=$('#character-grid');wrap.innerHTML='';CHARACTERS.forEach(c=>{const unlocked=state.unlockedCharacters.includes(c.id),card=document.createElement('button');card.className='character-card'+(state.selectedCharacter===c.id?' selected':'');card.innerHTML=`<div class="character-art">${characterMarkup(c.id)}</div><h3>${c.name}</h3><p>${c.subtitle}</p><span class="rarity">${unlocked?c.rarity:'🔒 Unlock later'}</span>`;card.disabled=!unlocked;card.addEventListener('click',()=>{state.selectedCharacter=c.id;saveState();renderCharacters()});wrap.append(card)});const c=CHARACTERS.find(x=>x.id===state.selectedCharacter)||CHARACTERS[0];$('#selected-character-preview').innerHTML=characterMarkup(c.id);$('#selected-character-name').textContent=c.name;$('#selected-character-desc').textContent=c.desc;$('#equip-character').textContent=`Choose ${c.name} ✓`;$('#equip-character').onclick=()=>{state.selectedCharacter=c.id;saveState();$('#objective-character').innerHTML=characterMarkup(c.id);toast(`${c.name} is ready for adventure!`)}}
  function renderRewards(){const wrap=$('#reward-calendar');const rewards=[['🪙','100 coins'],['✧','1 Dream Puff'],['🌈','200 coins'],['⭐','1 Star'],['🔨','1 Hammer'],['🪙','300 coins'],['🎁','Mystery gift']];wrap.innerHTML=rewards.map((r,i)=>`<div class="reward-day ${state.dailyClaimed&&i===0?'claimed':''}"><span class="reward-art">${r[0]}</span><b>Day ${i+1}</b><small>${r[1]}</small></div>`).join('');$('#claim-reward').disabled=state.dailyClaimed;$('#claim-reward').textContent=state.dailyClaimed?'Claimed ✓':'Claim Today’s Reward 🎁';$('#reward-status').textContent=state.dailyClaimed?'You have collected today’s reward. Come back tomorrow!':'A small gift is waiting for you.'}
  function syncSettings(){for(const [key,id] of Object.entries({music:'music-toggle',sfx:'sfx-toggle',vibration:'vibration-toggle',reducedMotion:'motion-toggle'}))$('#'+id).checked=!!state.settings[key]}
  function randomType(){return PUFFS[Math.floor(Math.random()*PUFFS.length)].id}
  function createCell(type=randomType(),special=null){return {type,special,id:Math.random().toString(36).slice(2)}}
  function initialBoard(){board=Match3.makeBoard(PUFFS.map(p=>p.id),Math.random,type=>createCell(type));}
  function renderBoard(){const wrap=$('#puzzle-board');wrap.innerHTML='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const cell=board[r][c],b=document.createElement('button');b.className='puff-tile'+(selected&&selected.r===r&&selected.c===c?' selected':'')+(cell.special?` special-${cell.special}`:'');b.dataset.r=r;b.dataset.c=c;b.setAttribute('role','gridcell');b.setAttribute('aria-label',`${PUFFS.find(p=>p.id===cell.type).name}${cell.special?' '+cell.special:''}, row ${r+1}, column ${c+1}`);b.innerHTML=puffMarkup(cell.type);b.addEventListener('click',()=>onTileClick(r,c));wrap.append(b)}updateGameHUD()}
  function updateGameHUD(){$('#moves-left').textContent=moves;$('#score').textContent=score.toLocaleString();$('#target-count').textContent=Math.max(0,goal-collected);$('#target-score').textContent=targetScore.toLocaleString();$('#objective-progress').style.width=`${Math.min(100,Math.max(collected/goal,score/targetScore)*100)}%`;updateHeader()}
  function startGame(level=state.highestLevel){levelFinished=false;activeLevel=level;state.level=level;saveState();moves=24-Math.min(10,Math.floor((level-1)/3));goal=12+Math.min(18,Math.floor((level-1)/2));targetScore=1500+level*120;score=0;collected=0;selected=null;busy=false;boosterMode=null;gameStartTime=Date.now();initialBoard();$('#game-level').textContent=level;$('#game-message').textContent='Swap two neighbors to match 3 or more!';showScreen('game');renderBoard();}
  function onTileClick(r,c){if(busy)return;if(boosterMode){useBoosterOn(r,c);return}if(!selected){selected={r,c};renderBoard();return}if(selected.r===r&&selected.c===c){selected=null;renderBoard();return}if(Math.abs(selected.r-r)+Math.abs(selected.c-c)===1){const a=selected;selected=null;swapAndResolve(a,{r,c})}else{selected={r,c};renderBoard()}}
  function swapCells(a,b){const tmp=board[a.r][a.c];board[a.r][a.c]=board[b.r][b.c];board[b.r][b.c]=tmp}
  async function swapAndResolve(a,b){if(busy)return;busy=true;swapCells(a,b);let matches=findMatches();if(!matches.length&&!board[a.r][a.c].special&&!board[b.r][b.c].special){swapCells(a,b);selected=null;renderBoard();$('#game-message').textContent='That swap does not make a match. Try another!';busy=false;return}moves--;selected=null;renderBoard();if(board[a.r][a.c].special||board[b.r][b.c].special){await triggerSpecialSwap(a,b);matches=findMatches()}await resolveCascades(matches);busy=false;checkResult()}
  function findMatches(){return Match3.findMatches(board)}
  function groupMatches(matches){const set=new Set(matches.map(m=>`${m.r},${m.c}`)),groups=[];for(const m of matches){if(!groups.some(g=>g.has(`${m.r},${m.c}`)))groups.push(new Set([`${m.r},${m.c}`]))} // Connected groups by adjacency
    let changed=true;while(changed){changed=false;for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){if([...groups[i]].some(k=>{const [r,c]=k.split(',').map(Number);return [...groups[j]].some(q=>{const [rr,cc]=q.split(',').map(Number);return Math.abs(r-rr)+Math.abs(c-cc)<=1})})){for(const k of groups[j])groups[i].add(k);groups.splice(j,1);changed=true;break}}}return groups.map(g=>[...g].map(k=>{const [r,c]=k.split(',').map(Number);return {r,c}}))}
  async function triggerSpecialSwap(a,b){
    const ca=board[a.r][a.c], cb=board[b.r][b.c];
    const bothRainbow=ca.special==='rainbow'&&cb.special==='rainbow';
    const clear=Match3.expandSpecialClear(board,Match3.specialClearCells(board,a,b));
    let removed=0;
    for(const pos of clear){
      if(board[pos.r][pos.c]){board[pos.r][pos.c]=null;removed++;}
    }
    score += bothRainbow ? 1600 : (ca.special==='rainbow'||cb.special==='rainbow') ? 850 : (ca.special&&cb.special) ? 700 : 450;
    collected += removed;
    const message=bothRainbow?'Double Rainbow! The whole board sparkles away!':
      (ca.special==='rainbow'||cb.special==='rainbow')?'Rainbow magic! Every Puff of that type disappears!':
      (ca.special&&cb.special)?'Special combo! A huge magical blast!':
      (ca.special==='striped'||cb.special==='striped')?'Striped magic! A full row and column clear!':'Burst magic! Nearby Puffs explode!';
    $('#game-message').textContent=message;
    renderBoard();
    await wait(260);
  }
  function blast(r,c){for(let rr=Math.max(0,r-1);rr<=Math.min(7,r+1);rr++)for(let cc=Math.max(0,c-1);cc<=Math.min(7,c+1);cc++)board[rr][cc]=null}
  async function resolveCascades(matches){let chain=0;while(matches.length||board.some(row=>row.some(cell=>cell===null))){chain++;if(chain>20)break;if(matches.length){for(const m of matches){const tile=$(`#puzzle-board .puff-tile[data-r=\"${m.r}\"][data-c=\"${m.c}\"]`);if(tile)tile.classList.add('matched')}await wait(180);const groups=groupMatches(matches);let specialMade=0;const createdSpecials=new Set();for(const group of groups){const horizontal=matches.some(m=>m.axis==='h'&&group.some(g=>g.r===m.r&&g.c===m.c));const vertical=matches.some(m=>m.axis==='v'&&group.some(g=>g.r===m.r&&g.c===m.c));const fiveInLine=matches.some(m=>m.len>=5&&group.some(g=>g.r===m.r&&g.c===m.c));const fourInLine=matches.some(m=>m.len>=4&&group.some(g=>g.r===m.r&&g.c===m.c));const size=group.length;let special=null;if(horizontal&&vertical)special='burst';else if(fiveInLine)special='rainbow';else if(fourInLine||size>=4)special='striped';if(special){const anchor=group[Math.floor(group.length/2)];board[anchor.r][anchor.c]=createCell(board[anchor.r][anchor.c].type,special);createdSpecials.add(`${anchor.r},${anchor.c}`);specialMade++}}
        const remove=new Set(matches.map(m=>`${m.r},${m.c}`));for(const group of groups){const size=group.length;for(const cell of group){if(board[cell.r][cell.c].special)continue;board[cell.r][cell.c]=null;collected++;score+=60+chain*10} }
        // Activate matched special Puffs and any specials hit by their effects.
        const ordinaryClear=[...remove].filter(key=>!createdSpecials.has(key)).map(key=>{const [r,c]=key.split(',').map(Number);return {r,c}});
        const chainedClear=Match3.expandSpecialClear(board,ordinaryClear);
        for(const pos of chainedClear){if(board[pos.r][pos.c]!==null){if(board[pos.r][pos.c].special)score+=board[pos.r][pos.c].special==='rainbow'?350:board[pos.r][pos.c].special==='striped'?220:180;board[pos.r][pos.c]=null;collected++;score+=40}}
        if(chain>1)$('#game-message').textContent=`Cascade x${chain}! +${chain*100} bonus`;else $('#game-message').textContent=specialMade?`Amazing! ${specialMade} special Puff created!`:'Lovely match!';
      }
      applyGravity();renderBoard();await wait(120);matches=findMatches();if(!matches.length&&!board.some(row=>row.some(cell=>cell===null)))break;
    }if(!hasValidMove()){shuffleBoard(false);$('#game-message').textContent='The board needed a little shuffle!'}updateGameHUD()}
  function applyGravity(){return Match3.applyGravity(board,()=>createCell())}
  function hasValidMove(){return Match3.hasValidMove(board)}
  function shuffleBoard(show=true){
    const shuffled=Match3.shufflePlayable(board);
    if(!shuffled){
      try{board=Match3.makeBoard(PUFFS.map(p=>p.id),Math.random,type=>createCell(type));}
      catch(error){console.error('Could not recover a playable board:',error);toast('Could not shuffle right now. Please try again.');return false;}
    }else board=shuffled;
    if(show){renderBoard();toast('Board shuffled!');}
    return true;
  }
  function useBoosterOn(r,c){if(levelFinished||busy)return;const type=boosterMode;boosterMode=null;if(type==='hammer'){if(state.boosters.hammer<1){toast('No Puff Hammers left. Visit the shop!');return}const removed=Match3.applyHammer(board,{r,c});if(!removed.length){toast('Choose a Puff to remove.');return}state.boosters.hammer--;busy=true;for(const item of removed){collected++;score+=100+(item.cell.special==='rainbow'?350:item.cell.special==='striped'?220:item.cell.special==='burst'?180:0)}applyGravity();renderBoard();saveState();toast(removed.length>1?'Puff Hammer combo!':'Puff Hammer!');resolveCascades(findMatches()).then(()=>{busy=false;checkResult()}).catch(()=>{busy=false;toast('That move could not finish. Please try again.')})}}
  function checkResult(){if(levelFinished)return;updateGameHUD();const result=Match3.evaluateLevelResult({collected,goal,score,targetScore});if(result.won){finishLevel(true);return}if(moves<=0){finishLevel(false);return}}
  function finishLevel(win){if(levelFinished)return;levelFinished=true;busy=false;const result=Match3.evaluateLevelResult({collected,goal,score,targetScore});win=result.won;const c=CHARACTERS.find(x=>x.id===state.selectedCharacter)||CHARACTERS[0];$('#result-mascot').innerHTML=characterMarkup(c.id);$('#result-mascot .puff-character')?.classList.add(win?'happy':'sad');$('#result-eyebrow').textContent=win?'ISLAND MAGIC RESTORED':'A LITTLE MORE PRACTICE';$('#result-title').textContent=win?'Wonderful!':'Keep Going!';$('#result-description').textContent=win?'You brought a little more magic back to Cloud Meadow.':`You collected ${collected}/${goal} Puffs and scored ${score.toLocaleString()} points. Every try teaches a new trick.`;const stars=result.stars;$('#result-stars').textContent=win?'★ '.repeat(stars)+'☆ '.repeat(3-stars):'☆ ☆ ☆';$('#result-score').textContent=score.toLocaleString();const earned=result.coins;$('#result-coins').textContent=`+${earned} 🪙`;$('#result-continue').textContent=win?'Next Level ➜':'Try Again ↻';$('#result-continue').onclick=()=>win?startGame(activeLevel+1):startGame(activeLevel);$('#result-map').onclick=()=>showScreen('map');if(win){state.stars[activeLevel]=Math.max(state.stars[activeLevel]||0,stars);state.highestLevel=Math.max(state.highestLevel,activeLevel+1);state.level=activeLevel+1;state.coins+=earned;if(activeLevel===2&&!state.unlockedCharacters.includes('lumi'))state.unlockedCharacters.push('lumi')}else state.coins+=earned;saveState();showScreen('result')}
  function wait(ms){return new Promise(resolve=>setTimeout(resolve,state.settings.reducedMotion?0:ms))}
  function startBooster(type){if(busy||levelFinished)return;if(type==='extra'){const result=Match3.applyExtraMoves(moves,state.boosters.extra,5);if(!result.used){toast(state.boosters.extra<1?'No Extra Moves left. Visit the shop!':'Extra Moves are unavailable right now.');return}moves=result.moves;state.boosters.extra=result.inventory;saveState();updateGameHUD();toast('+5 moves!');return}if(type==='shuffle'){if(state.boosters.shuffle<1){toast('No Shuffles left. Visit the shop!');return}if(shuffleBoard()){state.boosters.shuffle--;saveState();updateHeader()}return}if(type==='hammer'){if(state.boosters.hammer<1){toast('No Puff Hammers left. Visit the shop!');return}boosterMode='hammer';toast('Choose a Puff to remove.');}}
  function buyItem(item){const price={hammer:40,extra:60,shuffle:30}[item];if(state.coins<price){toast('Not enough coins yet. Win a level to earn more!');return}state.coins-=price;state.boosters[item]++;saveState();toast(`${item==='extra'?'Extra Moves':item==='hammer'?'Puff Hammer':'Shuffle'} added to your boosters!`)}
  function leaveToMap(){if(busy){toast('Please wait for the Puffs to settle.');return}selected=null;boosterMode=null;showScreen('map')}
  function initEvents(){$$('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));$('#play-button').addEventListener('click',()=>showScreen('level'));$('#map-play').addEventListener('click',()=>showScreen('level'));$$('[data-level]').forEach(b=>b.addEventListener('click',()=>b.classList.contains('locked')?toast('This world will unlock in a future approved phase.'):showScreen('level')));$('#open-settings').addEventListener('click',()=>showScreen('settings'));$('#leave-game').addEventListener('click',leaveToMap);$('#pause-button').addEventListener('click',()=>showScreen('pause'));$('#resume-game').addEventListener('click',()=>showScreen('game'));$('#pause-map').addEventListener('click',leaveToMap);$$('[data-booster]').forEach(b=>b.addEventListener('click',()=>startBooster(b.dataset.booster)));$$('.buy-item').forEach(b=>b.addEventListener('click',()=>buyItem(b.dataset.item)));$('#claim-reward').addEventListener('click',()=>{if(state.dailyClaimed)return;state.dailyClaimed=true;state.coins+=100;saveState();renderRewards();toast('Daily gift collected: 100 coins!')});for(const [key,id] of Object.entries({music:'music-toggle',sfx:'sfx-toggle',vibration:'vibration-toggle',reducedMotion:'motion-toggle'}))$('#'+id).addEventListener('change',e=>{state.settings[key]=e.target.checked;saveState();document.body.classList.toggle('reduce-motion',state.settings.reducedMotion)});document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState()});window.addEventListener('beforeunload',saveState)}
  function init(){const saveStatus=$('#save-status');if(saveStatus&&!initialLoad.persistent)saveStatus.textContent='Local storage is unavailable in this browser. Progress may not persist after closing this page.';updateHeader();initHome();initEvents();renderMap();renderLevels();renderCharacters();renderRewards();syncSettings();document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);}
  init();
  // Small, low-cost idle animation beats make Puffs feel alive without a heavy animation dependency.
  setInterval(()=>{if(state.settings.reducedMotion||document.hidden)return;const visible=$$('.screen.active .puff-character');if(!visible.length)return;const puff=visible[Math.floor(Math.random()*visible.length)];puff.classList.add('blink');setTimeout(()=>puff.classList.remove('blink'),170);},2800);
})();
