
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('fitness app provides an update refresh action that preserves local app data', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const app = fs.readFileSync('src/app.js', 'utf8');
  assert.match(html, /id="refreshAppUpdate"/);
  assert.match(app, /refreshAppUpdate/);
  assert.match(app, /caches\.keys\(\)/);
  assert.match(app, /localStorage\.getItem\(STATE_STORAGE_KEY\)/);
  assert.doesNotMatch(app, /localStorage\.clear\(/);
});

test('fitness service worker is network first for app shell updates and cache v9', () => {
  const sw = fs.readFileSync('sw.js', 'utf8');
  assert.match(sw, /const CACHE = 'fitlog-v9';/);
  assert.match(sw, /fetch\(event\.request\)/);
  assert.match(sw, /cache\.put\(event\.request/);
  assert.match(sw, /cached/);
  assert.match(sw, /openfoodfacts\.org/);
});
