/** Script-signed issuer exit after a separately proven browser consumption. */
import {actors,balance,client,EXPLORER,gen,identity,load,quote,read,save,send,wait,verifyNetwork,safeReceipt,safeError,SafeError} from './network.mjs';
import {assertDemoExitAmount,proveExit} from './native-exit.mjs';

async function main(){
 await verifyNetwork();
 const deployment=await load('deployment.json');if(!deployment?.address)throw new SafeError('DeploymentRequired');
 const target=deployment.address,issuer=(await actors())[1],requestId='chrome-grant-20261020';
 const request=JSON.parse(await read(target,'get_request',[requestId]));
 if(request.issuer.toLowerCase()!==issuer.address.toLowerCase())throw new SafeError('IssuerMismatch');
 const file='tx-browser-peer-issuer-exit.json',proofFile='exit-browser-peer-issuer.json';
 let attempt=await load(file);const creditGEN=await read(target,'get_credit',[issuer.address]);
 console.log(JSON.stringify({mode:process.argv.includes('--execute')?'execute':'inspect',requestId,status:request.status,issuer:issuer.address,creditGEN,existingHash:attempt?.hash??null}));
 if(!process.argv.includes('--execute'))return;
 if(request.status!=='USED')throw new SafeError('BrowserConsumptionRequired');
 const previousProof=await load(proofFile);if(previousProof?.passed){if(creditGEN!=='0')throw new SafeError('UnexpectedNewCredit');return;}
 if(!attempt){
  if(creditGEN!=='1')throw new SafeError('ExactOneGENCreditRequired');assertDemoExitAmount(creditGEN);
  const before={ownCreditGEN:creditGEN,contractBalanceGEN:gen(await balance(target)),actorBalanceGEN:gen(await balance(issuer.address)),accounting:JSON.parse(await read(target,'get_accounting'))};
  const fees=await quote(issuer,target,'withdraw',[]);
  attempt=await send(file,{...await identity(),operation:'withdraw',args:[],actor:issuer.address,valueGEN:'0',feeReserveGEN:gen(fees.feeValue),before,scope:'Script-signed peer issuer, not browser proof'},()=>client(issuer).writeContract({address:target,functionName:'withdraw',args:[],value:0n,fees}));
 }
 if(!attempt.hash)throw new SafeError('PreparedOperationNeedsInspection');
 const receipt=safeReceipt(await wait(attempt.hash));
 const proof=await proveExit(attempt.before,'1',attempt.feeReserveGEN,async()=>({contract:await balance(target),owner:await balance(issuer.address)}));
 if(await read(target,'get_credit',[issuer.address])!=='0')throw new SafeError('CreditNotCleared');
 await save(file,{...attempt,status:'FINALIZED',receipt,finalizedObservedAt:new Date().toISOString(),transactionExplorer:EXPLORER+'/tx/'+attempt.hash});
 await save(proofFile,{at:new Date().toISOString(),actor:issuer.address,hash:attempt.hash,creditedGEN:'1',...proof,creditAfterGEN:'0',receipt,scope:'Script-signed peer issuer exit after browser USED'});
 console.log(JSON.stringify({hash:attempt.hash,...proof}));
}
try{await main();}catch(error){console.log(JSON.stringify({peerExitStopped:safeError(error)}));process.exitCode=1;}
