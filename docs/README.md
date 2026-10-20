# RuleWeft product specification

## Identity

- Idea: IDEA-049; project RuleWeft; slug rule-weft.
- Category: Projects. Status: DELIVERY_IN_PROGRESS (Phase15 audit; browser writes pending).
- Network: Studio Dev primary, D1 fallback only after verified unavailability.
- Repository: https://github.com/duclucky/rule-weft-genlayer
- App: https://rule-weft-genlayer.vercel.app
- Studio Dev deployment and script-signed execution: evidence/studio-dev/canonical-summary.json.
- Full browser-wallet execution: PENDING_REAL_EVIDENCE; no submission-readiness claim.

## One-sentence product hook

Agree on exceptions, then request a permission everyone can verify.

## Scope

Three co-authors lock the exact wording and declared exception targets of a
small protocol policy. A requester prepays1GEN for a one-use protocol permission.
Validators interpret rule scope and exception meaning; deterministic grounded
labeling permits a request only when an ALLOW rule is in and every applicable
BLOCK rule is out. A prohibition cycle cannot grant a permission. Consumption
credits the fixed issuer; denied, conflicted or expired requests refund the payer.

These are constitutive protocol rules. No real external work, legal permission,
privacy compliance, private-data handling or ODRL conformance is attested.

## Provisional contract-capability sketch

Roles: policy creator (also first author), three distinct rule authors, fixed
issuer receiving the consumption fee, and actual paying requester. An author
may also request; the requester and fee recipient must be different for purchase.
Authors publish one rule each, review the complete slate and ratify the same
digest. Requesters buy, request review/retry, inspect the result, consume a
granted right or recover an expired purchase, and withdraw their own credits.
The creator may cancel only an incomplete expired policy with no purchases.

Minimum views: policy list/details, three rules and assent status, request
list/details, current semantic attempt/history, user credit, canonical accounting,
and current effective permission. Expected states: collecting rules, awaiting
agreement, open for requests, cancelled/expired policy; awaiting review, needs
retry, ready to use, declined, conflicting rules, used and expired/refunded request.
No write is complete until successful finalization and canonical reload.

## Product/frontend blueprint

### Human users and jobs

| User | Job | Needed decision |
| --- | --- | --- |
| Team organizer | Establish a small jointly agreed policy | Choose authors, fixed issuer and explicit deadlines |
| Co-author | Publish own rule and agree to the full slate | Check exact effects, wording and exception targets before assent |
| Requester | Get a defensible one-use approval | Understand fee, scope, result, expiry, use/refund and withdrawal |

### Information architecture and named route map

Persistent desktop header and responsive wrapped navigation: Home, Policies,
Activity, Help; wallet/account action always available. Deep links supported.

| Route | User job | Primary action | Data/states | Mobile |
| --- | --- | --- | --- | --- |
| / | Understand value and process | Explore policies | Real explanation, no invented counters or testimonials | Single-column story |
| /policies | Find a policy and its readiness | Search/open policy; create | Canonical list, search/filter, loading/error/empty | Stacked cards |
| /policies/new | Define a team agreement | Create policy | Labeled identity/authors/issuer/deadline fields, validation, submitted/finality/error | Single-column form |
| /policies/:id | Read, author and ratify rules | Contextual publish/agree/request | Exact three rules, agreed authors, deadline, status; role/state gating | Stacked rule cards |
| /requests/new?policy=:id | Describe exact action and cost | Request permission for1GEN | Policy summary, action, expiry, cost, pending/error | Summary above form |
| /requests/:id | Understand decision and act | Review/retry, use or recover | Canonical reason, plain-language rule outcomes, fee/refund, expiry/history | Primary outcome first |
| /activity | Revisit prior purchases | Filter/open request | Canonical user/all request history, empty/error/loading | Stacked rows |
| /account | Review wallet and recover own credit | Withdraw or disconnect | Selected wallet/address, canonical GEN credit, feedback | Single column |
| /help | Learn policy/fee/recovery rules | Go to policies | Real English documentation and honest protocol limits | Readable text measure |
| unmatched | Recover navigation | Return to policies | Honest not-found page | Single column |

All data pages have first-run/missing-configuration, empty, loading, success,
error with retry, and appropriate wallet/transaction waiting states. Initial
adapter must explicitly report missing deployment rather than supply fake data.
Only test harnesses may inject fixtures; production never displays them.

### Visibility matrix

