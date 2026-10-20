/** Bounded same-origin RPC gateway. It never signs or retains wallet material. */
const allowed = new Set(['gen_call', 'eth_chainId', 'eth_getTransactionCount', 'eth_estimateGas', 'eth_gasPrice', 'eth_blockNumber', 'eth_getTransactionReceipt', 'eth_getTransactionByHash', 'sim_getFeeConfig', 'sim_estimateTransactionFees']);
const pick = (object, keys) => Object.fromEntries(keys.filter(k => object && Object.hasOwn(object, k)).map(k => [k, object[k]]));
export async function forwardRpc(input) {
    if (!input || !allowed.has(input.method ?? '') || !Array.isArray(input.params) || JSON.stringify(input).length > 65536)
        throw Error('Unsupported RPC request');
    const params = structuredClone(input.params);
    if (input.method === 'sim_estimateTransactionFees' && params[0] && typeof params[0] === 'object')
        Object.assign(params[0], { sim_config: { genvm_datetime: new Date().toISOString() } });
    const response = await fetch('https://studio-next.genlayer.com/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: input.id ?? 1, method: input.method, params }), signal: AbortSignal.timeout(55000) });
    if (!response.ok)
        return { jsonrpc: '2.0', id: input.id ?? 1, error: { code: -32000, message: 'The selected network RPC is unavailable.' } };
    const envelope = await response.json();
    if (envelope.error)
        return { jsonrpc: '2.0', id: input.id ?? 1, error: { code: Number.isInteger(envelope.error.code) ? envelope.error.code : -32000, message: 'The network could not complete this request.' } };
    let result = envelope.result;
    if (input.method === 'eth_getTransactionByHash' && result) {
        result = pick(result, ['hash', 'status', 'statusName', 'execution_result', 'txExecutionResult', 'txExecutionResultName', 'result', 'result_name', 'resultName', 'from_address', 'to_address']);
        if (envelope.result.consensus_data?.leader_receipt) {
            const rows = envelope.result.consensus_data.leader_receipt;
            result.consensus_data = { leader_receipt: (Array.isArray(rows) ? rows : [rows]).map((r) => pick(r, ['mode', 'vote', 'execution_result', 'controlCode'])) };
        }
    }
    if (input.method === 'eth_getTransactionByHash' && result) {
        const names = ['IDLE', 'AGREE', 'DISAGREE', 'TIMEOUT', 'DETERMINISTIC_VIOLATION', 'NO_MAJORITY', 'MAJORITY_AGREE', 'MAJORITY_DISAGREE', 'MAJORITY_TIMEOUT'];
        for (const key of ['result', 'result_name', 'resultName'])
            if (Object.hasOwn(result, key)) {
                const value = result[key];
                if (!(typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5) && !(typeof value === 'string' && names.includes(value))) {
                    delete result[key];
                    result.result = 'INVALID_CONSENSUS_RESULT';
                }
            }
    }
    if (input.method === 'sim_getFeeConfig' && result) {
        result = { enabled: result.enabled, policy: pick(result.policy, ['genPerTimeUnit', 'storageUnitPrice', 'receiptGasPrice', 'timeUnitOverlayBps', 'intrinsicGas', 'bootloaderOverhead', 'gasPerChangedSlot', 'calldataGasPerByte', 'fixedProposeReceiptGas', 'fixedMessageRevealGas', 'messageFeeParamsBudgetFloor']) };
    }
    if (input.method === 'sim_estimateTransactionFees' && result) {
        const p = result.recommendedPreset;
        result = { recommendedPreset: p ? { feeValue: p.feeValue, distribution: pick(p.distribution, ['leaderTimeunitsAllocation', 'validatorTimeunitsAllocation', 'appealRounds', 'executionBudgetPerRound', 'executionConsumed', 'totalMessageFees', 'rotations', 'maxPriceGenPerTimeUnit', 'storageFeeMaxGasPrice', 'receiptFeeMaxGasPrice']), messageAllocations: Array.isArray(p.messageAllocations) ? p.messageAllocations.map((a) => pick(a, ['messageType', 'budget', 'recipient', 'value', 'dataSize', 'on', 'id', 'parent', 'messageIndex', 'feeParams', 'gasLimit'])) : [] } : null };
    }
    return { jsonrpc: '2.0', id: input.id ?? 1, result };
}
