
import { EXERCISES } from './exercises.mjs';
import { parseWorkoutPlan, toISODateLocal, missedWorkoutWarning, nutritionScore, exportExerciseLogCsv, findExerciseMatch, cryptoRandomId } from './core.mjs';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const state = loadState();
let selectedPlanDayIndex = 0;

function loadState(){
  const defaults = {logs:[], workouts:{}, plans:[], activePlanId:null, foods:[], water:{}, customExercises:[]};
  try { return {...defaults, ...JSON.parse(localStorage.getItem('hfa-state')||'{}')}; } catch { return defaults; }
}
function save(){ localStorage.setItem('hfa-state', JSON.stringify(state)); renderAll(); }
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
  $('#exportRange').addEventListener('click', ()=>{ const dates=calendarSelectedDates(); exportLogs(dates, `exercise-log-${dates[0]||'all'}-to-${dates.at(-1)||'all'}.csv`); });
  $('#calendar').addEventListener('click', calendarClick);
  $('#foodSearchBtn').addEventListener('click', searchFoods);
  $('#foodQuery').addEventListener('keydown', e=>{ if(e.key==='Enter') searchFoods(); });
  $('#foodResults').addEventListener('click', addFoodFromClick);
  $('#addWater').addEventListener('click', ()=>{ const d=$('#waterDate').value; state.water[d]=(state.water[d]||0)+(+$('#waterMl').value||250); save(); });
  $('#notifyBtn').addEventListener('click', requestNotifications);
}
function showTab(tab){ $$('.tab').forEach(s=>s.hidden=s.id!==tab); $$('#tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); }
function renderAll(){ renderExerciseDatalist(); renderExerciseLog(); renderCalendar(); renderPlanTemplate(); renderFoodLog(); renderWater(); renderWarnings(); }
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
function exportLogs(dates, filename){ const set=new Set(dates); const rows=dates.length? state.logs.filter(r=>set.has(r.date)) : state.logs; download(filename, exportExerciseLogCsv(rows), 'text/csv'); }
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
function foodNutrients(p){ const n=p.nutriments||{}; return {calories: +(n['energy-kcal_100g']||n['energy-kcal']||0), protein:+(n.proteins_100g||0), fiber:+(n.fiber_100g||0), sugar:+(n.sugars_100g||0), saturatedFat:+(n['saturated-fat_100g']||0), sodium: Math.round(+(n.sodium_100g||0)*1000)}; }
function renderFoodResults(products){
  $('#foodResults').innerHTML=products.map((p,i)=>{ const nutrients=foodNutrients(p), s=nutritionScore(nutrients); return `<li><button data-food='${escapeHtml(JSON.stringify({name:p.product_name, brand:p.brands||'', nutrients}))}'>Log</button> ${s.icon} <b>${escapeHtml(p.product_name)}</b> <small>${escapeHtml(p.brands||'')} — per 100g: ${nutrients.calories} kcal, protein ${nutrients.protein}g, sugar ${nutrients.sugar}g, sat fat ${nutrients.saturatedFat}g</small></li>`; }).join('') || '<li>No products found.</li>';
}
function addFoodFromClick(e){ if(!e.target.dataset.food) return; const f=JSON.parse(e.target.dataset.food); f.id=cryptoRandomId(); f.date=$('#foodDate').value; f.grams=+(prompt('How many grams?', '100')||100); state.foods.push(f); save(); }
function renderFoodLog(){
  const d=$('#foodDate').value, foods=state.foods.filter(f=>f.date===d);
  let totals={calories:0, protein:0, fiber:0, sugar:0, saturatedFat:0, sodium:0};
  $('#foodLog').innerHTML=foods.map(f=>{ const factor=(f.grams||100)/100; const n=Object.fromEntries(Object.entries(f.nutrients).map(([k,v])=>[k,Math.round(v*factor*10)/10])); Object.keys(totals).forEach(k=>totals[k]+=n[k]||0); const s=nutritionScore(n); return `<tr><td data-label="Rating" class="food-rating">${s.icon}</td><td data-label="Food">${escapeHtml(f.name)}</td><td data-label="Amount">${f.grams}g</td><td data-label="kcal">${n.calories}</td><td data-label="Protein">${n.protein}g</td><td data-label="Sugar">${n.sugar}g</td><td data-label="Action"><button data-delfood="${f.id}">Delete</button></td></tr>`; }).join('') || '<tr><td colspan="7">No food logged.</td></tr>';
  $('#foodTotals').textContent=`Totals: ${Math.round(totals.calories)} kcal, protein ${totals.protein.toFixed(1)}g, fiber ${totals.fiber.toFixed(1)}g, sugar ${totals.sugar.toFixed(1)}g, sodium ${Math.round(totals.sodium)}mg.`;
  $('#mealIdeas').innerHTML=recommendMeals(totals).map(x=>`<li>${x}</li>`).join('');
  $('#foodLog').onclick=e=>{ if(e.target.dataset.delfood){ state.foods=state.foods.filter(f=>f.id!==e.target.dataset.delfood); save(); }};
}
function recommendMeals(t){ const ideas=[]; if(t.protein<80) ideas.push('Lean protein bowl: grilled chicken/tofu, brown rice, beans, salsa, salad.'); if(t.fiber<25) ideas.push('High-fiber option: lentil soup with vegetables or oats with berries.'); if(t.sugar>50) ideas.push('Keep the next snack low-sugar: Greek yogurt, eggs, nuts, or hummus with vegetables.'); if(!ideas.length) ideas.push('Balanced dinner: salmon or tempeh, sweet potato, and leafy greens.'); return ideas; }
function renderWater(){ const d=$('#waterDate').value, ml=state.water[d]||0; $('#waterProgress').value=Math.min(ml,3000); $('#waterText').textContent=`${ml} / 3000 ml`; }
function renderWarnings(){ const dates=Object.keys(state.workouts).filter(d=>state.workouts[d]); const w=missedWorkoutWarning(dates, toISODateLocal()); $('#gapWarning').className=w.level; $('#gapWarning').textContent=w.message; }
function requestNotifications(){ if(!('Notification' in window)) return; if(Notification.permission==='default') Notification.requestPermission(); }
function maybeNotify(){ if(!('Notification' in window) || Notification.permission!=='granted') return; const w=missedWorkoutWarning(Object.keys(state.workouts).filter(d=>state.workouts[d])); if(w.level==='warning') new Notification('Workout gap warning', {body:w.message}); }
setInterval(maybeNotify, 60*60*1000);
function examplePlan(){ return {planName:'4-Day Strength Template', notes:'All fields except name are optional. Exercise names are case-insensitive; spaces/punctuation/minor differences are tolerated.', days:[{day:'Day 1', focus:'Lower strength', exercises:[{name:'Barbell Back Squat', sets:5, reps:'5', targetWeightKg:100, restSeconds:180, notes:'Add weight only if all reps are clean.'},{name:'Romanian deadlifts', sets:3, reps:'8-10', restSeconds:120}]},{day:'Day 2', focus:'Upper strength', exercises:[{name:'bench press', sets:5, reps:'5', restSeconds:180},{name:'DB row', sets:4, reps:'8/side', restSeconds:90}]}]}; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
init();
