
import { EXERCISES } from './exercises.mjs';
import { parseWorkoutPlan, toISODateLocal, missedWorkoutWarning, nutritionScore, exportExerciseLogCsv, exportNutritionLogCsv, macroCalories, macroProgress, createCustomFoodItem, createFoodLogItemFromProduct, nutrientsFromOpenFoodFacts, openFoodFactsBarcodeUrl, normalizeBarcode, findExerciseMatch, cryptoRandomId } from './core.mjs';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const STATE_STORAGE_KEY = 'hfa-state';
const state = loadState();
let selectedPlanDayIndex = 0;

function defaultState(){
  return {schemaVersion:2, logs:[], workouts:{}, plans:[], activePlanId:null, foods:[], water:{}, customExercises:[], macroTargets:{protein:150, carbs:200, fats:70}};
}
function migrateState(stored={}){
  const defaults = defaultState();
  return {
    ...defaults,
    ...stored,
    schemaVersion: 2,
    logs: Array.isArray(stored.logs) ? stored.logs : defaults.logs,
    workouts: stored.workouts && typeof stored.workouts === 'object' ? stored.workouts : defaults.workouts,
    plans: Array.isArray(stored.plans) ? stored.plans : defaults.plans,
    foods: Array.isArray(stored.foods) ? stored.foods : defaults.foods,
    water: stored.water && typeof stored.water === 'object' ? stored.water : defaults.water,
    customExercises: Array.isArray(stored.customExercises) ? stored.customExercises : defaults.customExercises,
    macroTargets: {...defaults.macroTargets, ...stored.macroTargets}
  };
}
function loadState(){
  try { return migrateState(JSON.parse(localStorage.getItem(STATE_STORAGE_KEY)||'{}')); } catch { return defaultState(); }
}
function save(){ localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state)); renderAll(); }
function allExercises(){ return [...EXERCISES, ...state.customExercises.map(name=>({name, custom:true}))]; }
function today(){ return $('#date').value || toISODateLocal(); }
function download(name, text, type='text/plain'){
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function init(){
  $('#date').value = toISODateLocal();
  $('#foodDate').value = toISODateLocal();
  $('#waterDate').value = toISODateLocal();
  $('#planExample').textContent = JSON.stringify(examplePlan(), null, 2);
  loadMacroInputs();
  bindEvents(); renderAll(); requestNotifications();
}
function bindEvents(){
  $('#tabs').addEventListener('click', e=>{ if(e.target.matches('button')) showTab(e.target.dataset.tab); });
  $('#date').addEventListener('change', renderAll); $('#foodDate').addEventListener('change', renderFoodLog); $('#waterDate').addEventListener('change', renderWater);
  $('#exerciseSearch').addEventListener('input', renderExerciseSuggestions);
  $('#addSet').addEventListener('click', addSet);
  $('#parsePlan').addEventListener('click', importPlan);
  $('#clearPlan').addEventListener('click', ()=>{ state.activePlanId=null; save(); });
  $('#planDay').addEventListener('change', e=>{ selectedPlanDayIndex=+e.target.value; renderPlanTemplate(); });
  $('#exportToday').addEventListener('click', ()=>exportLogs([today()], `exercise-log-${today()}.csv`));
  $('#clearExerciseDay').addEventListener('click', clearExerciseDay);
  $('#exportRange').addEventListener('click', ()=>{ const dates=calendarSelectedDates(); exportLogs(dates, `exercise-log-${dates[0]||'all'}-to-${dates.at(-1)||'all'}.csv`); });
  $('#calendar').addEventListener('click', calendarClick);
  $('#foodSearchBtn').addEventListener('click', searchFoods);
  $('#foodQuery').addEventListener('keydown', e=>{ if(e.key==='Enter') searchFoods(); });
  $('#foodResults').addEventListener('click', addFoodFromClick);
  $('#lookupBarcode').addEventListener('click', ()=>lookupBarcodeFood($('#barcodeInput').value));
  $('#barcodeInput').addEventListener('keydown', e=>{ if(e.key==='Enter') lookupBarcodeFood(e.target.value); });
  $('#scanBarcode').addEventListener('click', scanBarcodeFood);
  $('#addCustomFood').addEventListener('click', addCustomFood);
  $('#saveMacros').addEventListener('click', saveMacroTargets);
  $('#exportNutritionToday').addEventListener('click', ()=>exportNutrition([$('#foodDate').value], `nutrition-log-${$('#foodDate').value}.csv`));
  $('#exportNutritionAll').addEventListener('click', ()=>exportNutrition([], 'nutrition-log-all.csv'));
  $('#addWater').addEventListener('click', ()=>{ const d=$('#waterDate').value; state.water[d]=(state.water[d]||0)+(+$('#waterMl').value||250); save(); });
  $('#notifyBtn').addEventListener('click', requestNotifications);
  $('#exportBackup').addEventListener('click', exportBackup);
  $('#importBackup').addEventListener('click', importBackup);
  $('#refreshAppUpdate').addEventListener('click', refreshAppUpdate);
}

async function refreshAppUpdate(){
  const snapshot = localStorage.getItem(STATE_STORAGE_KEY);
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('fitlog-')).map(key => caches.delete(key)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    if (snapshot && !localStorage.getItem(STATE_STORAGE_KEY)) localStorage.setItem(STATE_STORAGE_KEY, snapshot);
    window.location.reload();
  } catch (err) {
    if (snapshot && !localStorage.getItem(STATE_STORAGE_KEY)) localStorage.setItem(STATE_STORAGE_KEY, snapshot);
    alert('Could not refresh the app cache automatically. Your saved FitLog data was left untouched.');
  }
}

