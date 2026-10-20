# Verification checkpoint

Not complete. Category Projects. Gate13 is PENDING_EXECUTION.

## Current checkpoint (supersedes the earlier browser blocker below)

Chrome browser access recovered after a tool refresh; root cause unknown.
Phase7 PASS: actual same-origin RPC check reached Studio Dev61997, OKX connection,
reload restoration and disconnect verified. See evidence/local/browser-phase7.md.
Latest full check:87 Python+20 Node+69 frontend=176 tests, lint/typecheck/build pass.
Phase8 IN_PROGRESS: exact committed source deployed with FINALIZED/SUCCESS at
0xFd64D6cD0816970CE6151aa5232cf8f4Bdf41D32; code/schema match and initial accounting
and native balance were zero. Grant/use, denial and conflict finalized with
individual native1GEN exits. Three further purchases were recovered with an
explicitly nonconforming aggregated3GEN cleanup; all6GEN were withdrawn and the
contract was empty before corrective1GEN-per-exit acceptance runs began.
An uncertainty review finalized MAJORITY_DISAGREE without applying state; the
receipt parser/proxy now distinguish that from successful materialization.
See evidence/studio-dev/RECOVERY-CORRECTION.md. Corrective recovery, browser
writes and remaining phases are pending; no completion/no-BLOCKER claim.
No public push, hosting or Portal submission has occurred.

## Verified local work

- Contract ASCII, pinned v0.3.0/runner/API family; semantic linter recognizes
  exactly one RuleWeftContract with9 writes and9 views.
- First full `npm run check` passed85 Python tests,6 Node receipt-parser tests,
  46 frontend tests, TypeScript and Vite build.
- Integration `npm run check` passed85 Python,6 Node and61 frontend tests,
  TypeScript and Vite build. No critical skips/xfails.
- Latest full `npm run check` exited0 with87 Python,6 Node and61 frontend tests:
  154 passing tests, no skips/xfails, semantic lint, TypeScript and production
  build successful. Final check record:2026-10-19T23:41:59.775Z; contract SHA256
  `a98626be9b84e28b9523a5c3f89be50de596a5114919357b2593126104955d66`.
  This includes actual independent-validator callback and prompt-containment tests.
- Real-SDK adapter tests intercept only RPC/provider I/O; all9 application
  writes reach the proper wallet boundary without raw-string account overrides.
  Exact1GEN application value is distinct from network fee reserve. These tests
  are not actual wallet signatures, external transactions or finality.
- Bounded same-origin proxy allowlists methods and projects receipt/fee fields.
  Unit tests cover time injection for fee simulation and rejection/redaction.

## Browser baseline versus integration

Before integration, the actual local app was inspected at375x812 and1440x1000:
no horizontal overflow, route navigation and missing-deployment states correct.
Installed OKX/MetaMask appeared in the centered provider picker. No account
permission or transaction signature was requested. See DESIGN.md.

During Phase7 verification, the browser tool began returning exactly:
`Local browser use is disabled in Work settings`.
The owner confirmed browser use was already enabled. A fresh control session
still returned `{"apps":[],"browsers":[],"errors":["Browsers: Error: Local browser use is disabled in Work settings"]}`.
Reading tool documentation succeeded, but listing tabs and the fresh inventory
failed. The effective service state contradicts the owner's visible setting;
the root cause is not established. No security setting was changed or bypassed.
This is an external verification blocker; it is not evidence of a frontend or
network outage. Node fetch or unit tests cannot substitute for browser-local
RPC/CORS or real browser-wallet proof. Phase7 remains OPEN and Phase8 deployment
and subsequent publication phases have not begun.

## Still required

Browser-local RPC/proxy and legal control verification; selected-network exact
source/schema/smoke; successful finalized semantic grant/denial/conflict cases;
actual GEN use/refund/withdrawal with native contract and recipient evidence;
actual primary-wallet browser journey; public allowlisted Git repository/current
CI; Vercel/live checks; original grading bot with no BLOCKER; Portal packet and
final master-prompt item-by-item audit. No deployment address or URL is invented.

No contract was deployed, no GEN transferred, no public repository pushed, no
Vercel publication or Portal submission performed at this checkpoint.

## Phase 8 verified checkpoint — 2026-10-20T01:45:22.970Z

Fresh `node scripts/evidence-summary.mjs` exit 0: passed=true, 47 transactions,
9 required terminal request states, 7 exact native exit proofs, missing=[],
received=withdrawn=9 GEN, escrow=credit=nativeBalance=0 GEN. Corrective
RETRYABLE review+retry and each 1 GEN recovery exit passed. Historical 3 GEN
cleanup remains an explicit deviation, not compliant demo evidence. Phase 8's
consequential lifecycle exit gate is verified. Full browser workflow and Gate 13
execution acceptance remain pending. Latest local check: 87 Python + 23 Node +
69 frontend = 179 tests; lint, typecheck, build passed. Phase 9 starts next.

