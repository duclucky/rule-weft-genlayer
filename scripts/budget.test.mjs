import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serializeTransaction,parseUnits} from 'viem';
import {reserve} from './budget.mjs';
const raw=value=>serializeTransaction({type:'legacy',chainId:61997,to:'0x1111111111111111111111111111111111111111',nonce:0,gas:21000n,gasPrice:0n,value:parseUnits(value,18)});
test('signed value must equal purchase plus measured fee reserve',()=>{assert.equal(reserve(null,raw('1.01'),{valueGEN:'1',feeReserveGEN:'0.01'}).rows.length,1);assert.throws(()=>reserve(null,raw('2'),{valueGEN:'1',feeReserveGEN:'0.01'}));});
test('whole GEN application bound and aggregate fee budget fail closed',()=>{assert.throws(()=>reserve(null,raw('2.01'),{valueGEN:'2',feeReserveGEN:'0.01'}));assert.throws(()=>reserve({rows:[{feeGEN:'5',valueGEN:'0'}]},raw('0.01'),{valueGEN:'0',feeReserveGEN:'0.01'}));});
