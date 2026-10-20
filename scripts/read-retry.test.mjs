import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retryRead} from './read-retry.mjs';
test('a transient post-finality read failure is rechecked without a signing callback',async()=>{let calls=0,pauses=[];const value=await retryRead(async()=>{if(++calls===1)throw {cause:{code:-32006}};return 'canonical';},{pause:async ms=>pauses.push(ms)});assert.equal(value,'canonical');assert.deepEqual(pauses,[10000]);});
test('structural read errors are not retried and transient retries are bounded',async()=>{let calls=0;await assert.rejects(()=>retryRead(async()=>{calls++;throw Error('InvalidAddress');},{pause:async()=>{}}));assert.equal(calls,1);calls=0;await assert.rejects(()=>retryRead(async()=>{calls++;throw Object.assign(Error('rate limited'),{code:429});},{pause:async()=>{}}));assert.equal(calls,4);});
