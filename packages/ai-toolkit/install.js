const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@10xdevs/ai-toolkit';
const COPY_MODE = !!process.env.INSTALL_COPY;
const SENTINEL_BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const SENTINEL_END = `<!-- END ${PACKAGE_NAME} -->`;

function findProjectRoot() {
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }
  // Walk up from this file's location to find the project root
  // When installed as a dependency, this file lives in node_modules/@10xdevs/ai-toolkit/
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === 'node_modules') {
      return path.dirname(dir);
    }
    dir = path.dirname(dir);
  }
  // Fallback: assume CWD is project root
  return process.cwd();
}

function cleanStaleSymlinks(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    try {
      if (entry.isSymbolicLink() && !fs.existsSync(fs.readlinkSync(fullPath))) {
        fs.unlinkSync(fullPath);
        console.log(`  Cleaned stale symlink: ${fullPath}`);
      }
    } catch {
      // Ignore errors during cleanup
    }
  }
}

function installItem(sourcePath, targetPath, isDirectory) {
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Remove existing target if present
  if (fs.existsSync(targetPath) || fs.lstatSync(targetPath).isSymbolicLink?.()) {
    if (fs.lstatSync(targetPath).isDirectory() && !fs.lstatSync(targetPath).isSymbolicLink()) {
      fs.rmSync(targetPath, { recursive: true });
    } else {
      fs.unlinkSync(targetPath);
    }
  }

  if (COPY_MODE) {
    if (isDirectory) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
    console.log(`  Copied: ${targetPath}`);
  } else {
    const symlinkType = isDirectory ? 'dir' : 'file';
    fs.symlinkSync(sourcePath, targetPath, symlinkType);
    console.log(`  Linked: ${targetPath}`);
  }
}

function safeInstallItem(sourcePath, targetPath, isDirectory) {
  // Safe version that checks existence properly
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Remove existing target if present
  try {
    const stat = fs.lstatSync(targetPath);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      fs.rmSync(targetPath, { recursive: true });
    } else {
      fs.unlinkSync(targetPath);
    }
  } catch {
    // Target doesn't exist, which is fine
  }

  if (COPY_MODE) {
    if (isDirectory) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
    console.log(`  Copied: ${targetPath}`);
  } else {
    const symlinkType = isDirectory ? 'dir' : 'file';
    fs.symlinkSync(sourcePath, targetPath, symlinkType);
    console.log(`  Linked: ${targetPath}`);
  }
}

function installRules(projectRoot) {
  const rulesSource = path.join(__dirname, 'rules', 'CLAUDE.md');
  if (!fs.existsSync(rulesSource)) return [];

  const rulesContent = fs.readFileSync(rulesSource, 'utf8').trim();
  const sentinelBlock = `${SENTINEL_BEGIN}\n${rulesContent}\n${SENTINEL_END}`;
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  if (fs.existsSync(claudeMdPath)) {
    let existing = fs.readFileSync(claudeMdPath, 'utf8');
    const beginIdx = existing.indexOf(SENTINEL_BEGIN);
    const endIdx = existing.indexOf(SENTINEL_END);

    if (beginIdx !== -1 && endIdx !== -1) {
      // Replace existing sentinel block (idempotent)
      existing = existing.substring(0, beginIdx) + sentinelBlock + existing.substring(endIdx + SENTINEL_END.length);
    } else {
      // Append with separator
      existing = existing.trimEnd() + '\n\n' + sentinelBlock + '\n';
    }
    fs.writeFileSync(claudeMdPath, existing);
  } else {
    fs.writeFileSync(claudeMdPath, sentinelBlock + '\n');
  }

  console.log(`  Rules installed to: ${claudeMdPath}`);
  return [claudeMdPath];
}

function main() {
  const projectRoot = findProjectRoot();
  const claudeDir = path.join(projectRoot, '.claude');
  const skillsTargetDir = path.join(claudeDir, 'skills');
  const installedFiles = [];
  const mode = COPY_MODE ? 'copy' : 'symlink';

  console.log(`\n[${PACKAGE_NAME}] Installing (${mode} mode)...`);
  console.log(`  Project root: ${projectRoot}`);

  // Ensure .claude/skills exists
  if (!fs.existsSync(skillsTargetDir)) {
    fs.mkdirSync(skillsTargetDir, { recursive: true });
  }

  // Clean stale symlinks
  cleanStaleSymlinks(skillsTargetDir);

  // Install skills
  const skillsSourceDir = path.join(__dirname, 'skills');
  if (fs.existsSync(skillsSourceDir)) {
    const skills = fs.readdirSync(skillsSourceDir, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const skill of skills) {
      const source = path.join(skillsSourceDir, skill.name);
      const target = path.join(skillsTargetDir, skill.name);
      safeInstallItem(source, target, true);
      installedFiles.push(target);
    }
  }

  // Install commands (if any)
  const commandsSourceDir = path.join(__dirname, 'commands');
  if (fs.existsSync(commandsSourceDir)) {
    const commands = fs.readdirSync(commandsSourceDir)
      .filter(f => f.endsWith('.md'));

    if (commands.length > 0) {
      const commandsTargetDir = path.join(claudeDir, 'commands');
      if (!fs.existsSync(commandsTargetDir)) {
        fs.mkdirSync(commandsTargetDir, { recursive: true });
      }
      cleanStaleSymlinks(commandsTargetDir);

      for (const cmd of commands) {
        const source = path.join(commandsSourceDir, cmd);
        const target = path.join(commandsTargetDir, cmd);
        safeInstallItem(source, target, false);
        installedFiles.push(target);
      }
    }
  }

  // Install rules to CLAUDE.md
  const rulesFiles = installRules(projectRoot);
  installedFiles.push(...rulesFiles);

  // Write manifest
  const manifest = {
    package: PACKAGE_NAME,
    version: require('./package.json').version,
    mode,
    installedAt: new Date().toISOString(),
    files: installedFiles
  };
  const manifestPath = path.join(claudeDir, '.ai-toolkit-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest: ${manifestPath}`);

  console.log(`[${PACKAGE_NAME}] Installation complete!\n`);
}

try {
  main();
} catch (err) {
  console.warn(`[${PACKAGE_NAME}] Installation warning: ${err.message}`);
  // Never fail npm install
}
