
export const HOME = { name: 'Leipzig Hbf', stationQuery: 'Leipzig Hbf', lat: 51.3457, lon: 12.3813 };

export const DESTINATIONS = [
  { id:'dresden', name:'Dresden', country:'Germany', station:'Dresden Hbf', lat:51.0504, lon:13.7373, trainMinutes:75, baseCost:18, dticket:true, weekend:true, hiddenGem:false, categories:['culture','museums','city','castles','christmas markets'], highlights:['Altstadt museums','Elbe river walks','Pillnitz Palace'], eventHints:['Striezelmarkt','Dixieland Festival'] },
  { id:'erfurt', name:'Erfurt', country:'Germany', station:'Erfurt Hbf', lat:50.9848, lon:11.0299, trainMinutes:75, baseCost:18, dticket:true, weekend:true, hiddenGem:false, categories:['old town','culture','cathedral','food'], highlights:['Krämerbrücke','Cathedral steps','Egapark'], eventHints:['DomStufen-Festspiele','Christmas Market'] },
  { id:'weimar', name:'Weimar', country:'Germany', station:'Weimar', lat:50.9795, lon:11.3235, trainMinutes:95, baseCost:18, dticket:true, weekend:true, hiddenGem:false, categories:['culture','museums','parks','unesco'], highlights:['Goethe houses','Bauhaus Museum','Park an der Ilm'], eventHints:['Zwiebelmarkt'] },
  { id:'naumburg', name:'Naumburg', country:'Germany', station:'Naumburg(Saale)Hbf', lat:51.1526, lon:11.8096, trainMinutes:65, baseCost:14, dticket:true, weekend:true, hiddenGem:true, categories:['cathedral','wine','old town','nature'], highlights:['Naumburg Cathedral','Saale-Unstrut wine region','Old town lanes'], eventHints:['Hussiten-Kirschfest'] },
  { id:'quedlinburg', name:'Quedlinburg', country:'Germany', station:'Quedlinburg', lat:51.7905, lon:11.1414, trainMinutes:160, baseCost:20, dticket:true, weekend:true, hiddenGem:false, categories:['unesco','old town','castles','half-timbered'], highlights:['UNESCO old town','Castle hill','Fachwerk streets'], eventHints:['Advent in den Höfen'] },
  { id:'wernigerode', name:'Wernigerode', country:'Germany', station:'Wernigerode', lat:51.8365, lon:10.7822, trainMinutes:155, baseCost:20, dticket:true, weekend:true, hiddenGem:false, categories:['nature','castles','harz','old town'], highlights:['Wernigerode Castle','Harz foothills','Old town hall'], eventHints:['Walpurgis celebrations nearby'] },
  { id:'goslar', name:'Goslar', country:'Germany', station:'Goslar', lat:51.9059, lon:10.4289, trainMinutes:205, baseCost:23, dticket:true, weekend:true, hiddenGem:false, categories:['unesco','harz','mines','old town'], highlights:['Imperial Palace','Rammelsberg mine','Harz hikes'], eventHints:['Goslar Christmas Market'] },
  { id:'bamberg', name:'Bamberg', country:'Germany', station:'Bamberg', lat:49.8988, lon:10.9028, trainMinutes:155, baseCost:28, dticket:false, weekend:true, hiddenGem:false, categories:['unesco','beer','old town','culture'], highlights:['Little Venice','Cathedral hill','Franconian breweries'], eventHints:['Sandkerwa'] },
  { id:'nuernberg', name:'Nuremberg', country:'Germany', station:'Nürnberg Hbf', lat:49.4521, lon:11.0767, trainMinutes:185, baseCost:30, dticket:false, weekend:true, hiddenGem:false, categories:['museums','castle','history','christmas markets'], highlights:['Imperial Castle','Germanisches Nationalmuseum','Old town'], eventHints:['Christkindlesmarkt','Bardentreffen'] },
  { id:'regensburg', name:'Regensburg', country:'Germany', station:'Regensburg Hbf', lat:49.0134, lon:12.1016, trainMinutes:250, baseCost:36, dticket:false, weekend:true, hiddenGem:false, categories:['unesco','danube','old town','culture'], highlights:['Stone Bridge','Cathedral','Danube riverfront'], eventHints:['Dult folk festivals'] },
  { id:'halle', name:'Halle (Saale)', country:'Germany', station:'Halle(Saale)Hbf', lat:51.4969, lon:11.9688, trainMinutes:25, baseCost:8, dticket:true, weekend:true, hiddenGem:true, categories:['museums','old town','culture','river'], highlights:['Moritzburg Museum','Francke Foundations','Saale river'], eventHints:['Handel Festival','Lantern Festival'] },
  { id:'dessau', name:'Dessau-Roßlau', country:'Germany', station:'Dessau Hbf', lat:51.8308, lon:12.2426, trainMinutes:55, baseCost:12, dticket:true, weekend:true, hiddenGem:true, categories:['bauhaus','parks','unesco','nature'], highlights:['Bauhaus Dessau','Masters Houses','Garden Kingdom nearby'], eventHints:['Kurt Weill Fest'] },
  { id:'woerlitz', name:'Wörlitz Garden Realm', country:'Germany', station:'Dessau Hbf', lat:51.8462, lon:12.4212, trainMinutes:80, baseCost:14, dticket:true, weekend:true, hiddenGem:true, categories:['parks','unesco','nature','palace'], highlights:['Wörlitz Park','Lakes and bridges','Dessau-Wörlitz UNESCO landscape'], eventHints:['Gartenreich summer concerts'] },
  { id:'meissen', name:'Meißen', country:'Germany', station:'Meißen', lat:51.1610, lon:13.4737, trainMinutes:115, baseCost:18, dticket:true, weekend:true, hiddenGem:true, categories:['castle','porcelain','old town','wine'], highlights:['Albrechtsburg Castle','Porcelain manufactory','Elbe wine hills'], eventHints:['Meißen wine festival'] },
  { id:'goerlitz', name:'Görlitz', country:'Germany', station:'Görlitz', lat:51.1528, lon:14.9872, trainMinutes:220, baseCost:24, dticket:true, weekend:true, hiddenGem:true, categories:['old town','architecture','culture','border'], highlights:['Film-like old town','Polish Zgorzelec walk','Art Nouveau buildings'], eventHints:['ViaThea street theatre'] },
  { id:'chemnitz', name:'Chemnitz', country:'Germany', station:'Chemnitz Hbf', lat:50.8278, lon:12.9214, trainMinutes:70, baseCost:15, dticket:true, weekend:true, hiddenGem:true, categories:['museums','industrial culture','modernism'], highlights:['Kunstsammlungen','Kaßberg architecture','Industrial Museum'], eventHints:['Capital of Culture 2025 events'] },
  { id:'zwickau', name:'Zwickau', country:'Germany', station:'Zwickau(Sachs)Hbf', lat:50.7189, lon:12.4961, trainMinutes:80, baseCost:15, dticket:true, weekend:true, hiddenGem:true, categories:['music','automotive','old town'], highlights:['Robert Schumann House','August Horch Museum','Cathedral square'], eventHints:['Schumann Festival'] },
  { id:'jena', name:'Jena', country:'Germany', station:'Jena Paradies', lat:50.9271, lon:11.5892, trainMinutes:80, baseCost:16, dticket:true, weekend:true, hiddenGem:true, categories:['nature','city','museums','hiking'], highlights:['Saale valley trails','Zeiss Planetarium','Botanical garden'], eventHints:['Kulturarena Jena'] },
  { id:'saalfeld', name:'Saalfeld Fairy Grottoes', country:'Germany', station:'Saalfeld(Saale)', lat:50.6483, lon:11.3654, trainMinutes:135, baseCost:18, dticket:true, weekend:true, hiddenGem:true, categories:['nature','caves','family','hiking'], highlights:['Fairy Grottoes','Thuringian Forest edge','Old town'], eventHints:['Grottoneum events'] },
  { id:'magdeburg', name:'Magdeburg', country:'Germany', station:'Magdeburg Hbf', lat:52.1205, lon:11.6276, trainMinutes:90, baseCost:18, dticket:true, weekend:true, hiddenGem:true, categories:['cathedral','elbe','architecture','city'], highlights:['Magdeburg Cathedral','Hundertwasser Green Citadel','Elbauenpark'], eventHints:['Riverside festivals'] },
  { id:'potsdam', name:'Potsdam', country:'Germany', station:'Potsdam Hbf', lat:52.3906, lon:13.0645, trainMinutes:130, baseCost:22, dticket:true, weekend:true, hiddenGem:false, categories:['palaces','parks','unesco','lakes'], highlights:['Sanssouci Park','Dutch Quarter','Havel lakes'], eventHints:['Potsdam Palace Night'] },
  { id:'berlin', name:'Berlin', country:'Germany', station:'Berlin Hbf', lat:52.5200, lon:13.4050, trainMinutes:75, baseCost:25, dticket:false, weekend:true, hiddenGem:false, categories:['museums','nightlife','culture','city'], highlights:['Museum Island','Neighborhood food','Tempelhofer Feld'], eventHints:['Berlinale','Fête de la Musique'] },
  { id:'hamburg', name:'Hamburg', country:'Germany', station:'Hamburg Hbf', lat:53.5511, lon:9.9937, trainMinutes:210, baseCost:45, dticket:false, weekend:true, hiddenGem:false, categories:['harbor','museums','music','city'], highlights:['Harbor ferries','Speicherstadt','Elbphilharmonie plaza'], eventHints:['Harbour Birthday','Reeperbahn Festival'] },
  { id:'luebeck', name:'Lübeck', country:'Germany', station:'Lübeck Hbf', lat:53.8655, lon:10.6866, trainMinutes:255, baseCost:46, dticket:false, weekend:true, hiddenGem:false, categories:['unesco','old town','marzipan','baltic'], highlights:['Holstentor','Old town island','Travemünde side trip'], eventHints:['Nordic Film Days'] },
  { id:'rostock', name:'Rostock & Warnemünde', country:'Germany', station:'Rostock Hbf', lat:54.0924, lon:12.0991, trainMinutes:235, baseCost:44, dticket:false, weekend:true, hiddenGem:false, categories:['sea','old town','nature','beach'], highlights:['Warnemünde beach','Harbor','Brick Gothic old town'], eventHints:['Hanse Sail'] },
  { id:'stralsund', name:'Stralsund', country:'Germany', station:'Stralsund Hbf', lat:54.3091, lon:13.0818, trainMinutes:275, baseCost:48, dticket:false, weekend:true, hiddenGem:false, categories:['sea','unesco','museums','islands'], highlights:['Ozeaneum','UNESCO old town','Rügen gateway'], eventHints:['Wallensteintage'] },
  { id:'munich', name:'Munich', country:'Germany', station:'München Hbf', lat:48.1351, lon:11.5820, trainMinutes:250, baseCost:55, dticket:false, weekend:true, hiddenGem:false, categories:['museums','beer gardens','alps','city'], highlights:['Pinakotheken','English Garden','Day trips to lakes'], eventHints:['Oktoberfest','Tollwood'] },
  { id:'heidelberg', name:'Heidelberg', country:'Germany', station:'Heidelberg Hbf', lat:49.3988, lon:8.6724, trainMinutes:310, baseCost:50, dticket:false, weekend:true, hiddenGem:false, categories:['castle','romantic city','river','hiking'], highlights:['Castle ruins','Philosophers’ Walk','Old bridge'], eventHints:['Castle illuminations'] },
  { id:'kassel', name:'Kassel', country:'Germany', station:'Kassel-Wilhelmshöhe', lat:51.3127, lon:9.4797, trainMinutes:135, baseCost:28, dticket:false, weekend:true, hiddenGem:true, categories:['parks','museums','unesco','nature'], highlights:['Bergpark Wilhelmshöhe','Hercules monument','Grimmwelt'], eventHints:['documenta'] },
  { id:'hannover', name:'Hannover', country:'Germany', station:'Hannover Hbf', lat:52.3759, lon:9.7320, trainMinutes:170, baseCost:32, dticket:false, weekend:true, hiddenGem:true, categories:['gardens','museums','city','lakes'], highlights:['Herrenhäuser Gärten','Maschsee','Sprengel Museum'], eventHints:['Maschsee Festival'] },
  { id:'prague', name:'Prague', country:'Czechia', station:'Praha hl.n.', lat:50.0755, lon:14.4378, trainMinutes:240, baseCost:38, dticket:false, weekend:true, hiddenGem:false, categories:['culture','old town','castles','beer'], highlights:['Castle district','Charles Bridge','Czech food and beer'], eventHints:['Signal Festival','Christmas markets'] },
  { id:'liberec', name:'Liberec', country:'Czechia', station:'Liberec', lat:50.7663, lon:15.0543, trainMinutes:260, baseCost:32, dticket:false, weekend:true, hiddenGem:true, categories:['mountains','architecture','nature','city'], highlights:['Ještěd mountain','Town hall','Jizera Mountains'], eventHints:['Anifilm nearby'] },
  { id:'poznan', name:'Poznań', country:'Poland', station:'Poznan Glowny', lat:52.4064, lon:16.9252, trainMinutes:250, baseCost:34, dticket:false, weekend:true, hiddenGem:true, categories:['old town','food','museums','lakes'], highlights:['Old Market Square','Croissant Museum','Lake Malta'], eventHints:['Malta Festival'] },
  { id:'wroclaw', name:'Wrocław', country:'Poland', station:'Wroclaw Glowny', lat:51.1079, lon:17.0385, trainMinutes:300, baseCost:40, dticket:false, weekend:true, hiddenGem:false, categories:['old town','islands','culture','food'], highlights:['Market Square','Oder islands','Dwarf trail'], eventHints:['New Horizons Film Festival'] },
  { id:'krakow', name:'Kraków', country:'Poland', station:'Krakow Glowny', lat:50.0647, lon:19.9450, trainMinutes:480, baseCost:60, dticket:false, weekend:false, hiddenGem:false, categories:['culture','old town','museums','food'], highlights:['Wawel Castle','Kazimierz','Main Square'], eventHints:['Jewish Culture Festival'] },
  { id:'vienna', name:'Vienna', country:'Austria', station:'Wien Hbf', lat:48.2082, lon:16.3738, trainMinutes:430, baseCost:65, dticket:false, weekend:false, hiddenGem:false, categories:['museums','music','palaces','city'], highlights:['MuseumsQuartier','Schönbrunn','Coffee houses'], eventHints:['Viennale','Christmas markets'] },
  { id:'salzburg', name:'Salzburg', country:'Austria', station:'Salzburg Hbf', lat:47.8095, lon:13.0550, trainMinutes:410, baseCost:70, dticket:false, weekend:false, hiddenGem:false, categories:['mountains','music','old town','castles'], highlights:['Hohensalzburg Fortress','Old town','Alpine views'], eventHints:['Salzburg Festival'] },
  { id:'basel', name:'Basel', country:'Switzerland', station:'Basel SBB', lat:47.5596, lon:7.5886, trainMinutes:440, baseCost:75, dticket:false, weekend:false, hiddenGem:false, categories:['museums','river','old town','art'], highlights:['Kunstmuseum','Rhine swims in summer','Old town'], eventHints:['Art Basel','Basel Fasnacht'] },
  { id:'amsterdam', name:'Amsterdam', country:'Netherlands', station:'Amsterdam Centraal', lat:52.3676, lon:4.9041, trainMinutes:480, baseCost:70, dticket:false, weekend:false, hiddenGem:false, categories:['museums','canals','city','culture'], highlights:['Rijksmuseum','Canals','Noord ferry'], eventHints:['King’s Day','Amsterdam Light Festival'] },
  { id:'copenhagen', name:'Copenhagen', country:'Denmark', station:'København H', lat:55.6761, lon:12.5683, trainMinutes:520, baseCost:80, dticket:false, weekend:false, hiddenGem:false, categories:['design','sea','food','city'], highlights:['Nyhavn','Designmuseum','Harbor baths'], eventHints:['Distortion','Jazz Festival'] },
  { id:'brussels', name:'Brussels', country:'Belgium', station:'Bruxelles-Midi', lat:50.8503, lon:4.3517, trainMinutes:500, baseCost:75, dticket:false, weekend:false, hiddenGem:false, categories:['museums','food','art nouveau','city'], highlights:['Grand Place','Comic art','Art Nouveau walks'], eventHints:['Flower Carpet'] },
];