| Data/action group | Visibility | Role/state | User reason |
| --- | --- | --- | --- |
| Policy title/rules/authors/agreement/expiry | USER_PRIMARY | Everyone | Know what is being bought/agreed |
| Create/publish/ratify | USER_CONTEXTUAL | Creator/assigned author in legal window | Complete own agreement task |
| Request action/status/expiry/result/fee/refund | USER_PRIMARY | Everyone; payer actions only | Follow purchase outcome |
| Review/use/retry/recover | USER_CONTEXTUAL | Actual payer and exact legal state/time | Advance or recover own request |
| Own GEN credit/withdraw | USER_PRIMARY | Connected owner | Recover accrued funds |
| Digests, raw enums, attempt IDs, transaction hashes | USER_CONTEXTUAL | Technical disclosure | Optional verification |
| Validator internals, evidence packet, grading/submission | SYSTEM_ONLY | Absent from normal UI | Not an end-user job |

### Provisional UI action matrix

| Visible control | Capability | Eligible role/state | Input/value | Finality | Recovery |
| --- | --- | --- | --- | --- | --- |
| Connect wallet | Discover/select EVM provider | Disconnected | Selected provider/accounts | No transaction | Retry/install wallet |
| Create agreement | create_policy | Creator, new ID | Three authors, issuer, dates;0GEN | Finalized success + reload | Correct fields/retry |
| Publish rule | submit_rule | Own empty author slot before deadline | Effect/text/target;0GEN | Finalized + reload | Retain form on failure |
| Agree to these rules | ratify | Named author, all rules, no own assent | Complete policy digest;0GEN | Finalized + reload | Refresh slate/retry |
| Cancel expired draft | cancel_policy | Creator, expired incomplete | PolicyID;0GEN | Finalized + reload | Refresh legal state |
| Request permission | open_request | Connected actual payer, active policy | Exact action/deadline;1GEN | Finalized + reload | No duplicate replay |
| Review / Try review again | review_request | Payer OPEN/RETRYABLE, before deadline | RequestID;0GEN | Finalized verdict + reload | Diagnose technical failure; expiry recovery |
| Use permission | consume | Payer GRANTED before deadline | RequestID;0GEN | Finalized + reload | Re-read before retry |
| Recover purchase | recover | Payer unresolved/unused after deadline | RequestID;0GEN | Finalized + reload | Re-read before retry |
| Withdraw GEN | withdraw | Owner positive credit | Own credit;0GEN attached | Finalized + canonical balance/credit | Inspect ambiguous transaction |
| Disconnect | Clear selected provider/account/client | Connected | No transaction | Immediate local UI clearing | Reconnect explicitly |

### User-facing state language

COLLECTING: Collecting rules. RATIFYING: Waiting for agreement. ACTIVE: Open for
requests. CANCELLED: Draft cancelled. OPEN: Ready for review. RETRYABLE: Review
needs another attempt. GRANTED: Ready to use. DENIED: Request declined. CONFLICT:
Rules need clarification. USED: Permission used. EXPIRED: Purchase recovered.
UNDEC labels: Unresolved exception. OUT: Overridden. IN: Effective. INACTIVE:
Outside this request. Exact values remain unchanged in the adapter/disclosure.

### Wallet/network behavior

Use EIP6963 discovery plus injected fallbacks; a centered picker lists detected
providers before accounts are requested. The selected address opens an account
menu with Account and Disconnect. Clear selection and disable writes on logout.
Switch/add the verified selected EVM chain before writes; keep IC reads on a
same-origin proxy. Adapter constructor sets normalized account; individual writes
omit raw-string account overrides. Submitted, accepted/decided, finalized, failure
and retry remain distinct; refresh canonical state after finalized success.

### Visual preservation constraints

The project-local ui-ux-pro-max engine will determine the complete product design
before frontend source. Preserve its accepted tokens, typography, components,
navigation and page arrangement through SDK integration. Restrained disclosures
hold technical detail. No reviewer console, artificial metrics or simulated value.

The full technical specification below locks the approved frontend capabilities.
Phase3B baseline passed46 frontend tests, TypeScript and Vite build. Local browser
375/1440 checks and multi-provider picker were inspected; SDK/network writes remain
pending. Integration preserves the design in DESIGN.md.

## Trust problem and seven-part fingerprint

The issuer collecting a fee and requester seeking an exception cannot privately
choose the effective policy. A deterministic engine can resolve an agreed graph;
it cannot independently settle disputed natural-language exception edges.

