/** Allowlisted interpretation; no complete RPC object is ever written or logged. */
export const address=x=>typeof x==='string'&&/^0x[0-9a-fA-F]{40}$/.test(x)&&!/^0x0{40}$/i.test(x)?x.toLowerCase():null;
export const hash=x=>typeof x==='string'&&/^0x[0-9a-fA-F]{64}$/.test(x)?x.toLowerCase():null;
const codes={1:'PENDING',2:'PROPOSING',3:'COMMITTING',4:'REVEALING',5:'ACCEPTED',6:'UNDETERMINED',7:'FINALIZED',8:'CANCELED',11:'VALIDATORS_TIMEOUT',12:'LEADER_TIMEOUT'};
export function state(r){
 if(!r||typeof r!=='object')return {status:'UNKNOWN',execution:'UNKNOWN',successful:false};
 const raw=r.statusName??r.status;const status=typeof raw==='string'&&/^[A-Z_]{2,30}$/.test(raw)?raw:codes[raw]??'UNKNOWN';
 let rows=r.consensus_data?.leader_receipt??[];if(!Array.isArray(rows))rows=[rows];
 const normalized=r.txExecutionResultName!==undefined?(r.txExecutionResultName==='FINISHED_WITH_RETURN'?'SUCCESS':'ERROR'):r.txExecutionResult!==undefined?(Number(r.txExecutionResult)===1?'SUCCESS':'ERROR'):null;
 const results=[r.execution_result,...rows.filter(x=>!(normalized==='SUCCESS'&&x?.mode==='validator'&&x.vote==='idle'&&(x.controlCode??x.genvm_result?.error_code)==='CONSENSUS_VALIDATOR_QUORUM_REACHED')).map(x=>x?.execution_result),normalized].filter(x=>x!==undefined&&x!==null);
 const execution=results.length===0?'UNKNOWN':results.every(x=>x==='SUCCESS')?'SUCCESS':'ERROR';
 const decisions=[r.resultName,r.result_name,r.result].filter(x=>x!==undefined&&x!==null);
 const agreed=decisions.every(x=>x===1||x==='1'||x==='MAJORITY_AGREE'||x==='AGREE');
 return {status,execution,successful:status==='FINALIZED'&&execution==='SUCCESS'&&agreed};
}
export function safeReceipt(r){return {...state(r),hash:hash(r?.hash??r?.transactionHash??r?.txId),from:address(r?.from_address??r?.from??r?.sender),to:address(r?.to_address??r?.to??r?.recipient)};}
