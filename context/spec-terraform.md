# Private npm Registry — Requirements

## Goal
Create AWS infrastructure for a private npm registry using Terraform.

## Architecture
AWS CodeArtifact with two-repository pattern:
- `npm` repo: our private packages (scoped @10xdevs/*)
- `npm-store` repo: proxy to public npmjs.com with external connection
- `npm` has `npm-store` as upstream → one endpoint for everything

## Requirements
- Terraform >= 1.10 with S3 remote state
- Use native S3 locking (use_lockfile = true) — NO DynamoDB needed
- KMS encryption for the CodeArtifact domain
- Three-layer IAM: domain policy, repo policy, attachable managed policy
- All resources tagged (Project, ManagedBy)
- Outputs with pre-built login commands for convenience

## Constraints
- Domain name must start with lowercase letter (CodeArtifact requirement)
- S3 state bucket must be bootstrapped manually before terraform init
- Expected deploy time: ~39 seconds
