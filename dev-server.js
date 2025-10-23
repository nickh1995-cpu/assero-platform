const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve Next.js source directly (this is a workaround)
app.use(express.static(path.join(__dirname, 'src/app')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/valuation', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Valuation - ASSERO</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0b1220 0%, #1a202c 100%);
      color: #e6edf7;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #fff; }
    .lead { font-size: 1.125rem; color: #9fb2c8; margin-bottom: 2rem; }
    .tabs { display: flex; gap: 12px; margin-bottom: 24px; }
    .tab-btn { 
      padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #e6edf7; cursor: pointer; font-size: 14px; font-weight: 500;
      transition: all 0.2s;
    }
    .tab-btn:hover { background: rgba(255,255,255,0.08); }
    .tab-btn.active { background: #1e40af; border-color: #1e40af; }
    .card { 
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 24px; margin-bottom: 20px;
    }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    label { display: block; margin-bottom: 6px; font-size: 14px; color: #9fb2c8; }
    input, select { 
      width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e6edf7;
      font-size: 14px;
    }
    input:focus, select:focus { outline: none; border-color: #1e40af; }
    .btn-primary { 
      padding: 12px 32px; background: #1e40af; color: #fff; border: none;
      border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: #1e3a8a; }
    .result { margin-top: 24px; }
    .result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
    .result-item { padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; }
    .result-label { font-size: 12px; color: #9fb2c8; margin-bottom: 4px; }
    .result-value { font-size: 20px; font-weight: 600; color: #fff; }
    .hidden { display: none; }
    .comps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
    .comp-card { padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Asset Valuation</h1>
    <p class="lead">Premium-Schätzung mit transparenten Parametern und Comps. Für Immobilien, Luxusuhren und Fahrzeuge.</p>
    
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('real-estate')">Immobilien</button>
      <button class="tab-btn" onclick="switchTab('luxusuhren')">Luxusuhren</button>
      <button class="tab-btn" onclick="switchTab('fahrzeuge')">Fahrzeuge</button>
    </div>
    
    <div id="real-estate-form" class="card">
      <div class="form-grid">
        <div><label>Lage-Tier</label><select id="re-tier"><option value="1">1 (Toplage)</option><option value="2">2 (Gute Lage)</option><option value="3">3 (Solide)</option></select></div>
        <div><label>Fläche (m²)</label><input id="re-area" type="number" value="120"></div>
        <div><label>Zimmer</label><input id="re-rooms" type="number" value="4"></div>
        <div><label>Zustand</label><select id="re-condition"><option value="new">Neubau</option><option value="renovated" selected>Saniert</option><option value="needs_renovation">Renovierungsbedürftig</option></select></div>
      </div>
    </div>
    
    <div id="luxusuhren-form" class="card hidden">
      <div class="form-grid">
        <div><label>Marken-Tier</label><select id="w-brand"><option value="1">1 (Patek/Rolex)</option><option value="2">2 (Omega/IWC)</option><option value="3">3 (Tudor)</option></select></div>
        <div><label>Modell-Grad</label><select id="w-grade"><option value="1">Icon</option><option value="2">Core</option><option value="3">Entry</option></select></div>
        <div><label>Zustand</label><select id="w-condition"><option value="mint">Mint</option><option value="very_good" selected>Sehr gut</option><option value="good">Gut</option></select></div>
      </div>
    </div>
    
    <div id="fahrzeuge-form" class="card hidden">
      <div class="form-grid">
        <div><label>Segment</label><select id="v-segment"><option value="sports">Sports</option><option value="luxury">Luxury</option><option value="suv">SUV</option></select></div>
        <div><label>Brand-Tier</label><select id="v-brand"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
        <div><label>Baujahr</label><input id="v-year" type="number" value="2021"></div>
        <div><label>Kilometer</label><input id="v-mileage" type="number" value="22000"></div>
      </div>
    </div>
    
    <button class="btn-primary" onclick="calculate()">Bewerten</button>
    
    <div id="result" class="result hidden">
      <div class="card">
        <h2>Schätzung</h2>
        <div class="result-grid">
          <div class="result-item"><div class="result-label">Bandbreite</div><div class="result-value" id="range"></div></div>
          <div class="result-item"><div class="result-label">Mid</div><div class="result-value" id="mid"></div></div>
          <div class="result-item"><div class="result-label">Confidence</div><div class="result-value" id="confidence"></div></div>
          <div class="result-item"><div class="result-label">Währung</div><div class="result-value">EUR</div></div>
        </div>
        <div id="comps-section"></div>
      </div>
    </div>
  </div>
  
  <script>
    let currentTab = 'real-estate';
    
    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('real-estate-form').classList.toggle('hidden', tab !== 'real-estate');
      document.getElementById('luxusuhren-form').classList.toggle('hidden', tab !== 'luxusuhren');
      document.getElementById('fahrzeuge-form').classList.toggle('hidden', tab !== 'fahrzeuge');
    }
    
    function fmt(n) { return new Intl.NumberFormat('de-DE', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(n); }
    
    function calculate() {
      let est, low, high, conf, comps = [];
      
      if (currentTab === 'real-estate') {
        const tier = +document.getElementById('re-tier').value;
        const area = +document.getElementById('re-area').value;
        const base = tier === 1 ? 12500 : tier === 2 ? 8500 : 6000;
        est = Math.round(area * base);
        low = Math.round(est * 0.88);
        high = Math.round(est * 1.12);
        conf = tier === 1 ? 0.78 : 0.72;
        comps = [{title:'Penthouse', price:est*0.95}, {title:'Premium-Apartment', price:est*1.02}, {title:'Stadthaus', price:est*0.98}];
      } else if (currentTab === 'luxusuhren') {
        const brand = +document.getElementById('w-brand').value;
        est = brand === 1 ? 18000 : brand === 2 ? 8500 : 4200;
        low = Math.round(est * 0.82);
        high = Math.round(est * 1.18);
        conf = 0.74;
        comps = [{title:'Diver Full Set', price:est*0.98}, {title:'Chronograph', price:est*0.9}, {title:'Dress Watch', price:est*0.8}];
      } else {
        const year = +document.getElementById('v-year').value;
        const mileage = +document.getElementById('v-mileage').value;
        est = 220000 * Math.max(0.6, 1 - (2025-year)*0.05) * (mileage > 60000 ? 0.88 : 0.93);
        low = Math.round(est * 0.85);
        high = Math.round(est * 1.15);
        conf = 0.72;
        comps = [{title:'Sports Coupé', price:est*0.95}, {title:'Luxury Sedan', price:est*0.9}, {title:'SUV', price:est*0.92}];
      }
      
      document.getElementById('range').textContent = fmt(low) + ' – ' + fmt(high);
      document.getElementById('mid').textContent = fmt(est);
      document.getElementById('confidence').textContent = Math.round(conf*100) + '%';
      
      const compsHtml = '<h3 style="margin-top:20px;color:#9fb2c8;font-size:14px">Vergleichswerte</h3><div class="comps">' +
        comps.map(c => '<div class="comp-card"><div style="font-weight:600">'+c.title+'</div><div>'+fmt(c.price)+'</div></div>').join('') +
        '</div>';
      document.getElementById('comps-section').innerHTML = compsHtml;
      document.getElementById('result').classList.remove('hidden');
    }
  </script>
</body>
</html>
  `);
});

app.get('/', (req, res) => {
  res.redirect('/valuation');
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('✅ Dev-Server läuft auf http://localhost:' + PORT + '/valuation');
});

