
import { DESTINATIONS, INTERESTS, budgetFit, classifyTrip, filterDestinations, formatMinutes, buildDbSearchUrl, buildFlixBusUrl, buildFlightDealLinks, makeGoogleEventsUrl } from './travel-core.mjs';

const $ = sel => document.querySelector(sel);
const state = { interests: ['nature','culture','old town'], weather: {}, journeys: {}, shortlist: JSON.parse(localStorage.getItem('travel-shortlist') || '[]') };

function weatherUrl(d) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&daily=weather_code,temperature_2m_max,precipitation_sum,precipitation_hours,cloud_cover_mean&timezone=Europe%2FBerlin&forecast_days=14`;
}

async function fetchWeather(destination) {
  const res = await fetch(weatherUrl(destination));
  if (!res.ok) throw new Error('Open-Meteo weather failed');
  const data = await res.json();
  const daily = data.daily || {};
  let best = null;
  for (let i=0; i<(daily.time || []).length; i++) {
    const w = {
      date: daily.time[i],
      weatherCode: daily.weather_code?.[i] ?? 0,
      maxTemp: daily.temperature_2m_max?.[i] ?? 0,
      precipitationSum: daily.precipitation_sum?.[i] ?? 0,
      precipitationHours: daily.precipitation_hours?.[i] ?? 0,
      cloudCover: daily.cloud_cover_mean?.[i] ?? 0,
    };
    const quality = Math.max(0, 100 - w.precipitationHours * 7 - w.cloudCover * .35 - w.precipitationSum * 2);
    if (!best || quality > best.quality) best = { ...w, quality: Math.round(quality) };
  }
  return best;
}

async function findStation(query) {
  const res = await fetch(`https://v6.db.transport.rest/locations?query=${encodeURIComponent(query)}&results=1`);
  if (!res.ok) throw new Error('transport.rest station lookup failed');
  const data = await res.json();
  return data?.[0]?.id || null;
}

