
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const travelDir = path.join(root, 'travel');

test('travel app lives in its own GitHub Pages subfolder with PWA files', () => {
  for (const file of ['index.html', 'styles.css', 'src/app.js', 'src/travel-core.mjs', 'manifest.webmanifest', 'sw.js']) {
    assert.ok(fs.existsSync(path.join(travelDir, file)), `${file} should exist in /travel`);
  }
});

test('travel app documents live data sources and has no LLM integration', () => {
  const html = fs.readFileSync(path.join(travelDir, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(travelDir, 'src/app.js'), 'utf8');
  assert.match(html + app, /Open-Meteo/i, 'uses Open-Meteo weather');
  assert.match(html + app, /transport\.rest|Deutsche Bahn|DB/i, 'uses DB/transport.rest connection data');
  assert.doesNotMatch(html + app, /openai|anthropic|chatgpt|llm|gemini/i, 'must not include LLM APIs');
});

test('travel scoring prioritises weather, budget, deutschland ticket and value', async () => {
  const core = await import('../travel/src/travel-core.mjs');
  const destination = {
    id: 'dresden', name: 'Dresden', dticket: true, baseCost: 24, trainMinutes: 110,
    categories: ['culture', 'museums', 'castles'], hiddenGem: false,
  };
  const sunny = { precipitationHours: 0, cloudCover: 20, maxTemp: 22, weatherCode: 1 };
  const rainy = { precipitationHours: 8, cloudCover: 96, maxTemp: 11, weatherCode: 61 };
  const filters = { budget: 60, days: 2, interests: ['culture', 'museums'], deutschlandTicket: true };
  assert.ok(core.scoreDestination(destination, sunny, filters) > core.scoreDestination(destination, rainy, filters));
  assert.equal(core.budgetFit(destination, 10), false);
  assert.equal(core.budgetFit(destination, 60), true);
});

test('travel core contains broad Leipzig weekend destination set and trip format helpers', async () => {
  const core = await import('../travel/src/travel-core.mjs');
  assert.ok(core.DESTINATIONS.length >= 35, 'should include at least 35 hand-curated destinations');
  assert.ok(core.DESTINATIONS.some(d => d.country !== 'Germany'), 'should include neighboring countries');
  assert.ok(core.DESTINATIONS.some(d => d.dticket), 'should include Deutschland Ticket friendly places');
  const url = core.buildDbSearchUrl(core.DESTINATIONS.find(d => d.id === 'erfurt'));
  assert.match(url, /bahn\.de/i);
  const flightLinks = core.buildFlightDealLinks(120);
  assert.ok(flightLinks.some(l => /Berlin|BER|Prague|PRG|Leipzig|LEJ/i.test(l.label + l.url)));
});

test('travel app is mobile safe and installable under /travel scope', () => {
  const css = fs.readFileSync(path.join(travelDir, 'styles.css'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(travelDir, 'manifest.webmanifest'), 'utf8'));
  const sw = fs.readFileSync(path.join(travelDir, 'sw.js'), 'utf8');
  assert.match(css, /overflow-x:\s*hidden/i);
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/i);
  assert.equal(manifest.scope, './');
  assert.equal(manifest.start_url, './index.html');
  assert.match(sw, /travel-helper-v1/);
});
