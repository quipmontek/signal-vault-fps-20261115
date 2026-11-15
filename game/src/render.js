import * as T from 'three';
import {createWorld} from './world.js';
export function createView(s){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;document.getElementById('view').append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color(0x20353d);scene.fog=new T.Fog(0x20353d,22,64);
 const camera=new T.PerspectiveCamera(76,innerWidth/innerHeight,.045,100);scene.add(camera);const world=createWorld(scene);
 const unit=new T.BoxGeometry(1,1,1),actors=[];
 const teal=new T.MeshStandardMaterial({color:0x2caaa2,roughness:.6,metalness:.3}),amber=new T.MeshStandardMaterial({color:0xb87537,roughness:.65,metalness:.3}),cloth=new T.MeshStandardMaterial({color:0x16252e,roughness:.9}),visor=new T.MeshStandardMaterial({color:0xa9fff0,emissive:0x298d84,emissiveIntensity:.5,metalness:.6,roughness:.2});
 function part(parent,x,y,z,w,h,d,mat){const m=new T.Mesh(unit,mat);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;parent.add(m);return m;}
 for(const a of s.actors){const g=new T.Group();scene.add(g);const color=a.team===0?teal:amber;part(g,0,1.03,0,.59,.7,.34,color);part(g,0,1.15,-.2,.4,.4,.13,cloth);part(g,0,1.57,0,.38,.38,.36,cloth);part(g,0,1.6,-.19,.31,.11,.04,visor);part(g,0,1.8,0,.43,.09,.4,color);const legs=[];for(const side of [-1,1]){legs.push(part(g,side*.17,.38,0,.23,.75,.26,cloth));part(g,side*.39,1.05,-.15,.18,.55,.2,color);part(g,side*.39,.81,-.25,.16,.17,.24,cloth);}part(g,.16,1.05,-.48,.1,.12,.7,cloth);part(g,0,1.03,.24,.42,.5,.18,cloth);actors.push({g,legs});}
 const gun=new T.Group();camera.add(gun);const steel=new T.MeshStandardMaterial({color:0x5e7a7d,roughness:.35,metalness:.75}),dark=new T.MeshStandardMaterial({color:0x101e26,roughness:.65,metalness:.45}),stripe=new T.MeshStandardMaterial({color:0xc6b58c,roughness:.55,metalness:.4});
 part(gun,0,0,0,.14,.16,.5,steel);part(gun,0,.015,-.42,.065,.07,.4,dark);part(gun,0,.005,-.64,.095,.095,.09,steel);part(gun,0,-.14,.08,.1,.25,.13,dark);part(gun,0,-.17,-.12,.11,.27,.17,steel);part(gun,0,-.02,.32,.13,.14,.22,dark);part(gun,0,.12,-.05,.075,.09,.12,dark);part(gun,0,.17,-.05,.04,.02,.12,visor);for(let j=0;j<7;j++)part(gun,0,.105,-.28+j*.065,.15,.025,.025,dark);part(gun,.073,0,.03,.005,.06,.13,stripe);part(gun,-.09,-.18,-.27,.16,.16,.3,cloth);part(gun,.08,-.22,.2,.19,.18,.28,cloth);
 const flash=new T.Mesh(new T.OctahedronGeometry(.13,0),new T.MeshBasicMaterial({color:0xffe9a2}));flash.position.set(0,.015,-.76);gun.add(flash);
 const traces=[];for(let i=0;i<32;i++){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(6),3));const line=new T.Line(geo,new T.LineBasicMaterial({color:0xffdd9a,transparent:true,opacity:.8}));scene.add(line);traces.push(line);}
 const clouds=[];const cloudGeo=new T.IcosahedronGeometry(1,1),cloudMat=new T.MeshStandardMaterial({color:0x65b8b1,transparent:true,opacity:.23,depthWrite:false,roughness:1});for(let i=0;i<2;i++){const g=new T.Group();for(let j=0;j<9;j++){const m=new T.Mesh(cloudGeo,cloudMat);m.position.set(Math.cos(j*2.4)*1.6,.9+(j%3)*.6,Math.sin(j*2.4)*1.6);m.scale.setScalar(1.5);g.add(m);}scene.add(g);clouds.push(g);}
 let recoil=0;
 function draw(){
  const p=s.actors[0];let pov=p;if(!p.alive)pov=s.actors.find(a=>a.team===0&&a.alive)||p;
  camera.position.set(pov.x,pov.y+pov.eye,pov.z);camera.rotation.set(pov.pitch,pov.yaw,0,'YXZ');camera.fov=s.aim?57:76;camera.updateProjectionMatrix();
  world.core.rotation.y=s.tick*.004;world.core.rotation.z=Math.sin(s.tick*.003)*.12;
  for(let i=0;i<actors.length;i++){const a=s.actors[i],m=actors[i];m.g.visible=a.id!==pov.id;m.g.position.set(a.x,a.y,a.z);m.g.rotation.set(a.alive?0:-Math.PI/2,a.yaw,0);m.g.scale.y=a.crouch?.68:1;for(let j=0;j<2;j++)m.legs[j].rotation.x=a.alive?Math.sin(s.tick*.16+j*Math.PI)*Math.min(.55,Math.hypot(a.vx,a.vz)*.18):0;}
  gun.visible=p.alive;const bob=Math.sin(s.tick*.13)*Math.min(.014,Math.hypot(p.vx,p.vz)*.003);recoil=s.flash>0?.085:recoil*.7;gun.position.set(s.aim?.06:.3,-.26+bob-(p.reload>0?.17:0),-.47+recoil);gun.rotation.set(p.reload>0?-.5:recoil*.7,0,p.reload>0?-.4:0);gun.scale.setScalar(p.weapon===0?.8:p.weapon===2?1.08:1);flash.visible=s.flash>0;flash.rotation.z=s.tick*1.7;
  for(let i=0;i<traces.length;i++){const m=traces[i],t=s.traces[i];m.visible=!!t;if(t){const ar=m.geometry.attributes.position.array;ar[0]=t.x;ar[1]=t.y-.1;ar[2]=t.z;ar[3]=t.ex;ar[4]=t.ey;ar[5]=t.ez;m.geometry.attributes.position.needsUpdate=true;}}
  for(let i=0;i<clouds.length;i++){clouds[i].visible=!!s.emp[i];if(s.emp[i]){clouds[i].position.set(s.emp[i].x,0,s.emp[i].z);clouds[i].rotation.y=s.tick*.002;}}
  renderer.render(scene,camera);
 }
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 return {renderer,scene,camera,draw};
}
