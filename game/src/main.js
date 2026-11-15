import {createGame} from './sim.js';
import {STEP,clamp} from './data.js';
import {createView} from './render.js';
import {createUI} from './ui.js';
import {createAudio} from './audio.js';
const params=new URLSearchParams(location.search),game=createGame(Number(params.get('seed')||90210)),{s,p}=game,view=createView(s),ui=createUI(game),audio=createAudio();
const keys=new Set(),input={forward:0,strafe:0,crouch:false,walk:false,jump:false,fire:false,aim:false,reload:false,use:false};let active=false,started=false,last=performance.now(),acc=0;
document.getElementById('play').onclick=()=>{if(s.phase==='match')game.restart();started=true;audio.wake();ui.hideShop();view.renderer.domElement.requestPointerLock();};
document.addEventListener('pointerlockchange',()=>{active=document.pointerLockElement===view.renderer.domElement;ui.overlay(!active&&!ui.shop);if(!active){keys.clear();input.fire=false;input.aim=false;}});
addEventListener('keydown',e=>{if(['Space','Tab','ControlLeft'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyB'&&started){ui.toggleShop();input.fire=false;input.aim=false;if(ui.shop){document.exitPointerLock();ui.overlay(false);}else view.renderer.domElement.requestPointerLock();}if(e.code==='KeyG'&&active)game.grenade();if(e.code==='KeyQ'&&active&&!s.planted&&p.team===s.attack){s.site=1-s.site;game.event('SQUAD / ROTATE TO '+(s.site===0?'A':'B'));}if(e.code==='Tab')ui.roster(true);if(ui.shop&&e.code.startsWith('Digit')){game.buy(Number(e.code.slice(5))-1);ui.paintShop();}});
addEventListener('keydown',e=>{if(e.code==='Escape'){ui.hideShop();document.exitPointerLock();ui.overlay(true);}});
addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Tab')ui.roster(false);});addEventListener('blur',()=>{keys.clear();input.fire=false;});
addEventListener('mousemove',e=>{if(active&&!ui.shop){p.yaw-=e.movementX*(input.aim?.0011:.002);p.pitch=clamp(p.pitch-e.movementY*(input.aim?.0011:.002),-1.4,1.4);}});
addEventListener('mousedown',e=>{if(active){if(e.button===0)input.fire=true;if(e.button===2)input.aim=true;}});addEventListener('mouseup',e=>{if(e.button===0)input.fire=false;if(e.button===2)input.aim=false;});addEventListener('contextmenu',e=>e.preventDefault());
function sample(){input.forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);input.strafe=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);input.crouch=keys.has('ControlLeft')||keys.has('KeyC');input.walk=keys.has('ShiftLeft');input.jump=keys.has('Space');input.reload=keys.has('KeyR');input.use=keys.has('KeyE');}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;if(active&&!ui.shop){sample();acc+=dt;while(acc>=STEP){const shots=s.shotCount,hit=s.hit;game.step(input);if(s.shotCount>shots)audio.tone('shot');if(s.hit>hit)audio.tone('hit');acc-=STEP;}}view.draw();ui.draw();}
// Capture scenes use the same renderer and simulation, never an image or alternative HUD.
function capture(name){ui.overlay(false);s.phase='live';s.left=72;p.x=-10;p.z=8;p.yaw=0;p.pitch=-.035;for(let i=0;i<20;i++)game.step({});
 if(name==='relay'){p.x=-13;p.z=-5;p.yaw=-.35;p.pitch=-.06;s.planted=true;s.site=0;s.charge=23;s.emp.push({x:-2,z:-7,life:5});}
 if(name==='well'){p.x=1;p.z=6;p.yaw=.08;p.pitch=.18;}
 if(name==='combat'){p.x=14.8;p.z=3;p.yaw=.03;p.pitch=-.015;const e=s.actors[5];e.x=14.8;e.z=-4;e.hp=100;e.alive=true;e.yaw=Math.PI;game.fire(p);}
 if(name==='armory'){s.phase='buy';s.left=9;ui.toggleShop();}
 view.draw();ui.draw();requestAnimationFrame(()=>{view.draw();window.__shotReady=true;});}
window.__game=game;window.__view=view;
if(params.has('shot'))capture(params.get('shot'));else requestAnimationFrame(frame);
