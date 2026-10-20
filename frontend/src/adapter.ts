import {createClient} from 'genlayer-js';
import {studioDevnet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {isAddress,formatUnits} from 'viem';
import {ensureChain} from './wallet';
import {state} from '../../scripts/receipt.mjs';
import {contractArgs} from '../../scripts/contract-args.mjs';
import {deploymentMessage,type ContractAdapter,type Policy,type RequestItem,type Provider,type Address,type Progress} from './domain';

type Options={address?:string;account?:string;provider?:Provider;endpoint?:string;pollMs?:number;maxPolls?:number};
const pending=new Map<string,`0x${string}`>();
const valid=(x:unknown):x is Address=>typeof x==='string'&&isAddress(x)&&!/^0x0{40}$/i.test(x);
const validHash=(x:unknown):x is `0x${string}`=>typeof x==='string'&&/^0x[0-9a-fA-F]{64}$/.test(x);
const decode=(x:unknown):unknown=>typeof x==='string'?JSON.parse(x):x;
function policy(x:unknown):Policy{
 const p=decode(x) as Policy;
 if(!p||typeof p.id!=='string'||typeof p.title!=='string'||!valid(p.creator)||!valid(p.issuer)||!['COLLECTING','RATIFYING','ACTIVE','CANCELLED'].includes(p.status)||!Number.isSafeInteger(p.collectDeadline)||!Number.isSafeInteger(p.expiry)||typeof p.digest!=='string'||!Array.isArray(p.rules)||p.rules.length!==3||!p.rules.every((r,i)=>r.id===`R${i}`&&valid(r.author)&&typeof r.text==='string'&&typeof r.target==='string'&&typeof r.ratified==='boolean'&&typeof r.submitted==='boolean'&&['','ALLOW','BLOCK'].includes(r.effect)))throw Error('The network returned an invalid policy. Actions remain unavailable.');
 return p;
}
function request(x:unknown):RequestItem{
 const r=decode(x) as RequestItem;
 if(!r||typeof r.id!=='string'||typeof r.policyId!=='string'||typeof r.policyTitle!=='string'||!valid(r.payer)||!valid(r.issuer)||typeof r.action!=='string'||!['OPEN','RETRYABLE','GRANTED','DENIED','CONFLICT','USED','EXPIRED'].includes(r.status)||!Number.isSafeInteger(r.deadline)||!Number.isSafeInteger(r.attempts)||typeof r.reason!=='string'||!Array.isArray(r.rules)||r.rules.length>3||!r.rules.every(x=>['R0','R1','R2'].includes(x.id)&&['APPLIES','NOT_APPLICABLE','UNCLEAR'].includes(x.applicability)&&['OVERRIDES','NO_OVERRIDE','UNCLEAR'].includes(x.exception)&&['IN','OUT','UNDEC','INACTIVE'].includes(x.label)))throw Error('The network returned an invalid request. Actions remain unavailable.');
 return r;
}
class TerminalError extends Error{}
function safeWalletFailure(error:unknown){
 const names=new Set(['TransactionExecutionError','TransactionRejectedRpcError','UserRejectedRequestError','InvalidParamsRpcError','InvalidInputRpcError','InvalidAddressError','AccountNotFoundError','ChainMismatchError','ChainNotFoundError','ChainNotConfiguredError','UnsupportedProviderMethodError','RpcRequestError','UnknownRpcError','HttpRequestError','InternalRpcError','InvalidChainIdError']);
 const found:string[]=[];let code:number|undefined;const seen=new Set();
 for(let e=error;e&&typeof e==='object'&&!seen.has(e)&&seen.size<8;){seen.add(e);const row=e as {name?:unknown;code?:unknown;cause?:unknown};if(typeof row.name==='string'&&names.has(row.name))found.push(row.name);if(code===undefined&&typeof row.code==='number'&&Number.isSafeInteger(row.code))code=row.code;e=row.cause;}
 return [...new Set(found),...(code===undefined?[]:[`code ${code}`])].join(' / ')||'write preparation failed';
}
export function createRuleWeftAdapter(options:Options):ContractAdapter{
 const endpoint=options.endpoint??'/genlayer-rpc';
 const chain={...studioDevnet,rpcUrls:{default:{http:[endpoint]}}};
 const reader=createClient({chain});
 function destination(){if(!valid(options.address))throw Error(deploymentMessage);if(!valid(chain.consensusMainContract?.address))throw Error('The Studio Dev system address is invalid.');return options.address;}
 async function read(name:string,args:(string|number)[]=[]){return reader.readContract({address:destination(),functionName:name,args:contractArgs(name,args),transactionHashVariant:TransactionHashVariant.LATEST_FINAL});}
 async function poll(hash:`0x${string}`,onProgress:(p:Progress)=>void){
  let decided=false;
  for(let i=0;i<(options.maxPolls??120);i++){
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getTransactionByHash',params:[hash]})});
   if(!response.ok)throw Error('The submitted transaction could not be rechecked. Refresh and try this action again to inspect the same transaction.');
   const envelope=await response.json();if(envelope.error)throw Error('The receipt is unavailable. Recheck the existing transaction before retrying.');
   const result=state(envelope.result);
   if(result.successful){onProgress('Finalized');return;}
   if(result.status==='FINALIZED')throw new TerminalError('The transaction did not finalize successfully. Refresh the confirmed record before requesting another review.');
   if(result.status==='ACCEPTED'&&!decided){onProgress('Accepted / decided');decided=true;}
   await new Promise(resolve=>setTimeout(resolve,options.pollMs??3000));
  }
  throw Error('Still waiting for finality. Try this action again to recheck the existing transaction; it will not be sent twice.');
 }
 return {
  configured:valid(options.address),
  async policies(){const rows=decode(await read('list_policies'));if(!Array.isArray(rows)||rows.length>100)throw Error('Invalid policy list.');return rows.map(policy);},
  async policy(id){const p=policy(await read('get_policy',[id]));if(p.id!==id)throw Error('Policy identity mismatch.');return p;},
  async requests(){const rows=decode(await read('list_requests'));if(!Array.isArray(rows)||rows.length>300)throw Error('Invalid request list.');return rows.map(request);},
  async request(id){const r=request(await read('get_request',[id]));if(r.id!==id)throw Error('Request identity mismatch.');return r;},
  async credit(owner){if(!valid(owner))throw Error('A valid wallet address is required.');const result=await read('get_credit',[owner]);if(typeof result!=='string'||!/^\d+$/.test(result))throw Error('The network returned an invalid GEN credit.');return result;},
  async write(command,args,valueGEN,onProgress){
   const address=destination();
   if(!options.provider||!valid(options.account))throw Error('Connect your selected wallet before signing.');
   if(valueGEN!==(command==='open_request'?'1':'0'))throw Error('The purchase amount must be exactly 1 GEN; other actions do not take a purchase payment.');
   if(args.some(x=>typeof x!=='string'&&!(typeof x==='number'&&Number.isSafeInteger(x))))throw Error('Invalid transaction input.');
   const key=JSON.stringify([chain.id,address.toLowerCase(),options.account.toLowerCase(),command,command==='withdraw'?null:args[0]]);
   const old=pending.get(key);
   if(old){try{await poll(old,onProgress);pending.delete(key);return;}catch(e){if(e instanceof TerminalError)pending.delete(key);throw e;}}
   await ensureChain(options.provider);
   const accounts=await options.provider.request({method:'eth_accounts'});
   if(!Array.isArray(accounts)||!valid(accounts[0])||accounts[0].toLowerCase()!==options.account.toLowerCase())throw Error('Your selected account changed. Disconnect and reconnect before signing.');
   const selected=options.provider;let providerFailure='';
   const provider:Provider={async request(input){try{const result=await selected.request(input);if(input.method==='eth_sendTransaction'&&validHash(result)){pending.set(key,result);onProgress('Submitted');}return result;}catch(e){const method=['eth_sendTransaction','eth_accounts','eth_chainId','eth_estimateGas','eth_gasPrice','eth_getTransactionCount','eth_getTransactionReceipt','eth_blockNumber'].includes(input.method)?input.method:'provider request';providerFailure=`${method}: ${safeWalletFailure(e)}`;throw e;}}};
   const writer=createClient({chain,account:options.account,provider});
   const value=valueGEN==='1'?10n**18n:0n;
   const call={address,functionName:command,args:contractArgs(command,args),value};
   onProgress('Estimating network fees');
   const quote=await writer.estimateTransactionFeesForWrite({...call,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}).catch(()=>{throw Error('The network could not quote this action. Check its timing and refresh the record. No transaction was submitted.');});
   if(quote.policy.enabled&&quote.feeValue<=0n)throw Error('The network did not provide a funded fee quote. No transaction was submitted.');
   onProgress(`Awaiting signature · network fee reserve ${formatUnits(quote.feeValue,18)} GEN`);
   let hash:`0x${string}`;
   try{hash=await writer.writeContract({...call,fees:{distribution:quote.distribution,feeValue:quote.feeValue,messageAllocations:quote.messageAllocations}});}catch(e){
    if(pending.has(key))throw Error('Your wallet submitted a transaction. Recheck the same action to inspect it before another attempt.');
    throw Error(`The wallet did not return a transaction reference (${providerFailure||safeWalletFailure(e)}). Check wallet activity and the confirmed record before trying again.`);
   }
   if(!validHash(hash))throw Error('The wallet returned an invalid transaction reference.');
   pending.set(key,hash);onProgress('Submitted');
   try{await poll(hash,onProgress);pending.delete(key);}catch(e){if(e instanceof TerminalError)pending.delete(key);throw e;}
  }
 };
}
