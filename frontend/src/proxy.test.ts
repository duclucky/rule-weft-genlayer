import {afterEach,expect,it,vi} from 'vitest';
import {forwardRpc} from '../rpc-proxy';
import {state} from '../../scripts/receipt.mjs';
afterEach(()=>vi.unstubAllGlobals());
it('preserves only the known nested quorum control code so successful finality survives the proxy',async()=>{
 const receipt={status:7,txExecutionResult:1,result:1,consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS'},{mode:'validator',vote:'idle',execution_result:'ERROR',genvm_result:{error_code:'CONSENSUS_VALIDATOR_QUORUM_REACHED',node_config:'PRIVATE'}}]}};
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:receipt})));
 const out=await forwardRpc({method:'eth_getTransactionByHash',params:[]});
 expect(state(out.result).successful).toBe(true);expect(JSON.stringify(out)).not.toContain('PRIVATE');
});
it('does not suppress a real validator failure or expose unknown control diagnostics',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{status:7,txExecutionResult:1,result:1,consensus_data:{leader_receipt:[{mode:'validator',vote:'idle',execution_result:'ERROR',controlCode:'PRIVATE',genvm_result:{error_code:'PRIVATE'}}]}}})));
 const out=await forwardRpc({method:'eth_getTransactionByHash',params:[]});
 expect(state(out.result).successful).toBe(false);expect(JSON.stringify(out)).not.toContain('PRIVATE');
});
it('never forwards signing or unknown RPC methods',async()=>{vi.stubGlobal('fetch',vi.fn());await expect(forwardRpc({method:'eth_sendRawTransaction',params:[]})).rejects.toThrow('Unsupported');expect(fetch).not.toHaveBeenCalled();});
it('adds a simulation-only canonical timestamp before quote measurement',async()=>{vi.stubGlobal('fetch',vi.fn(async(_u,o)=>{const body=JSON.parse(String(o?.body));expect(body.params[0].sim_config.genvm_datetime).toMatch(/^\d{4}-/);return Response.json({result:{recommendedPreset:{feeValue:'1',distribution:{executionBudgetPerRound:'100'}}}});}));const r=await forwardRpc({method:'sim_estimateTransactionFees',params:[{type:'write'}]});expect(r.result.recommendedPreset.feeValue).toBe('1');});
it('projects receipt status without leaking raw nested config or diagnostics',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{status:'FINALIZED',stdout:'PRIVATE',node_config:{private_key:'PRIVATE'},consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS',node_config:'PRIVATE',stdout:'PRIVATE'}]}}})));const r=await forwardRpc({method:'eth_getTransactionByHash',params:['0x'+'1'.repeat(64)]});expect(JSON.stringify(r)).not.toContain('PRIVATE');expect(r.result.status).toBe('FINALIZED');});
it('never returns raw RPC error bodies',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>Response.json({error:{code:-32000,message:'PRIVATE',data:{key:'PRIVATE'}}})));const r=await forwardRpc({method:'eth_chainId',params:[]});expect(JSON.stringify(r)).not.toContain('PRIVATE');expect(r.error?.code).toBe(-32000);});
it('preserves materialized consensus result so a finalized disagreement cannot become UI success',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{status:'FINALIZED',txExecutionResult:1,result:2,result_name:'MAJORITY_DISAGREE',node_config:'PRIVATE'}})));const r=await forwardRpc({method:'eth_getTransactionByHash',params:[]});expect(r.result.result).toBe(2);expect(r.result.result_name).toBe('MAJORITY_DISAGREE');expect(JSON.stringify(r)).not.toContain('PRIVATE');});
it('rejects unexpected nested consensus metadata without forwarding its payload',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{status:'FINALIZED',txExecutionResult:1,result:{node_config:'PRIVATE'}}})));const r=await forwardRpc({method:'eth_getTransactionByHash',params:[]});expect(JSON.stringify(r)).not.toContain('PRIVATE');expect(r.result.result).toBe('INVALID_CONSENSUS_RESULT');});
