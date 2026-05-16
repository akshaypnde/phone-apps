
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExerciseName,
  findExerciseMatch,
  parseWorkoutPlan,
  missedWorkoutWarning,
  nutritionScore,
  exportExerciseLogCsv,
  toISODateLocal
} from '../src/core.mjs';

test('normalizes exercise names case-insensitively and ignores spaces/punctuation', () => {
  assert.equal(normalizeExerciseName(' Barbell   Back-Squat!! '), 'barbellbacksquat');
});

test('matches slight exercise name differences against known exercise database', () => {
  const db = [{name:'Barbell Back Squat'}, {name:'Dumbbell Bench Press'}];
  assert.equal(findExerciseMatch('barbell back squats', db).name, 'Barbell Back Squat');
  assert.equal(findExerciseMatch('DB bench-press', db).name, 'Dumbbell Bench Press');
});

test('parses 4-day workout plan JSON and creates unmatched exercise entries instead of failing', () => {
  const db = [{name:'Barbell Back Squat'}, {name:'Romanian Deadlift'}];
  const plan = JSON.stringify({
    planName:'Strength 4 day',
    days:[{day:'Day 1', exercises:[
      {name:'back squat', sets:3, reps:'5', targetWeightKg:100, restSeconds:180},
      {name:'Mystery Lift', sets:2, reps:'10'}
    ]}]
  });
  const parsed = parseWorkoutPlan(plan, db);
  assert.equal(parsed.days.length, 1);
  assert.equal(parsed.days[0].exercises[0].canonicalName, 'Barbell Back Squat');
  assert.equal(parsed.days[0].exercises[1].canonicalName, 'Mystery Lift');
  assert.equal(parsed.days[0].exercises[1].custom, true);
});

test('flags strength-gain risk when workout gap is two days or more', () => {
  assert.equal(missedWorkoutWarning(['2026-05-10'], '2026-05-12').level, 'warning');
  assert.equal(missedWorkoutWarning(['2026-05-11'], '2026-05-12').level, 'ok');
});

test('scores nutritious foods better than sugary/high-sat-fat foods', () => {
  const apple = nutritionScore({calories:95, protein:0.5, fiber:4.4, sugar:19, saturatedFat:0.1, sodium:2});
  const soda = nutritionScore({calories:150, protein:0, fiber:0, sugar:39, saturatedFat:0, sodium:45});
  assert.equal(apple.label, 'good');
  assert.equal(soda.label, 'warning');
});

test('exports exercise log rows to CSV with correct escaping', () => {
  const csv = exportExerciseLogCsv([{date:'2026-05-16', exerciseName:'Squat, heavy', set:1, reps:5, weight:100, unit:'kg', restSeconds:180, notes:'felt "good"'}]);
  assert.match(csv, /"Squat, heavy"/);
  assert.match(csv, /"felt ""good"""/);
});

test('local ISO date helper uses real calendar date format', () => {
  assert.match(toISODateLocal(new Date('2026-02-28T12:00:00')), /^2026-02-28$/);
});
