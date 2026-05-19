
export function normalizeExerciseName(name='') {
  return String(name).toLowerCase()
    .replace(/\b(dbs?|dumbells?|dumbbells?)\b/g, 'dumbbell')
    .replace(/\b(bbs?|barbells?)\b/g, 'barbell')
    .replace(/\b(ohp)\b/g, 'overheadpress')
    .replace(/\b(rdl|rdls)\b/g, 'romaniandeadlift')
    .replace(/\b(squats|presses|rows|curls|deadlifts|lunges|raises|extensions)\b/g, m => m.replace(/s$/, ''))
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function levenshtein(a, b) {
  const dp = Array.from({length: a.length + 1}, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  }
  return dp[a.length][b.length];
}

export function findExerciseMatch(input, db=[]) {
  const q = normalizeExerciseName(input);
  if (!q) return null;
  let best = null, bestScore = -Infinity;
  for (const item of db) {
    const n = normalizeExerciseName(item.name);
    let score = 0;
    if (n === q) score = 100;
    else if (n.includes(q) || q.includes(n)) score = 86 - Math.abs(n.length - q.length);
    else {
      const dist = levenshtein(q, n);
      score = 80 - (dist / Math.max(q.length, n.length)) * 100;
    }
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore >= 52 ? best : null;
}

export function parseWorkoutPlan(input, exerciseDb=[]) {
  let obj;
  if (typeof input === 'string') obj = JSON.parse(input); else obj = input;
  if (!obj || !Array.isArray(obj.days)) throw new Error('Workout plan must be JSON with a days array');
  return {
    planName: obj.planName || obj.name || 'Workout Plan',
    notes: obj.notes || '',
    days: obj.days.map((day, dayIndex) => ({
      day: day.day || day.name || `Day ${dayIndex + 1}`,
      focus: day.focus || '',
      exercises: (day.exercises || []).map((ex, exerciseIndex) => {
        const name = ex.name || ex.exercise || '';
        const match = findExerciseMatch(name, exerciseDb);
        return {
          id: cryptoRandomId(),
          order: ex.order ?? exerciseIndex + 1,
          inputName: name,
          canonicalName: match?.name || name,
          custom: !match,
          sets: Number(ex.sets || 1),
          reps: String(ex.reps ?? ''),
          targetWeightKg: ex.targetWeightKg ?? ex.weightKg ?? ex.weight ?? '',
          restSeconds: ex.restSeconds ?? ex.rest ?? '',
          notes: ex.notes || ''
        };
      })
    }))
  };
}

export function cryptoRandomId() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function toISODateLocal(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export function missedWorkoutWarning(workoutDates=[], today=toISODateLocal()) {
  const dates = workoutDates.map(d => new Date(d+'T00:00:00')).filter(d => !isNaN(d)).sort((a,b)=>b-a);
  if (!dates.length) return {level:'warning', message:'No completed workout logged yet.'};
  const now = new Date(today+'T00:00:00');
  const gapDays = Math.floor((now - dates[0]) / 86400000);
  if (gapDays >= 2) return {level:'warning', gapDays, message:`${gapDays} days since your last completed workout. For strength progress, try not to let gaps reach 2+ days unless your plan intentionally schedules rest.`};
  return {level:'ok', gapDays, message:'Workout spacing looks fine.'};
}

export function nutritionScore(n={}) {
  const calories=+n.calories||0, protein=+n.protein||0, fiber=+n.fiber||0, sugar=+n.sugar||0, sat=+n.saturatedFat||0, sodium=+n.sodium||0;
  let score = 50;
  score += Math.min(20, protein * 2.4) + Math.min(18, fiber * 4);
  score -= Math.max(0, calories - 450) / 18;
  score -= Math.max(0, sugar - 12) * 1.5;
  score -= Math.max(0, sat - 3) * 5;
  score -= Math.max(0, sodium - 500) / 80;
  let label = score >= 55 ? 'good' : score >= 42 ? 'neutral' : 'warning';
  return {score: Math.round(score), label, icon: label === 'good' ? '✅' : label === 'neutral' ? '•' : '⚠️'};
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}

export function exportExerciseLogCsv(rows=[], {markedWorkoutDates=[]}={}) {
  const cols = ['date','exerciseName','set','reps','weight','unit','restSeconds','notes'];
  const datesWithLoggedSets = new Set(rows.map(r => r.date).filter(Boolean));
  const generalRows = [...new Set(markedWorkoutDates)]
    .filter(date => date && !datesWithLoggedSets.has(date))
    .map(date => ({
      date,
      exerciseName: 'Workout completed',
      set: '',
      reps: '',
      weight: '',
      unit: '',
      restSeconds: '',
      notes: 'Marked complete on calendar; no sets logged'
    }));
  const exportRows = [...rows, ...generalRows].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  return [cols.join(','), ...exportRows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n');
}

export function normalizeBarcode(input='') {
  return String(input).replace(/[^0-9]/g, '');
}

export function openFoodFactsBarcodeUrl(barcode) {
  const code = normalizeBarcode(barcode);
  if (!code) throw new Error('Barcode is required');
  return `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,brands,nutriments,image_front_thumb_url,product_quantity,serving_quantity`;
}

export function nutrientsFromOpenFoodFacts(product={}) {
  const n = product.nutriments || {};
  return {
    calories: +(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein: +(n.proteins_100g ?? 0),
    carbohydrates: +(n.carbohydrates_100g ?? 0),
    fat: +(n.fat_100g ?? 0),
    fiber: +(n.fiber_100g ?? 0),
    sugar: +(n.sugars_100g ?? 0),
    saturatedFat: +(n['saturated-fat_100g'] ?? 0),
    sodium: Math.round(+(n.sodium_100g ?? 0) * 1000)
  };
}

export function createFoodLogItemFromProduct(product={}, {date='', grams=100, id=''}={}) {
  const qty = +grams;
  const name = String(product.product_name || product.generic_name || '').trim();
  if (!name) throw new Error('Barcode product has no usable name');
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Food quantity must be greater than zero');
  return {
    id,
    date,
    name,
    brand: product.brands || '',
    barcode: normalizeBarcode(product.code || product._id || ''),
    grams: qty,
    nutrients: nutrientsFromOpenFoodFacts(product)
  };
}


export function macroCalories(targets={}) {
  const protein = +targets.protein || 0;
  const carbs = +targets.carbs || 0;
  const fats = +targets.fats || 0;
  return Math.round((protein * 4) + (carbs * 4) + (fats * 9));
}

export function macroProgress(totals={}, targets={}) {
  const resolvedTargets = {
    protein: +targets.protein || 0,
    carbs: +targets.carbs || 0,
    fats: +targets.fats || 0,
    calories: +targets.calories || macroCalories(targets)
  };
  const metric = key => {
    const consumed = Math.round((+totals[key] || 0) * 10) / 10;
    const target = resolvedTargets[key] || 0;
    return {
      consumed,
      target,
      remaining: Math.max(0, Math.round((target - consumed) * 10) / 10),
      percent: target ? Math.min(999, Math.round((consumed / target) * 100)) : 0
    };
  };
  return {
    targets: resolvedTargets,
    calories: metric('calories'),
    protein: metric('protein'),
    carbs: metric('carbs'),
    fats: metric('fats')
  };
}


export function createCustomFoodItem({name, grams, protein=0, carbs=0, fats=0, date='', id=''}) {
  const cleanName = String(name || '').trim();
  const qty = +grams;
  if (!cleanName) throw new Error('Custom food name is required');
  if (!Number.isFinite(qty) || qty <= 0) throw new Error('Custom food quantity must be greater than zero');
  const macroTotals = {
    protein: Math.max(0, +protein || 0),
    carbohydrates: Math.max(0, +carbs || 0),
    fat: Math.max(0, +fats || 0)
  };
  return {
    id,
    date,
    name: cleanName,
    brand: 'Custom',
    grams: qty,
    servingBased: true,
    nutrients: {
      calories: macroCalories({protein: macroTotals.protein, carbs: macroTotals.carbohydrates, fats: macroTotals.fat}),
      protein: macroTotals.protein,
      carbohydrates: macroTotals.carbohydrates,
      fat: macroTotals.fat,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      sodium: 0
    }
  };
}

export function exportNutritionLogCsv(rows=[]) {
  const cols = ['date','food','brand','grams','calories','protein','carbs','fats','sugar','fiber','saturatedFat','sodium'];
  const value = (row, col) => {
    if (col === 'food') return row.name;
    if (col === 'carbs') return row.nutrients?.carbohydrates ?? row.nutrients?.carbs ?? '';
    if (col === 'fats') return row.nutrients?.fat ?? row.nutrients?.fats ?? '';
    return row[col] ?? row.nutrients?.[col] ?? '';
  };
  return [cols.join(','), ...rows.map(row => cols.map(col => csvCell(value(row, col))).join(','))].join('\n');
}

export function exportJson(data) { return JSON.stringify(data, null, 2); }