## Phase 9 / 10 — 2026-10-20

`npm run build --workspace frontend --prefix .\rule-weft` (from parent) exited 0:
Vite built 2386 modules; TypeScript passed. Ignored frontend/.env contains the
verified deployed address. The existing large-chunk warning remains.
Chrome loaded all three actual canonical policies after reload; no CORS failure.
OKX returned 4001 on reconnect; no browser transaction is claimed.

Language audit: Python Unicode-letter scan across 38 source/README/comment files
returned non_ascii_letter_lines=[] and exit 0. App, adapter, domain, wallet and
README copy manually reviewed as natural English; punctuation and technical
identifiers remain. Phase 10 exit gate passed. Phase 11 publication follows the
staged/history allowlist and exact-secret scan; browser-write proof stays pending.

## Phase 12 build diagnosis

The first Vercel build failed with TS2307 for `viem` and `genlayer-js`:
Vercel installed the frontend workspace's declared dependencies, whereas these
runtime imports were declared only at repository root. The frontend now declares
the same pinned versions directly; no version upgrade or visual change is made.
The failed deployment is preserved as an error, not a production success:
rule-weft-genlayer-e74bt3vtq-duckys-projects-bc83c6a0.vercel.app.
Root directory frontend, Vite, npm run build, dist and the public deployed-address
environment variable are configured. Shared source outside root is enabled as
required by the workspace imports. Private env files are excluded from upload.

## API runtime regression

Production root GET returned200 with RuleWeft title and React root, but POST
/genlayer-rpc returned500 FUNCTION_INVOCATION_FAILED. The exact deployment log
identified ERR_MODULE_NOT_FOUND for extensionless frontend/rpc-proxy. The API
import now uses .js for emitted Node ESM, with a separate browser-free TypeScript
configuration. Native Node import of emitted files and GET405 passed; this
check is now part of npm run check. A READY deployment alone is not app proof.
The first public CI run39355602849 completed SUCCESS for commita1bdbee; newer
commits require their own result before a current-CI completion claim.

## Phases 12 and 13 verified — 2026-10-20T02:00:15Z

Deployment dpl_F2wareZpsiNgWBRSdQ9HmYuTJTot is READY at the resolved production
alias https://rule-weft-genlayer.vercel.app. Final function transpilation has no
missing-type errors; TypeScript is the only proxy source. Fresh curl root HEAD
returned HTTP/1.1 200 OK; body contains RuleWeft and <div id="root"></div>.
Fresh POST /genlayer-rpc eth_chainId returned HTTP200 and0xf22d. Actual Chrome
loaded three canonical policies and the Activity route. Saved hosting.json
records deployment identity, commands and superseded failures. Phase14 now
updates README and pushes verified live/contract links. Browser-wallet writes
remain pending due the selected OKX provider returning4001 on reconnect.

Exact collection count:83 direct tests +4 Python metadata tests +23 Node tests
+69 frontend tests=179, plus the emitted-API native-Node check; no critical skips.

## Browser interoperability checkpoint — 2026-10-20T02:19Z

The owner reconnected OKX successfully. Public browser wallet is
0xc495ef51618d03267a1f227afe5b27b38c748272 with33.277453182332787962GEN on Studio Dev;
no funding was needed. Chrome-native date/autofill submission regression was
reproduced RED then corrected with named controls and FormData, preserving design.
All nine UI controls now have actual submission/reload coverage alongside real-SDK
adapter tests. The safe wallet-error regression was RED then GREEN; production
messages expose only allowlisted method/error names and numeric codes.
Latest full check:83direct+4metadata+23Node+79frontend=189PASS, plus native emitted
API import, one recognized class/18methods, TypeScript/build PASS.

The next actual wallet call reached eth_sendTransaction and returned4001. No
receipt hash was observed. browser-first-write-inspection.json proves the request
absent, wallet balance unchanged, native/accounting zero liabilities, and equal
pending/latest nonce. Do not treat connection or script signing as browser write
proof. Owner has been asked to keep OKX ready and approve the actual signature.
No repeat write is sent while that handoff is pending. Form request ID is
chrome-synthetic-20261020 with a recoverable1GEN purchase and deadline09:40UTC+7.
If the deadline becomes too close before purchase, update it through the UI;
never change an already-created canonical request. No GEN was deposited by this
browser at this checkpoint.