export const INTERESTS = ['nature','museums','culture','castles','old town','city','parks','sea','food','unesco','festivals'];

export function budgetFit(destination, budget) {
  return Number(destination.baseCost || 0) <= Number(budget || 0);
}

export function weatherQuality(weather = {}) {
  const rainPenalty = Math.min(45, Number(weather.precipitationHours || 0) * 7 + Number(weather.precipitationSum || 0) * 2);
  const cloudPenalty = Math.min(35, Number(weather.cloudCover || 0) * 0.35);
  const coldPenalty = weather.maxTemp < 7 ? 12 : weather.maxTemp < 12 ? 6 : 0;
  const severePenalty = [61,63,65,66,67,71,73,75,80,81,82,95,96,99].includes(Number(weather.weatherCode)) ? 20 : 0;
  return Math.max(0, Math.round(100 - rainPenalty - cloudPenalty - coldPenalty - severePenalty));
}

export function scoreDestination(destination, weather = {}, filters = {}) {
  let score = weatherQuality(weather);
  const budget = Number(filters.budget || 60);
  if (budgetFit(destination, budget)) score += 22; else score -= Math.min(35, (destination.baseCost - budget) * 1.2);
  if (filters.deutschlandTicket && destination.dticket) score += 18;
  if (destination.hiddenGem) score += 8;
  if (destination.weekend && Number(filters.days || 2) <= 3) score += 8;
  if (Number(destination.trainMinutes || 999) <= 120) score += 8;
  if (Number(destination.trainMinutes || 999) > 360 && Number(filters.days || 2) <= 2) score -= 18;
  const wanted = new Set((filters.interests || []).map(x => String(x).toLowerCase()));
  for (const cat of destination.categories || []) if (wanted.has(String(cat).toLowerCase())) score += 6;
  return Math.max(0, Math.round(score));
}

