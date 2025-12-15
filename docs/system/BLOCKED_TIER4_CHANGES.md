# BLOCKED: Tier 4 Files Modified

This change touched Tier 4 (critical) paths and therefore requires manual approval.

Files modified by Infinity Prime run:

- .github/workflows/infinity-prime.yml
- .github/workflows/infinity-builder.yml
- .github/workflows/infinity-automerge.yml
- .github/pull_request_template.md
- .github/ISSUE_TEMPLATE/infinity-prime-regression.md
- .github/ISSUE_TEMPLATE/blocked-permissions.md
- config/credentials_registry.yaml
- config/policy.yaml

Evidence: these files were created to implement the Infinity Prime Supervisor/Builder and credential registry.

Rollback Plan:

1. Revert the above commits in a PR titled "rollback: revert Infinity Prime Tier4 changes".
2. Ensure CI runs locally for the PR and passes all gates before reapplying changes incrementally.
3. After human review, re-open or reapply minimal, well-documented changes with approval.

Action: include this file in the blocked PR and label it `blocked-approval-required`.
