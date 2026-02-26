const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@10xdevs/ai-toolkit';
const PACKAGE_VERSION = '1.0.0';
const SENTINEL_BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const SENTINEL_END = `<!-- END ${PACKAGE_NAME} -->`;
const COPY_MODE = !!process.env.INSTALL_COPY;

function findProjectRoot() {
  // If explicitly set, use that
  if (process.env.PROJECT_ROOT) {
    return process.env.PROJECT_ROOT;
  }

  // Walk up from __dirname looking for node_modules parent
  let dir = __dirname;
  while (true) {
    const basename = path.basename(dir);
    const parent = path.dirname(dir);

    if (basename === 'node_modules') {
      // Check if we're inside an npx cache directory
      if (dir.includes(path.join('.npm', '_npx'))) {
        return null;
      }
      return parent;
    }

    if (parent === dir) {
      // Reached filesystem root without finding node_modules
      return null;
    }

    dir = parent;
  }
}

function cleanStaleSymlinks(targetDir) {
  if (!fs.existsSync(targetDir)) return;

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    try {
      if (entry.isSymbolicLink() && !fs.existsSync(fs.readlinkSync(fullPath))) {
        fs.unlinkSync(fullPath);
      }
    } catch {
      // Ignore errors cleaning stale symlinks
    }
  }
}

function installSkills(projectRoot, installedFiles) {
  const skillsSource = path.join(__dirname, 'skills');
  const skillsTarget = path.join(projectRoot, '.claude', 'skills');

  if (!fs.existsSync(skillsSource)) return;

  fs.mkdirSync(skillsTarget, { recursive: true });
  cleanStaleSymlinks(skillsTarget);

  const skills = fs.readdirSync(skillsSource, { withFileTypes: true })
    .filter(e => e.isDirectory());

  for (const skill of skills) {
    const source = path.join(skillsSource, skill.name);
    const target = path.join(skillsTarget, skill.name);

    if (fs.existsSync(target)) {
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(target);
      } else {
        fs.rmSync(target, { recursive: true, force: true });
      }
    }

    if (COPY_MODE) {
      copyDirRecursive(source, target);
    } else {
      fs.symlinkSync(source, target, 'dir');
    }

    installedFiles.push(path.relative(projectRoot, target));
  }
}

function installCommands(projectRoot, installedFiles) {
  const commandsSource = path.join(__dirname, 'commands');
  const commandsTarget = path.join(projectRoot, '.claude', 'commands');

  if (!fs.existsSync(commandsSource)) return;

  const commands = fs.readdirSync(commandsSource)
    .filter(f => f.endsWith('.md'));

  if (commands.length === 0) return;

  fs.mkdirSync(commandsTarget, { recursive: true });
  cleanStaleSymlinks(commandsTarget);

  for (const cmd of commands) {
    const source = path.join(commandsSource, cmd);
    const target = path.join(commandsTarget, cmd);

    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }

    if (COPY_MODE) {
      fs.copyFileSync(source, target);
    } else {
      fs.symlinkSync(source, target, 'file');
    }

    installedFiles.push(path.relative(projectRoot, target));
  }
}

function installRules(projectRoot, installedFiles) {
  const rulesSource = path.join(__dirname, 'rules', 'CLAUDE.md');
  if (!fs.existsSync(rulesSource)) return;

  const rulesContent = fs.readFileSync(rulesSource, 'utf8').trim();
  const sentinelBlock = `\n${SENTINEL_BEGIN}\n${rulesContent}\n${SENTINEL_END}\n`;

  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  if (fs.existsSync(claudeMdPath)) {
    let existing = fs.readFileSync(claudeMdPath, 'utf8');

    // Replace existing sentinel block if present (idempotent)
    const sentinelRegex = new RegExp(
      `\\n?${escapeRegex(SENTINEL_BEGIN)}[\\s\\S]*?${escapeRegex(SENTINEL_END)}\\n?`
    );

    if (sentinelRegex.test(existing)) {
      existing = existing.replace(sentinelRegex, sentinelBlock);
      fs.writeFileSync(claudeMdPath, existing);
    } else {
      fs.appendFileSync(claudeMdPath, sentinelBlock);
    }
  } else {
    fs.writeFileSync(claudeMdPath, sentinelBlock.trimStart());
  }

  installedFiles.push('CLAUDE.md');
}

function writeManifest(projectRoot, installedFiles) {
  const manifestDir = path.join(projectRoot, '.claude');
  fs.mkdirSync(manifestDir, { recursive: true });

  const manifest = {
    package: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    mode: COPY_MODE ? 'copy' : 'symlink',
    installedAt: new Date().toISOString(),
    files: installedFiles
  };

  const manifestPath = path.join(manifestDir, '.ai-toolkit-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function copyDirRecursive(source, target) {
  fs.mkdirSync(target, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const tgtPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, tgtPath);
    } else {
      fs.copyFileSync(srcPath, tgtPath);
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  const projectRoot = findProjectRoot();

  if (!projectRoot) {
    console.log(`[${PACKAGE_NAME}] Skipping postinstall (no project root detected).`);
    return;
  }

  console.log(`[${PACKAGE_NAME}] Installing to ${projectRoot} (${COPY_MODE ? 'copy' : 'symlink'} mode)...`);

  const installedFiles = [];

  installSkills(projectRoot, installedFiles);
  installCommands(projectRoot, installedFiles);
  installRules(projectRoot, installedFiles);
  writeManifest(projectRoot, installedFiles);

  console.log(`[${PACKAGE_NAME}] Installed ${installedFiles.length} item(s).`);
}

try {
  main();
} catch (err) {
  console.warn(`[${PACKAGE_NAME}] postinstall warning: ${err.message}`);
}
