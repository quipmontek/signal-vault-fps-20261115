import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildDossier} from '../vendor/makefun-threejs.ts';

const hash=b=>createHash('sha256').update(b).digest('hex');
// Child programs are ordinary Node processes, not children of node:test's IPC protocol.
const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
function inventory(root,dir=root,items=[]){for(const name of readdirSync(dir).sort()){const path=join(dir,name),st=lstatSync(path);assert(!st.isSymbolicLink());if(st.isDirectory()){items.push({path:relative(root,path)+'/',bytes:0});inventory(root,path,items);}else{assert(st.isFile());items.push({path:relative(root,path),bytes:st.size,sha256:hash(readFileSync(path))});}}return items;}
const caps={text_max_bytes:163840,screenshots:{max:4,max_bytes:262144},game_max_files:993,game_max_bytes:50331648};

test('two complete producer runs are byte-identical and helper rebuild matches',()=>{
 for(const out of ['out-a','out-b']){console.log('Producing',out);const run=spawnSync(process.execPath,['main.ts'],{env:{...childEnv,MAKEFUN_OUTPUT_DIR:resolve(out)},encoding:'utf8',timeout:15000});assert.equal(run.status,0,run.stderr);}
 console.log('Comparing complete manifests');const a=inventory('out-a'),b=inventory('out-b');assert.deepEqual(a,b);assert(a.length<=1000);assert(a.reduce((n,f)=>n+f.bytes,0)<=67108864);
 const dossier=readFileSync('out-a/dossier.json');assert(dossier.equals(Buffer.from(buildDossier('out-a',caps))));assert(dossier.length<=1572864);assert.doesNotThrow(()=>JSON.parse(dossier));
 console.log(JSON.stringify({entries:a.length,bytes:a.reduce((n,f)=>n+f.bytes,0),dossier_bytes:dossier.length,dossier_sha256:hash(dossier)}));
});
test('exact kit three.js and dossier helper hashes',()=>{
 for(const [path,expected] of Object.entries({
  'game/three.core.min.js':'613e370f76638fdef83926642bf256dc9615684922de1ce1f63a8583e5d78578',
  'game/three.module.min.js':'ef510bae547ab3789d6ed543333a8bf42510a8c70743b766c4e19039b976c26b',
  'vendor/makefun-threejs.ts':'f9622210e6a0aed70d6f13273a24c9c4a661b5e272edf8fef21197fac6de7969'
 }))assert.equal(hash(readFileSync(path)),expected,path);
});
test('game caps, one local import map and authored JS syntax',()=>{
 const files=inventory('game');assert(files.length<=993);assert(files.reduce((n,f)=>n+f.bytes,0)<=50331648);
 const html=readFileSync('game/index.html','utf8');const maps=[...html.matchAll(/<script type="importmap">([\s\S]*?)<\/script>/g)];assert.equal(maps.length,1);assert.equal(JSON.parse(maps[0][1]).imports.three,'./three.module.min.js');
 for(const f of files){assert(Buffer.byteLength(f.path)<=1000);if(f.path.endsWith('.js')){const run=spawnSync(process.execPath,['--check',join('game',f.path)],{env:childEnv,encoding:'utf8',timeout:15000});assert.equal(run.status,0,run.stderr);}}
});
test('four small, correctly named, complete JPEG screenshots',()=>{
 const files=readdirSync('screenshots').filter(n=>!n.startsWith('.'));assert.equal(files.length,4);
 for(const name of files){assert(/^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/.test(name));const b=readFileSync(join('screenshots',name));assert(b.length<=262144);assert.equal(b.readUInt16BE(0),0xffd8);assert.equal(b.readUInt16BE(b.length-2),0xffd9);
  let offset=2,width=0,height=0;while(offset<b.length){assert.equal(b[offset++],0xff);let marker=b[offset++];while(marker===0xff)marker=b[offset++];if(marker===0xda)break;const length=b.readUInt16BE(offset);if([0xc0,0xc1,0xc2].includes(marker)){height=b.readUInt16BE(offset+3);width=b.readUInt16BE(offset+5);break;}offset+=length;}
  assert.equal(width,1280);assert.equal(height,720);
 }
});
