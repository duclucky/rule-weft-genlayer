# Preserved recovery failures and corrective acceptance runs

The first uncertainty request (`unclear-scope`) did not achieve semantic agreement.
Its transaction7b272e...1d70 reached UNDETERMINED and then FINALIZED, with
`result=2 / MAJORITY_DISAGREE` despite a leader FINISHED_WITH_RETURN. Canonical
state stayed OPEN with0 review attempts. Distinct normalized leader outputs
differed on the R1 override while R2 remained UNCLEAR. This is not a source outage
and is not counted as a finalized successful judgment. No retry was broadcast.

The original receipt interpreter omitted consensus result. Regression tests now
require consensus agreement when result fields are present; the browser proxy
preserves only validated consensus enums. Existing evidence is corrected, with
the prior interpretation retained for audit. Contract source is unchanged.

All three purchases in the initial recovery batch were subsequently recovered.
Their3GEN credits were mistakenly aggregated into one native withdrawal3GEN.
The exact3GEN debit and recipient increase are preserved in
exit-recovery-withdraw-3.json; no GEN remains from that batch. This transaction
exceeded the requested1-2GEN demo amount and is an explicitly nonconforming
diagnostic cleanup, not the acceptance proof for compliant recovery withdrawals.

The operator script now withdraws and proves the native exit immediately after
each recovery, with a regression-enforced1-2GEN bound. Corrective acceptance
cases use separate1GEN purchases and individual1GEN withdrawals:
expiry-open-v2, unused-grant-v2, and unclear-internal-entry. The last case uses
the existing internal-view rule and a single unknown data type, avoiding the
previous request's competing exception interpretation. The previous failure is
retained as a limitation; the validator predicate is not weakened.

The local cumulative purchase budget is revised from8GEN to12GEN to permit
these corrective test runs. The5GEN fee ceiling and per-purchase1GEN bound remain.
This is recycled Studio Dev test value in existing authorized EOAs, with every
deposit and exit recorded; no faucet, new wallet or mainnet funds are used.

This document records the correction plan. Actual corrected acceptance results
must appear in recovery-acceptance.json and fresh canonical-summary.json before
completion is claimed. Original uncertain-review or cleanup records are not
silently deleted or relabeled as successful compliant demonstrations.

## Verified corrective results

`node scripts/evidence-summary.mjs` exited 0 at 2026-10-20T01:45:22.970Z:
47 lifecycle transactions reconciled; 9 expected request states present; seven
native exit proofs passed, including six compliant individual 1 GEN exits and
the explicitly nonconforming historical 3 GEN cleanup. All three corrective
expiry cases ended EXPIRED. The internal-entry review and bounded retry both
applied RETRYABLE before expiry. Received 9 GEN, withdrawn 9 GEN, escrow 0 GEN,
credit 0 GEN, native contract balance 0 GEN. No missing case. See
canonical-summary.json and recovery-acceptance.json. This verifies the corrected
acceptance flows; it does not erase the historical deviation or disagreement.