function showTab(tab){ $$('.tab').forEach(s=>s.hidden=s.id!==tab); $$('#tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); }
function renderAll(){ renderExerciseDatalist(); renderExerciseLog(); renderCalendar(); renderPlanTemplate(); renderFoodLog(); renderMacroTargets(); renderWater(); renderWarnings(); }
function renderExerciseDatalist(){ $('#exerciseList').innerHTML=allExercises().map(e=>`<option value="${escapeHtml(e.name)}"></option>`).join(''); renderExerciseSuggestions(); }
function renderExerciseSuggestions(){
  const q=$('#exerciseSearch').value.trim(); const list=$('#exerciseMatches'); if(!q){ list.innerHTML=''; return; }
  const matches=allExercises().filter(e=>e.name.toLowerCase().includes(q.toLowerCase()) || findExerciseMatch(q,[e])).slice(0,8);
  list.innerHTML=matches.map(e=>`<button type="button" data-name="${escapeHtml(e.name)}">${escapeHtml(e.name)}</button>`).join('');
  list.onclick=e=>{ if(e.target.dataset.name){ $('#exerciseSearch').value=e.target.dataset.name; list.innerHTML=''; } };
}
function addSet(){
  const date=today(), name=$('#exerciseSearch').value.trim(); if(!name) return alert('Choose or type an exercise first.');
  const match=findExerciseMatch(name, allExercises()); const canonical=match?.name||name;
  if(!match && !state.customExercises.includes(name)) state.customExercises.push(name);
  state.logs.push({id:cryptoRandomId(), date, exerciseName:canonical, set:+$('#setNo').value||1, reps:+$('#reps').value||0, weight:+$('#weight').value||0, unit:$('#unit').value, restSeconds:+$('#rest').value||'', notes:$('#notes').value.trim()});
  state.workouts[date]=true; save();
}
function renderExerciseLog(){
  const rows=state.logs.filter(r=>r.date===today());
  $('#exerciseLog').innerHTML=rows.length? rows.map(r=>`<tr><td>${r.set}</td><td>${escapeHtml(r.exerciseName)}</td><td>${r.reps}</td><td>${r.weight} ${r.unit}</td><td>${r.restSeconds||''}</td><td>${escapeHtml(r.notes||'')}</td><td><button data-del="${r.id}">Delete</button></td></tr>`).join('') : '<tr><td colspan="7">No sets logged for this date.</td></tr>';
  $('#exerciseLog').onclick=e=>{ if(e.target.dataset.del){ state.logs=state.logs.filter(r=>r.id!==e.target.dataset.del); save(); } };
}
function clearExerciseDay(){ if(confirm(`Clear all exercise sets for ${today()}?`)){ state.logs = state.logs.filter(r => r.date !== today()); save(); } }
function exportLogs(dates, filename){
  const set=new Set(dates);
  const rows=dates.length? state.logs.filter(r=>set.has(r.date)) : state.logs;
  const markedWorkoutDates = (dates.length ? dates : Object.keys(state.workouts)).filter(d => state.workouts[d] && (!dates.length || set.has(d)));
  download(filename, exportExerciseLogCsv(rows, {markedWorkoutDates}), 'text/csv');
}
function calendarSelectedDates(){ return $$('#calendar input:checked').map(x=>x.value).sort(); }
function renderCalendar(){
  const base=new Date(today()+'T12:00:00'); const y=base.getFullYear(), m=base.getMonth();
  const first=new Date(y,m,1), start=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate();
  let html='<div class="week head"><b>Mon</b><b>Tue</b><b>Wed</b><b>Thu</b><b>Fri</b><b>Sat</b><b>Sun</b></div><div class="grid">';
  for(let i=0;i<start;i++) html+='<div></div>';
  for(let d=1;d<=days;d++){ const iso=toISODateLocal(new Date(y,m,d,12)); const done=state.workouts[iso]; html+=`<label class="day ${done?'done':''}"><input type="checkbox" value="${iso}"><span>${d}</span><button data-toggle="${iso}" title="Mark workout done">${done?'✓':'○'}</button></label>`; }
  $('#calendar').innerHTML=html+'</div>';
}
function calendarClick(e){ if(e.target.dataset.toggle){ state.workouts[e.target.dataset.toggle]=!state.workouts[e.target.dataset.toggle]; save(); } }
function importPlan(){
  try { const p=parseWorkoutPlan($('#planInput').value, allExercises()); p.id=cryptoRandomId(); state.plans.push(p); state.activePlanId=p.id; selectedPlanDayIndex=0; save(); }
  catch(err){ alert('Could not parse plan JSON: '+err.message); }
}
function activePlan(){ return state.plans.find(p=>p.id===state.activePlanId); }
function renderPlanTemplate(){
  const plan=activePlan(); $('#activePlanName').textContent=plan?plan.planName:'No active plan';
  $('#planDay').innerHTML=plan?plan.days.map((d,i)=>`<option value="${i}">${escapeHtml(d.day)} ${d.focus?'— '+escapeHtml(d.focus):''}</option>`).join(''):''; $('#planDay').value=selectedPlanDayIndex;
  if(!plan){ $('#planTemplate').innerHTML='<p>Import a plan to create reusable workout templates.</p>'; return; }
  const day=plan.days[selectedPlanDayIndex]||plan.days[0];
  $('#planTemplate').innerHTML=day.exercises.map(ex=>`<div class="template-card ${ex.custom?'custom':''}"><b>${escapeHtml(ex.canonicalName)}</b>${ex.custom?' <span title="Custom exercise">new</span>':''}<p>${ex.sets} sets × ${escapeHtml(ex.reps)} reps ${ex.targetWeightKg?`@ ${ex.targetWeightKg} kg`:''} ${ex.restSeconds?`• rest ${ex.restSeconds}s`:''}</p><button data-fill='${escapeHtml(JSON.stringify(ex))}'>Fill on exercise page</button></div>`).join('');
  $('#planTemplate').onclick=e=>{ if(e.target.dataset.fill){ const ex=JSON.parse(e.target.dataset.fill); $('#exerciseSearch').value=ex.canonicalName; $('#reps').value=parseInt(ex.reps)||''; $('#weight').value=ex.targetWeightKg||''; $('#rest').value=ex.restSeconds||''; showTab('exercise'); }};
}
async function searchFoods(){
  const q=$('#foodQuery').value.trim(); if(!q) return; $('#foodResults').innerHTML='<li>Searching Open Food Facts…</li>';
  const url=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments,nutrition_grades,image_front_thumb_url`;
  try { const res=await fetch(url); const data=await res.json(); renderFoodResults((data.products||[]).filter(p=>p.product_name)); }
  catch { $('#foodResults').innerHTML='<li>Food search failed. Check your connection.</li>'; }
}
function foodNutrients(p){ return nutrientsFromOpenFoodFacts(p); }
function renderFoodResults(products){
  $('#foodResults').innerHTML=products.map((p,i)=>{ const nutrients=foodNutrients(p), s=nutritionScore(nutrients); return `<li><button data-food='${escapeHtml(JSON.stringify({name:p.product_name, brand:p.brands||'', nutrients}))}'>Log</button> ${s.icon} <b>${escapeHtml(p.product_name)}</b> <small>${escapeHtml(p.brands||'')} — per 100g: ${nutrients.calories} kcal, protein ${nutrients.protein}g, carbs ${nutrients.carbohydrates}g, fat ${nutrients.fat}g, sugar ${nutrients.sugar}g</small></li>`; }).join('') || '<li>No products found.</li>';
}
function addFoodFromClick(e){ if(!e.target.dataset.food) return; const f=JSON.parse(e.target.dataset.food); f.id=cryptoRandomId(); f.date=$('#foodDate').value; f.grams=+(prompt('How many grams?', '100')||100); state.foods.push(f); save(); }
async function lookupBarcodeFood(rawBarcode){
  const code = normalizeBarcode(rawBarcode);
  const status = $('#barcodeStatus');
  if(!code){ status.textContent='Enter or scan a barcode first.'; return; }
  status.textContent='Looking up barcode in Open Food Facts…';
  try {
    const res = await fetch(openFoodFactsBarcodeUrl(code));
    const data = await res.json();
    if(!res.ok || data.status === 0 || !data.product) throw new Error('No product found for this barcode.');
    const product = {...data.product, code: data.code || data.product.code || code};
    const defaultQty = product.product_quantity || product.serving_quantity || 100;
    const grams = +(prompt(`Found ${product.product_name || 'food item'}. How many grams did you eat?`, String(defaultQty)) || defaultQty);
    const item = createFoodLogItemFromProduct(product, {date: $('#foodDate').value, grams, id: cryptoRandomId()});
    state.foods.push(item);
    $('#barcodeInput').value = code;
    status.textContent = `Logged ${item.name} (${item.grams}g).`;
    save();
  } catch(err) {
    status.textContent = err.message || 'Barcode lookup failed. Check your connection or add it as custom food.';
  }
}
async function scanBarcodeFood(){
  const status = $('#barcodeStatus');
  const video = $('#barcodeVideo');
  if(!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia){
    status.textContent='Camera barcode scanning is not supported in this browser. Type the barcode number and tap Lookup instead.';
    return;
  }
  let stream;
  try {
    const supportedFormats = await BarcodeDetector.getSupportedFormats?.() || [];
    const preferredFormats = supportedFormats.filter(f => ['ean_13','ean_8','upc_a','upc_e','code_128'].includes(f));
    const detector = preferredFormats.length ? new BarcodeDetector({formats: preferredFormats}) : new BarcodeDetector();
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject = stream;
    video.hidden = false;
    await video.play();
    status.textContent='Point the camera at the food barcode…';
    const start = Date.now();
    const tick = async () => {
      if(Date.now() - start > 20000) throw new Error('No barcode detected. Try better light or enter the number manually.');
      const barcodes = await detector.detect(video);
      if(barcodes.length){
        const code = barcodes[0].rawValue;
        stream.getTracks().forEach(t=>t.stop());
        video.hidden = true;
        await lookupBarcodeFood(code);
      } else {
        requestAnimationFrame(() => tick().catch(err => { status.textContent=err.message; stream?.getTracks().forEach(t=>t.stop()); video.hidden=true; }));
      }
    };
    await tick();
  } catch(err) {
    status.textContent = err.message || 'Could not start barcode scanning.';
    stream?.getTracks().forEach(t=>t.stop());
    video.hidden = true;
  }
}
function addCustomFood(){
  const data = {
    id: cryptoRandomId(),
    date: $('#foodDate').value,
    name: $('#customFoodName').value,
    grams: $('#customFoodGrams').value,
    protein: $('#customFoodProtein').value,
    carbs: $('#customFoodCarbs').value,
    fats: $('#customFoodFats').value
  };
  try {
    state.foods.push(createCustomFoodItem(data));
    ['customFoodName','customFoodProtein','customFoodCarbs','customFoodFats'].forEach(id => $('#'+id).value = '');
    $('#customFoodGrams').value = 100;
    save();
  } catch (err) {
    alert(err.message || 'Could not add custom food.');
  }
}
function renderFoodLog(){
  const d=$('#foodDate').value, foods=state.foods.filter(f=>f.date===d);
  let totals={calories:0, protein:0, carbs:0, fats:0, fiber:0, sugar:0, saturatedFat:0, sodium:0};
  $('#foodLog').innerHTML=foods.map(f=>{ const factor=(f.grams||100)/100; const n=f.servingBased ? {...f.nutrients} : Object.fromEntries(Object.entries(f.nutrients).map(([k,v])=>[k,Math.round(v*factor*10)/10])); totals.calories+=n.calories||0; totals.protein+=n.protein||0; totals.carbs+=(n.carbohydrates??n.carbs)||0; totals.fats+=(n.fat??n.fats)||0; totals.fiber+=n.fiber||0; totals.sugar+=n.sugar||0; totals.saturatedFat+=n.saturatedFat||0; totals.sodium+=n.sodium||0; const s=nutritionScore(n); return `<tr><td data-label="Rating" class="food-rating">${s.icon}</td><td data-label="Food">${escapeHtml(f.name)}</td><td data-label="Amount">${f.grams}g</td><td data-label="kcal">${n.calories}</td><td data-label="Protein">${n.protein}g</td><td data-label="Carbs">${n.carbohydrates??n.carbs??0}g</td><td data-label="Fats">${n.fat??n.fats??0}g</td><td data-label="Sugar">${n.sugar}g</td><td data-label="Action"><button data-delfood="${f.id}">Delete</button></td></tr>`; }).join('') || '<tr><td colspan="9">No food logged.</td></tr>';
  $('#foodTotals').textContent=`Totals: ${Math.round(totals.calories)} kcal, protein ${totals.protein.toFixed(1)}g, carbs ${totals.carbs.toFixed(1)}g, fats ${totals.fats.toFixed(1)}g, fiber ${totals.fiber.toFixed(1)}g, sugar ${totals.sugar.toFixed(1)}g, sodium ${Math.round(totals.sodium)}mg.`;
  renderMacroProgress(totals);
  $('#mealIdeas').innerHTML=recommendMeals(totals).map(x=>`<li>${x}</li>`).join('');
  $('#foodLog').onclick=e=>{ if(e.target.dataset.delfood){ state.foods=state.foods.filter(f=>f.id!==e.target.dataset.delfood); save(); }};
}
function loadMacroInputs(){ ['Protein','Carbs','Fats'].forEach(k=>{ const el=$(`#target${k}`); if(el) el.value=state.macroTargets[k.toLowerCase()]||0; }); renderMacroTargets(); }
function saveMacroTargets(){ state.macroTargets={protein:+$('#targetProtein').value||0, carbs:+$('#targetCarbs').value||0, fats:+$('#targetFats').value||0}; save(); }
function renderMacroTargets(){ if(!$('#targetCalories')) return; $('#targetCalories').textContent=`${macroCalories(state.macroTargets)} kcal/day`; }
function renderMacroProgress(totals){ const el=$('#macroProgress'); if(!el) return; const p=macroProgress(totals, state.macroTargets); el.innerHTML=['calories','protein','carbs','fats'].map(k=>`<div class="macro-row"><span>${k}</span><progress max="100" value="${Math.min(100,p[k].percent)}"></progress><b>${p[k].consumed}/${p[k].target}${k==='calories'?' kcal':'g'}</b></div>`).join(''); renderMacroTargets(); }
function exportNutrition(dates, filename){ const set=new Set(dates); const rows=dates.length? state.foods.filter(f=>set.has(f.date)) : state.foods; download(filename, exportNutritionLogCsv(rows), 'text/csv'); }
function recommendMeals(t){ const ideas=[]; if(t.protein<80) ideas.push('Lean protein bowl: grilled chicken/tofu, brown rice, beans, salsa, salad.'); if(t.fiber<25) ideas.push('High-fiber option: lentil soup with vegetables or oats with berries.'); if(t.sugar>50) ideas.push('Keep the next snack low-sugar: Greek yogurt, eggs, nuts, or hummus with vegetables.'); if(!ideas.length) ideas.push('Balanced dinner: salmon or tempeh, sweet potato, and leafy greens.'); return ideas; }
function renderWater(){ const d=$('#waterDate').value, ml=state.water[d]||0; $('#waterProgress').value=Math.min(ml,3000); $('#waterText').textContent=`${ml} / 3000 ml`; }
function renderWarnings(){ const dates=Object.keys(state.workouts).filter(d=>state.workouts[d]); const w=missedWorkoutWarning(dates, toISODateLocal()); $('#gapWarning').className=w.level; $('#gapWarning').textContent=w.message; }
function requestNotifications(){ if(!('Notification' in window)) return; if(Notification.permission==='default') Notification.requestPermission(); }
function maybeNotify(){ if(!('Notification' in window) || Notification.permission!=='granted') return; const w=missedWorkoutWarning(Object.keys(state.workouts).filter(d=>state.workouts[d])); if(w.level==='warning') new Notification('Workout gap warning', {body:w.message}); }
setInterval(maybeNotify, 60*60*1000);

function exportBackup(){
  const snapshot = {...state, exportedAt: new Date().toISOString(), app: 'FitLog'};
  download(`fitlog-backup-${toISODateLocal()}.json`, JSON.stringify(snapshot, null, 2), 'application/json');
}
async function importBackup(){
  const file = $('#importBackupFile').files?.[0];
  if(!file) return alert('Choose a FitLog backup JSON file first.');
  try {
    const parsed = JSON.parse(await file.text());
    const restored = migrateState(parsed);
    if(!confirm('Import this backup and replace the current local data on this phone?')) return;
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, restored);
    save();
    alert('Backup imported successfully.');
  } catch(err) {
    alert('Could not import backup: '+err.message);
  }
}
function examplePlan(){ return {planName:'4-Day Strength Template', notes:'All fields except name are optional. Exercise names are case-insensitive; spaces/punctuation/minor differences are tolerated.', days:[{day:'Day 1', focus:'Lower strength', exercises:[{name:'Barbell Back Squat', sets:5, reps:'5', targetWeightKg:100, restSeconds:180, notes:'Add weight only if all reps are clean.'},{name:'Romanian deadlifts', sets:3, reps:'8-10', restSeconds:120}]},{day:'Day 2', focus:'Upper strength', exercises:[{name:'bench press', sets:5, reps:'5', restSeconds:180},{name:'DB row', sets:4, reps:'8/side', restSeconds:90}]}]}; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
init();
