# Delivery audit â€” in progress

Category: Projects. Submission readiness remains blocked by actual browser-wallet
execution. Local tests, script-signed lifecycle and browser read proof are distinct.

## Four-source reconciliation

| Claim | Source and views | Test proof | Execution proof |
| --- | --- | --- | --- |
| Authenticated complete agreement | submit_rule/ratify, policy digest, get_policy | Sender/slot/digest/replay/immutability negatives | Two ACTIVE policies with three independent authors and three assents in canonical-summary.json |
| Payer-authored exact intent | open_request/review_request, request digest, get_request | Wrong actor/policy/request/version/value and injection tripwires | Exact1GEN requests and locked payer/action in canonical-summary.json |
| Source identity before semantic judgment | Fixed W3C URL and exact fetched-byte hash in _evaluate | Digest mismatch, unavailable source, actor-hosted-copy/provenance negatives | Successful independently fetched source/model reviews; hash and URL in source-probe and deployment identity |
| Independent semantic equivalence | _validate calls _evaluate inside run_nondet_default validator; exact normalized semantic rows | Actual independent callback/replay and malicious-output cases | Grant, denial, conflict and RETRYABLE reviews; majority disagreement is explicitly non-applied |
| Deterministic consequences | _normalize/_resolve before any settlement; get_request/can_consume | Coverage/enums/edge/grounded invariants,512 reference graphs; accounting unchanged on invalid input | USED, DENIED, CONFLICT and EXPIRED plus prior GRANTED/RETRYABLE reads |
| Recoverable purchase and native exit | recover/withdraw, get_credit/get_accounting and native balances | Wrong caller/state/time, duplicate, no double-credit/withdraw and EVM boundary | Seven exact native exit proofs; six compliant individual1GEN exits, historical3GEN cleanup deviation retained |
| All nine frontend actions | Typed adapter, contextual controls, finality and canonical reload | Real-SDK adapter tests plus UI submission/reload tests for all nine writes; boundary/role matrix | Actual Chrome canonical reads and wallet connection; signatures/lifecycle PENDING |
| Public hosting and hygiene | README and hosting.json; own child Git history | Emitted API compiles/imports as native Node ESM; production build | Public GitHub, resolved Vercel alias, root200/name/React root, proxy200/61997; current CI checked separately |

The complete Evidence Authority Matrix and write safety cards are in README.md
within this docs directory. Every consequential path above traces a matrix row
to code, negative tests, views and separately labeled execution evidence. No
claim of authenticated external execution or existing consumer adoption is made.

## Original grading bot

The unmodified parent tool was run with the actual child path, category projects,
public repository URL and actual Studio Dev Explorer. Its first full result:
0 BLOCKER,3 WARN; npm run check PASS; gltest tests/ PASS; Git root/hygiene OK;
all five machine gate items PASS. Exit1 reflected warnings, not a clean zero exit.
The rubric is a heuristic readiness estimate, not an official points award.

A later full run on the189-test tree reports0 BLOCKER,2 WARN,7 auto-verified
items; npm run check PASS; gltest tests/ PASS; five machine gate items PASS;
repository/Explorer/notes checks OK. The notes file has877 characters including
its trailing newline; the copy-ready trimmed description has876. Exit1 remains
the warning status. Actual browser signature proof is still a separate blocker.

Warnings and heuristic misses are reviewed as follows:

- Deployment evidence used structured executionResult SUCCESS; DEPLOYMENT-RESULT.md
  now records the verified human-readable Result: SUCCESS beside the actual hash.
  The grader's legacy Studionet text does not override the selected Studio Dev network.
- _plain reads attached value to reject it for nonpayable methods. The actual
  value-receiving open_request has payable metadata; AST metadata tests verify it.
- _evaluate is called from both the nested leader and sandboxed independent
  validator; no storage mutation occurs inside nondeterminism. Live reviews and
  independent-callback direct tests supplement the static nesting heuristic.
- run_nondet_default is the verified safe v0.3 custom-validator API. The old
  run_nondet spelling sought by the heuristic is not substituted to improve a score.
- localStorage stores only the selected provider name as a harmless UI preference.
  Canonical policy, requests, credit and finality come from contract views/RPC.
- SDK/React fixtures occur only in test harnesses. Production imports no fixture
  adapter or fake balances/signatures. Actual signatures are still pending.

## Browser findings and regression proof

Chrome's native date value could exist without updating React state. The original
form rejected that valid date. A focused regression failed1/29 with the deadline
validation message, then all29 UI tests passed after named form controls and
FormData submission were added. The visual design remains unchanged.

The first wallet write returned no hash. Read-only inspection found no request,
unchanged33.277453182332787962GEN wallet balance,0GEN contract native balance and
equal pending/latest nonce. Safe diagnostics then identified eth_sendTransaction
code4001. Raw provider/RPC errors are never displayed. A real-SDK regression
proves only allowlisted method/error names and a numeric code are surfaced and
an ambiguous send is not described as definitely unsent.

Latest full check:83 direct +4 Python metadata +23 Node +79 frontend=189 passing
tests, no critical skips, semantic lint (one RuleWeftContract,9 writes/9 views),
TypeScript, Vite build and emitted-API native-Node check PASS. Browser signatures
must still produce actual hashes, successful finality and canonical consequences.

## Browser purchase verified — 2026-10-20 02:37 UTC

The owner clicked the local Request for 1 GEN control and signed through OKX.
Transaction `0xf2b512c2ef659d94d707e56608b44bc79df433e0ef389ee7ac934b84849c906c`
was observed in Chrome receipt polling and independently read as FINALIZED,
execution SUCCESS, consensus agreement. The canonical payer is the selected
Chrome wallet, the request is OPEN, its reserve is1GEN, and accounting reports
received10GEN = escrow1GEN + withdrawn9GEN with credit0GEN and native balance1GEN.
See studio-dev/browser-open.json and local/chrome-open-finalized.png.
No intermediate accepted timestamp was observed for this purchase.

The automated review click again returned eth_sendTransaction code4001 without
a reference. A direct owner review/signature is pending. The evidence establishes
a real browser purchase but does not yet establish the complete browser lifecycle.
The cause of the earlier wallet rejections is not established. Do not substitute
script signatures for the missing browser steps or count the pending review as
a successful consequence.

## Receipt projection correction — current195-test tree

The owner-signed recover transaction finalized successfully as
0x21a5a2218daf8b2975c96881040af3a5055f05f02520b25477dfffb86acffef1.
Canonical state is EXPIRED, reserve0GEN, own credit1GEN. Withdrawal is pending.

A controlled comparison of this exact receipt found direct SUCCESS but proxy
ERROR: the gateway omitted the nested CONSENSUS_VALIDATOR_QUORUM_REACHED control
code. Two focused regressions failed, then8/8 proxy tests passed after projecting
only that known code and omitting arbitrary diagnostic text. The same live receipt
then passed through the corrected local proxy. No validator config is forwarded.

A separate real-SDK regression failed because an UNDETERMINED result discarded
the pending hash. Only finalized unsuccessful results now release it; bounded
waiting resumes the same hash without another signature. All14 adapter tests pass.
Three expiry-label regressions failed, then all32 UI tests passed with recovery
guidance while the canonical OPEN/RETRYABLE/GRANTED status remains unchanged.
The accepted visual design is preserved.

Current npm run check:83 direct +4 Python metadata +23 Node +85 frontend=195
passing tests, semantic lint one contract/18 methods, API native ESM import,
TypeScript and Vite production build PASS. CI and production must be refreshed
for the new source commit. Phase15 remains open for the full browser journey.
