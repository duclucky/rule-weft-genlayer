# Selected-runtime smoke evidence

Studio Dev61997. Exact deployed source SHA256
a98626be9b84e28b9523a5c3f89be50de596a5114919357b2593126104955d66.

- `node scripts/runtime-probe.mjs` exited0: exact-source schema18 methods and
  constructor SUCCESS (unsigned, not final consensus).
- `node scripts/deploy.mjs --execute`: FINALIZED/SUCCESS; code/schema matched;
  initial accounting/native balance zero. See deployment.json.
- Actual three-author create/publish/ratify writes finalized SUCCESS before
  any application-value transaction. See tx-diagnostics-*.json.
- `node scripts/negative-smoke.mjs --execute` reconciled the existing hash
  0x3092a67ba905f434ba0b76ceab5cafddaa7fcbc7459426069d1fde1a63b48a23:
  FINALIZED/ERROR with encoded DISTINCT_AUTHORS, canonical state unchanged,
  application value0GEN. The failed execution is the intended negative result;
  it is excluded from successful consequence claims. The fee was measured with
  valid arguments to the same method; it was not an arbitrary guessed fee.

`sim_call` negative probes returned RPC-32000 with timeout markers both before
and after explicitly selecting latest-final. Those attempts are preserved in
runtime-guards*.json as failed/unavailable probes. No local root cause or network
outage is asserted. They were supplemented by the actual zero-value rejection
above; they are not silently counted as successful guard tests.

The first negative receipt parser searched plain text and did not recognize
the base64 error. A bounded allowlisted error-field decoder and regression tests
then proved the existing receipt. No negative transaction was replayed.

Direct/AST checks prove payable metadata and temporal guards. Real finalized
configuration writes and the real duplicate-author rejection supplement those
checks before the value-bearing lifecycle. Semantic consequences and native
withdrawal delivery are separately proved; this smoke does not imply them.
