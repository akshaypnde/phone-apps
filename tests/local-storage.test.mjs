
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('app uses a stable localStorage key so PWA updates do not wipe phone data', () => {
  assert.match(app, /const\s+STATE_STORAGE_KEY\s*=\s*['"]hfa-state['"]/);
  assert.match(app, /localStorage\.getItem\(STATE_STORAGE_KEY\)/);
  assert.match(app, /localStorage\.setItem\(STATE_STORAGE_KEY/);
});

test('state loading preserves old saved data while adding new default fields', () => {
  assert.match(app, /function\s+defaultState\s*\(/);
  assert.match(app, /migrateState\(/);
  assert.match(app, /\.\.\.defaults,\s*\.\.\.stored/s);
  assert.match(app, /macroTargets\s*:\s*\{\s*\.\.\.defaults\.macroTargets,\s*\.\.\.stored\.macroTargets\s*\}/s);
});

test('user can export and import a complete local backup', () => {
  for (const id of ['exportBackup', 'importBackupFile', 'importBackup']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(app, /function\s+exportBackup\s*\(/);
  assert.match(app, /function\s+importBackup\s*\(/);
  assert.match(app, /download\(`fitlog-backup-/);
});

test('service worker cache is at the current fitness app version', () => {
  assert.match(sw, /const CACHE = 'fitlog-v6';/);
});
