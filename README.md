# RuleWeft

Agree on policy exceptions before buying a one-use protocol permission.

RuleWeft is being built for the GenLayer Projects track. Three authors ratify
exact rules, validators interpret their applicability and declared exceptions,
and deterministic grounded labeling resolves which rules remain effective.
Unresolved prohibition cycles never authorize a request.

Status: deployed on Studio Dev; full delivery is in progress. The latest
`npm run check` passed 87 Python, 23 Node and 79 frontend tests (189 total), plus
semantic lint, TypeScript and production build. Grant/use, denial, conflict,
retry and expiry have finalized with real native GEN exits. Fresh reconciliation
finds 47 lifecycle transactions, 9 expected request states, 9 GEN received and
withdrawn, and 0 GEN native balance, escrow and credit. These are local and
script-signed network results, not CI or browser-write proof.
No external execution, legal permission, ODRL conformance or adoption is claimed.

Chrome RPC/CORS, OKX connection, restoration and logout have been verified.
Actual browser-wallet writes remain pending. The deployed
contract is0xFd64D6cD0816970CE6151aa5232cf8f4Bdf41D32. See
[verification](docs/VERIFICATION.md), [preserved recovery corrections](docs/evidence/studio-dev/RECOVERY-CORRECTION.md)
and [specification](docs/README.md).

## Live App

[Open RuleWeft](https://rule-weft-genlayer.vercel.app)
· [Public repository](https://github.com/duclucky/rule-weft-genlayer)
· [CI runs](https://github.com/duclucky/rule-weft-genlayer/actions)

Verified root HTTP 200, RuleWeft title, React root, and production proxy HTTP 200
with Studio Dev chain ID 61997. Actual Chrome loads canonical policies/history.
This is live read proof; browser signatures and their lifecycle remain pending.

## Deployed Contract

Exactly one application contract, `RuleWeftContract`, on Studio Dev (61997).

[Contract Explorer](https://explorer-studio-dev.genlayer.com/address/0xFd64D6cD0816970CE6151aa5232cf8f4Bdf41D32)
and [deployment identity](docs/evidence/studio-dev/deployment.json).
The [canonical summary](docs/evidence/studio-dev/canonical-summary.json) includes
receipt hashes and canonical views; [recovery proof](docs/evidence/studio-dev/recovery-acceptance.json)
includes actual native balance checks.

## Run locally

Use Node.js 22 or newer and Python 3.12 on Windows. Versions are pinned.

```powershell
npm ci
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.lock
Copy-Item frontend/.env.example frontend/.env
npm run check
npm run dev
```

Open `http://127.0.0.1:5190`. Select an installed EVM wallet in the centered
picker. IC reads use a bounded same-origin proxy; signatures use the selected
provider on Studio Dev. Requests reserve **1 GEN**, with network fees quoted
separately. Never put keys in frontend environment variables.

The app covers policy creation, author publication/ratification, requests,
review/retry, one-time consumption, expiry recovery, history and own withdrawal.
Controls follow canonical state and caller role. Actual browser-write evidence
remains pending; real-SDK regression tests do not substitute for signatures.

## Deployment and reconciliation

Keep three distinct authorized role keys only in an ignored local `.env` as
`RULEWEFT_AUTHOR0_PRIVATE_KEY`, `RULEWEFT_AUTHOR1_PRIVATE_KEY` and
`RULEWEFT_AUTHOR2_PRIVATE_KEY`. Existing workspace key names are also supported.
Read saved journals and canonical state before any execution.

```powershell
node scripts/inspect.mjs
node scripts/runtime-probe.mjs
npm run check
# Commit the verified source before deploying a new revision.
node scripts/deploy.mjs --execute
node scripts/lifecycle.mjs --execute
node scripts/recovery.mjs --execute
node scripts/evidence-summary.mjs
```

Scripts resume saved transaction hashes and do not redeploy a finalized revision.
Historical IDs and deadlines are fixed campaign fixtures; a fresh campaign needs
reviewed future deadlines and a distinct deployment identity. Do not replay the
completed campaign blindly. Native exits require exact contract balance decreases.

## Architecture and reuse

The contract owns authenticated authorship, immutable policy state, bounded
validator interpretation, deterministic grounded labels and GEN accounting.
The React frontend uses its views and wallet writes; there is no backend judge
or pass-through consumer contract. Integrators use `get_policy`, `get_request`
and `can_consume`. LangGraph, OPA/Envoy and DAOhaus integrations are proposals,
not adopters. The specification maps claims to writes, views and negative tests.

## Honest limits

Three-rule constitutive protocol on a resettable development network. No external
execution, legal permission, privacy compliance, ODRL conformance, production
audit or adoption is proven. A real semantic disagreement did not apply state.
One historical 3 GEN aggregate cleanup exceeded the 1–2 GEN demo bound and is
retained explicitly; corrected acceptance exits each use 1 GEN. A bundle-size
warning remains. The next substantial milestone is an authenticated agent-tool
gateway enforcing finalized permits at its actual external write boundary.
