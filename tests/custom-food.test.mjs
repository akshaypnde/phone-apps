
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCustomFoodItem, macroCalories } from '../src/core.mjs';

test('creates a custom food item from quantity and total macros', () => {
  const item = createCustomFoodItem({
    name: 'Homemade paneer bowl',
    grams: 250,
    protein: 32,
    carbs: 44,
    fats: 18,
    date: '2026-05-16',
    id: 'custom-1'
  });
  assert.equal(item.name, 'Homemade paneer bowl');
  assert.equal(item.brand, 'Custom');
  assert.equal(item.grams, 250);
  assert.equal(item.date, '2026-05-16');
  assert.equal(item.id, 'custom-1');
  assert.equal(item.nutrients.calories, macroCalories({protein:32, carbs:44, fats:18}));
  assert.equal(item.servingBased, true);
  assert.equal(item.nutrients.protein, 32);
  assert.equal(item.nutrients.carbohydrates, 44);
  assert.equal(item.nutrients.fat, 18);
});

test('custom food helper rejects missing names and non-positive quantities', () => {
  assert.throws(() => createCustomFoodItem({name:'', grams:100, protein:1, carbs:1, fats:1}), /name/i);
  assert.throws(() => createCustomFoodItem({name:'Snack', grams:0, protein:1, carbs:1, fats:1}), /quantity/i);
});

test('nutrition page exposes a custom food fallback form and binds it', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const app = fs.readFileSync('src/app.js', 'utf8');
  for (const id of ['customFoodName', 'customFoodGrams', 'customFoodProtein', 'customFoodCarbs', 'customFoodFats', 'addCustomFood']) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} should exist`);
  }
  assert.match(app, /createCustomFoodItem/);
  assert.match(app, /addCustomFood/);
  assert.match(app, /customFoodName/);
});

test('service worker cache is bumped for custom food update', () => {
  const sw = fs.readFileSync('sw.js', 'utf8');
  assert.match(sw, /fitlog-v6/);
});
