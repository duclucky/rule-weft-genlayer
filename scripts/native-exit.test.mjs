import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseUnits} from 'viem';
import {exitInvariant,assertDemoExitAmount} from './native-exit.mjs';
const before={contractBalanceGEN:'1',actorBalanceGEN:'2'},after=(contract,owner)=>({contract:parseUnits(contract,18),owner:parseUnits(owner,18)});
test('parent finality or zero internal credit cannot substitute for exact native debit and recipient increase',()=>{assert.equal(exitInvariant(before,after('1','2'),'1','0.01').passed,false);assert.equal(exitInvariant(before,after('0','2'),'1','0.01').passed,false);assert.equal(exitInvariant(before,after('0','2.995'),'1','0.01').passed,true);});
test('wrong native debit and excessive fee loss reject an exit proof',()=>{assert.equal(exitInvariant(before,after('0.1','2.995'),'1','0.01').passed,false);assert.equal(exitInvariant(before,after('0','2.98'),'1','0.01').passed,false);});
test('demo operator cannot aggregate a withdrawal above 2 GEN',()=>{assert.doesNotThrow(()=>assertDemoExitAmount('1'));assert.doesNotThrow(()=>assertDemoExitAmount('2'));assert.throws(()=>assertDemoExitAmount('3'));});
