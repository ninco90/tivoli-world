import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||5173);
const server=http.createServer((req,res)=>{let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}const f=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.stat(f,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end('Archivo no encontrado');return}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(res)});});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`El puerto ${port} ya está ocupado. Prueba abrir http://127.0.0.1:${port} o usa otro puerto con PORT.`:e);process.exitCode=1});server.listen(port,'127.0.0.1',()=>console.log(`Tívoli · Atlas del cambio\nAbre http://127.0.0.1:${port}\nServidor exclusivamente local. Ctrl+C para cerrar.`));
