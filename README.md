# AI-Native Infrastructure

End-to-end pipeline for distributing AI artifacts (skills, rules, commands) across a development team — built entirely with AI assistance.

This repository accompanies the **"Od chaosu do AI-Native Infrastructure"** webinar, demonstrating how to go from "50 developers, 50 different prompts" to a standardized, version-controlled AI toolkit with private registry and CI/CD.

## What We Build

| Step | Component | Description |
|------|-----------|-------------|
| 1 | **Agent Skill** | A code review skill (`SKILL.md`) based on team conventions, following the [Agent Skills Open Standard](https://agentskills.io) |
| 2 | **Extension Pack** | An npm package (`@10xdevs/ai-toolkit`) bundling skills, commands, and AI rules with smart installation |
| 3 | **Private Registry** | AWS CodeArtifact provisioned via Terraform — a managed npm registry with two-repo pattern |
| 4 | **CI/CD Pipeline** | GitHub Actions workflow with OIDC auth for automated validation and publishing |
| 5 | **Team Installation** | One-command setup for any developer, in any project type |

## Architecture

```
Team Conventions          Private Registry (AWS CodeArtifact)
       │                         ▲            │
       ▼                         │            ▼
  Agent Skill ──► Extension Pack ──► npm publish    npm install / npx install
  (SKILL.md)     (pack.yaml)     │                         │
                                 │                         ▼
                            CI/CD Gate              .claude/skills/
                         (GitHub Actions)           .claude/commands/
```

### Two Installation Modes

- **JS/TS projects**: `npm install @10xdevs/ai-toolkit` — postinstall creates symlinks
- **Any project** (Python, Go, Rust...): `npx @10xdevs/ai-toolkit install` — copies files, no `package.json` needed

Both modes install into the project's `.claude/` directory and track state via a manifest for clean uninstall.

## Repository Structure

```
context/
  conventions.md        # Team engineering conventions (input for skill creation)
  spec-skill.md         # Requirements: Agent Skill
  spec-pack.md          # Requirements: Extension Pack
  spec-terraform.md     # Requirements: Terraform registry
  spec-cicd.md          # Requirements: CI/CD pipeline
packages/ai-toolkit/    # The Extension Pack (npm package)
  pack.yaml             # Pack manifest
  skills/code-review/   # Code review Agent Skill
  install.js            # Dual-mode installer (symlink/copy)
  bin/cli.js            # CLI for npx usage
skills/                 # Project-level skills
terraform/              # IaC for AWS CodeArtifact registry
.github/workflows/      # CI/CD pipeline
```

## Git Checkpoints

The repo has tagged branches for each stage of the build, so you can jump to any point:

| Branch | State |
|--------|-------|
| `master` | Starting point — specs and conventions only |
| `checkpoint-1-cr-skill` | Agent Skill created |
| `checkpoint-2-extension-pack` | Extension Pack packaged |
| `checkpoint-3-terraform` | Terraform registry configured |
| `checkpoint-4-cicd` | CI/CD pipeline added |

## Key Technologies

- **Agent Skills** — open standard for AI tool extensions ([agentskills.io](https://agentskills.io))
- **AWS CodeArtifact** — managed npm registry with two-repo pattern (private + public proxy)
- **Terraform** (>= 1.10) — IaC with S3 remote state and native locking (no DynamoDB)
- **GitHub Actions** — OIDC federation with AWS (zero long-lived credentials)

## Quick Start

```bash
# Clone and explore the specs
git clone https://github.com/przeprogramowani/ai-native-infra.git
cd ai-native-infra

# Check out the starting point
git checkout master

# Specs live in context/ — read them, then ask AI to generate each component
cat context/spec-skill.md
cat context/conventions.md
```

To deploy the full infrastructure, see the Terraform and CI/CD specs in `context/`.

## Related

This project is part of the [10xDevs 3.0](https://10xdevs.pl) curriculum, covering:
- **Module 1** — Agent Skills & Context Engineering
- **Module 3** — AI Development Quality & CI/CD
- **Module 5** — AI-Native Teamwork & Extension Packs

## License

MIT
