import {STEP,SITES,SOLIDS,WEAPONS,ROUTES,seeded,clamp} from './data.js';
// Pure, fixed-step state. No renderer, Date, timers or Math.random in gameplay.
export function createGame(seed=90210){
 const rng=seeded(seed);
 const s={tick:0,round:0,phase:'buy',left:0,score:[0,0],attack:0,site:0,planted:false,charge:0,progress:0,credits:2600,kills:0,deaths:0,events:[],noise:[],emp:[],traces:[],flash:0,hit:0,hurt:0,result:'',actors:[],selected:1,armor:50,grenades:1,aim:false,shotCount:0};
 const names=['YOU','MICA','VEIL','HUSH','KNOT','ECHO'];
 for(let i=0;i<6;i++)s.actors.push({id:i,name:names[i],team:i<3?0:1,x:0,z:0,y:0,vy:0,yaw:0,pitch:0,vx:0,vz:0,eye:1.65,hp:100,alive:true,crouch:false,weapon:1,mag:24,reserve:72,reload:0,cool:0,recoil:0,route:i%3,node:0,seen:-1,memory:0,tx:0,tz:0,hold:0,flashed:0,action:0});
 const p=s.actors[0];
 function event(text){s.events.unshift({text,tick:s.tick});if(s.events.length>5)s.events.pop();}
 function free(x,z,r=.32){for(const b of SOLIDS)if(x+r>b[0]-b[3]/2&&x-r<b[0]+b[3]/2&&z+r>b[2]-b[5]/2&&z-r<b[2]+b[5]/2)return false;return true;}
 function move(a,dx,dz){if(free(a.x+dx,a.z))a.x+=dx;if(free(a.x,a.z+dz))a.z+=dz;}
 // One-metre clearance grid and reusable BFS scratch. Paths are rebuilt only on goal changes.
 const N=35,CELLS=N*N,walk=new Uint8Array(CELLS),queue=new Int16Array(CELLS),parent=new Int16Array(CELLS);
 for(let z=0;z<N;z++)for(let x=0;x<N;x++)walk[z*N+x]=free(x-17,z-17,.52)?1:0;
 function cell(x,z){return clamp(Math.round(z)+17,0,N-1)*N+clamp(Math.round(x)+17,0,N-1);}
 function routeTo(a,tx,tz){
  const goal=cell(tx,tz),start=cell(a.x,a.z);if(a.navGoal===goal&&a.path&&a.pathAt<a.path.length)return;
  parent.fill(-1);let head=0,tail=0;queue[tail++]=start;parent[start]=start;let found=start;
  while(head<tail){const c=queue[head++];if(c===goal){found=c;break;}const x=c%N,z=Math.floor(c/N);for(let k=0;k<4;k++){const nx=x+(k===0?1:k===1?-1:0),nz=z+(k===2?1:k===3?-1:0);if(nx<0||nz<0||nx>=N||nz>=N)continue;const next=nz*N+nx;if(!walk[next]||parent[next]>=0)continue;parent[next]=c;queue[tail++]=next;}}
  a.path??=[];a.path.length=0;let c=found;while(c!==start){a.path.push(c);c=parent[c];}a.path.reverse();a.pathAt=0;a.navGoal=goal;
 }
 // Slab intersection returns distance; used for map occlusion as well as damage.
 function boxRay(ox,oy,oz,dx,dy,dz,cx,cy,cz,hx,hy,hz){let lo=0,hi=90;for(let axis=0;axis<3;axis++){const o=axis===0?ox:axis===1?oy:oz,d=axis===0?dx:axis===1?dy:dz,c=axis===0?cx:axis===1?cy:cz,h=axis===0?hx:axis===1?hy:hz;if(Math.abs(d)<1e-8){if(o<c-h||o>c+h)return Infinity;}else{let a=(c-h-o)/d,b=(c+h-o)/d;if(a>b){const t=a;a=b;b=t;}lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return Infinity;}}return lo;}
 function wallDistance(x,y,z,dx,dy,dz){let near=90;for(const b of SOLIDS)near=Math.min(near,boxRay(x,y,z,dx,dy,dz,b[0],b[1],b[2],b[3]/2,b[4]/2,b[5]/2));return near;}
 function sight(a,b){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>29||wallDistance(a.x,1.4,a.z,dx/d,0,dz/d)<d)return false;for(const e of s.emp)if(e.life>0){const t=clamp(((e.x-a.x)*dx+(e.z-a.z)*dz)/(d*d),0,1);if(Math.hypot(a.x+t*dx-e.x,a.z+t*dz-e.z)<3.3)return false;}return true;}
 function refill(a){const w=WEAPONS[a.weapon];a.mag=w.mag;a.reserve=w.reserve;a.reload=0;a.cool=0;}
 function newRound(){
  s.round++;s.attack=Math.floor((s.round-1)/4)%2;s.phase='buy';s.left=10;s.planted=false;s.progress=0;s.charge=0;s.site=(s.round-1)%2;s.emp.length=0;s.noise.length=0;s.traces.length=0;s.result='';
  for(const a of s.actors){a.alive=true;a.hp=100;a.y=0;a.vy=0;a.vx=0;a.vz=0;a.eye=1.65;a.crouch=false;a.recoil=0;a.memory=0;a.seen=-1;a.node=0;a.hold=0;a.action=0;a.flashed=0;a.navGoal=-1;a.pathAt=0;if(a.path)a.path.length=0;const attacking=a.team===s.attack;a.x=(a.id%3-1)*3;a.z=attacking?15:-15;a.yaw=attacking?0:Math.PI;a.pitch=0;a.route=a.id%3;refill(a);}
  p.weapon=s.selected;refill(p);s.armor=50;s.grenades=Math.max(1,s.grenades);event(`ROUND ${s.round} · ${s.attack===0?'WAVE':'STATIC'} ON UPLINK`);
 }
 function end(team,reason){if(s.phase==='end'||s.phase==='match')return;s.score[team]++;s.credits+=team===0?2200:1600;s.credits=Math.min(s.credits,9000);s.phase='end';s.left=5;s.result=`${team===0?'WAVE':'STATIC'} WINS / ${reason}`;event(s.result);if(s.score[team]>=5){s.phase='match';s.left=0;s.result=`${team===0?'VICTORY':'DEFEAT'} / ${s.score[0]} : ${s.score[1]}`;}}
 function damage(a,amount,by,head=false){if(!a.alive)return;if(a.id===0){const absorbed=Math.min(s.armor,amount*.4);s.armor-=absorbed;amount-=absorbed;s.hurt=.75;}a.hp-=amount;if(a.hp<=0){a.hp=0;a.alive=false;a.action=0;event(`${by.name}  ${head?'◇ HEADSHOT':'→'}  ${a.name}`);if(by.id===0){s.kills++;s.credits+=300;}if(a.id===0)s.deaths++;}}
 function fire(a){
  if(!a.alive||a.cool>0||a.reload>0||a.mag<=0||s.phase!=='live')return false;
  const w=WEAPONS[a.weapon];a.mag--;a.cool=w.gap;a.recoil=Math.min(.065,a.recoil+.008);s.shotCount++;
  let spread=w.spread+Math.hypot(a.vx,a.vz)*.006+a.recoil*.35;if(a.crouch)spread*=.55;if(a.id===0&&s.aim)spread*=.55;
  if(a.id>0)spread+=.035+Math.hypot(a.tx-a.x,a.tz-a.z)*.0005;
  const yaw=a.yaw+(rng()-.5)*spread*2,pitch=a.pitch+(rng()-.5)*spread*2,cp=Math.cos(pitch),dx=-Math.sin(yaw)*cp,dy=Math.sin(pitch),dz=-Math.cos(yaw)*cp,oy=a.y+a.eye;
  let near=wallDistance(a.x,oy,a.z,dx,dy,dz),victim=null,head=false;
   for(const b of s.actors){if(!b.alive||b.team===a.team)continue;const ey=b.y+b.eye;let h=boxRay(a.x,oy,a.z,dx,dy,dz,b.x,ey-.02,b.z,.19,.21,.19);if(h<near){near=h;victim=b;head=true;}h=boxRay(a.x,oy,a.z,dx,dy,dz,b.x,b.y+b.eye*.48,b.z,.32,b.eye*.37,.26);if(h<near){near=h;victim=b;head=false;}}
  if(victim){damage(victim,w.damage*(head?3.5:1),a,head);if(a.id===0)s.hit=.14;}
  s.traces.push({x:a.x,y:oy,z:a.z,ex:a.x+dx*near,ey:oy+dy*near,ez:a.z+dz*near,life:.09,team:a.team});
  s.noise.push({x:a.x,z:a.z,team:a.team,life:2});if(a.id===0){s.flash=.055;a.pitch=clamp(a.pitch+w.kick,-1.45,1.45);a.yaw+=(rng()-.5)*w.kick*.55;}return true;
 }
 function reload(a){if(a.reload<=0&&a.mag<WEAPONS[a.weapon].mag&&a.reserve>0)a.reload=WEAPONS[a.weapon].reload;}
 function buy(id){if(s.phase!=='buy'||!p.alive)return false;if(id>=0&&id<3){if(s.credits<WEAPONS[id].cost)return false;s.credits-=WEAPONS[id].cost;p.weapon=id;s.selected=id;refill(p);return true;}if(id===3&&s.credits>=500){s.credits-=500;s.armor=100;return true;}if(id===4&&s.credits>=300&&s.grenades<2){s.credits-=300;s.grenades++;return true;}return false;}
 function grenade(){if(s.phase!=='live'||!p.alive||s.grenades<=0)return false;s.grenades--;let d=9;const dx=-Math.sin(p.yaw),dz=-Math.cos(p.yaw);d=Math.min(d,wallDistance(p.x,1,p.z,dx,0,dz)-.6);s.emp.push({x:p.x+dx*d,z:p.z+dz*d,life:7});event('EMP / SIGNAL OBSCURED');return true;}
 function bot(a){
  let target=null,dist=Infinity;for(const b of s.actors)if(b.team!==a.team&&b.alive&&sight(a,b)){const d=Math.hypot(b.x-a.x,b.z-a.z);if(d<dist){target=b;dist=d;}}
  if(target){if(a.seen!==target.id){a.hold=.55+rng()*.4;a.seen=target.id;}a.memory=2.5;a.tx=target.x;a.tz=target.z;a.yaw=Math.atan2(a.x-target.x,a.z-target.z);a.pitch=Math.atan2(target.y+target.eye*.68-a.eye,dist);a.vx=0;a.vz=0;a.hold-=STEP;a.action=0;if(a.hold<=0&&a.flashed<=0)fire(a);if(dist<6)move(a,Math.sin(a.yaw)*STEP,Math.cos(a.yaw)*STEP);return;}
  a.seen=-1;a.memory=Math.max(0,a.memory-STEP);
  for(const n of s.noise)if(n.team!==a.team&&Math.hypot(n.x-a.x,n.z-a.z)<16){a.tx=n.x;a.tz=n.z;a.memory=Math.max(a.memory,.6);}
  const attacking=a.team===s.attack,site=SITES[s.site];let tx,tz;
  if(s.planted){tx=site.x+(attacking?(a.id%3-1)*2:0);tz=site.z+(attacking?4:0);}
  else if(a.memory>0){tx=a.tx;tz=a.tz;}
  else if(attacking){const route=ROUTES[a.route];const node=route[Math.min(a.node,route.length-1)];tx=node[0];tz=node[1];if(Math.hypot(tx-a.x,tz-a.z)<.6&&a.node<route.length-1)a.node++;if(a.node===route.length-1){tx=site.x;tz=site.z;}}
  else {tx=a.id%3===0?-10:a.id%3===1?0:10;tz=a.id%3===1?-7:-11;if(s.left<42){tx=site.x;tz=site.z+3;}}
  if(Math.hypot(tx-a.x,tz-a.z)>.7){routeTo(a,tx,tz);if(a.pathAt<a.path.length){const c=a.path[a.pathAt];tx=c%N-17;tz=Math.floor(c/N)-17;if(Math.hypot(tx-a.x,tz-a.z)<.16)a.pathAt++;}}
  const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d>.12){a.yaw=Math.atan2(-dx,-dz);a.pitch=0;const speed=a.flashed>0?.8:2.5;a.vx=dx/d*speed;a.vz=dz/d*speed;move(a,a.vx*STEP,a.vz*STEP);}else {a.vx=0;a.vz=0;}
  const atSite=Math.hypot(a.x-site.x,a.z-site.z)<2.6;
  if(attacking&&!s.planted&&atSite){a.action+=STEP;if(a.action>=3){s.planted=true;s.charge=28;a.action=0;event('UPLINK ARMED / 28 SECONDS');}}
  else if(!attacking&&s.planted&&atSite){a.action+=STEP;if(a.action>=5)end(a.team,'SIGNAL PURGED');}
  else a.action=0;
 }
 function step(input={}){
  s.tick++;s.flash=Math.max(0,s.flash-STEP);s.hit=Math.max(0,s.hit-STEP);s.hurt=Math.max(0,s.hurt-STEP*2);
  for(const list of [s.emp,s.noise,s.traces])for(let i=list.length-1;i>=0;i--){list[i].life-=STEP;if(list[i].life<=0)list.splice(i,1);}
  if(s.phase==='match')return;s.left-=STEP;if(s.phase==='end'){if(s.left<=0)newRound();return;}if(s.phase==='buy'){if(s.left<=0){s.phase='live';s.left=85;}return;}
  for(const a of s.actors){a.cool=Math.max(0,a.cool-STEP);a.recoil=Math.max(0,a.recoil-STEP*.05);a.flashed=0;for(const e of s.emp)if(Math.hypot(a.x-e.x,a.z-e.z)<3.5)a.flashed=.2;if(a.reload>0){a.reload=Math.max(0,a.reload-STEP);if(a.reload===0){const n=Math.min(WEAPONS[a.weapon].mag-a.mag,a.reserve);a.mag+=n;a.reserve-=n;}}if(!a.alive)continue;if(a.id>0){if(a.mag===0)reload(a);bot(a);}}
  if(p.alive){
   p.crouch=!!input.crouch;p.eye+=((p.crouch?1.08:1.65)-p.eye)*.22;s.aim=!!input.aim;
   const f=input.forward||0,r=input.strafe||0,len=Math.hypot(f,r)||1,speed=p.flashed>0?1.5:p.crouch?2.1:input.walk||s.aim?2.8:4.7,si=Math.sin(p.yaw),co=Math.cos(p.yaw),vx=(-si*f+co*r)/len*speed,vz=(-co*f-si*r)/len*speed;
   p.vx+=(vx-p.vx)*.19;p.vz+=(vz-p.vz)*.19;move(p,p.vx*STEP,p.vz*STEP);
   if(input.jump&&p.y===0&&!p.crouch)p.vy=5;p.vy-=18*STEP;p.y=Math.max(0,p.y+p.vy*STEP);if(p.y===0)p.vy=0;
   if(input.fire)fire(p);if(input.reload)reload(p);
   const nearest=Math.hypot(p.x-SITES[0].x,p.z-SITES[0].z)<Math.hypot(p.x-SITES[1].x,p.z-SITES[1].z)?0:1;
   const site=SITES[s.planted?s.site:nearest],can=Math.hypot(p.x-site.x,p.z-site.z)<2.8&&Math.hypot(p.vx,p.vz)<.3;
   if(input.use&&can&&((p.team===s.attack&&!s.planted)||(p.team!==s.attack&&s.planted))){s.progress+=STEP;if(s.progress>=(s.planted?5:3)){if(s.planted)end(p.team,'SIGNAL PURGED');else {s.site=nearest;s.planted=true;s.charge=28;s.progress=0;s.credits+=300;event('UPLINK ARMED / DEFEND THE RELAY');}}}else s.progress=0;
  }
  if(s.planted){s.charge-=STEP;if(s.charge<=0)end(s.attack,'UPLOAD COMPLETE');}
  const alive0=s.actors.some(a=>a.alive&&a.team===0),alive1=s.actors.some(a=>a.alive&&a.team===1);
  if(!s.planted&&(!alive0||!alive1))end(alive0?0:1,'SQUAD ELIMINATED');
  if(s.planted&&!s.actors.some(a=>a.alive&&a.team!==s.attack))end(s.attack,'RELAY SECURED');
  if(s.left<=0&&!s.planted)end(1-s.attack,'TIME EXPIRED');
 }
  newRound();return {s,p,step,fire,reload,buy,grenade,free,sight,wallDistance,boxRay,newRound,event,restart(){s.round=0;s.score[0]=0;s.score[1]=0;s.credits=2600;s.kills=0;s.deaths=0;s.selected=1;s.grenades=1;s.events.length=0;newRound();}};
}
