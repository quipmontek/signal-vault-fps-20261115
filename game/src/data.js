// World coordinates and weapon balance are shared by the simulation and view.
export const STEP=1/60;
export const SITES=[{x:-10,z:-10,name:'A · TURBINE'},{x:10,z:-10,name:'B · ARCHIVE'}];
export const WEAPONS=[
 {name:'NEEDLE / sidearm',cost:0,mag:12,reserve:48,gap:.24,reload:1.35,damage:26,spread:.003,kick:.014},
 {name:'VECTOR / carbine',cost:1400,mag:24,reserve:72,gap:.115,reload:1.85,damage:30,spread:.0025,kick:.016},
 {name:'LANCET / marksman',cost:2100,mag:8,reserve:32,gap:.65,reload:2.2,damage:68,spread:.001,kick:.045}
];
// Axis aligned solids. Wide lanes are connected above and below the center well.
export const SOLIDS=[
 [-18,3,0,1,6,37,'wall'],[18,3,0,1,6,37,'wall'],[0,3,18,37,6,1,'wall'],[0,3,-18,37,6,1,'wall'],
 [-5.2,2.3,1.8,1,4.6,13,'wall'],[5.2,2.3,1.8,1,4.6,13,'wall'],
 [-11,1.1,3,3.2,2.2,2,'crate'],[11,1.1,3,3.2,2.2,2,'crate'],
 [-10,0.65,-6,3,1.3,1.6,'crate'],[10,.65,-6,3,1.3,1.6,'crate'],
 [-14,1.3,-12,2,2.6,3,'crate'],[14,1.3,-12,2,2.6,3,'crate'],
 [-2,0.65,10,3,1.3,1.5,'crate'],[3,0.65,-9,3,1.3,1.5,'crate'],
 [0,1.1,-1,3.7,2.2,3.7,'reactor'],[-7.5,.65,12,2,1.3,2,'crate'],[8,.65,12,2,1.3,2,'crate']
];
export const ROUTES=[[[0,14],[-10,14],[-15,7],[-15,-3],[-10,-10]],[[0,14],[0,7],[-2,3],[-3,-5],[-10,-10]],[[0,14],[10,14],[15,7],[15,-3],[10,-10]]];
export function seeded(seed){let a=seed|0;return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
