# Open Decisions & Recommended Defaults

This document captures key open decisions and our recommended defaults for v1.0 → v1.5 work.

1. CHAIN_MODE default
- Decision: whether on by default. Recommendation: default `disabled` in `.env` to avoid accidental on-chain actions; require explicit `CHAIN_MODE=testnet` to enable Sepolia interactions.

2. Escrow persistence
- Decision: default persistence for escrows. Recommendation: add `PERSIST_ESCROWS=true` by default to ensure canonical persisted state; add migration and backfill scripts.

3. Deal Room schema
- Decision: schema choices (flat vs normalized). Recommendation: normalized `deals` with references to `properties`, `escrows`, `agents` and append-only `legal_events` for auditability.

4. RAG persistence
- Decision: Firestore vs managed vector DB. Recommendation: keep Firestore for v1 PoC, monitor growth and migrate to Vertex/Pinecone beyond ~10k vectors.

5. RBAC rollout
- Decision: when to flip from API-key to role-based auth. Recommendation: enable roles (seller,buyer,legal,ops,admin) behind feature-flag and start with `ops/admin` enforcement for sensitive endpoints.

6. Contract evolution policy
- Decision: API/contract changes must be cross-referenced with `/frontend_contract` and require a CI gate. Recommendation: implement schema contract checks in CI (Phase 3).

7. Deployment of smart contract
- Decision: when to deploy to Sepolia or Mainnet. Recommendation: use Sepolia for test flows after CHAIN_MODE testnet staging; mainnet only after audit and business approval.

8. Infinity Prime auto-approval defaults
- Decision: whether SAFE Tier changes can be auto-approved by CI. Recommendation: allow zero-human auto-approval for Tier < 4 when all required checks pass and risk gate heuristics determine SAFE. Workflows: add `labeler.yml` and `approver.yml` (pull_request_target) to apply labels and perform approval+automerge. Fall back: if workflow lacks approval permission, create a `blocked-permissions` issue requesting `INFINITY_PRIME_APPROVER_TOKEN` with `repo` and `pull_request` scopes.
