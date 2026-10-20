import {forwardRpc} from '../rpc-proxy';
interface Response {status:(n:number)=>Response;json:(x:unknown)=>void}
export default async function handler(req:{method?:string;body:unknown},res:Response){
 if(req.method!=='POST'){res.status(405).json({error:'POST required'});return;}
 try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body;res.status(200).json(await forwardRpc(body as Parameters<typeof forwardRpc>[0]));}
 catch{res.status(400).json({jsonrpc:'2.0',id:1,error:{code:-32600,message:'Invalid or unavailable RPC request.'}});}
}
