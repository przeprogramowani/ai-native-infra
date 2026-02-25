# CI/CD Pipeline — Requirements

## Goal
GitHub Actions workflow to validate and publish the Extension Pack.

## Configuration
- Branch: `master` (not `main`)
- AWS region: `eu-central-1`
- CodeArtifact domain: `devs10x`
- CodeArtifact repository: `npm`
- Workflow file: `.github/workflows/ci.yml`
- Package location: `packages/ai-toolkit/` (relative to repo root)
- GitHub secrets: `AWS_ACCOUNT_ID` and `AWS_ROLE_ARN`

### OIDC Authentication
- Action: `aws-actions/configure-aws-credentials@v4`
- Role: referenced via `${{ secrets.AWS_ROLE_ARN }}`
- Required workflow permission: `id-token: write`

### Validation checks (validate job)
1. `pack.yaml` exists with required fields: `name`, `version`, `description`, `namespace`
2. Each `skills/*/SKILL.md` has YAML frontmatter with `name` and `description`
3. Frontmatter `name` matches the skill's directory name
4. `npm pack --dry-run` succeeds

### Secrets setup
```bash
gh secret set AWS_ACCOUNT_ID --body "<account-id>" --repo <owner>/<repo>
gh secret set AWS_ROLE_ARN --body "<role-arn>" --repo <owner>/<repo>
```