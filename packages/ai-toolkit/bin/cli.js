#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PACKAGE_NAME = '@10xdevs/ai-toolkit';
const command = process.argv[2];

function showHelp() {
  console.log(`
${PACKAGE_NAME} — Extension Pack CLI

Usage:
  ai-toolkit install    Install skills, commands, and rules into the current project
  ai-toolkit uninstall  Remove all installed pack files from the current project
  ai-toolkit help       Show this help message

Environment variables:
  INSTALL_COPY=1        Force copy mode (default: auto-detect)
`);
}

function detectMode() {
  // INSTALL_COPY env var overrides auto-detection
  if (process.env.INSTALL_COPY) {
    return process.env.INSTALL_COPY === '1' || process.env.INSTALL_COPY === 'true';
  }

  // If package.json exists in project root → symlink mode
  // If no package.json → copy mode
  const projectPackageJson = path.join(process.cwd(), 'package.json');
  return !fs.existsSync(projectPackageJson);
}

function runInstall() {
  const copyMode = detectMode();
  const mode = copyMode ? 'copy' : 'symlink';

  console.log(`[${PACKAGE_NAME}] Installing in ${mode} mode...`);

  const installScript = path.join(__dirname, '..', 'install.js');

  execFileSync(process.execPath, [installScript], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PROJECT_ROOT: process.cwd(),
      INSTALL_COPY: copyMode ? '1' : ''
    }
  });
}

function runUninstall() {
  console.log(`[${PACKAGE_NAME}] Uninstalling...`);

  const uninstallScript = path.join(__dirname, '..', 'uninstall.js');

  execFileSync(process.execPath, [uninstallScript, process.cwd()], {
    stdio: 'inherit'
  });
}

switch (command) {
  case 'install':
    runInstall();
    break;
  case 'uninstall':
    runUninstall();
    break;
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