1. Trust: neutral interpretation of authored exception relationships before a paid permission.
2. Actors: three co-authorities, actual payer and fixed fee issuer with opposing scope/fee interests.
3. Evidence: constitutive sender-authored rules, declared targets and full-slate assent; exact signed request; bounded dated W3C vocabulary context.
4. Question: applicability and declared override meaning for every rule, independently replayed.
5. State: collect -> ratify -> immutable policy -> prepaid request -> review/retry -> grounded labels -> one use or payer recovery -> own withdrawal.
6. Consequence: skeptical permission;1GEN fixed issuer credit on use, actual payer credit on denial/conflict/expiry.
7. Reuse: policy/request/rule/attempt/permit/recover/credit API, without a mirror guard.

## Mandatory gate matrix

All fourteen rows are PASS_ADMISSION, with Gate13 PENDING_EXECUTION. The frozen
pre-admission probe ran twice in unsigned StudioDev GenVM: SUCCESS,18/18 semantic
fields each run, W3C HTTP200/181852 chars;512 deterministic grounded-reference
comparisons passed. This does not prove deployed finality or GEN movement.

| Gate | Admission decision | Basis |
| --- | --- | --- |
| Replacement | PASS | Semantic edges require independent validators; broker cannot choose final permission |
| Judgment | PASS | Meaning of action scope and claimed exceptions cannot be reduced to ID lookup |
| Evidence availability | PASS | Bounded stored terms and two fresh actual GenVM source/model simulations |
| Evidence authenticity | PASS | Complete matrix below; transactions create terms, never attest external behavior |
| Equivalence | PASS | Exact identity/coverage/enums and all semantic rows independently replayed |
| Consequence | PASS | One-use permit and fixed GEN fee/refund owned by this contract |
| Adversarial | PASS | Payer, issuer and contrary authors benefit from different interpretations |
| State model | PASS | Isolated typed entities, immutable slate, clock guards, append-only attempts, full recovery |
| Reuse | PASS | Proposed LangGraph approval middleware, OPA/Envoy adapter and DAOhaus plugin |
| Contract count | PASS | One independently responsible primitive, no mirrored consumer |
| Differentiation | PASS | Grounded defeasible graph differs from conjunctive policy quorum, attenuation and matching |
| Claim-to-code | PASS | Complete mapping below; future evidence explicitly pending |
| Full lifecycle | PASS_ADMISSION | Full purchase/judgment/use-or-refund/withdraw and browser acceptance cases; execution pending |
| Scope honesty | PASS | No legal/compliance/external-execution/adoption/ODRL-conformance claim |

## Actors, roles and incentives

| Actor | Permission | Value at risk | Incentive |
| --- | --- | --- | --- |
| Creator / author0 | Create fixed policy, own rule, own assent; cancel expired incomplete draft | Network fees; no policy purse | Favor a policy that generates purchases |
| Authors1/2 | Publish own single rule and assent to full slate | Own agreed protocol authority | Stretch restriction or exception scope |
| Requester | Pay1GEN; review, consume or recover own request | Exact1GEN reserve and network fees | Seek broader/cheaper approval |
| Fixed issuer | Receive fee only after consumption; own withdrawal | Possible unearned fee | Favor permissive outcome |

No owner can edit ratified rules, change an issuer, drain request escrow or withdraw
another wallet's credit. Three distinct nonzero author addresses are required.
Request payer must differ from the fee issuer. All addresses come from transaction
identity or immutable config, never model prose.

## State model, storage and temporal semantics

One validator-visible RuleWeftContract. Typed Policy, Rule, PermissionRequest,
ReviewAttempt and Assessment dataclasses are stored in str-keyed TreeMaps; ordered
IDs use DynArray[str]. No raw JSON is canonical storage. Views serialize typed
state for the frontend. Money uses bigint; bounded timestamps/counts sized ints.
No collection is reassigned in the constructor.

Unique public IDs match `[A-Za-z0-9-]{1,48}`. Rule keys bind policyID/R0..R2;
attempt keys bind requestID/ordinal and assessments bind attemptID/ruleID.
Canonical digest covers V1, chain ID, contract address, policy ID, exact title,
creator/issuer/authors, effects/texts/declared targets and both policy deadlines.
Request digest includes that policy digest, requestID, actual payer, exact action
and request deadline. Digests are integrity/binding checks, not substitutes for
sender authority. Immutable creation configuration binds every downstream action.

