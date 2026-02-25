#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2];
const packageDir = path.resolve(__dirname, '..');

function detectMode(projectRoot) {
  // INSTALL_COPY env var overrides auto-detection
  if (process.env.INSTALL_COPY !== undefined) {
    return process.env.INSTALL_COPY === 'true' || process.env.INSTALL_COPY === '1';
  }
  // Auto-detect: if package.json exists, use symlink mode; otherwise copy mode
  const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
  return !hasPackageJson;
}

function showHelp() {
  console.log(`
@10xdevs/ai-toolkit — Agent Skills Extension Pack

Usage:
  npx @10xdevs/ai-toolkit install   Install skills and rules into current project
  npx @10xdevs/ai-toolkit uninstall Remove skills and rules from current project
  npx @10xdevs/ai-toolkit help      Show this help message

Environment variables:
  INSTALL_COPY=1    Force copy mode (default: auto-detect)
  PROJECT_ROOT=...  Override project root detection
`);
}

function run() {
  const projectRoot = process.env.PROJECT_ROOT || process.cwd();
  const copyMode = detectMode(projectRoot);

  switch (command) {
    case 'install': {
      console.log(`Mode: ${copyMode ? 'copy' : 'symlink'} (${copyMode ? 'no package.json detected' : 'package.json found'})`);
      execFileSync('node', [path.join(packageDir, 'install.js')], {
        stdio: 'inherit',
        env: {
          ...process.env,
          PROJECT_ROOT: projectRoot,
          INSTALL_COPY: copyMode ? '1' : ''
        }
      });
      break;
    }
    case 'uninstall': {
      execFileSync('node', [path.join(packageDir, 'uninstall.js'), projectRoot], {
        stdio: 'inherit'
      });
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

run();
