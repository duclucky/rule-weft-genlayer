# Product design baseline

Phase3A design-system search: `B2B SaaS collaboration calm readable`, project
RuleWeft. The initial operations/telemetry pattern was rejected as off-topic;
the one narrower retry returned Hero + Features + CTA, Glassmorphism, a SaaS
blue/orange palette and Plus Jakarta Sans. Product category and top results
were verified against this collaboration/approval application before source.

Tokens: primary#2563EB/white; secondary#3B82F6/black; accent#EA580C/black;
background#F8FAFC, foreground#1E293B, card white, muted#E9EFF8,
muted foreground#475569, border#E2E8F0, destructive#DC2626/white,
focus ring#2563EB. Restrained14px backdrop blur for header and illustrated
policy cards. No animated telemetry, fake statistics or dark-first design.
Illustration is explicitly labeled as an example, never live state.

Preserve layout, palette, typography, page arrangement and navigation through
integration. Focused skill searches verified keyboard/modal focus states (UX,
top result Focus States) and async controlled forms/error feedback (React).
Typography is self-hosted. Mobile inputs16px; visible focus ring; named form
controls; reduced-motion override; contextual disclosure for technical details.

Baseline command `npm run check:frontend`:45 tests PASS, TypeScript PASS,
Vite production build PASS (before the additional duplicate-wallet regression).
Browser-local IAB at http://127.0.0.1:5190: home -> Policies -> Create policy
navigation confirmed; missing deployment error remained honest; actual installed
OKX and MetaMask appeared in the centered wallet picker. No connection/signature
was requested during this UI baseline check. A duplicate OKX wrapper was observed
and the discovery boundary now deduplicates extension names/providers.

375x812 create-policy check: viewport375, document scrollWidth360 (scrollbar),
one real form, visible labeled controls and persistent navigation; screenshot
inspected. 1440x1000 home check: viewport1440, scrollWidth1425, heading correct,
hero/two-column illustration and three steps visible; screenshot inspected.
Viewport override reset afterwards. Actual contract RPC/CORS and browser-wallet
write proof remain PENDING for the integration/network phases.
