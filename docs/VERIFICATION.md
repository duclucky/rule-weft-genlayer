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
