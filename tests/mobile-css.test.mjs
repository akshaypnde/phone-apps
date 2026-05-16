
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('mobile CSS prevents horizontal overflow on phone-sized screens', () => {
  assert.match(css, /box-sizing\s*:\s*border-box/);
  assert.match(css, /body[^}]*overflow-x\s*:\s*hidden/s);
  assert.match(css, /main[^}]*max-width\s*:\s*100%/s);
  assert.match(css, /\.card[^}]*overflow-x\s*:\s*auto/s);
});

test('calendar grid columns can shrink inside narrow mobile viewports', () => {
  assert.match(css, /#calendar[^}]*overflow-x\s*:\s*hidden/s);
  assert.match(css, /repeat\(7,minmax\(0,1fr\)\)/);
  assert.match(css, /\.day[^}]*min-width\s*:\s*0/s);
});