Bounds:100 policies,300 requests,3 rules per policy, rule/action text1..600
characters, title1..100, maximum5 completed technical/semantic review attempts.
Collection deadline must satisfy `now < collect < expiry`, collect at most7 days
ahead and policy expiry at most30 days ahead. Request deadline satisfies
`now + 60 <= deadline <= min(now + 86400, policy.expiry)`.

Canonical clock is the pinned runtime transaction timestamp parsed from
`gl.message.raw['datetime']`, UTC seconds. Invalid clock input rejects; no local
machine clock is used. A deadline equality is already late for authoring,
ratification, review and use; equality opens recovery/cancellation. Every public
entrypoint checks its own clock before mutation. Stale phase never permits a late
call. Withdraw is non-temporal because an accrued own-credit claim does not expire.

Policy: COLLECTING -> RATIFYING after all3 immutable rules -> ACTIVE after all3
full-digest assents. Expired incomplete COLLECTING/RATIFYING may become CANCELLED
only by creator. ACTIVE expiry prevents new purchases without a keeper call.
Request: OPEN -> RETRYABLE for technical/source uncertainty, GRANTED for skeptical
approval, DENIED or CONFLICT for authenticated substantive refusal. GRANTED -> USED
only by unexpired payer consumption. OPEN/RETRYABLE/GRANTED -> EXPIRED by payer
at/after deadline. DENIED/CONFLICT/USED/EXPIRED are terminal, reserve0GEN. No review
or recovery can settle twice. Each review attempt is append-only; current attempt
is read dynamically, never hardcoded to1. A rejected transaction mutates nothing.

## Write-method safety matrix

### Frontend lifecycle coverage matrix

| Canonical state | User action | Contract write | UI component | Frontend test | Evidence status |
| --- | --- | --- | --- | --- | --- |
| New policy | Create agreement | create_policy | NewPolicy/ProductForm | App create form/detail + real-SDK wrapper tests | Browser write pending |
| COLLECTING | Publish own rule | submit_rule | PolicyDetail/ProductForm | App own-slot form/reload + real-SDK wrapper tests | Browser write pending |
| RATIFYING | Agree to full slate | ratify | PolicyDetail/WriteButton | App exact-digest assent/reload + real-SDK tests | Browser write pending |
| Expired incomplete policy | Cancel draft | cancel_policy | PolicyDetail/WriteButton | App expired-draft control/reload + real-SDK tests | Browser write pending |
| ACTIVE | Pay for request | open_request | NewRequest/ProductForm | App purchase/detail + real-SDK exact1GEN sender/value tests | FINALIZED SUCCESS; browser-open.json |
| OPEN/RETRYABLE | Review/retry | review_request | RequestDetail/WriteButton | App review/reload/error tests PASS, temporal actions PASS | Browser write pending |
| GRANTED | Use once | consume | RequestDetail/WriteButton | App legal control/reload + temporal/role + real-SDK tests | Browser write pending |
| Expired OPEN/RETRYABLE/GRANTED | Recover purchase | recover | RequestDetail/WriteButton | App control/reload + exact-boundary/role + real-SDK tests | FINALIZED SUCCESS; browser-recover.json |
| Positive own credit | Withdraw | withdraw | Account/WriteButton | Own-credit adapter call/reload test PASS | Browser write and native delivery pending |

