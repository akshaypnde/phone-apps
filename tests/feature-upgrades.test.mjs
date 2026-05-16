
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  macroCalories,
  macroProgress,
  exportNutritionLogCsv,
  exportExerciseLogCsv
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

test('professional mobile app styling tokens are present', () => {
  assert.match(css, /--accent/);
  assert.match(css, /backdrop-filter/);
  assert.match(css, /linear-gradient\(135deg/);
  assert.match(css, /transition/);
  assert.match(css, /box-shadow/);
  assert.match(html, /🏋️|🥗|💧|📅/);
});
