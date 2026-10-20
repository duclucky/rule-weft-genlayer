import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {forwardRpc} from './rpc-proxy.ts';
export default defineConfig({plugins:[react(),{name:'bounded-genlayer-rpc',configureServer(server){server.middlewares.use('/genlayer-rpc',(req,res)=>{if(req.method!=='POST'){res.statusCode=405;res.end();return;}let body='';req.on('data',chunk=>{body+=String(chunk);if(body.length>65536)req.destroy();});req.on('end',async()=>{res.setHeader('Content-Type','application/json');try{res.end(JSON.stringify(await forwardRpc(JSON.parse(body))));}catch{res.statusCode=400;res.end(JSON.stringify({jsonrpc:'2.0',id:1,error:{code:-32600,message:'Invalid or unavailable RPC request.'}}));}});});}}],test:{environment:'jsdom',restoreMocks:true},server:{port:5190}});