All nine rows have wrapper/control/test/finality/reload paths. UI and real-SDK
tests intercept external I/O in an explicitly labeled test harness; they do not
establish actual browser-wallet signatures or a browser lifecycle.

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| create_policy | Creator, also author0 | New policy ID | Existing ID | now < collect_deadline < expiry, bounded horizon | Duplicate rejects | Nonpayable,0GEN | list/get_policy | duplicate, bad authors, invalid deadlines, attached GEN |
| submit_rule | Exact assigned author | COLLECTING, own slot empty | Filled slot, ratified/active/cancelled | now < collect_deadline | Duplicate rejects | Nonpayable,0GEN | policy/rule | wrong author, overwrite, invalid target/effect, all three boundary points |
| ratify | Exact named author | All3 rules frozen, RATIFYING | Incomplete, cancelled, duplicate, wrong digest | now < collect_deadline | One assent per author | Nonpayable,0GEN; third assent activates | policy/rule | wrong actor/digest, early/late, stale phase, overwrite |
| cancel_policy | Creator | Incomplete COLLECTING/RATIFYING | ACTIVE/CANCELLED | now >= collect_deadline | Duplicate specified no-op | Nonpayable,0GEN; no purchases yet | policy | wrong actor, premature, active, duplicate, stale phase |
| open_request | Actual payer | New request ID, ACTIVE policy | Existing ID, unratified/expired policy | now < request_deadline <= policy.expiry; minimum bounded window | Duplicate rejects | Exactly1GEN becomes request escrow | list/get_request/accounting | wrong amount/value, digest, ID, deadline and inactive policy |
| review_request | Actual payer | OPEN/RETRYABLE | GRANTED/USED/DENIED/CONFLICT/EXPIRED | now < request_deadline; bounded append-only attempts | Only retryable may repeat | GRANTED retains1GEN; DENIED/CONFLICT credits payer once; technical failure retains escrow | request/attempt/accounting/credit | wrong caller/state/time, malicious normalized fields/edge, source/digest/provenance, duplicate settlement |
| consume | Actual payer | GRANTED | Every other state including USED | now < request_deadline | Second consume rejects | Debit1GEN request escrow; credit fixed issuer1GEN once | request/permit/accounting/credit | wrong caller, equality/late, duplicate, invalid status, unchanged ledger |
| recover | Actual payer | OPEN/RETRYABLE/GRANTED | USED/DENIED/CONFLICT/EXPIRED | now >= request_deadline | Second recovery rejects | Debit1GEN request escrow; credit actual payer1GEN once | request/accounting/credit | premature, wrong caller/state, stale phase, duplicate, no double credit |
| withdraw | Owner of nonzero credit | Positive own credit | Zero credit | N/A, own accrued claim has no expiry | Zero/duplicate rejects | Debit own credit first; EVM recipient emits exact native GEN; received=escrow+credits+withdrawn | credit/accounting | wrong ledger owner, zero/duplicate, no overdraw, exact EOA boundary and native exit |

## Evidence Authority Matrix

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Policy rule is an agreed constitutive protocol term | Stored rule/effect/declared target plus full-slate assent | Named author can write own slot before ratification only | Actual transaction sender for that assigned authority; all3 assent to complete digest | Exact sender/slot, valid enum/target, length, no self-target, recompute full policy digest; all3 ratification hashes match immutable slate | Contract/chain namespace, unique policyID, fixed author index, rule ID, V1, complete objective and fixed fee recipient in locked config | Transaction clock before collection deadline, single write per slot; duplicate policyID/assent rejects | Applicability and claimed exception semantics only; prose cannot change role/effect/target/amount/destination | Invalid origin reverts before mutation; no review; technical missing source RETRYABLE | Permit creation/consumption, fee credit, denial settlement | Same valid bytes/hash via wrong sender, policy, rule, author, version or stale time; injected recipient/effect instructions leave escrow and authority unchanged |
| Exact requested action is payer's protocol intent | Canonical request text and payable1GEN sender | Actual requester | Actual payer transaction | Exact1GEN, active ratified policy digest, unique request ID, bounded text, clock; no supplied external receipt | RequestID, policyID/version/digest, payer, fixed issuer, action digest | One request identity; request/review/recovery windows enforced inside each write; no replay | Judge intended action meaning only, never whether already executed | Bad binding/value rejects; technical review failure RETRYABLE | All permit, consumption and fee settlement paths | Hash-valid action under wrong policy/request/actor/version, duplicated ID, stale/future window, artifact instruction to redirect fee: unchanged accounting/hard state |
| Public vocabulary context is the actual fixed W3C publication | Validator-fetched dated W3C ODRL content | W3C; requester cannot choose URL | Exact https://www.w3.org/TR/2018/REC-odrl-model-20180215/ | Fixed URL/domain, HTTP200, bounded content, date/title and exact content hash if production pins one | Locked source version/context identity; cannot override agreed resolver | Immutable dated version; digest recomputed from exact fetched representation if stored | Vocabulary only; never proof of external permission, legality or work | RETRYABLE on required-context acquisition mismatch; no consequence | All semantic review consequences | Stable actor-hosted copy with correct digest fails source authority; wrong dated path, digest mismatch or injected instruction cannot alter canonical policy |

## Evidence policy and consensus design

