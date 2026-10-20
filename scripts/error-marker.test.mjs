import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasErrorMarker} from './error-marker.mjs';
test('recognizes plain and base64 GenVM errors without returning their payload',()=>{assert.equal(hasErrorMarker({consensus_data:{leader_receipt:[{genvm_result:{result:Buffer.from('User error DISTINCT_AUTHORS').toString('base64')}}]}},'DISTINCT_AUTHORS'),true);assert.equal(hasErrorMarker({error:{message:'DISTINCT_AUTHORS'}},'DISTINCT_AUTHORS'),true);});
test('private validator configuration and unrelated payloads are excluded',()=>{assert.equal(hasErrorMarker({consensus_data:{leader_receipt:[{node_config:{message:'DISTINCT_AUTHORS'}}]}},'DISTINCT_AUTHORS'),false);assert.equal(hasErrorMarker({result:'unrelated'},'DISTINCT_AUTHORS'),false);});
