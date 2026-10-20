import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {App} from './App';
import type {ContractAdapter,Policy,RequestItem} from './domain';
const payer='0x1111111111111111111111111111111111111111';
const policy:Policy={id:'test-policy',title:'Fixture policy — test harness only',creator:payer,issuer:'0x2222222222222222222222222222222222222222',status:'ACTIVE',digest:'test-digest',collectDeadline:2000000000,expiry:2000100000,rules:[0,1,2].map(i=>({id:`R${i}`,author:i===0?payer:`0x${String(i+2).repeat(40)}`,effect:i===1?'BLOCK':'ALLOW',text:'Test rule',target:i===0?'':`R${i-1}`,submitted:true,ratified:true}))};
const item:RequestItem={id:'test-request',policyId:policy.id,policyTitle:policy.title,payer,issuer:policy.issuer,action:'Synthetic test action',status:'OPEN',deadline:2000000000,attempts:0,reason:'',rules:[]};
function adapter():ContractAdapter{return {configured:true,policies:vi.fn(async()=>[policy]),policy:vi.fn(async()=>structuredClone(policy)),requests:vi.fn(async()=>[item]),request:vi.fn(async()=>structuredClone(item)),credit:vi.fn(async()=>'1'),write:vi.fn(async(_c,_a,_v,p)=>{p('Submitted');p('Accepted / decided');p('Finalized');})};}
beforeEach(()=>{vi.stubGlobal('scrollTo',vi.fn());Object.defineProperty(window,'ethereum',{configurable:true,value:{request:vi.fn(async({method}:{method:string})=>method==='eth_requestAccounts'?[payer]:'0xf22d')}});});
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals();delete (window as unknown as {ethereum?:unknown}).ethereum;});
function mount(route:string,a=adapter()){render(<MemoryRouter initialEntries={[route]}><App adapterFactory={()=>a}/></MemoryRouter>);return a;}
async function wallet(){fireEvent.click(screen.getByRole('button',{name:'Connect wallet'}));fireEvent.click(await screen.findByRole('button',{name:/Browser wallet/}));await screen.findByRole('button',{name:/0x1111/});}
describe('complete named page map',()=>{
 for(const [route,heading] of [['/','Good rules need'],['/policies','Policies'],['/policies/new','A policy built together'],['/policies/test-policy',policy.title],['/requests/new?policy=test-policy','Request a permission'],['/requests/test-request','Ready for review'],['/activity','Activity'],['/account','Your account'],['/help','Clear rules, considered exceptions'],['/missing','That page is not here']])it(`reachable ${route}`,async()=>{mount(route);expect(await screen.findByRole('heading',{name:new RegExp(heading)})).toBeTruthy();expect(screen.getByRole('navigation',{name:'Main navigation'})).toBeTruthy();expect(screen.getByRole('link',{name:'Policies'})).toBeTruthy();});
 it('filters canonical policy reads without fabricated results',async()=>{mount('/policies');await screen.findByRole('heading',{name:policy.title});fireEvent.change(screen.getByLabelText('Search policies'),{target:{value:'no-match'}});expect(screen.queryByRole('heading',{name:policy.title})).toBeNull();expect(screen.getByRole('heading',{name:'No matching policies'})).toBeTruthy();});
 it('makes missing deployment explicit on data pages',async()=>{render(<MemoryRouter initialEntries={['/policies']}><App/></MemoryRouter>);expect(await screen.findByRole('heading',{name:'We could not load this yet'})).toBeTruthy();expect(screen.getAllByText(/Deployment is not configured yet/).length).toBeGreaterThan(0);});
});
describe('realistic boundary feedback through an injected test adapter only',()=>{
 it('restores only the previously selected authorized provider without prompting and forgets it on logout',async()=>{localStorage.setItem('ruleweft.wallet','Browser wallet');const request=vi.fn(async({method}:{method:string})=>method==='eth_accounts'?[payer]:'0xf22d');Object.defineProperty(window,'ethereum',{configurable:true,value:{request}});mount('/account');fireEvent.click(await screen.findByRole('button',{name:/0x1111/}));expect(request.mock.calls.map(x=>x[0].method)).toEqual(['eth_accounts']);fireEvent.click(screen.getByRole('button',{name:'Disconnect'}));expect(localStorage.getItem('ruleweft.wallet')).toBeNull();});
 it('does not prompt or restore when prior provider has no authorized accounts',async()=>{localStorage.setItem('ruleweft.wallet','Browser wallet');const request=vi.fn(async()=>[]);Object.defineProperty(window,'ethereum',{configurable:true,value:{request}});mount('/account');await waitFor(()=>expect(request).toHaveBeenCalled());expect(screen.getByRole('button',{name:'Connect wallet'})).toBeTruthy();expect(request.mock.calls.every(c=>!(c as unknown[]).includes('eth_requestAccounts'))).toBe(true);});
 it('does not expose requester write before wallet selection',async()=>{mount('/requests/test-request');await screen.findByRole('heading',{name:'Ready for review'});expect(screen.queryByRole('button',{name:'Review this request'})).toBeNull();});
 it('selects a wallet, reviews and reloads canonical state only after completion',async()=>{const a=mount('/requests/test-request');await wallet();await screen.findByRole('button',{name:'Review this request'});fireEvent.click(screen.getByRole('button',{name:'Review this request'}));await waitFor(()=>expect(a.write).toHaveBeenCalledWith('review_request',['test-request'],'0',expect.any(Function)));await screen.findByText(/Finalized — refreshing/);expect(a.request).toHaveBeenCalledTimes(2);});
 it('disconnect clears the account and removes all payer writes',async()=>{mount('/requests/test-request');await wallet();await screen.findByRole('button',{name:'Review this request'});fireEvent.click(screen.getByRole('button',{name:/0x1111/}));fireEvent.click(screen.getByRole('button',{name:'Disconnect'}));expect(screen.queryByRole('button',{name:'Review this request'})).toBeNull();expect(screen.getByRole('button',{name:'Connect wallet'})).toBeTruthy();});
 it('surfaces transaction error and never claims finalized success',async()=>{const a=adapter();a.write=vi.fn(async()=>{throw new Error('Wallet rejected the test transaction.');});mount('/requests/test-request',a);await wallet();fireEvent.click(await screen.findByRole('button',{name:'Review this request'}));expect(await screen.findByRole('alert')).toHaveProperty('textContent','Wallet rejected the test transaction.');expect(screen.queryByText(/Finalized — refreshing/)).toBeNull();});
 it('withdraws own positive credit through the adapter and reloads canonical credit',async()=>{const a=mount('/account');await wallet();fireEvent.click(await screen.findByRole('button',{name:'Withdraw my GEN'}));await waitFor(()=>expect(a.write).toHaveBeenCalledWith('withdraw',[],'0',expect.any(Function)));await waitFor(()=>expect(a.credit).toHaveBeenCalledTimes(2));});
 it('never displays a fixture as normal production data',async()=>{render(<MemoryRouter initialEntries={['/activity']}><App/></MemoryRouter>);await screen.findByRole('alert');expect(screen.queryByText(item.action)).toBeNull();});
});

