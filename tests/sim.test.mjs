import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../game/src/sim.js';
import {STEP,SITES,WEAPONS} from '../game/src/data.js';

const ticks=(g,n,input={})=>{for(let i=0;i<n;i++)g.step(input);};
function isolated(seed=7){const g=createGame(seed);g.s.phase='live';g.s.left=85;for(const a of g.s.actors)a.alive=false;g.p.alive=true;g.p.x=-15;g.p.z=4;const enemy=g.s.actors[3];enemy.alive=true;enemy.x=100;enemy.z=100;return g;}
function target(pitch){const g=isolated();const e=g.s.actors[3];e.x=-15;e.z=-3;g.p.yaw=0;g.p.pitch=pitch;return g;}

test('buy phase, affordability, armor, EMP cap and live-phase lock',()=>{
 const g=createGame();assert.equal(g.s.phase,'buy');assert(g.buy(2));assert.equal(g.s.credits,500);assert(!g.buy(1));assert(g.buy(3));assert.equal(g.s.armor,100);assert(g.buy(0));ticks(g,601);assert.equal(g.s.phase,'live');assert(!g.buy(0));
 const h=createGame();assert(h.buy(4));assert.equal(h.s.grenades,2);assert(!h.buy(4));
});
test('body hit, headshot multiplier, hit feedback and kill reward',()=>{
 const body=target(-.12);assert(body.fire(body.p));assert.equal(body.s.actors[3].hp,70);assert(body.s.hit>0);
 const head=target(0);const credits=head.s.credits;assert(head.fire(head.p));assert(!head.s.actors[3].alive);assert.equal(head.s.kills,1);assert.equal(head.s.credits,credits+300);
});
test('map occlusion blocks both sight and bullet damage',()=>{
 const g=target(0);g.p.x=0;g.p.z=5;const e=g.s.actors[3];e.x=0;e.z=-5;
 assert(!g.sight(g.p,e));g.fire(g.p);assert.equal(e.hp,100);assert(g.s.traces[0].ez>-5);
});
test('cooldown, finite ammunition, reload duration and reserve transfer',()=>{
 const g=isolated();assert(g.fire(g.p));assert(!g.fire(g.p));g.p.mag=0;assert(!g.fire(g.p));g.reload(g.p);assert(g.p.reload>0);ticks(g,Math.ceil(WEAPONS[1].reload/STEP)+1);assert.equal(g.p.mag,24);assert.equal(g.p.reserve,48);
 g.p.mag=0;g.p.reserve=0;g.reload(g.p);assert.equal(g.p.reload,0);assert(!g.fire(g.p));
});
test('accelerated movement, diagonal normalization, crouch, jump and wall collision',()=>{
 const g=isolated();g.step({forward:1});assert(g.p.vz<0&&g.p.vz>-4.7);ticks(g,35,{crouch:true});assert(g.p.eye<1.1);
 g.step({jump:true});assert(g.p.y>0);ticks(g,90);assert.equal(g.p.y,0);
 g.p.x=-16;g.p.z=10;ticks(g,100,{strafe:-1});assert(g.p.x>=-17.18);assert(g.free(g.p.x,g.p.z));
 const h=isolated();ticks(h,40,{forward:1,strafe:1});assert(Math.hypot(h.p.vx,h.p.vz)<=4.701);
});
test('EMP obscures sight, slows occupants, expires and consumes inventory',()=>{
 const g=target(0);assert(g.sight(g.p,g.s.actors[3]));assert(g.grenade());assert.equal(g.s.grenades,0);assert(!g.grenade());assert(!g.sight(g.p,g.s.actors[3]));
 g.s.emp[0].x=g.p.x;g.s.emp[0].z=g.p.z;g.step({forward:1});assert(g.p.flashed>0);ticks(g,425);assert.equal(g.s.emp.length,0);
});
test('player upload completes, then survives attacker elimination until timer',()=>{
 const g=isolated();Object.assign(g.p,SITES[0]);ticks(g,181,{use:true});assert(g.s.planted);assert(g.s.charge>27);g.p.alive=false;ticks(g,1700);assert.equal(g.s.score[0],1);assert.match(g.s.result,/UPLOAD COMPLETE/);
});
test('purge requires uninterrupted use and awards defenders',()=>{
 const g=isolated();g.s.attack=1;g.s.planted=true;g.s.site=0;g.s.charge=28;Object.assign(g.p,SITES[0]);ticks(g,100,{use:true});assert(g.s.progress>1);g.step({});assert.equal(g.s.progress,0);ticks(g,301,{use:true});assert.equal(g.s.score[0],1);assert.match(g.s.result,/PURGED/);
});
test('bots navigate routes, upload and purge without a player',()=>{
 const g=createGame(88);g.s.phase='live';g.s.left=85;for(const a of g.s.actors)a.alive=false;
 const a=g.s.actors[1];a.alive=true;a.hp=1000;const defender=g.s.actors[3];defender.alive=true;defender.x=100;defender.z=100;defender.mag=0;defender.reserve=0;
 let armed=false;for(let i=0;i<5000&&g.s.phase==='live';i++){g.step();if(g.s.planted){armed=true;break;}}assert(armed,'attacker reaches relay and arms');
 const h=isolated();h.s.planted=true;h.s.charge=28;h.s.site=0;h.p.alive=false;const d=h.s.actors[3];Object.assign(d,SITES[0]);d.action=0;ticks(h,301);assert.equal(h.s.score[1],1);assert.match(h.s.result,/PURGED/);
});
test('timeout, round restart, fourth-round side swap and match restart',()=>{
 const g=isolated();g.s.left=STEP/2;g.step();assert.equal(g.s.score[1],1);assert.equal(g.s.phase,'end');ticks(g,301);assert.equal(g.s.round,2);assert.equal(g.s.phase,'buy');
 g.newRound();g.newRound();assert.equal(g.s.round,4);assert.equal(g.s.attack,0);g.newRound();assert.equal(g.s.attack,1);assert.equal(g.p.z,-15);
 g.s.score[0]=4;g.s.phase='live';for(const a of g.s.actors)if(a.team===1)a.alive=false;g.step();assert.equal(g.s.phase,'match');g.s.kills=10;g.restart();assert.equal(g.s.round,1);assert.deepEqual(g.s.score,[0,0]);assert.equal(g.s.kills,0);assert.equal(g.p.weapon,1);
});
test('same seed and input replay produces byte-identical state across a full match',()=>{
 const a=createGame(121),b=createGame(121);for(let i=0;i<30000;i++){const input={crouch:i%300<100,fire:i%120<10};a.step(input);b.step(input);}assert.equal(JSON.stringify(a.s),JSON.stringify(b.s));assert(a.s.round>=5);assert(a.s.shotCount>100);
});