export function classifyTrip(destination, weather, filters) {
  const score = scoreDestination(destination, weather, filters);
  if (score >= 115) return 'Excellent pick';
  if (score >= 90) return 'Strong option';
  if (score >= 70) return 'Possible';
  return 'Skip for now';
}

export function buildDbSearchUrl(destination, date = new Date()) {
  const day = date.toISOString().slice(0,10);
  const from = encodeURIComponent(HOME.name);
  const to = encodeURIComponent(destination.station || destination.name);
  return `https://www.bahn.de/buchung/fahrplan/suche#sts=true&so=${from}&zo=${to}&hd=${day}T08:00:00`;
}

export function buildFlixBusUrl(destination) {
  return `https://www.flixbus.de/busverbindung/bus-leipzig-${encodeURIComponent(destination.name.toLowerCase().replaceAll(' ','-'))}`;
}

export function buildFlightDealLinks(maxBudget = 150) {
  const budget = encodeURIComponent(String(maxBudget));
  return [
    { label: 'Google Flights from Berlin BER', url: `https://www.google.com/travel/flights?q=Flights%20from%20Berlin%20under%20${budget}%20EUR` },
    { label: 'Google Flights from Prague PRG', url: `https://www.google.com/travel/flights?q=Flights%20from%20Prague%20under%20${budget}%20EUR` },
    { label: 'Google Flights from Leipzig/Halle LEJ', url: `https://www.google.com/travel/flights?q=Flights%20from%20Leipzig%20under%20${budget}%20EUR` },
    { label: 'Skyscanner Leipzig departures', url: 'https://www.skyscanner.de/transport/flights-from/lej/' },
    { label: 'Ryanair deals from nearby airports', url: 'https://www.ryanair.com/de/de/angebote' },
  ];
}

export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function makeGoogleEventsUrl(destination) {
  return `https://www.google.com/search?q=${encodeURIComponent(destination.name + ' upcoming festivals events')}`;
}

export function filterDestinations(filters = {}, weatherById = {}) {
  return DESTINATIONS
    .filter(d => (Number(filters.days || 2) > 3 || d.weekend))
    .filter(d => !filters.deutschlandTicketOnly || d.dticket)
    .filter(d => !filters.country || filters.country === 'all' || d.country === filters.country)
    .map(d => ({ ...d, weather: weatherById[d.id] || null, score: scoreDestination(d, weatherById[d.id] || {}, filters) }))
    .sort((a,b) => b.score - a.score);
}
