import {describe,it,expect,vi} from 'vitest';
import {actions,UnavailableAdapter,deploymentMessage,type RequestItem} from './domain';
import {discoverWallets,connect,ensureChain} from './wallet';
const payer='0x1111111111111111111111111111111111111111';
const request={payer,status:'OPEN',deadline:100} as RequestItem;
describe('legal requester actions',()=>{
 for(const state of ['OPEN','RETRYABLE','GRANTED','DENIED','CONFLICT','USED','EXPIRED'])for(const time of [99,100,101])it(`${state} at ${time}`,()=>{
  const item={...request,status:state};const actual=actions(item,payer,time);
  const expected=time>=100?(['OPEN','RETRYABLE','GRANTED'].includes(state)?['recover']:[]):state==='GRANTED'?['consume']:['OPEN','RETRYABLE'].includes(state)?['review_request']:[];
  expect(actual).toEqual(expected);expect(actions(item,'0x2222222222222222222222222222222222222222',time)).toEqual([]);
 });
 it('missing deployment never fabricates a read or write',async()=>{const a=new UnavailableAdapter();expect(a.configured).toBe(false);await expect(a.policies()).rejects.toThrow(deploymentMessage);await expect(a.write()).rejects.toThrow(deploymentMessage);});
});
describe('wallet boundary',()=>{
 for(const [code,message] of [[4001,'declined'],[-32002,'already open'],[-32603,'code -32603']] as const)it(`shows actionable safe wallet error ${code}`,async()=>{await expect(connect({id:'x',name:'X',provider:{request:async()=>{throw {code,privateDetail:'must not display'};}}})).rejects.toThrow(message);});
 it('deduplicates the same named extension across announced and injected wrappers',()=>{let found:unknown[]=[];const stop=discoverWallets(w=>{found=w;});for(const id of ['one','two'])window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info:{uuid:id,name:'Same wallet'},provider:{request:vi.fn()}}}));expect(found).toHaveLength(1);stop();});
 it('discovers announcements without requesting accounts or auto-selecting',()=>{const p={request:vi.fn()};let found:unknown[]=[];const stop=discoverWallets(w=>{found=w;});window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info:{uuid:'one',name:'Chosen wallet'},provider:p}}));expect(found).toHaveLength(1);expect(p.request).not.toHaveBeenCalled();stop();});
 it('requests only the selected wallet and validates account',async()=>{const provider={request:vi.fn(async({method}:{method:string})=>method==='eth_requestAccounts'?[payer]:'0xf22d')};expect(await connect({id:'a',name:'A',provider})).toBe(payer);expect(provider.request.mock.calls[0][0].method).toBe('eth_requestAccounts');});
 it('rejects invalid account before network switching',async()=>{const provider={request:vi.fn(async()=>['invalid'])};await expect(connect({id:'a',name:'A',provider})).rejects.toThrow('valid account');expect(provider.request).toHaveBeenCalledTimes(1);});
 it('adds an unknown chain and verifies resulting chain',async()=>{let chain='0x1';const request=vi.fn(async({method}:{method:string})=>{if(method==='eth_chainId')return chain;if(method==='wallet_switchEthereumChain')throw {code:4902};chain='0xf22d';});await ensureChain({request});expect(request.mock.calls.map(c=>c[0].method)).toContain('wallet_addEthereumChain');});
 it('rejects a wallet that stays on the wrong chain',async()=>{const request=vi.fn(async({method}:{method:string})=>method==='eth_chainId'?'0x1':null);await expect(ensureChain({request})).rejects.toThrow('Switch your wallet');});
});