W3C dated URL `https://www.w3.org/TR/2018/REC-odrl-model-20180215/` is vocabulary
context, not an authority to invent external compliance. Acquisition inside every
leader and validator review requires HTTP200, bounded300000 bytes, expected dated
publication identity and a source hash pinned from exact fetched bytes before
deployment. The same exact bytes are hashed before extraction or model judgment;
mismatch/404/timeout/unavailable source yields RETRYABLE with no GEN or rights
change. A claimant cannot supply another URL, signature, screenshot or receipt.

Verified local acquisition `node scripts/source-probe.mjs`: HTTP200,181875 raw
bytes, SHA256 af187a2c26b2429a579039403f34d9a5d5f29a1e01019662043068fa1ca2beaa.
This is the V1 exact-byte context pin; it is not an authenticity proof for any
external action. The runtime source fetch was separately demonstrated during
unsigned admission; production review must still enforce this exact hash.

Each review captures all bounded locked state before entering the nondeterministic
block. It does not read storage from a leader/validator closure. Objective gates
check role, immutable policy/request digest, exact expected IDs/target/effect,
deadline, attempt bound and source identity. Rule/action body is untrusted data;
prompt includes canonical authority/IDs/targets separately. Instructions in prose
cannot change amounts, destinations, effect, target, expected IDs or resolver.

Leader output schema: `{request_id, policy_digest, rules:[{id, applicability,
exception}], reason}`. Exactly3 rules, each expected ID once. Applicability is
APPLIES/NOT_APPLICABLE/UNCLEAR; exception is OVERRIDES/NO_OVERRIDE/UNCLEAR. Lazy
transport/JSON string/fenced JSON may be normalized; unknown metadata is ignored.
Missing/extra/duplicate IDs, invalid enums, wrong identity or impossible edge
meaning reject before mutation. Rationale is bounded and not consensus-critical.

Independent validator re-fetches the exact source, reruns semantic judgment and
compares the complete normalized critical fields. It rejects a non-Return leader,
invalid settlement meaning or different semantic classification. Sandboxed
`gl.vm.run_nondet_default` is required; plain unsandboxed run_nondet is forbidden.
UNDETERMINED never becomes a finalized application outcome. The client inspects
receipt and canonical request before retry; no automatic repeat of uncertain writes.

### Settlement invariants

| Input/consequence | Required deterministic invariant | Invalid behavior |
| --- | --- | --- |
| Authority | Author slots and full policy/request digests match locked state; exact source URL/hash verified before LLM | Revert or technical RETRYABLE, no permission/GEN movement |
| Coverage | ExactlyR0/R1/R2 once; exact request/policy identity; valid enums | Revert before attempt or financial mutation |
| Declared overrides | Edge only to the canonical nonself target; source and target APPLIES; empty target always NO_OVERRIDE | Revert, unchanged reserve/credit/rights |
| Grounded labels | Code computes unique fixed point on applicable graph; no IN attacks IN; OUT requires an IN attacker; remaining nodes UNDEC | No model-supplied label trusted |
| Permit | At least one ALLOW IN and every applicable BLOCK OUT | DENIED or substantive CONFLICT, never grant from an unresolved prohibition |
| Technical UNCLEAR | No hard outcome or money allocation derived from incomplete semantics | RETRYABLE, reserve unchanged |
| Amount/destination | Exactly1GEN, immutable issuer on use or actual payer on denial/conflict/expiry; no residual, split, fine, or model amount | Reject invalid accounting before mutation |

Root/class and downstream relation requirements apply through the grounded graph:
every OUT node has a real incoming edge from IN; no label may be injected without
its validated semantic relation. An odd/even attack cycle without external defense
stays UNDEC. All output labels and consequences are derived in deterministic code.

## Reusable public interface

Writes (all return None): create_policy(id,title,author1,author2,issuer,collect,expiry),
submit_rule(policy_id,slot,effect,text,target), ratify(policy_id,digest),
cancel_policy(policy_id), payable open_request(id,policy_id,action,digest,deadline),
review_request(id), consume(id), recover(id), withdraw(). Only open_request is
payable. Every other method explicitly rejects attached value, supplementing metadata.

Views (JSON-encoded typed projections or exact decimal GEN strings): list_policies(),
get_policy(id), get_rule(policy_id,slot), list_requests(), get_request(id),
get_attempt(id,ordinal), get_credit(owner), get_accounting(), can_consume(id,owner).
List projections use bounded known entity caps. No consumer contract is needed.
Future external adapters must actually enforce final permission and authenticate
consumer, policy/request digest, expiry and one-time consumption at their boundary.

