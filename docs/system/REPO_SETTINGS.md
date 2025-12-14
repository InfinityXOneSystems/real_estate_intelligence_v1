# Repository Settings Required for Infinity Prime

If the Infinity Prime approver workflow cannot approve PRs automatically, ensure these settings are configured:

- Actions workflow permissions: Read and write (Repository settings -> Actions -> General -> Workflow permissions)
- Allow GitHub Actions to approve pull requests (Organization or repository policy must permit Actions to approve PRs)
- Enable repository auto-merge or set required permissions for workflows to enable auto-merge
- If your organization disallows Actions from approving PRs, create a machine account or provide a Personal Access Token named `INFINITY_PRIME_APPROVER_TOKEN` with the following scopes:
  - `repo`
  - `pull_request`

After applying these settings, re-run the approver workflow or re-label the PR to trigger Infinity Prime.
