
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('calendar mobile layout remains compact even when mobile media queries do not apply', () => {
  assert.match(css, /#calendar\s*\.grid[^}]*grid-template-columns\s*:\s*repeat\(7,minmax\(0,1fr\)\)/s);
  assert.match(css, /#calendar\s*\.day[^}]*aspect-ratio\s*:\s*1\s*\/\s*1/s);
  assert.match(css, /#calendar\s*\.day\s*button[^}]*position\s*:\s*absolute/s);
  assert.match(css, /#calendar\s*\.day\s*input[^}]*position\s*:\s*absolute/s);
});

test('food log uses mobile card semantics instead of forcing a wide table', () => {
  assert.match(app, /data-label="Food"/);
  assert.match(app, /data-label="Amount"/);
  assert.match(app, /data-label="Protein"/);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*#foodLog\s*tr[^{]*{[^}]*display\s*:\s*grid/s);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*#foodLog\s*td::before/s);
});
