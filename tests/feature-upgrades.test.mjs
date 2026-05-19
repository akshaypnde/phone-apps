
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  macroCalories,
  macroProgress,
  exportNutritionLogCsv,
  exportExerciseLogCsv,
  normalizeBarcode,
  openFoodFactsBarcodeUrl,
  createFoodLogItemFromProduct
} from '../src/core.mjs';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('calculates kcal from target macros using 4/4/9 rule', () => {
  assert.equal(macroCalories({protein: 150, carbs: 200, fats: 70}), 2030);
});

test('compares logged nutrition totals against macro targets', () => {
  const progress = macroProgress(
    {protein: 120, carbs: 180, fats: 55, calories: 1700},
    {protein: 150, carbs: 200, fats: 70}
  );
  assert.equal(progress.targets.calories, 2030);
  assert.equal(progress.protein.percent, 80);
  assert.equal(progress.carbs.remaining, 20);
  assert.equal(progress.fats.remaining, 15);
});

test('exports nutrition log as CSV with macro columns and escaping', () => {
  const csv = exportNutritionLogCsv([{date:'2026-05-16', name:'Greek, Yogurt', brand:'Brand "A"', grams:150, nutrients:{calories:90, protein:10, carbohydrates:4, fat:0.5, sugar:4, fiber:0, saturatedFat:0.1, sodium:40}}]);
  assert.match(csv, /^date,food,brand,grams,calories,protein,carbs,fats,sugar,fiber,saturatedFat,sodium/m);
  assert.match(csv, /"Greek, Yogurt"/);
  assert.match(csv, /"Brand ""A"""/);
});

test('checked workout CSV includes a general row for marked workout days without sets', () => {
  const csv = exportExerciseLogCsv(
    [{date:'2026-05-16', exerciseName:'Squat', set:1, reps:5, weight:100, unit:'kg'}],
    {markedWorkoutDates:['2026-05-15', '2026-05-16']}
  );
  const lines = csv.split('\n');
  assert.equal(lines[0], 'date,exerciseName,set,reps,weight,unit,restSeconds,notes');
  assert.match(csv, /^2026-05-15,Workout completed,,,,,,Marked complete on calendar; no sets logged$/m);
  assert.match(csv, /^2026-05-16,Squat,1,5,100,kg,,/m);
});

test('barcode helpers build Open Food Facts lookup URLs and quantity-adjustable log entries', () => {
  assert.equal(normalizeBarcode(' 4 004321-000123 '), '4004321000123');
  assert.equal(openFoodFactsBarcodeUrl('4004321000123'), 'https://world.openfoodfacts.org/api/v2/product/4004321000123.json?fields=code,product_name,brands,nutriments,image_front_thumb_url,product_quantity,serving_quantity');
  const item = createFoodLogItemFromProduct({
    code: '4004321000123',
    product_name: 'Test Muesli',
    brands: 'EU Brand',
    nutriments: {'energy-kcal_100g': 370, proteins_100g: 12, carbohydrates_100g: 60, fat_100g: 8, sugars_100g: 10, fiber_100g: 7, 'saturated-fat_100g': 1.2, sodium_100g: 0.2}
  }, {date:'2026-05-17', grams: 75, id:'scan-1'});
  assert.equal(item.id, 'scan-1');
  assert.equal(item.date, '2026-05-17');
  assert.equal(item.name, 'Test Muesli');
  assert.equal(item.brand, 'EU Brand');
  assert.equal(item.barcode, '4004321000123');
  assert.equal(item.grams, 75);
  assert.equal(item.nutrients.calories, 370);
  assert.equal(item.nutrients.protein, 12);
});

test('exercise page exposes a clear all sets action', () => {
  assert.match(html, /id="clearExerciseDay"/);
  assert.match(app, /clearExerciseDay/);
  assert.match(app, /state\.logs\s*=\s*state\.logs\.filter\(r\s*=>\s*r\.date\s*!==\s*today\(\)\)/);
});

test('nutrition page exposes macro targets and CSV export controls', () => {
  for (const id of ['targetProtein', 'targetCarbs', 'targetFats', 'targetCalories', 'saveMacros', 'exportNutritionToday', 'exportNutritionAll', 'macroProgress']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(app, /exportNutritionLogCsv/);
  assert.match(app, /macroProgress\(/);
});

test('nutrition page exposes barcode scanning with manual fallback', () => {
  for (const id of ['barcodeInput', 'lookupBarcode', 'scanBarcode', 'barcodeVideo', 'barcodeStatus']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(app, /BarcodeDetector/);
  assert.match(app, /lookupBarcodeFood/);
  assert.match(app, /openFoodFactsBarcodeUrl/);
  assert.match(app, /createFoodLogItemFromProduct/);
});

test('professional mobile app styling tokens are present', () => {
  assert.match(css, /--accent/);
  assert.match(css, /backdrop-filter/);
  assert.match(css, /linear-gradient\(135deg/);
  assert.match(css, /transition/);
  assert.match(css, /box-shadow/);
  assert.match(html, /🏋️|🥗|💧|📅/);
});
