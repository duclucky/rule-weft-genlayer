import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspect} from 'node:util';
import {rpc,safeError} from './network.mjs';
test('RPC rejection discards raw nested validator data before constructing an error',async()=>{const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({error:{code:-32000,message:'timed out: insufficient funds',data:{node_config:{credential:'SENTINEL_PRIVATE_MUST_NOT_ESCAPE'}}}}));try{await assert.rejects(()=>rpc('eth_chainId'),e=>{assert(!inspect(e,{depth:10}).includes('SENTINEL'));assert(!JSON.stringify(e).includes('SENTINEL'));assert(!String(e.stack).includes('SENTINEL'));const safe=safeError(e);assert.equal(safe.markers.timeout,true);assert.equal(safe.markers.insufficientFunds,true);return true;});}finally{globalThis.fetch=original;}});

test('safe error markers remain an explicit boolean allowlist',()=>{const value=safeError({markers:{timeout:true,node_config:'SENTINEL_PRIVATE_MUST_NOT_ESCAPE'}});assert.equal(value.markers.timeout,true);assert(!JSON.stringify(value).includes('SENTINEL'));assert.deepEqual(Object.keys(value.markers).sort(),['feeCap','insufficientFunds','rolledBack','timeout']);});
