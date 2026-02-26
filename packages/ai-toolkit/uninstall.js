const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@10xdevs/ai-toolkit';
const SENTINEL_BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const SENTINEL_END = `<!-- END ${PACKAGE_NAME} -->`;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findProjectRoot() {
  // Accept project root as CLI argument
  if (process.argv[2]) {
    return path.resolve(process.argv[2]);
  }

  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }

  // Walk up from __dirname
  let dir = __dirname;
  while (true) {
    const basename = path.basename(dir);
    const parent = path.dirname(dir);

    if (basename === 'node_modules') {
      return parent;
    }

    if (parent === dir) {
      return null;
    }

    dir = parent;
  }
}

function removeTrackedFiles(projectRoot, files) {
  for (const file of files) {
    const fullPath = path.join(projectRoot, file);

    try {
      if (!fs.existsSync(fullPath) && !fs.lstatSync(fullPath).isSymbolicLink()) {
        continue;
      }
    } catch {
      continue;
    }

    try {
      const stat = fs.lstatSync(fullPath);

      if (stat.isSymbolicLink() || stat.isFile()) {
        fs.unlinkSync(fullPath);
      } else if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn(`  Warning: could not remove ${file}: ${err.message}`);
    }
  }
}

function stripRules(projectRoot) {
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  if (!fs.existsSync(claudeMdPath)) return;

  let content = fs.readFileSync(claudeMdPath, 'utf8');

  const sentinelRegex = new RegExp(
    `\\n?${escapeRegex(SENTINEL_BEGIN)}[\\s\\S]*?${escapeRegex(SENTINEL_END)}\\n?`
  );

  if (!sentinelRegex.test(content)) return;

  content = content.replace(sentinelRegex, '');

  if (content.trim() === '') {
    fs.unlinkSync(claudeMdPath);
    console.log('  Removed CLAUDE.md (was empty after stripping pack rules).');
  } else {
    fs.writeFileSync(claudeMdPath, content);
    console.log('  Stripped pack rules from CLAUDE.md.');
  }
}

function cleanEmptyDirs(projectRoot) {
  const dirs = [
    path.join(projectRoot, '.claude', 'commands'),
    path.join(projectRoot, '.claude', 'skills')
  ];

  for (const dir of dirs) {
    try {
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    } catch {
      // Ignore
    }
  }
}

function main() {
  const projectRoot = findProjectRoot();

  if (!projectRoot) {
    console.error(`[${PACKAGE_NAME}] Cannot determine project root. Pass it as an argument: node uninstall.js /path/to/project`);
    process.exit(1);
  }

  const manifestPath = path.join(projectRoot, '.claude', '.ai-toolkit-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.log(`[${PACKAGE_NAME}] No manifest found at ${manifestPath}. Nothing to uninstall.`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`[${PACKAGE_NAME}] Uninstalling from ${projectRoot}...`);

  // Remove tracked files (excluding CLAUDE.md, handled separately)
  const filesToRemove = manifest.files.filter(f => f !== 'CLAUDE.md');
  removeTrackedFiles(projectRoot, filesToRemove);

  // Strip rules from CLAUDE.md
  stripRules(projectRoot);

  // Remove manifest
  fs.unlinkSync(manifestPath);

  // Clean empty directories
  cleanEmptyDirs(projectRoot);

  console.log(`[${PACKAGE_NAME}] Uninstall complete.`);
}

try {
  main();
} catch (err) {
  console.error(`[${PACKAGE_NAME}] Uninstall error: ${err.message}`);
  process.exit(1);
}
