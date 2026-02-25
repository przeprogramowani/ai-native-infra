# Extension Pack — Requirements

## Goal
Package our Agent Skill into a distributable npm package that teams can install.

## What is an Extension Pack?
An npm package with a `pack.yaml` manifest. It contains skills, commands, and AI rules.
When installed, it creates entries in the project's `.claude/` directory.

## Requirements
- Package name: `@10xdevs/ai-toolkit`
- Namespace: `10xdevs`
- Include: code-review skill

### Smart installation (two modes):
1. **`npm install`** (JS/TS projects with package.json): postinstall hook creates symlinks
2. **`npx ai-toolkit install`** (any project): auto-detects — if package.json exists use symlinks, otherwise copy files

### Key constraints:
- Install to PROJECT's `.claude/` (not global `~/.claude/`)
- Write manifest `.claude/.ai-toolkit-manifest.json` tracking mode + installed files
- npm 10.x doesn't run `preuninstall` hooks — need manifest-based cleanup
- macOS symlinks: use 'dir' type for directories, 'file' for files (not 'junction')
- Never fail `npm install` — catch errors in postinstall and warn only
- CLI (bin/cli.js) for `npx ai-toolkit install/uninstall/help`