## Consequence and value destinations

| State/result | Permission | Reserve/credit destination | Duplicate/late behavior |
| --- | --- | --- | --- |
| OPEN/RETRYABLE | None | Actual payer1GEN remains request reserve | Before deadline retry at most5 completed attempts; after deadline payer recovers |
| GRANTED | Payer's one-use right until deadline |1GEN remains reserve until use or expiry | Late use rejects even with stale GRANTED |
| USED | Consumed exactly once | Fixed issuer1GEN credit | Second use/recovery/review rejects |
| DENIED/CONFLICT | None | Actual payer1GEN credit immediately | No further allocation or recovery |
| EXPIRED | None | Actual payer1GEN credit once | Duplicate recovery rejects |
| Withdraw | Does not change request decision | Credit owner receives exact native GEN via EVM interface | Debit ledger first; zero/duplicate rejects |

Global invariant: received = request_escrow + total_credit + withdrawn; every
component nonnegative, no credit without a matching reserve debit, no two terminal
allocations per request. Nonpayable policy methods hold no purse. No value can
remain orphaned because an author or requester skipped a later step: policy drafts
are unpaid and a paid requester independently recovers unresolved/unused funds.
No forfeiture, bond, penalty, fee split, dust or rounding remainder exists.

The contract applies consensus-owned state within the transaction; frontend and
public proofs require successful finalized receipts and LATEST_FINAL canonical
reads. EOA withdrawals use an `@gl.evm.contract_interface` recipient, never
gl.chain.Account transfers. External messages do not accept an on-stage option;
verify parent result, child delivery and exact native contract-balance decrease
plus recipient evidence. Cleared internal credit alone is not transfer proof.

## Threat model and executable test plan

| Threat | Mitigation | Required cases |
| --- | --- | --- |
| Wrong author/payer, forged provenance | Runtime sender and immutable author/request identity; full-digest assent | Wrong sender, actor, objective, policy, rule, request, version; matching bytes/hash cannot bypass |
| Rewrite or replay | One immutable rule per slot, unique IDs and assent/terminal guards | Duplicate/overwrite/assent/review/use/recover/withdraw; independent entity isolation |
| Prompt injection | Objective gates first; canonical effect/target/destination separate; complete replay | Artifact asks to change authority, enum, expected IDs, recipient, payment or policy |
| Malicious leader | Independent semantic replay and strict meaning normalization | Same shape/different critical fields; non-Return; malformed/fenced/noisy output |
| Bad settlement graph | Exact coverage and edge/grounded invariants | Missing/extra/duplicate IDs; invalid enums; wrong target; inactive source/target; impossible OUT/root/downstream relation; unchanged accounting |
| Late calls in stale phases | Entrypoint-local transaction clock | boundary-1/equality/+1 for create/submit/ratify/cancel/open/review/consume/recover; rejected state/accounting unchanged |
| Source unavailable/altered | Fixed authoritative URL, bounded exact-byte hash before LLM |404/timeout/malformed identity/oversize/hash mismatch/actor-hosted hash-valid copy -> no consequence |
| Value loss/double exit | Exact payable amount, reserve/credit invariant, own withdrawal |0GEN/2GEN on1GEN request, nonpayable value, duplicate settlement, wrong actor/state, terminal methods, EVM boundary/native debit |
| Browser incompatibility | Real-SDK adapter regression and local/live browser proof | Provider discovery/dedupe/selection, chain switch/add, address validation, constructor account, logout,1GEN encoded wallet write, finality/error/retry/reload/CORS |

Direct tests are supplemented by AST/payability checks, validator replay tests,
raw/normalized receipt-parser fixtures, exact-source schema/lint/smoke and selected
D1 live consensus. Critical paths cannot be skipped/xfail. Simulator mocks must be
installed as a bare dict before nondeterministic gltest transactions. No local
test or simulation is labeled as network finality or actual transfer.

## Claim-to-code matrix

