/** Unsigned target-runtime negative checks; no keys loaded and no writes broadcast. */
import {read,load,verifyNetwork,rpc,abi,contractArgs,save,safeError,SafeError} from './network.mjs';
import {toHex} from 'viem';
try{const network=await verifyNetwork(),deployment=await load('deployment.json');if(!deployment?.address)throw new SafeError('DeploymentRequired');const target=deployment.address,p=JSON.parse(await read(target,'get_policy',['diagnostics'])),sender=p.creator,other=p.rules[1].author;
 const snap=async()=>({policies:await read(target,'list_policies'),requests:await read(target,'list_requests'),accounting:await read(target,'get_accounting')});const before=await snap(),checks=[];
 for(const [name,from,method,args,expected]of [
 ['duplicate-author',sender,'create_policy',['guard-only','Unsigned negative check',sender,other,other,Math.floor(Date.now()/1000)+1000,Math.floor(Date.now()/1000)+2000],'DISTINCT_AUTHORS'],
 ['wrong-cancel-caller',other,'cancel_policy',['diagnostics'],'POLICY_CREATOR'],
 ['missing-purchase-payment',sender,'open_request',['guard-only','diagnostics','Synthetic logs',p.digest,Math.floor(Date.now()/1000)+1000],'EXACT_1_GEN']]){
  const data=abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject(method,contractArgs(method,args))),false]);let result;
  try{const r=await rpc('sim_call',[{type:'write',from,to:target,data,transaction_hash_variant:'latest-final',value:toHex(0),sim_config:{genvm_datetime:new Date().toISOString()}}]);result={executionResult:r?.execution_result==='SUCCESS'?'SUCCESS':'ERROR',expectedMarker:JSON.stringify(r).includes(expected)};}catch(e){result={executionResult:'RPC_REJECTED',expectedMarker:JSON.stringify(e?.cause?.message??'').includes(expected),error:safeError(e)};}
  checks.push({name,expected,...result,passed:result.executionResult!=='SUCCESS'&&result.expectedMarker});
 }
 const after=await snap(),unchanged=JSON.stringify(before)===JSON.stringify(after),record={at:new Date().toISOString(),command:'node scripts/runtime-guards.mjs',scope:'Unsigned selected-runtime guard checks; not real failed transactions.',network,address:target,checks,canonicalUnchanged:unchanged,passed:unchanged&&checks.every(c=>c.passed)};await save('runtime-guards.json',record);console.log(JSON.stringify(record));process.exitCode=record.passed?0:1;
}catch(e){console.log(JSON.stringify({guardStopped:safeError(e)}));process.exitCode=1;}
