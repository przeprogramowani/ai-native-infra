# CI/CD Pipeline — Requirements

## Goal
GitHub Actions workflow to validate and publish the Extension Pack.

## Two jobs:

### Validate (all PRs and pushes to master, no AWS needed)
- Check pack.yaml structure (required fields: name, version, description, namespace)
- Check each SKILL.md has frontmatter with name + description
- Verify frontmatter name matches directory name
- Run `npm pack --dry-run`

### Publish (push to master only, after validate)
- OIDC authentication with AWS (no long-lived secrets!)
- Login to CodeArtifact
- `npm publish`

## Key requirements:
- `permissions: id-token: write` for OIDC
- Use `aws-actions/configure-aws-credentials@v4`
- Secrets: AWS_ACCOUNT_ID and AWS_ROLE_ARN
- Inline Node.js validation (no external tools needed)
- Branch: `master` (not `main`)