describe('each lifecycle control reaches its wrapper and reloads canonical state',()=>{
 const change=(label:RegExp,value:string)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
 const localDate=(offset:number)=>{const d=new Date(Date.now()+offset);const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;};
 it('creates a policy from the form and reads its canonical detail',async()=>{
  const a=mount('/policies/new');await wallet();
  for(const [label,value] of [[/^Policy ID/,'test-policy'],[/^Policy title/,'Shared rules'],[/^Second author wallet/,'0x3333333333333333333333333333333333333333'],[/^Third author wallet/,'0x4444444444444444444444444444444444444444'],[/^Permission issuer wallet/,policy.issuer],[/^Agreement deadline/,localDate(3600000)],[/^Policy expiry/,localDate(7200000)]] as const)change(label,value);
  fireEvent.click(screen.getByRole('button',{name:'Create policy'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('create_policy',expect.arrayContaining(['test-policy','Shared rules']),'0',expect.any(Function)));
  await screen.findByRole('heading',{name:policy.title});expect(a.policy).toHaveBeenCalledWith('test-policy');
 });
 it('publishes the connected author slot and reloads the policy',async()=>{
  const a=adapter(),p=structuredClone(policy);p.status='COLLECTING';p.rules[0].submitted=false;a.policy=vi.fn(async()=>p);
  mount('/policies/test-policy',a);await wallet();change(/^Exact rule wording/,'Synthetic logs may be shared.');
  fireEvent.click(screen.getByRole('button',{name:'Publish my rule'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('submit_rule',['test-policy',0,'ALLOW','Synthetic logs may be shared.',''],'0',expect.any(Function)));
  await waitFor(()=>expect(a.policy).toHaveBeenCalledTimes(2));
 });
 it('ratifies the complete canonical digest and reloads it',async()=>{
  const a=adapter(),p=structuredClone(policy);p.status='RATIFYING';p.rules[0].ratified=false;a.policy=vi.fn(async()=>p);
  mount('/policies/test-policy',a);await wallet();fireEvent.click(await screen.findByRole('button',{name:'Agree to these rules'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('ratify',['test-policy','test-digest'],'0',expect.any(Function)));
  await waitFor(()=>expect(a.policy).toHaveBeenCalledTimes(2));
 });
 it('cancels only the visible expired draft and reloads it',async()=>{
  const a=adapter(),p=structuredClone(policy);p.status='RATIFYING';p.rules[0].ratified=false;p.collectDeadline=Math.floor(Date.now()/1000)-1;a.policy=vi.fn(async()=>p);
  mount('/policies/test-policy',a);await wallet();fireEvent.click(await screen.findByRole('button',{name:'Cancel expired draft'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('cancel_policy',['test-policy'],'0',expect.any(Function)));
  await waitFor(()=>expect(a.policy).toHaveBeenCalledTimes(2));
 });
 it('purchases an exact 1 GEN request from the form and reads its detail',async()=>{
  const a=mount('/requests/new?policy=test-policy');await wallet();await screen.findByRole('heading',{name:'Request a permission'});
  change(/^Request ID/,'test-request');change(/^Your intended action/,'Publish synthetic logs.');change(/^Use or recovery deadline/,localDate(600000));
  fireEvent.click(screen.getByRole('button',{name:'Request for 1 GEN'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('open_request',expect.arrayContaining(['test-request','test-policy','Publish synthetic logs.','test-digest']),'1',expect.any(Function)));
  await screen.findByRole('heading',{name:'Ready for review'});expect(a.request).toHaveBeenCalledWith('test-request');
 });
 it('submits a native date control value even when browser autofill did not update React state',async()=>{
  const a=mount('/requests/new?policy=test-policy');await wallet();await screen.findByRole('heading',{name:'Request a permission'});
  change(/^Request ID/,'test-request');change(/^Your intended action/,'Publish synthetic logs.');
  const input=screen.getByLabelText(/^Use or recovery deadline/) as HTMLInputElement;
  const deadline=localDate(600000);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,deadline);
  fireEvent.click(screen.getByRole('button',{name:'Request for 1 GEN'}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith('open_request',['test-request','test-policy','Publish synthetic logs.','test-digest',Math.floor(new Date(deadline).getTime()/1000)],'1',expect.any(Function)));
 });
 for(const [status,deadline,button,command] of [
  ['GRANTED',2000000000,'Use permission once','consume'],
  ['RETRYABLE',1,'Recover 1 GEN purchase','recover'],
  ['RETRYABLE',2000000000,'Try review again','review_request']
 ] as const)it(`${command} from its legal visible control reloads the request`,async()=>{
  const a=adapter();a.request=vi.fn(async()=>({...item,status,deadline}));mount('/requests/test-request',a);await wallet();
  fireEvent.click(await screen.findByRole('button',{name:button}));
  await waitFor(()=>expect(a.write).toHaveBeenCalledWith(command,['test-request'],'0',expect.any(Function)));
  await waitFor(()=>expect(a.request).toHaveBeenCalledTimes(2));
 });
});
