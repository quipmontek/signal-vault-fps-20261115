import * as T from 'three';
import {SOLIDS,SITES} from './data.js';
export function createWorld(scene){
 const mat={wall:new T.MeshStandardMaterial({color:0x294047,roughness:.88}),floor:new T.MeshStandardMaterial({color:0x1b3038,roughness:.8,metalness:.2}),crate:new T.MeshStandardMaterial({color:0x65756c,roughness:.65,metalness:.35}),reactor:new T.MeshStandardMaterial({color:0x183b44,metalness:.6,roughness:.3}),dark:new T.MeshStandardMaterial({color:0x10212b,metalness:.5,roughness:.6}),teal:new T.MeshStandardMaterial({color:0x7bf4d5,emissive:0x38c7aa,emissiveIntensity:1.5}),amber:new T.MeshStandardMaterial({color:0xe5b15e,emissive:0xa66422,emissiveIntensity:1})};
 const cube=new T.BoxGeometry(1,1,1);
 function box(x,y,z,w,h,d,m='wall'){const o=new T.Mesh(cube,mat[m]);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 box(0,-.18,0,37,.36,37,'floor');
 for(const b of SOLIDS){box(...b);if(b[6]==='crate'){box(b[0],b[1]+b[4]/2+.025,b[2],b[3]+.08,.05,b[5]+.08,'dark');for(const side of [-1,1])box(b[0]+side*b[3]*.36,b[1],b[2]+b[5]/2+.012,.12,b[4],.04,'dark');box(b[0],b[1]+.2,b[2]+b[5]/2+.04,b[3]*.4,.08,.03,'amber');}}
 // Repeating structural ribs and inset light strips make a legible, original facility.
 for(let z=-16;z<=16;z+=8){for(const x of [-17.4,17.4]){box(x,3.5,z,.55,7,.6,'dark');box(x+(x<0?.3:-.3),3.5,z,.06,3,.18,'teal');}box(0,6.4,z,35,.3,.5,'dark');}
 for(const x of [-5.2,5.2]){box(x,4.7,1.8,1.15,.2,13.15,'dark');box(x,3.8,1.8,1.03,.06,12.8,'teal');}
 for(let x=-16;x<=16;x+=2)box(x,.006,0,.018,.012,35,'dark');
 for(let z=-16;z<=16;z+=2)box(0,.009,z,35,.012,.018,'dark');
 for(const x of [-10,10]){box(x,.015,8,.11,.02,9,'teal');box(x,.015,-10,6,.02,6,'dark');}
 const core=new T.Group();core.position.set(0,3.6,-1);scene.add(core);
 const torus=new T.TorusGeometry(1.45,.065,8,64);
 for(let i=0;i<3;i++){const ring=new T.Mesh(torus,i===1?mat.teal:mat.amber);ring.rotation.x=Math.PI/2+i*.55;ring.rotation.y=i*.7;core.add(ring);}
 const crystal=new T.Mesh(new T.OctahedronGeometry(.65),mat.teal);core.add(crystal);
 for(const x of [-1.6,1.6])for(const z of [-2.6,.6])box(x,2.3,z,.18,4.6,.18,'dark');
 function label(text,x,y,z,size=2.5,color='#94ecdc',rotate=0){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#10232a';ctx.fillRect(0,0,512,128);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(5,5,502,118);ctx.fillStyle=color;ctx.font='bold 55px monospace';ctx.textAlign='center';ctx.fillText(text,256,84);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(size,size/4),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);m.rotation.y=rotate;scene.add(m);}
 const relays=[];
 for(let i=0;i<2;i++){const site=SITES[i];const g=new T.Group();scene.add(g);g.position.set(site.x,0,site.z);const pedestal=new T.Mesh(new T.CylinderGeometry(.65,.85,.7,12),mat.dark);pedestal.position.y=.35;g.add(pedestal);const device=new T.Mesh(new T.BoxGeometry(.7,.6,.6),mat.reactor);device.position.y=1;g.add(device);const ring=new T.Mesh(new T.TorusGeometry(2.7,.045,6,64),i===0?mat.teal:mat.amber);ring.rotation.x=-Math.PI/2;ring.position.y=.04;g.add(ring);const screen=new T.Mesh(new T.BoxGeometry(.55,.25,.025),mat.teal);screen.position.set(0,1.1,.32);g.add(screen);relays.push(g);label(i===0?'A / TURBINE':'B / ARCHIVE',site.x,3.6,-17.42,6,i===0?'#8cead8':'#f2bd76');for(let j=0;j<3;j++)box(site.x-2+j*2,5.5,-17.4,.08,2.5,.08,i===0?'teal':'amber');}
 label('SIGNAL / 09',0,4.1,-17.4,6);label('WAVE →',-10,3.6,17.4,4,'#8cead8',Math.PI);label('ARCHIVE',17.4,3,0,4,'#f2bd76',-Math.PI/2);
 for(const x of [-17.35,17.35])for(const z of [-11,-5]){const disc=new T.Mesh(new T.CylinderGeometry(1.6,1.6,.18,32),mat.dark);disc.rotation.z=Math.PI/2;disc.position.set(x,3,z);scene.add(disc);for(let j=0;j<8;j++){const blade=box(x,3+Math.cos(j*Math.PI/4)*.95,z+Math.sin(j*Math.PI/4)*.95,.18,.55,.18,'crate');blade.rotation.x=-j*Math.PI/4;}}
  scene.add(new T.HemisphereLight(0xbde7ed,0x263f4b,2.8));
 const sun=new T.DirectionalLight(0xffdca2,3);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,far:70});sun.shadow.bias=-.0003;scene.add(sun);
 const cyan=new T.PointLight(0x57e8ce,65,16,2);cyan.position.set(0,5,-1);scene.add(cyan);
 for(const site of SITES){const l=new T.PointLight(0xefbc6e,40,13,2);l.position.set(site.x,5,site.z);scene.add(l);}
 return {core,relays,mat,box};
}
