const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@10xdevs/ai-toolkit';
const SENTINEL_BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const SENTINEL_END = `<!-- END ${PACKAGE_NAME} -->`;

function main() {
  const projectRoot = process.argv[2] || process.cwd();
  const claudeDir = path.join(projectRoot, '.claude');
  const manifestPath = path.join(claudeDir, '.ai-toolkit-manifest.json');

  console.log(`\n[${PACKAGE_NAME}] Uninstalling...`);
  console.log(`  Project root: ${projectRoot}`);

  if (!fs.existsSync(manifestPath)) {
    console.log('  No manifest found — nothing to uninstall.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Remove installed files/symlinks
  for (const filePath of manifest.files) {
    try {
      if (filePath.endsWith('CLAUDE.md') && path.dirname(filePath) === projectRoot) {
        // Strip sentinel block from CLAUDE.md instead of deleting
        stripRulesFromClaudeMd(filePath);
        continue;
      }

      const stat = fs.lstatSync(filePath);
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        fs.rmSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(`  Removed: ${filePath}`);

      // Clean up empty parent directories
      cleanEmptyDirs(path.dirname(filePath), claudeDir);
    } catch {
      // File already removed
    }
  }

  // Remove manifest
  fs.unlinkSync(manifestPath);
  console.log(`  Removed manifest: ${manifestPath}`);

  console.log(`[${PACKAGE_NAME}] Uninstall complete!\n`);
}

function stripRulesFromClaudeMd(claudeMdPath) {
  if (!fs.existsSync(claudeMdPath)) return;

  let content = fs.readFileSync(claudeMdPath, 'utf8');
  const beginIdx = content.indexOf(SENTINEL_BEGIN);
  const endIdx = content.indexOf(SENTINEL_END);

  if (beginIdx === -1 || endIdx === -1) return;

  const before = content.substring(0, beginIdx).trimEnd();
  const after = content.substring(endIdx + SENTINEL_END.length).trimStart();

  const remaining = before + (before && after ? '\n\n' : '') + after;

  if (remaining.trim() === '') {
    fs.unlinkSync(claudeMdPath);
    console.log(`  Removed: ${claudeMdPath} (empty after sentinel removal)`);
  } else {
    fs.writeFileSync(claudeMdPath, remaining.trimEnd() + '\n');
    console.log(`  Stripped rules from: ${claudeMdPath}`);
  }
}

function cleanEmptyDirs(dir, stopAt) {
  while (dir !== stopAt && dir !== path.dirname(dir)) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

try {
  main();
} catch (err) {
  console.error(`[${PACKAGE_NAME}] Uninstall error: ${err.message}`);
  process.exit(1);
}