| Claim | Contract method/state | View/read | Test | Network evidence |
| --- | --- | --- | --- | --- |
| Whole-policy agreement | submit_rule/ratify, locked digest/assent | get_policy/get_rule | Role/digest/replay/immutability | tx-diagnostics-rule*/ratify*, lifecycle.json and canonical-summary.json |
| Neutral exception semantics | review_request, attempts/assessments | get_request/get_attempt | Independent replay, all enums, injection, source/auth failures | grant-review.json, denial-review.json, bounded-retry-review.json; failed disagreement preserved separately |
| Cycle-safe skeptical approval | Deterministic grounded labels and GRANTED | can_consume/get_request |512 reference graphs plus chain/block/cycle/invariants | lifecycle.json and canonical-summary.json grant/denial/conflict |
| One-use paid permission | consume, USED | get_request/can_consume | Wrong actor/time/state/duplicate | tx-synthetic-consume.json, exit-issuer-use-fee.json |
| Every purchase recoverable | recover/denial/conflict | get_credit/get_accounting | All terminal/retry/expiry paths, stale-phase boundaries | recovery-acceptance.json and zero-liability canonical-summary.json |
| Native GEN exit | withdraw | credit/accounting plus RPC balances | Own credit, duplicate and EVM boundary | exit-*.json exact native debit/recipient checks; historical3GEN cleanup explicitly nonconforming |
| Complete product workflow | Typed adapters/UI for all9 writes | Canonical policy/request/history/credit | Route/control/role/finality/SDK tests | Pending browser-wallet primary journey; peer script proof labeled separately |

## Deployment, evidence and exact Definition of Done

Use one coherent pinned runner/header/API family, lint/direct/metadata/receipt
checks, Python3.12 .venv and PYTHONUTF8=1. Exact runner is frozen after semantic
validation and bounded target smoke, not swapped because another hash is newer.
Record network, chain ID, source commit/hash, Depends/API and actual address.
Read-only inspect precedes every write; scripts resume known hashes/state and
never blindly redeploy or replay payments. Distinguish submitted, accepted,
finalized and execution SUCCESS. Save only safe allowlisted receipt fields.

Demo: use existing authorized distinct EOAs; role0 may also be requester and fee
issuer is a different EOA. Run chain approval/use/issuer withdrawal, undefeated
block/payer withdrawal, substantive cycle/payer withdrawal and unresolved/unused
expiry recovery. Every actual purchase/funding uses1GEN or2GEN. Before an
ambiguous transfer retry, inspect hash and recipient balance. No faucet/new wallet.
Evidence: docs/evidence/studio-dev, or separately verified D1 fallback studionet;
local tests stay docs/evidence/local. No mixed network identities.

Projects completion requires all nine browser wrappers/controls/tests/finality/
reload paths, actual primary-wallet browser lifecycle, successful deployed
judgment/consequence/withdrawal and balance proof, full npm run check, original
grading bot with no BLOCKER, clean allowlisted public Git/history and current CI,
verified Vercel production app, English claims aligned with source/tests/evidence,
copy-ready Portal packet and final audit. Authenticated Portal requirements are
checked at submission time; no acceptance/score is invented. Every pending item
stays pending until the exact command/receipt/view/browser proof exists.

## Analogue/differentiation and adoption path

PolicyQuorum combines all conditions; RuleWeft computes a defeasible grounded
extension. GrantLattice attenuates parent authority; no ancestry/delegation exists
here. ConcordBatch allocates compatible slots; RuleWeft has no matching, winner
or capacity. ConsentDelta computes affected-party amendment consent; our policy is
immutable before requests. CycleWarrant rotates existing owners; no exchange
occurs here. Nearest overlaps are authenticated constitutive text and generic
permission interfaces, not four matching fingerprint dimensions. OPA/ODRL engines
provide deterministic combining logic, not validator consensus on disputed prose.
No global novelty or compliance certification is asserted.

Proposed first consumers are LangGraph approval middleware, OPA/Envoy external
authorization and DAOhaus proposal plugins via the public request/permit views.
They are proposals, not users. After an acceptedV1, a substantial milestone is a
real authenticated agent-tool gateway enforcing exact finalized permits at its
actual write boundary, including expiry, revocation, replay and live proof.

## Kill criteria and honest limitations

Return to design if a backend decides edges, validators compare only shape,
source authentication is missing, policy prose can change authority or funds,
the permission is merely a write-only log, actual use can ignore final state,
value lacks independent payer recovery, or four material fingerprint dimensions
collide with existing work. No larger frontend compensates for a failed gate.

V1 is a three-rule constitutive protocol on a resettable development network;
not a legal/compliance oracle, proof of real external execution, private-data
system, general ODRL interpreter, adopted gateway or audited production system.
Model/finality/value and public hosting have separate verified evidence. Full
browser-wallet execution remains PENDING. Admission does not become complete
Projects PASS_EXECUTION until that primary user journey is proven.