async function fetchJourney(destination) {
  const from = await findStation('Leipzig Hbf');
  const to = await findStation(destination.station || destination.name);
  if (!from || !to) throw new Error('station not found');
  const url = `https://v6.db.transport.rest/journeys?from=${from}&to=${to}&results=1&departure=${encodeURIComponent(new Date(Date.now()+86400000).toISOString())}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('transport.rest journey failed');
  const data = await res.json();
  const j = data?.journeys?.[0];
  if (!j) return null;
  const dep = new Date(j.legs?.[0]?.departure || 0), arr = new Date(j.legs?.at(-1)?.arrival || 0);
  return { minutes: Math.round((arr - dep) / 60000), changes: Math.max(0, (j.legs || []).filter(l => l.line).length - 1) };
}

function filters() {
  return { budget: Number($('#budget').value), days: Number($('#days').value), country: $('#country').value, deutschlandTicket: $('#dticket').checked, deutschlandTicketOnly: $('#dticketOnly').checked, interests: state.interests };
}

function renderInterests() {
  $('#interestRow').innerHTML = INTERESTS.map(i => `<button type="button" class="chip ${state.interests.includes(i) ? 'active' : ''}" data-interest="${i}">${i}</button>`).join('');
  $('#interestRow').onclick = e => {
    const i = e.target.dataset.interest; if (!i) return;
    state.interests = state.interests.includes(i) ? state.interests.filter(x => x !== i) : [...state.interests, i];
    renderInterests(); render();
  };
}

function weatherLabel(w) {
  if (!w) return 'Live weather pending';
  if (w.precipitationHours >= 5 || w.cloudCover >= 85) return `⚠️ ${w.date}: rainy/cloudy`;
  if (w.cloudCover <= 45 && w.precipitationHours <= 1) return `☀️ ${w.date}: good weather`;
  return `⛅ ${w.date}: mixed weather`;
}

function card(d) {
  const f = filters();
  const w = d.weather;
  const label = classifyTrip(d, w || {}, f);
  const cls = label.startsWith('Excellent') ? 'excellent' : label.startsWith('Strong') ? 'strong' : label.startsWith('Possible') ? 'possible' : 'skip';
  const journey = state.journeys[d.id];
  const liveTime = journey?.minutes ? `${formatMinutes(journey.minutes)} live` : `${formatMinutes(d.trainMinutes)} est.`;
  return `<article class="trip-card">
    <div class="card-top"><div><h3>${d.name}</h3><div>${d.country} · ${d.hiddenGem ? 'Hidden gem' : 'Classic pick'}</div></div><span class="badge ${cls}">${label}</span></div>
    <div class="metrics">
      <div class="metric"><strong>${d.score}</strong><span>value score</span></div>
      <div class="metric"><strong>${w ? Math.round(w.maxTemp)+'°C' : '–'}</strong><span>${weatherLabel(w)}</span></div>
      <div class="metric"><strong>${liveTime}</strong><span>${journey ? journey.changes + ' changes' : 'rail/bus time'}</span></div>
      <div class="metric"><strong>€${d.baseCost}</strong><span>${budgetFit(d, f.budget) ? 'inside budget' : 'over slider'}</span></div>
    </div>
    <p>${d.highlights.slice(0,3).join(' · ')}</p>
    <p class="warning">${d.dticket ? '✅ Deutschland Ticket friendly' : '💶 Saver fare / bus / flight deal recommended'}</p>
    <div class="tags">${d.categories.slice(0,6).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="links"><a target="_blank" href="${buildDbSearchUrl(d)}">DB search</a><a target="_blank" href="${buildFlixBusUrl(d)}">FlixBus</a><a target="_blank" href="${makeGoogleEventsUrl(d)}">Events</a><button data-save="${d.id}" class="secondary">Save</button></div>
  </article>`;
}

function render() {
  const ranked = filterDestinations(filters(), state.weather).slice(0, 18);
  $('#cards').innerHTML = ranked.map(card).join('') || '<div class="empty">No trips match these filters.</div>';
  const sunny = ranked.find(d => d.weather && d.weather.precipitationHours <= 1 && d.weather.cloudCover < 55);
  $('#bestWeather').textContent = sunny?.name || ranked[0]?.name || '–';
  $('#bestValue').textContent = ranked.find(d => budgetFit(d, filters().budget))?.name || '–';
  $('#dticketCount').textContent = String(ranked.filter(d => d.dticket).length);
  renderShortlist();
  $('#flightLinks').innerHTML = buildFlightDealLinks(filters().budget).map(l => `<a target="_blank" href="${l.url}">${l.label}</a>`).join('');
}

function renderShortlist() {
  if (!state.shortlist.length) { $('#shortlist').className='shortlist empty'; $('#shortlist').textContent='No saved ideas yet.'; return; }
  $('#shortlist').className='shortlist';
  $('#shortlist').innerHTML = state.shortlist.map(id => DESTINATIONS.find(d => d.id === id)).filter(Boolean).map(d => `<div class="saved-item"><span>${d.name}</span><button class="secondary" data-remove="${d.id}">Remove</button></div>`).join('');
}

async function refreshLive() {
  $('#cards').innerHTML = '<div class="skeleton">Refreshing live weather and sample rail data…</div>';
  const candidates = filterDestinations(filters(), {}).slice(0, 24);
  const weatherResults = await Promise.allSettled(candidates.map(async d => [d.id, await fetchWeather(d)]));
  for (const r of weatherResults) if (r.status === 'fulfilled') state.weather[r.value[0]] = r.value[1];
  const journeyResults = await Promise.allSettled(candidates.slice(0, 8).map(async d => [d.id, await fetchJourney(d)]));
  for (const r of journeyResults) if (r.status === 'fulfilled' && r.value[1]) state.journeys[r.value[0]] = r.value[1];
  render();
}

$('#budget').oninput = () => { $('#budgetOut').textContent = `€${$('#budget').value}`; render(); };
for (const id of ['days','country','dticket','dticketOnly']) $('#'+id).onchange = render;
$('#refreshBtn').onclick = refreshLive;
$('#saveBtn').onclick = () => { localStorage.setItem('travel-shortlist', JSON.stringify(state.shortlist)); alert('Shortlist saved locally on this phone.'); };
$('#cards').onclick = e => { const id = e.target.dataset.save; if (!id) return; if (!state.shortlist.includes(id)) state.shortlist.push(id); localStorage.setItem('travel-shortlist', JSON.stringify(state.shortlist)); renderShortlist(); };
$('#shortlist').onclick = e => { const id = e.target.dataset.remove; if (!id) return; state.shortlist = state.shortlist.filter(x => x !== id); localStorage.setItem('travel-shortlist', JSON.stringify(state.shortlist)); renderShortlist(); };

renderInterests(); render(); refreshLive();
