import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('game');
createServer((req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url??'/', 'http://localhost').pathname));if(path!==root&&!path.startsWith(root+sep))throw Error('path');const file=statSync(path).isDirectory()?resolve(path,'index.html'):path;res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'})[extname(file)]??'application/octet-stream');res.end(readFileSync(file));}catch{res.statusCode=404;res.end('Not found');}}).listen(8080,'127.0.0.1',()=>console.log('SIGNAL VAULT: http://127.0.0.1:8080'));
