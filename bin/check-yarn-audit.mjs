#!/usr/bin/env node

/**
 * Fail if Yarn reports npm advisories that are not in yarn-audit-known-issues,
 * or if the production tree has any advisory.
 *
 * @remarks Pins and lockfile checksums do not replace a CVE scan. Production
 *   (`dependencies`) must stay clean. Dev/test toolchain findings may be
 *   listed in `yarn-audit-known-issues` after review — do not copy a line
 *   there just to go green. Deprecations are included (Yarn reports them).
 * @see AGENTS.md Dependencies
 * @see docs/security-and-privacy.md
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knownIssuesPath = path.join(root, 'yarn-audit-known-issues');

/**
 * @param record - One Yarn `--json` NDJSON audit object
 * @returns Stable key: package name plus advisory id
 */
function advisoryKey(record) {
  const name = record?.value ?? '';
  const id = record?.children?.ID ?? '';
  return `${name}::${id}`;
}

/**
 * @param text - Yarn `--json` stdout (NDJSON; may be empty)
 * @returns Parsed advisory records
 */
function parseAuditNdjson(text) {
  const records = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    records.push(JSON.parse(trimmed));
  }
  return records;
}

/**
 * @param records - Parsed advisories
 * @returns Map keyed by {@link advisoryKey}
 */
function indexAdvisories(records) {
  const map = new Map();
  for (const record of records) {
    map.set(advisoryKey(record), record);
  }
  return map;
}

function runYarnAudit(extraArgs) {
  const result = spawnSync('yarn', ['npm', 'audit', '--recursive', '--json', ...extraArgs], {
    cwd: root,
    encoding: 'utf8',
    // Audit talks to the npm registry.
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw result.error;
  }
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  // Yarn exits 1 when any report exists; that is expected. Other codes are fatal.
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`yarn npm audit failed (exit ${result.status}): ${stderr || stdout}`);
  }
  return parseAuditNdjson(stdout);
}

function formatRecord(record) {
  const id = record.children?.ID;
  const severity = record.children?.Severity;
  const issue = record.children?.Issue;
  return `  - ${record.value} [${severity}] ${id}: ${issue}`;
}

const errors = [];

const production = runYarnAudit(['--environment', 'production']);
if (production.length > 0) {
  errors.push('Production dependency tree has advisories (must be empty — do not allowlist these):');
  for (const record of production) {
    errors.push(formatRecord(record));
  }
}

const knownText = fs.existsSync(knownIssuesPath) ? fs.readFileSync(knownIssuesPath, 'utf8') : '';
const known = indexAdvisories(parseAuditNdjson(knownText));
const current = indexAdvisories(runYarnAudit([]));

const unexpected = [];
for (const [key, record] of current) {
  if (!known.has(key)) {
    unexpected.push(record);
  }
}
if (unexpected.length > 0) {
  errors.push('New advisories are not in yarn-audit-known-issues (review, then add a line or upgrade):');
  for (const record of unexpected) {
    errors.push(formatRecord(record));
  }
}

const stale = [];
for (const [key, record] of known) {
  if (!current.has(key)) {
    stale.push(record);
  }
}
if (stale.length > 0) {
  errors.push('yarn-audit-known-issues lists advisories Yarn no longer reports (remove the stale lines):');
  for (const record of stale) {
    errors.push(formatRecord(record));
  }
}

if (errors.length > 0) {
  console.error(`deps:audit: ${errors.join('\n')}`);
  process.exit(1);
}

console.log(`deps:audit: production tree is clean; ${current.size} accepted toolchain advisories match yarn-audit-known-issues.`);
