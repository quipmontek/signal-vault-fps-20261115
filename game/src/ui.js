import {WEAPONS,SITES,SOLIDS} from './data.js';
export function createUI(game){const {s,p}=game;const ids={};for(const id of ['match','health','credits','ammo','objective','message','action','hit','hurt','feed','shop','roster','cross','overlay'])ids[id]=document.getElementById(id);const ctx=document.getElementById('map').getContext('2d');let shop=false;
 function toggleShop(){shop=!shop;ids.shop.hidden=!shop;paintShop();}
 function paintShop(){ids.shop.innerHTML=`<h2>FIELD ARMORY</h2><p>${s.phase==='buy'?'BUY PHASE':'ARMORY LOCKED DURING ROUND'} / CREDITS ${s.credits}</p>`;for(let i=0;i<5;i++){const b=document.createElement('button');b.textContent=i<3?`${i+1}  ${WEAPONS[i].name} — ${WEAPONS[i].cost} CR`:i===3?'4  CERAMIC ARMOR — 500 CR':'5  EMP CANISTER — 300 CR';b.onclick=()=>{game.buy(i);paintShop();};ids.shop.append(b);}const text=document.createElement('p');text.textContent='B TO CLOSE · purchases only between rounds · rifle retained on respawn';ids.shop.append(text);}
 function draw(){
  ids.match.innerHTML=`<b>${s.score[0]}</b> ${s.planted?'◉':String(Math.max(0,Math.ceil(s.left))).padStart(2,'0')} <b>${s.score[1]}</b><small>WAVE / ROUND ${s.round} / STATIC</small>`;
  ids.health.innerHTML=`<b>${Math.ceil(p.hp)}</b> HP <small>ARMOR ${Math.ceil(s.armor)} · ${p.crouch?'CROUCHED':'WAVE / 01'}</small>`;ids.credits.innerHTML=`<b>${s.credits}</b><small>CREDITS · ${s.grenades} EMP</small>`;
  ids.ammo.innerHTML=`<b>${p.mag}</b> / ${p.reserve}<small>${p.reload>0?'RELOADING '+p.reload.toFixed(1)+'s':WEAPONS[p.weapon].name}</small>`;
  ids.objective.textContent=s.phase==='buy'?'PREPARE / B TO BUY · '+(s.attack===0?'UPLOAD AT A OR B':'DEFEND BOTH RELAYS'):s.planted?`UPLINK ${SITES[s.site].name} / ${Math.ceil(s.charge)}s`:s.attack===0?'ATTACK / REACH A RELAY · HOLD E TO UPLOAD':'DEFEND / DENY THE UPLINK';
  ids.message.textContent=s.phase==='end'||s.phase==='match'?s.result:!p.alive?'SIGNAL LOST / SPECTATING':'';
  ids.action.textContent=s.progress>0?`${s.planted?'PURGING':'UPLOADING'} ${'▰'.repeat(Math.floor(s.progress*5))}`:s.phase==='live'&&SITES.some(site=>Math.hypot(site.x-p.x,site.z-p.z)<2.8)?'[ E ] HOLD TO '+(s.planted?'PURGE SIGNAL':'UPLOAD CHARGE'):'';
  ids.hit.style.opacity=s.hit>0?1:0;ids.hurt.style.opacity=s.hurt;ids.cross.style.opacity=p.alive?'.8':'0';ids.feed.textContent=s.events.filter(e=>s.tick-e.tick<500).map(e=>e.text).join('\n');
  ctx.fillStyle='#0a1920';ctx.fillRect(0,0,180,180);ctx.strokeStyle='#29434b';ctx.strokeRect(8,8,164,164);ctx.fillStyle='#304850';for(const b of SOLIDS)ctx.fillRect(90+(b[0]-b[3]/2)*4.5,90+(b[2]-b[5]/2)*4.5,b[3]*4.5,b[5]*4.5);
  ctx.font='bold 12px monospace';for(let i=0;i<2;i++){ctx.fillStyle=i===0?'#80edce':'#edb466';ctx.fillText(i===0?'A':'B',86+SITES[i].x*4.5,94+SITES[i].z*4.5);}
  for(const a of s.actors){if(!a.alive||a.team!==0&&!game.sight(p,a))continue;ctx.fillStyle=a.team===0?'#71e6cf':'#f7b05f';ctx.beginPath();ctx.arc(90+a.x*4.5,90+a.z*4.5,a.id===0?3.5:2.5,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#a9fff1';ctx.beginPath();ctx.moveTo(90+p.x*4.5,90+p.z*4.5);ctx.lineTo(90+p.x*4.5-Math.sin(p.yaw)*10,90+p.z*4.5-Math.cos(p.yaw)*10);ctx.stroke();
  ids.roster.textContent=`SQUAD TELEMETRY / FIRST TO FIVE\n\n${s.actors.map(a=>`${a.team===0?'WAVE  ':'STATIC'}  ${a.name.padEnd(5)}  ${a.alive?Math.ceil(a.hp)+' HP':'OFFLINE'}`).join('\n')}\n\nPERSONAL  ${s.kills} ELIMINATIONS / ${s.deaths} LOSSES`;
 }
  return {draw,toggleShop,paintShop,hideShop(){shop=false;ids.shop.hidden=true;},roster(on){ids.roster.hidden=!on;},overlay(on){ids.overlay.hidden=!on;},get shop(){return shop;}};
}
