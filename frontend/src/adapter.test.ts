import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {decodeFunctionData,encodeFunctionResult} from 'viem';
import {studioDevnet} from 'genlayer-js/chains';
import {createFeesDistribution} from 'genlayer-js';
import {createRuleWeftAdapter} from './adapter';
import type {Provider} from './domain';
const payer='0x1111111111111111111111111111111111111111',destination='0x2222222222222222222222222222222222222222',tx='0x'+'3'.repeat(64);
const endpoint='https://offline-ruleweft.invalid';
const sends:{method:string;params?:unknown[]}[]=[];
let receipt=0,materializedResult=1;
const provider:Provider={async request(input){if(input.method==='eth_accounts')return [payer];if(input.method==='eth_chainId')return '0xf22d';if(input.method==='eth_sendTransaction'){sends.push(input);return tx;}throw Error('Unexpected provider request '+input.method);}};
beforeEach(()=>{sends.length=0;receipt=0;materializedResult=1;vi.stubGlobal('fetch',vi.fn(async(_url,options)=>{
 const {id,method,params}=JSON.parse(String(options?.body));let result:unknown;
 if(method==='eth_getTransactionCount')result='0x0';
 else if(method==='eth_estimateGas')result='0x30d40';
 else if(method==='eth_gasPrice')result='0x0';
 else if(method==='eth_blockNumber')result='0x10';
 else if(method==='eth_getTransactionReceipt')result={transactionHash:tx,transactionIndex:'0x0',blockHash:'0x'+'4'.repeat(64),blockNumber:'0x10',from:payer,to:destination,cumulativeGasUsed:'0x1',gasUsed:'0x1',contractAddress:null,logs:[],logsBloom:'0x'+'00'.repeat(256),status:'0x1',effectiveGasPrice:'0x0',type:'0x0'};
 else if(method==='sim_getFeeConfig')result={enabled:true,policy:{genPerTimeUnit:'1',storageUnitPrice:'1',receiptGasPrice:'1'}};
 else if(method==='eth_call'){
  const decoded=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi,data:params[0].data});
  if(decoded.functionName==='feePolicy'){result=encodeFunctionResult({abi:studioDevnet.consensusMainContract!.abi,functionName:'feePolicy',result:[false,0n,0n,0n,0n,0n,0n,0n]});}
  else throw Error('Unexpected eth_call '+decoded.functionName);
 }
 else if(method==='sim_estimateTransactionFees')result={recommendedPreset:{distribution:createFeesDistribution({}),feeValue:'100',messageAllocations:[]}};
 else if(method==='eth_getTransactionByHash')result={status:++receipt===1?'ACCEPTED':'FINALIZED',execution_result:'SUCCESS',result:materializedResult};
 else throw Error('Unexpected offline RPC '+method);
 return new Response(JSON.stringify({jsonrpc:'2.0',id,result},(_k,v)=>typeof v==='bigint'?v.toString():v),{status:200,headers:{'Content-Type':'application/json'}});
}));});
afterEach(()=>vi.unstubAllGlobals());
describe('actual project adapter through the real SDK, intercepted I/O only',()=>{
 it('does not report finalized success when leader returned but consensus rejected application',async()=>{materializedResult=2;const stages:string[]=[];await expect(createRuleWeftAdapter({endpoint,address:destination,account:payer,provider,pollMs:0,maxPolls:3}).write('consume',['r'],'0',p=>stages.push(p))).rejects.toThrow('did not finalize successfully');expect(stages).not.toContain('Finalized');});
 for(const [command,args] of [
  ['create_policy',['p','Policy',destination,'0x4444444444444444444444444444444444444444',destination,2000000000,2000100000]],
  ['submit_rule',['p',0,'ALLOW','Exact wording','']],['ratify',['p','digest']],['cancel_policy',['p']],['review_request',['r']],['consume',['r']],['recover',['r']],['withdraw',[]]
 ] as const)it(`real SDK wrapper ${command} with exact zero application GEN`,async()=>{const a=createRuleWeftAdapter({endpoint,address:destination,account:payer,provider,pollMs:0,maxPolls:3});await a.write(command,[...args],'0',()=>{});const sent=sends.find(s=>s.method==='eth_sendTransaction')!;const t=(sent.params as [{value:string;from:string}])[0];expect(BigInt(t.value)).toBe(100n);expect(t.from.toLowerCase()).toBe(payer);});
 it('validates missing destination and wallet before any RPC/signing',async()=>{await expect(createRuleWeftAdapter({endpoint,account:payer,provider}).write('open_request',['r','p','action','digest',2000000000],'1',()=>{})).rejects.toThrow('not configured');await expect(createRuleWeftAdapter({endpoint,address:destination}).write('consume',['r'],'0',()=>{})).rejects.toThrow('Connect');expect(sends).toHaveLength(0);expect(fetch).not.toHaveBeenCalled();});
 it('rejects wrong application GEN amount before signing',async()=>{await expect(createRuleWeftAdapter({endpoint,address:destination,account:payer,provider}).write('open_request',[],'0',()=>{})).rejects.toThrow('exactly 1 GEN');expect(sends).toHaveLength(0);});
 it('encodes exact actual payer, destination and1GEN without per-call account override',async()=>{const stages:string[]=[];const a=createRuleWeftAdapter({endpoint,address:destination,account:payer,provider,pollMs:0,maxPolls:3});await a.write('open_request',['r','p','synthetic action','digest',2000000000],'1',p=>stages.push(p));expect(sends).toHaveLength(1);const transaction=(sends[0].params as [{from:string;to:string;value:string;data:`0x${string}`}])[0];expect(transaction.from.toLowerCase()).toBe(payer);expect(transaction.to.toLowerCase()).toBe(studioDevnet.consensusMainContract!.address.toLowerCase());const call=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi,data:transaction.data});expect(call.functionName).toBe('addTransaction');expect(JSON.stringify(call.args,(_k,v)=>typeof v==='bigint'?v.toString():v).toLowerCase()).toContain(destination);expect(BigInt(transaction.value)).toBe(10n**18n+100n);expect(stages).toContain('Submitted');expect(stages).toContain('Accepted / decided');expect(stages.at(-1)).toBe('Finalized');});
});
