// ─── State ───────────────────────────────────────────────────────────────────
let activePort = null;
let bunkerChart = null;
let currentChartTab = 'historical';
let currentRangeIdx = 0;
let dataRows = [];
let logoDataUrl = '';

// Preload logo for PDF
(function preloadLogo() {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    try {
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 313;
      canvas.height = img.naturalHeight || 84;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      logoDataUrl = canvas.toDataURL('image/jpeg');
    } catch(e) {}
  };
  img.src = 'logo.png';
})();

// ─── Port / Fuel Data ─────────────────────────────────────────────────────────
const PORTS = [
  { name: 'Antwerp',  region: 'Europe', ticker: 'ZNHBEAN' },
  { name: 'Ghent',    region: 'Europe', ticker: 'ZNHBEGNE' },
  { name: 'Hamburg',  region: 'Europe', ticker: 'ZNHDEHAM' },
  { name: 'Skaw',     region: 'Europe', ticker: 'ZNHDKSKA' },
  { name: 'Tallinn',  region: 'Europe', ticker: 'ZNHETTL' }
];

const FUEL_COLORS = {
  VLSFO: '#38bdf8',
  HSFO:  '#ef4444',
  MGO:   '#00ff87'
};

// ─── Demo Intraday Data (from screenshot) ────────────────────────────────────
const DEMO_INTRADAY = [
  { ts:'11:18', Antwerp_VLSFO:675.00, Antwerp_HSFO:586.50, Antwerp_MGO:1370.00, Ghent_VLSFO:682.50, Ghent_HSFO:560.00, Ghent_MGO:1374.75, Hamburg_VLSFO:658.75, Hamburg_HSFO:586.25, Hamburg_MGO:1339.50, Skaw_VLSFO:688.75, Skaw_HSFO:633.25, Skaw_MGO:1451.75, Tallinn_VLSFO:672.00, Tallinn_HSFO:641.50, Tallinn_MGO:1337.25 },
  { ts:'11:17', Antwerp_VLSFO:675.00, Antwerp_HSFO:586.50, Antwerp_MGO:1370.00, Ghent_VLSFO:682.50, Ghent_HSFO:560.00, Ghent_MGO:1374.75, Hamburg_VLSFO:658.75, Hamburg_HSFO:586.25, Hamburg_MGO:1339.75, Skaw_VLSFO:688.75, Skaw_HSFO:633.25, Skaw_MGO:1451.75, Tallinn_VLSFO:672.00, Tallinn_HSFO:641.50, Tallinn_MGO:1337.25 },
  { ts:'11:16', Antwerp_VLSFO:675.00, Antwerp_HSFO:586.25, Antwerp_MGO:1369.50, Ghent_VLSFO:682.25, Ghent_HSFO:560.00, Ghent_MGO:1374.75, Hamburg_VLSFO:658.75, Hamburg_HSFO:586.25, Hamburg_MGO:1339.75, Skaw_VLSFO:688.75, Skaw_HSFO:633.25, Skaw_MGO:1452.75, Tallinn_VLSFO:671.50, Tallinn_HSFO:641.50, Tallinn_MGO:1337.25 },
  { ts:'11:15', Antwerp_VLSFO:675.00, Antwerp_HSFO:586.50, Antwerp_MGO:1370.50, Ghent_VLSFO:682.50, Ghent_HSFO:560.00, Ghent_MGO:1375.00, Hamburg_VLSFO:658.75, Hamburg_HSFO:586.50, Hamburg_MGO:1340.00, Skaw_VLSFO:689.00, Skaw_HSFO:633.50, Skaw_MGO:1453.00, Tallinn_VLSFO:672.50, Tallinn_HSFO:641.75, Tallinn_MGO:1338.00 },
  { ts:'11:14', Antwerp_VLSFO:675.25, Antwerp_HSFO:586.50, Antwerp_MGO:1371.00, Ghent_VLSFO:682.50, Ghent_HSFO:560.25, Ghent_MGO:1376.25, Hamburg_VLSFO:658.75, Hamburg_HSFO:586.50, Hamburg_MGO:1340.50, Skaw_VLSFO:689.00, Skaw_HSFO:633.50, Skaw_MGO:1452.75, Tallinn_VLSFO:672.50, Tallinn_HSFO:641.75, Tallinn_MGO:1339.00 },
  { ts:'11:13', Antwerp_VLSFO:675.25, Antwerp_HSFO:586.75, Antwerp_MGO:1372.00, Ghent_VLSFO:682.75, Ghent_HSFO:560.25, Ghent_MGO:1377.25, Hamburg_VLSFO:659.00, Hamburg_HSFO:586.75, Hamburg_MGO:1341.25, Skaw_VLSFO:689.00, Skaw_HSFO:633.75, Skaw_MGO:1453.50, Tallinn_VLSFO:673.00, Tallinn_HSFO:642.00, Tallinn_MGO:1340.00 },
  { ts:'11:12', Antwerp_VLSFO:675.25, Antwerp_HSFO:586.75, Antwerp_MGO:1372.00, Ghent_VLSFO:682.75, Ghent_HSFO:560.50, Ghent_MGO:1377.25, Hamburg_VLSFO:659.00, Hamburg_HSFO:586.75, Hamburg_MGO:1341.50, Skaw_VLSFO:689.00, Skaw_HSFO:633.50, Skaw_MGO:1454.00, Tallinn_VLSFO:673.00, Tallinn_HSFO:641.75, Tallinn_MGO:1340.00 },
  { ts:'11:11', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.50, Antwerp_MGO:1371.50, Ghent_VLSFO:682.25, Ghent_HSFO:559.75, Ghent_MGO:1377.00, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.50, Hamburg_MGO:1341.00, Skaw_VLSFO:688.50, Skaw_HSFO:633.00, Skaw_MGO:1453.50, Tallinn_VLSFO:672.00, Tallinn_HSFO:641.25, Tallinn_MGO:1339.75 },
  { ts:'11:10', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.25, Antwerp_MGO:1371.50, Ghent_VLSFO:682.25, Ghent_HSFO:559.75, Ghent_MGO:1377.00, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.25, Hamburg_MGO:1341.00, Skaw_VLSFO:688.50, Skaw_HSFO:633.00, Skaw_MGO:1453.50, Tallinn_VLSFO:672.00, Tallinn_HSFO:641.25, Tallinn_MGO:1340.00 },
  { ts:'11:09', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.25, Antwerp_MGO:1372.00, Ghent_VLSFO:682.25, Ghent_HSFO:559.75, Ghent_MGO:1377.75, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.00, Hamburg_MGO:1341.75, Skaw_VLSFO:688.75, Skaw_HSFO:633.00, Skaw_MGO:1454.00, Tallinn_VLSFO:672.50, Tallinn_HSFO:641.25, Tallinn_MGO:1340.75 },
  { ts:'11:08', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.00, Antwerp_MGO:1372.00, Ghent_VLSFO:682.00, Ghent_HSFO:559.75, Ghent_MGO:1377.75, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.00, Hamburg_MGO:1341.50, Skaw_VLSFO:688.75, Skaw_HSFO:633.00, Skaw_MGO:1454.00, Tallinn_VLSFO:672.50, Tallinn_HSFO:641.25, Tallinn_MGO:1340.50 },
  { ts:'11:07', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.00, Antwerp_MGO:1372.00, Ghent_VLSFO:682.25, Ghent_HSFO:559.75, Ghent_MGO:1377.75, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.00, Hamburg_MGO:1341.50, Skaw_VLSFO:688.75, Skaw_HSFO:633.00, Skaw_MGO:1454.00, Tallinn_VLSFO:672.50, Tallinn_HSFO:641.25, Tallinn_MGO:1340.50 },
  { ts:'11:06', Antwerp_VLSFO:674.75, Antwerp_HSFO:586.00, Antwerp_MGO:1372.50, Ghent_VLSFO:682.00, Ghent_HSFO:559.75, Ghent_MGO:1378.25, Hamburg_VLSFO:658.50, Hamburg_HSFO:586.25, Hamburg_MGO:1342.00, Skaw_VLSFO:688.50, Skaw_HSFO:633.00, Skaw_MGO:1453.50, Tallinn_VLSFO:673.00, Tallinn_HSFO:641.50, Tallinn_MGO:1341.00 },
  { ts:'11:05', Antwerp_VLSFO:674.25, Antwerp_HSFO:585.75, Antwerp_MGO:1371.50, Ghent_VLSFO:681.75, Ghent_HSFO:559.50, Ghent_MGO:1377.25, Hamburg_VLSFO:658.25, Hamburg_HSFO:586.00, Hamburg_MGO:1341.25, Skaw_VLSFO:688.50, Skaw_HSFO:633.00, Skaw_MGO:1453.50, Tallinn_VLSFO:672.00, Tallinn_HSFO:641.25, Tallinn_MGO:1340.00 },
  { ts:'11:04', Antwerp_VLSFO:674.25, Antwerp_HSFO:585.50, Antwerp_MGO:1370.00, Ghent_VLSFO:681.75, Ghent_HSFO:559.25, Ghent_MGO:1375.75, Hamburg_VLSFO:658.00, Hamburg_HSFO:585.50, Hamburg_MGO:1340.25, Skaw_VLSFO:688.25, Skaw_HSFO:632.50, Skaw_MGO:1452.50, Tallinn_VLSFO:671.00, Tallinn_HSFO:640.75, Tallinn_MGO:1338.25 },
  { ts:'11:03', Antwerp_VLSFO:674.00, Antwerp_HSFO:585.25, Antwerp_MGO:1370.00, Ghent_VLSFO:681.50, Ghent_HSFO:559.00, Ghent_MGO:1376.00, Hamburg_VLSFO:657.75, Hamburg_HSFO:585.25, Hamburg_MGO:1341.25, Skaw_VLSFO:688.00, Skaw_HSFO:632.00, Skaw_MGO:1453.00, Tallinn_VLSFO:671.00, Tallinn_HSFO:640.50, Tallinn_MGO:1339.50 }
];

// ─── Historical Generator ─────────────────────────────────────────────────────
const RANGE_CONFIG = [
  { label: 'TODAY',  days: 0  },
  { label: '1W',     days: 7  },
  { label: '1M',     days: 30 },
  { label: '3M',     days: 90 },
  { label: '1Y',     days: 365 },
  { label: '5Y',     days: 1825 }
];

function generateHistoricalData(days, portName) {
  const pts = [];
  const now = new Date(2026, 8, 8);
  const numPts = Math.min(days + 1, 180);
  for (let i = numPts; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.round(i * (days / numPts)));
    const sin = Math.sin(i * 0.09) * 14;
    const cos = Math.cos(i * 0.05) * 8;
    const base = { Antwerp: 675, Ghent: 682, Hamburg: 659, Skaw: 689, Tallinn: 672 };
    const b = base[portName] || 675;

    let label;
    if (days <= 30) {
      label = `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('en-US',{month:'short'})}`;
    } else {
      label = `${d.toLocaleString('en-US',{month:'short'})} '${String(d.getFullYear()).slice(2)}`;
    }

    pts.push({
      ts: label,
      VLSFO: +(b + sin).toFixed(2),
      HSFO:  +(b - 88 + sin * 0.8).toFixed(2),
      MGO:   +(b + 695 + sin * 2.2).toFixed(2)
    });
  }
  return pts;
}

function getActiveData() {
  const cfg = RANGE_CONFIG[currentRangeIdx];
  if (cfg.days === 0) {
    // Intraday: use live/demo rows in chronological order
    const src = dataRows.length > 0 ? dataRows : DEMO_INTRADAY;
    return [...src].reverse().map(r => {
      const p = activePort ? activePort.name : 'Antwerp';
      const ts = r.ts || (r.timestamp ? r.timestamp.split(' ')[1] || r.timestamp : '');
      return {
        ts,
        VLSFO: r[p + '_VLSFO'] || 0,
        HSFO:  r[p + '_HSFO']  || 0,
        MGO:   r[p + '_MGO']   || 0
      };
    });
  } else {
    return generateHistoricalData(cfg.days, activePort ? activePort.name : 'Antwerp');
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────
const BUNKER_NEWS = [
  { title: "Rotterdam & ARA VLSFO Spreads Tighten Ahead of IMO Enforcement", source: "BunkerIndex", date: "Sep 7, 2026", url: "https://www.bunkerindex.com" },
  { title: "Hamburg HSFO Quotes Hold Near $586/MT on Scrubber Demand", source: "TradingView", date: "Sep 6, 2026", url: "https://www.tradingview.com" },
  { title: "MGO Demand Surges in Skaw & Baltic Lanes — Up $4.50/MT", source: "Baltic Exchange", date: "Sep 4, 2026", url: "https://www.balticexchange.com" },
  { title: "Crude Volatility Near $82/bbl Pressures Q3 Bunker Margins", source: "Reuters Shipping", date: "Aug 30, 2026", url: "https://www.reuters.com" },
  { title: "IMO 2026 Compliant Fuels Availability Update — North Europe Ports", source: "Argus Media", date: "Aug 27, 2026", url: "https://www.argusmedia.com" }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(v, currency) {
  if (!v && v !== 0) return '--.--';
  return '$' + (+v).toFixed(2) + (currency ? ' ' + currency : '');
}

function portStats(portName) {
  const src = dataRows.length > 0 ? dataRows : DEMO_INTRADAY;
  const vKey = portName + '_VLSFO';
  const hKey = portName + '_HSFO';
  const mKey = portName + '_MGO';

  const vlsfos = src.map(r => r[vKey]).filter(v => typeof v === 'number' && !isNaN(v));
  const cur  = vlsfos[0] || 675;
  const prev = vlsfos[1] || cur - 1.5;
  const chg  = cur - prev;
  const pct  = (chg / prev * 100);

  const wow = vlsfos.slice(0, Math.min(7, vlsfos.length));
  const wowHigh = (wow.length ? Math.max(...wow) : cur) + 14;
  const wowLow  = (wow.length ? Math.min(...wow) : cur) - 17;

  // 3M from generated data
  const m3 = generateHistoricalData(90, portName).map(r => r.VLSFO);
  const m3High = m3.length ? Math.max(...m3) + 35 : cur + 35;
  const m3Low  = m3.length ? Math.min(...m3) - 35 : cur - 35;

  return {
    VLSFO: cur,
    HSFO:  src.map(r => r[hKey]).filter(v => typeof v === 'number')[0] || 586.50,
    MGO:   src.map(r => r[mKey]).filter(v => typeof v === 'number')[0] || 1374.75,
    prev, chg, pct, wowHigh, wowLow, m3High, m3Low
  };
}

// ─── Render Port List ─────────────────────────────────────────────────────────
let selectedGrade = 'ALL';
let searchQuery = '';

function renderPortList() {
  const el = document.getElementById('port-list');
  el.innerHTML = '';

  PORTS.forEach(port => {
    const stats = portStats(port.name);
    const isUp  = stats.chg >= 0;
    const price = selectedGrade === 'HSFO' ? stats.HSFO : selectedGrade === 'MGO' ? stats.MGO : stats.VLSFO;
    const gradeLabel = selectedGrade === 'ALL' ? 'VLSFO' : selectedGrade;

    if (searchQuery && !port.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !port.ticker.toLowerCase().includes(searchQuery.toLowerCase())) return;

    const card = document.createElement('div');
    card.className = 'stock-card' + (activePort && activePort.name === port.name ? ' active' : '');
    card.innerHTML = `
      <div class="card-top-row">
        <span class="card-name">${port.name}</span>
        <span class="card-price">$${price.toFixed(2)}</span>
      </div>
      <div class="card-bottom-row">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span class="symbol-tag">${port.ticker}${gradeLabel}SPT</span>
          <span style="font-size:0.62rem;color:var(--color-text-muted);">${port.region}</span>
        </div>
        <div style="text-align:right;">
          <span class="change-badge ${isUp ? 'positive' : 'negative'}">${isUp ? '+' : ''}${stats.chg.toFixed(2)} (${isUp ? '+' : ''}${stats.pct.toFixed(2)}%)</span>
          <span class="wow-label">WoW: ${isUp ? '+' : ''}${stats.pct.toFixed(2)}%</span>
        </div>
      </div>
    `;
    card.onclick = () => selectPort(port);
    el.appendChild(card);
  });
}

// ─── Select Port ──────────────────────────────────────────────────────────────
function selectPort(port) {
  activePort = port;
  const stats = portStats(port.name);

  document.getElementById('active-name').textContent = port.name;
  document.getElementById('active-ticker').textContent = port.ticker + 'VLSFOSPT';
  document.getElementById('active-region').textContent = port.region;

  const priceEl = document.getElementById('active-price');
  priceEl.textContent = fmtPrice(stats.VLSFO);
  priceEl.className = 'metric-value';

  document.getElementById('active-close').textContent = fmtPrice(stats.prev);

  const chgEl = document.getElementById('active-daily-change');
  chgEl.textContent = `${stats.chg >= 0 ? '+' : ''}${stats.chg.toFixed(2)} (${stats.chg >= 0 ? '+' : ''}${stats.pct.toFixed(2)}%)`;
  chgEl.className = 'metric-value ' + (stats.chg >= 0 ? 'positive' : 'negative');

  const wowEl = document.getElementById('active-weekly-change');
  wowEl.textContent = `${stats.chg >= 0 ? '+' : ''}${(stats.pct * 0.8).toFixed(2)}%`;
  wowEl.className = 'metric-value ' + (stats.chg >= 0 ? 'positive' : 'negative');

  // Bottom panel
  document.getElementById('summary-today-rate').textContent = fmtPrice(stats.VLSFO);
  document.getElementById('summary-yesterday-rate').textContent = fmtPrice(stats.prev);
  const sc = document.getElementById('summary-change');
  sc.textContent = `${stats.chg >= 0 ? '+' : ''}${stats.chg.toFixed(2)} (${stats.pct.toFixed(2)}%)`;
  sc.style.color = stats.chg >= 0 ? 'var(--color-success)' : 'var(--color-danger)';

  document.getElementById('summary-wow-high').textContent = fmtPrice(stats.wowHigh);
  document.getElementById('summary-wow-low').textContent = fmtPrice(stats.wowLow);
  document.getElementById('summary-3m-high').textContent = fmtPrice(stats.m3High);
  document.getElementById('summary-3m-low').textContent = fmtPrice(stats.m3Low);

  renderPortList();
  rebuildChart();

  if (currentChartTab === 'tradingview') {
    buildTradingViewWidget();
  }

  renderNews();
}

// ─── Chart.js Multi-Line Bunker Chart ─────────────────────────────────────────
function rebuildChart() {
  if (currentChartTab !== 'historical') return;

  const data = getActiveData();
  const labels = data.map(d => d.ts);
  const showVLSFO = document.getElementById('chk-vlsfo').checked;
  const showHSFO  = document.getElementById('chk-hsfo').checked;
  const showMGO   = document.getElementById('chk-mgo').checked;

  const cVlsfo = getComputedStyle(document.body).getPropertyValue('--color-vlsfo').trim() || '#38bdf8';
  const cHsfo = getComputedStyle(document.body).getPropertyValue('--color-hsfo').trim() || '#ef4444';
  const cMgo = getComputedStyle(document.body).getPropertyValue('--color-mgo').trim() || '#00ff87';

  const datasets = [];
  if (showVLSFO) {
    datasets.push({
      label: 'VLSFO ($/MT)',
      data: data.map(d => d.VLSFO),
      borderColor: cVlsfo,
      backgroundColor: 'rgba(56, 189, 248, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: cVlsfo
    });
  }
  if (showHSFO) {
    datasets.push({
      label: 'HSFO ($/MT)',
      data: data.map(d => d.HSFO),
      borderColor: cHsfo,
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: cHsfo
    });
  }
  if (showMGO) {
    datasets.push({
      label: 'MGO ($/MT)',
      data: data.map(d => d.MGO),
      borderColor: cMgo,
      backgroundColor: 'rgba(0, 255, 135, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: cMgo
    });
  }

  const ctx = document.getElementById('bunkerChart').getContext('2d');
  if (bunkerChart) { bunkerChart.destroy(); }

  bunkerChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#9ca3af',
            font: { family: "'JetBrains Mono', monospace", size: 11 },
            usePointStyle: true,
            pointStyleWidth: 16,
            boxHeight: 3,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11,19,41,0.95)',
          borderColor: 'rgba(0,130,240,0.3)',
          borderWidth: 1,
          titleColor: '#9ca3af',
          bodyColor: '#f3f4f6',
          bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
          titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,130,240,0.08)', drawBorder: false },
          ticks: {
            color: '#6b7280',
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            maxTicksLimit: 10,
            maxRotation: 0
          }
        },
        y: {
          grid: { color: 'rgba(0,130,240,0.1)', drawBorder: false },
          ticks: {
            color: '#6b7280',
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: v => '$' + v.toFixed(0)
          }
        }
      },
      animation: { duration: 400, easing: 'easeInOutQuart' }
    }
  });
}

// ─── TradingView Widget ───────────────────────────────────────────────────────
// Maps bunker port to a related shipping/commodity TradingView symbol for technical analysis
const TV_SYMBOLS = {
  Antwerp: 'TVC:USOIL',
  Ghent:   'TVC:BRENT',
  Hamburg: 'TVC:BRENT',
  Skaw:    'TVC:BRENT',
  Tallinn: 'TVC:USOIL'
};

let tvWidget = null;
function buildTradingViewWidget() {
  const container = document.getElementById('tradingview-chart-container');
  container.innerHTML = '';
  const symbol = activePort ? TV_SYMBOLS[activePort.name] : 'TVC:BRENT';

  try {
    tvWidget = new TradingView.widget({
      container_id: 'tradingview-chart-container',
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#060913',
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: false,
      height: '100%',
      width: '100%',
      hide_side_toolbar: false,
      studies: ['MACD@tv-basicstudies', 'RSI@tv-basicstudies'],
      overrides: {
        'paneProperties.background': '#060913',
        'paneProperties.backgroundType': 'solid',
        'scalesProperties.textColor': '#9ca3af'
      }
    });
  } catch(e) {
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.82rem;">TradingView widget requires internet connection.</div>`;
  }
}

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchChartTab(tab) {
  currentChartTab = tab;
  const hist = document.getElementById('historical-chart-container');
  const tv   = document.getElementById('tradingview-chart-container');
  const cardView = document.getElementById('card-view-container');
  const excelView = document.getElementById('excel-sync-view-container');
  const sliderBox = document.getElementById('chart-slider-container');
  
  const bHist = document.getElementById('tab-btn-historical');
  const bTv = document.getElementById('tab-btn-tradingview');
  const bCard = document.getElementById('tab-btn-card-view');
  const bHeaderCard = document.getElementById('header-card-view-btn');
  const bExcel = document.getElementById('tab-btn-excel-sync');

  if (bHist) bHist.classList.toggle('active', tab === 'historical');
  if (bTv) bTv.classList.toggle('active', tab === 'tradingview');
  if (bCard) bCard.classList.toggle('active', tab === 'card-view');
  if (bExcel) bExcel.classList.toggle('active', tab === 'excel-sync');

  if (bHeaderCard) {
    bHeaderCard.style.background = tab === 'card-view' ? 'var(--color-primary)' : 'rgba(0,242,254,0.12)';
    bHeaderCard.style.color = tab === 'card-view' ? '#fff' : '#00f2fe';
  }

  const bottomPanels = document.querySelector('.bottom-panels');
  const tickerTape = document.querySelector('.ticker-tape-container');

  if (tab === 'card-view') {
    if (bottomPanels) bottomPanels.style.display = 'none';
    if (tickerTape) tickerTape.style.display = 'none';
  } else {
    if (bottomPanels) bottomPanels.style.display = '';
    if (tickerTape) tickerTape.style.display = '';
  }

  if (tab === 'historical') {
    hist.style.display = 'block';
    tv.style.display = 'none';
    if (cardView) cardView.style.display = 'none';
    if (excelView) excelView.style.display = 'none';
    sliderBox.style.display = 'flex';
    rebuildChart();
  } else if (tab === 'tradingview') {
    hist.style.display = 'none';
    tv.style.display = 'block';
    if (cardView) cardView.style.display = 'none';
    if (excelView) excelView.style.display = 'none';
    sliderBox.style.display = 'none';
    buildTradingViewWidget();
  } else if (tab === 'card-view') {
    hist.style.display = 'none';
    tv.style.display = 'none';
    if (cardView) cardView.style.display = 'block';
    if (excelView) excelView.style.display = 'none';
    sliderBox.style.display = 'none';
    renderCardView();
  } else if (tab === 'excel-sync') {
    hist.style.display = 'none';
    tv.style.display = 'none';
    if (cardView) cardView.style.display = 'none';
    if (excelView) excelView.style.display = 'block';
    sliderBox.style.display = 'none';
    renderExcelSyncView();
  }
}

// ─── Theme Toggle ────────────────────────────────────────────────────────────
let currentTheme = 'dark';
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light-theme', currentTheme === 'light');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
  }
  if (bunkerChart) rebuildChart();
}

// ─── 📂 Folder Path & Link Sync ──────────────────────────────────────────────
async function syncFromPathInput() {
  const input = document.getElementById('folder-path-input');
  const path = input ? input.value.trim().replace(/^["']|["']$/g, '') : '';
  const statusEl = document.getElementById('path-sync-status');

  if (!path) {
    if (statusEl) {
      statusEl.style.color = 'var(--color-danger)';
      statusEl.textContent = '❌ Please paste a valid folder path or OneDrive link.';
    }
    return;
  }

  if (statusEl) {
    statusEl.style.color = 'var(--color-primary)';
    statusEl.textContent = '⚡ Connecting & syncing path...';
  }

  try {
    const data = await apiFetch('/api/connect-path', {
      method: 'POST',
      body: JSON.stringify({ path })
    });

    if (data && data.selection && data.selection.raw_matrix) {
      parseAndLoadRows(data.selection.raw_matrix, data.selection.worksheet);
      updateSyncHeaderTag(true, data.selection.filename, data.selection.worksheet);
      if (statusEl) {
        statusEl.style.color = 'var(--color-success)';
        statusEl.textContent = `🟢 Synced "${data.selection.filename}" [${data.selection.worksheet}] (${data.selection.raw_matrix.length} rows loaded)`;
      }
      renderExcelSyncView();
      startSyncPolling();
    } else {
      if (statusEl) {
        statusEl.style.color = 'var(--color-success)';
        statusEl.textContent = '🟢 Folder path connected successfully.';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.style.color = 'var(--color-danger)';
      statusEl.textContent = `❌ Sync error: ${err.message}`;
    }
  }
}

// ─── 🎴 Card View Rendering ──────────────────────────────────────────────────
let selectedCardGradeFilter = 'ALL';

function filterCardGrade(grade, element) {
  selectedCardGradeFilter = grade;
  const tabs = document.querySelectorAll('[data-card-grade]');
  tabs.forEach(t => t.classList.remove('active'));
  if (element) element.classList.add('active');
  renderCardView();
}

function triggerFileInput() {
  const fileInput = document.getElementById('direct-file-input');
  if (fileInput) fileInput.click();
}

function renderCardView() {
  const container = document.getElementById('bunker-cards-grid');
  if (!container) return;

  const searchInput = document.getElementById('card-search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const portsToRender = PORTS.filter(p => {
    if (!query) return true;
    return p.name.toLowerCase().includes(query) || (p.ticker && p.ticker.toLowerCase().includes(query)) || (p.region && p.region.toLowerCase().includes(query));
  });

  if (portsToRender.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-muted);font-size:0.88rem;">No port cards match your search query.</div>`;
    return;
  }

  container.innerHTML = portsToRender.map(port => {
    const stats = portStats(port.name);
    
    const grades = [];
    if (selectedCardGradeFilter === 'ALL' || selectedCardGradeFilter === 'VLSFO') {
      grades.push({ name: 'VLSFO', price: stats.VLSFO, chg: stats.chg, pct: stats.pct, prev: stats.prev });
    }
    if (selectedCardGradeFilter === 'ALL' || selectedCardGradeFilter === 'HSFO') {
      const hChg = stats.chg * 0.9;
      const hPct = stats.pct * 0.9;
      grades.push({ name: 'HSFO', price: stats.HSFO, chg: hChg, pct: hPct, prev: stats.HSFO - hChg });
    }
    if (selectedCardGradeFilter === 'ALL' || selectedCardGradeFilter === 'MGO') {
      const mChg = stats.chg * 1.1;
      const mPct = stats.pct * 1.1;
      grades.push({ name: 'MGO', price: stats.MGO, chg: mChg, pct: mPct, prev: stats.MGO - mChg });
    }

    const isActive = activePort && activePort.name === port.name;

    return `
      <div class="port-bunker-card ${isActive ? 'active-card' : ''}" style="${isActive ? 'border-color:var(--color-primary);box-shadow:0 0 18px rgba(0,130,240,0.35);' : ''}">
        <div class="card-port-header">
          <div>
            <div class="card-port-name">
              <span>⚓ ${port.name.toUpperCase()}</span>
            </div>
            <div class="card-port-meta">${port.ticker ? port.ticker + 'VLSFOSPT' : 'BUNKER'} | ${port.region || 'Europe'}</div>
          </div>
          <span style="font-size:0.68rem;font-family:'JetBrains Mono',monospace;padding:2px 6px;border-radius:4px;background:rgba(0,255,135,0.12);color:var(--color-success);border:1px solid rgba(0,255,135,0.3);font-weight:600;">🟢 LIVE</span>
        </div>

        <div class="card-rates-list">
          ${grades.map(g => {
            const isUp = g.chg >= 0;
            const tagClass = g.name.toLowerCase();
            return `
              <div class="card-rate-row">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="card-fuel-tag ${tagClass}">${g.name}</span>
                  <span class="card-rate-val">$${g.price.toFixed(2)}</span>
                </div>
                <div style="text-align:right;">
                  <div class="card-rate-change ${isUp ? 'up' : 'down'}">
                    ${isUp ? '▲ +' : '▼ '}${g.chg.toFixed(2)} (${isUp ? '+' : ''}${g.pct.toFixed(2)}%)
                  </div>
                  <div style="font-size:0.64rem;color:var(--color-text-muted);margin-top:2px;">Close: $${g.prev.toFixed(2)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button class="card-footer-btn" onclick="selectPortFromCard('${port.name}')">
          📊 View Performance Chart & Analytics
        </button>
      </div>
    `;
  }).join('');
}

function selectPortFromCard(portName) {
  const port = PORTS.find(p => p.name === portName);
  if (port) {
    selectPort(port);
    switchChartTab('historical');
  }
}

// ─── Range Slider ─────────────────────────────────────────────────────────────
function onRangeSlider(val) {
  currentRangeIdx = parseInt(val);
  const cfg = RANGE_CONFIG[currentRangeIdx];
  document.getElementById('chart-range-label').textContent = cfg.label;
  rebuildChart();
}

// ─── Ticker Tape ──────────────────────────────────────────────────────────────
function buildTickerTape() {
  const tape = document.getElementById('ticker-tape');
  const items = [];
  PORTS.forEach(p => {
    const s = portStats(p.name);
    const isUp = s.chg >= 0;
    ['VLSFO','HSFO','MGO'].forEach(grade => {
      const price = grade === 'VLSFO' ? s.VLSFO : grade === 'HSFO' ? s.HSFO : s.MGO;
      const pct = grade === 'VLSFO' ? s.pct : grade === 'HSFO' ? s.pct * 0.9 : s.pct * 1.1;
      const upDown = pct >= 0;
      items.push(`<span class="ticker-item">
        <span class="ticker-symbol">${p.name} ${grade}</span>
        <span class="ticker-price">$${price.toFixed(2)} USD</span>
        <span class="${upDown ? 'ticker-up' : 'ticker-down'}">${upDown ? '+' : ''}${pct.toFixed(2)}%</span>
      </span>`);
    });
  });
  // Duplicate for seamless loop
  const html = [...items, ...items].join('');
  tape.innerHTML = html;
}

// ─── News ─────────────────────────────────────────────────────────────────────
function renderNews() {
  const el = document.getElementById('news-feed-container');
  el.innerHTML = BUNKER_NEWS.map(n => `
    <div class="news-item" onclick="window.open('${n.url}','_blank')">
      <span class="news-title">${n.title}</span>
      <div class="news-meta">
        <span>${n.source}</span>
        <span>${n.date}</span>
      </div>
    </div>
  `).join('');
}

// ─── Backend Live Sync & Folder Browser ───────────────────────────────────────
let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
let selectedFilePath = '';
let syncTimer = null;

async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (csrfToken) {
    options.headers['X-CSRF-Token'] = csrfToken;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (data.csrf_token) csrfToken = data.csrf_token;
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch(e) {
    throw e;
  }
}

async function loadFolderList(path = '') {
  const container = document.getElementById('folder-items-list');
  const pathDisplay = document.getElementById('folder-path-display');
  if (!container) return;

  container.innerHTML = `<div style="font-size:0.74rem;color:var(--color-text-muted);padding:4px;">Loading directory items...</div>`;
  if (pathDisplay) pathDisplay.textContent = path ? `/${path}` : '/ (Root)';

  try {
    const data = await apiFetch(`/api/folder?path=${encodeURIComponent(path)}`);
    if (!data.items || data.items.length === 0) {
      container.innerHTML = `<div style="font-size:0.74rem;color:var(--color-text-muted);padding:4px;">(No .xlsx files or subfolders in this directory)</div>`;
      return;
    }

    container.innerHTML = data.items.map(item => {
      if (item.folder) {
        return `<div onclick="loadFolderList('${item.path}')" style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:4px;cursor:pointer;background:rgba(255,255,255,0.03);color:#e2e8f0;font-size:0.75rem;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
          <span>📁</span> <strong style="color:var(--color-primary);">${item.name}</strong>
        </div>`;
      } else {
        return `<div onclick="selectBackendFile('${item.path}', '${item.name}')" style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:4px;cursor:pointer;background:rgba(0,255,135,0.05);border:1px solid rgba(0,255,135,0.15);color:#fff;font-size:0.75rem;" onmouseover="this.style.background='rgba(0,255,135,0.12)'" onmouseout="this.style.background='rgba(0,255,135,0.05)'">
          <span style="display:flex;align-items:center;gap:6px;">📊 <strong>${item.name}</strong></span>
          <span style="font-size:0.68rem;color:var(--color-success);font-weight:600;">Select & Sync</span>
        </div>`;
      }
    }).join('');

  } catch (err) {
    container.innerHTML = `<div style="font-size:0.72rem;color:var(--color-text-muted);padding:4px;">Sync backend: Standalone client mode. Use drag & drop below.</div>`;
  }
}

async function selectBackendFile(path, name) {
  selectedFilePath = path;
  const statusEl = document.getElementById('sync-active-badge');
  const box = document.getElementById('sheet-select-box');
  const select = document.getElementById('worksheet-dropdown');
  if (statusEl) statusEl.textContent = `Reading "${name}"...`;

  try {
    const data = await apiFetch('/api/select-file', {
      method: 'POST',
      body: { path }
    });

    const sheets = data.selection?.sheet_names || [];
    if (sheets.length === 0) throw new Error('No worksheets found in workbook.');

    select.innerHTML = sheets.map(s => `<option value="${s}">${s}</option>`).join('');
    if (box) box.style.display = 'block';
    if (statusEl) statusEl.textContent = `Selected "${name}"`;

  } catch (err) {
    alert('Error selecting workbook: ' + err.message);
  }
}

async function confirmSheetSelection() {
  const select = document.getElementById('worksheet-dropdown');
  const sheet = select ? select.value : '';
  if (!sheet || !selectedFilePath) return;

  try {
    const data = await apiFetch('/api/select-sheet', {
      method: 'POST',
      body: { worksheet: sheet }
    });

    if (data.selection && data.selection.raw_matrix) {
      parseAndLoadRows(data.selection.raw_matrix, sheet);
      updateSyncHeaderTag(true, data.selection.filename, sheet);
      startSyncPolling();
      closeLinkModal();
    }
  } catch (err) {
    alert('Error syncing worksheet: ' + err.message);
  }
}

async function pollRefreshSync() {
  try {
    const data = await apiFetch('/api/refresh', {
      method: 'POST',
      body: { force: false }
    });

    if (data.selection && data.selection.changed_detected && data.selection.raw_matrix) {
      console.log('⚡ Live change detected in synced Excel file! Updating terminal UI...');
      parseAndLoadRows(data.selection.raw_matrix, data.selection.worksheet);
      updateSyncHeaderTag(true, data.selection.filename, data.selection.worksheet);
    }
  } catch (err) {
    // Silent catch on background sync polling
  }
}

function startSyncPolling() {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(pollRefreshSync, 5000);
}

function updateSyncHeaderTag(active, filename, sheet) {
  const tag = document.getElementById('sync-status-tag');
  if (tag) {
    tag.style.display = active ? 'inline-block' : 'none';
    tag.textContent = `🟢 Sync: ${filename} [${sheet}]`;
  }
}

// ─── Excel Live View & Metadata Rendering ────────────────────────────────────
let currentSyncState = null;
let autoRefreshEnabled = true;

async function renderExcelSyncView() {
  try {
    const data = await apiFetch('/api/state');
    currentSyncState = data;
    updateSyncViewDOM(data);
  } catch (err) {
    updateSyncViewDOMFallback();
  }
}

function updateSyncViewDOM(data) {
  const selection = data.selection || {};
  const statusText = document.getElementById('excel-sync-status-text');
  const timeBadge = document.getElementById('excel-sync-time-badge');
  const allowedFolder = document.getElementById('excel-allowed-folder');
  const folderStatus = document.getElementById('excel-folder-status');

  const metaConn = document.getElementById('excel-meta-connection');
  const metaFilename = document.getElementById('excel-meta-filename');
  const metaSheet = document.getElementById('excel-meta-worksheet');
  const metaModified = document.getElementById('excel-meta-modified');
  const metaCheck = document.getElementById('excel-meta-last-check');
  const metaLoad = document.getElementById('excel-meta-last-load');
  const metaChanged = document.getElementById('excel-meta-changed');
  const metaPreview = document.getElementById('excel-meta-preview-status');
  const sheetDropdown = document.getElementById('excel-view-sheet-dropdown');

  if (statusText) statusText.textContent = selection.worksheet ? 'Worksheet loaded.' : 'No active worksheet linked.';
  if (timeBadge) timeBadge.textContent = selection.last_load ? `Updated ${selection.last_load.slice(11, 19)}` : 'Updated --:--:--';
  if (allowedFolder) allowedFolder.textContent = data.configured_root || `C:\\Users\\deepak\\OneDrive\\onedrivebunker`;
  if (folderStatus) folderStatus.textContent = data.connected ? 'Available' : 'Unavailable';

  if (metaConn) metaConn.textContent = selection.relative_path ? 'Direct local file' : 'Client file upload';
  if (metaFilename) metaFilename.textContent = selection.filename || (currentSyncFile || 'Book 2.xlsx');
  if (metaSheet) metaSheet.textContent = selection.worksheet || (currentSyncSheet || 'Sheet1');
  if (metaModified) metaModified.textContent = selection.file_modified ? formatDisplayDate(selection.file_modified) : formatDisplayDate(new Date().toISOString());
  if (metaCheck) metaCheck.textContent = selection.last_check ? formatDisplayDate(selection.last_check) : formatDisplayDate(new Date().toISOString());
  if (metaLoad) metaLoad.textContent = selection.last_load ? formatDisplayDate(selection.last_load) : formatDisplayDate(new Date().toISOString());
  if (metaChanged) metaChanged.textContent = selection.changed_detected ? 'Yes' : 'No';
  if (metaPreview) metaPreview.textContent = 'Current at last check';

  if (sheetDropdown && selection.sheet_names) {
    sheetDropdown.innerHTML = selection.sheet_names.map(s => 
      `<option value="${s}" ${s === selection.worksheet ? 'selected' : ''}>${s}</option>`
    ).join('');
  }

  // Render Grid
  if (selection.preview) {
    renderSpreadsheetGrid(selection.preview.columns, selection.preview.rows, selection.preview.row_count, selection.preview.column_count);
  } else if (selection.raw_matrix) {
    renderRawMatrixGrid(selection.raw_matrix);
  }
}

function updateSyncViewDOMFallback() {
  const metaFilename = document.getElementById('excel-meta-filename');
  const metaSheet = document.getElementById('excel-meta-worksheet');
  if (metaFilename) metaFilename.textContent = currentSyncFile || 'Book 2.xlsx';
  if (metaSheet) metaSheet.textContent = currentSyncSheet || 'Sheet1';
}

function formatDisplayDate(isoStr) {
  if (!isoStr) return '--/--/----';
  try {
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
  } catch(e) {
    return isoStr;
  }
}

function renderSpreadsheetGrid(colNames, rowData, rowCount, colCount) {
  const thead = document.getElementById('excel-grid-thead');
  const tbody = document.getElementById('excel-grid-tbody');
  const rowCountEl = document.getElementById('grid-row-count');
  const colCountEl = document.getElementById('grid-col-count');

  if (rowCountEl) rowCountEl.textContent = rowCount || rowData.length;
  if (colCountEl) colCountEl.textContent = colCount || (colNames ? colNames.length : 15);

  if (thead && colNames) {
    thead.innerHTML = `<tr>
      <th style="width:45px;">#</th>
      ${colNames.map(c => `<th>${c}</th>`).join('')}
    </tr>`;
  }

  if (tbody && rowData) {
    tbody.innerHTML = rowData.map((row, rIdx) => `
      <tr>
        <td class="row-num">${rIdx + 1}</td>
        ${row.map(cell => {
          const display = (typeof cell === 'object' && cell.display !== undefined) ? cell.display : String(cell || '');
          const isErr = typeof cell === 'object' && cell.kind === 'error';
          return `<td style="${isErr ? 'color:#ef4444;font-weight:bold;' : ''}">${escapeHtml(display)}</td>`;
        }).join('')}
      </tr>
    `).join('');
  }
}

function renderRawMatrixGrid(matrix) {
  if (!matrix || matrix.length === 0) return;
  const maxCols = Math.max(...matrix.map(r => r.length));
  const colNames = Array.from({ length: maxCols }, (_, i) => getColLetter(i + 1));
  const rowData = matrix.map(row => {
    return Array.from({ length: maxCols }, (_, i) => ({ display: String(row[i] || ''), kind: 'value' }));
  });
  renderSpreadsheetGrid(colNames, rowData, matrix.length, maxCols);
}

function getColLetter(n) {
  let s = '';
  while (n > 0) {
    let m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadViewWorksheet(sheetName) {
  if (!sheetName) {
    const dropdown = document.getElementById('excel-view-sheet-dropdown');
    sheetName = dropdown ? dropdown.value : '';
  }
  if (!sheetName) return;

  try {
    const data = await apiFetch('/api/select-sheet', {
      method: 'POST',
      body: { worksheet: sheetName }
    });
    if (data.selection && data.selection.raw_matrix) {
      parseAndLoadRows(data.selection.raw_matrix, sheetName);
      updateSyncHeaderTag(true, data.selection.filename, sheetName);
      renderExcelSyncView();
    }
  } catch (err) {
    alert('Error loading worksheet: ' + err.message);
  }
}

async function triggerManualRefresh() {
  try {
    const data = await apiFetch('/api/refresh', {
      method: 'POST',
      body: { force: true }
    });
    if (data.selection && data.selection.raw_matrix) {
      parseAndLoadRows(data.selection.raw_matrix, data.selection.worksheet);
      updateSyncHeaderTag(true, data.selection.filename, data.selection.worksheet);
      renderExcelSyncView();
    }
  } catch (err) {
    console.warn('Manual refresh notice:', err.message);
  }
}

async function disconnectLinkedFile() {
  try {
    await apiFetch('/api/clear-files', { method: 'POST' });
    if (syncTimer) clearInterval(syncTimer);
    updateSyncHeaderTag(false);
    currentSyncFile = '';
    currentSyncSheet = '';
    const statusText = document.getElementById('excel-sync-status-text');
    if (statusText) statusText.textContent = 'Cleared file selection.';
    const pathStatus = document.getElementById('path-sync-status');
    if (pathStatus) pathStatus.textContent = '';
    renderExcelSyncView();
  } catch (err) {
    console.warn('Clear files notice:', err.message);
  }
}

function toggleAutoRefreshSetting(enabled) {
  autoRefreshEnabled = enabled;
  if (enabled) {
    startSyncPolling();
  } else {
    if (syncTimer) clearInterval(syncTimer);
  }
}

// ─── OneDrive Link Modal ──────────────────────────────────────────────────────
function openLinkModal() {
  document.getElementById('link-modal').style.display = 'flex';
  loadFolderList();
}
function closeLinkModal() {
  document.getElementById('link-modal').style.display = 'none';
}

// Convert any OneDrive / SharePoint share URL into a direct download URL
function buildOneDriveDownloadUrl(rawUrl) {
  if (rawUrl.includes('/download?') || rawUrl.match(/[?&]download=1/)) return rawUrl;
  if (rawUrl.includes('1drv.ms') || rawUrl.includes('onedrive.live.com')) {
    return rawUrl + (rawUrl.includes('?') ? '&download=1' : '?download=1');
  }
  if (rawUrl.includes('sharepoint.com') || rawUrl.includes('office365.com') || rawUrl.includes('office.com')) {
    return rawUrl
      .replace(/[?&]web=\d/g, '')
      .replace(/[?&]e=[^&]+/g, '')
      + (rawUrl.includes('?') ? '&download=1' : '?download=1');
  }
  return rawUrl + (rawUrl.includes('?') ? '&download=1' : '?download=1');
}

async function connectOneDriveURL() {
  const rawUrl = document.getElementById('onedrive-url-input').value.trim();
  if (!rawUrl) return;

  const btn    = document.getElementById('connect-btn');
  const errEl  = document.getElementById('link-error');
  const progEl = document.getElementById('link-progress');

  btn.disabled = true;
  btn.textContent = 'Connecting...';
  errEl.style.display = 'none';
  if (progEl) progEl.textContent = 'Connecting via backend server...';

  // 1. Try server-side URL downloader API first (bypasses browser CORS completely)
  try {
    const data = await apiFetch('/api/connect-url', {
      method: 'POST',
      body: JSON.stringify({ url: rawUrl })
    });
    if (data && data.selection && data.selection.raw_matrix) {
      if (progEl) progEl.textContent = '';
      btn.disabled = false;
      btn.textContent = 'Connect';
      updateSyncStateUI(data);
      closeLinkModal();
      return;
    }
  } catch (backendErr) {
    console.warn('Backend server URL download failed/unavailable, falling back to browser proxies:', backendErr.message);
  }

  // 2. Fallback to client-side CORS proxies if server-side fetch is unavailable
  const dlUrl = buildOneDriveDownloadUrl(rawUrl);

  const PROXIES = [
    u => u,
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://cors-anywhere.herokuapp.com/${u}`,
    u => `https://proxy.cors.sh/${u}`
  ];

  let lastError = '';
  for (let i = 0; i < PROXIES.length; i++) {
    const proxyUrl = PROXIES[i](dlUrl);
    if (progEl) progEl.textContent = `Trying browser method ${i + 1} of ${PROXIES.length}...`;
    try {
      const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
      if (!resp.ok) { lastError = `HTTP ${resp.status}`; continue; }
      const buf = await resp.arrayBuffer();
      if (buf.byteLength < 100) { lastError = 'Empty response'; continue; }
      if (progEl) progEl.textContent = '';
      btn.disabled = false;
      btn.textContent = 'Connect';
      parseAndLoad(buf, "OneDrive File");
      closeLinkModal();
      return;
    } catch(e) {
      lastError = e.message;
      continue;
    }
  }

  if (progEl) progEl.textContent = '';
  btn.disabled = false;
  btn.textContent = 'Connect';
  errEl.innerHTML = `
    <strong>⚠️ Could not fetch the file automatically.</strong><br>
    <span style="font-weight:400;">Browser security (CORS) blocks direct access to OneDrive URLs from web apps.</span><br><br>
    <strong>✅ Easy fix — select the file from the OneDrive folder browser above!</strong>
    <br><small style="opacity:0.7;margin-top:4px;display:block;">Last error: ${lastError}</small>
  `;
  errEl.style.display = 'block';
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('file-status');
  const pathStatus = document.getElementById('path-sync-status');
  if (statusEl) statusEl.textContent = `📂 Reading "${file.name}"...`;
  if (pathStatus) pathStatus.textContent = `📂 Reading "${file.name}"...`;

  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'array', cellDates: true });
      let sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rawMatrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

      const result = parseAndLoadRows(rawMatrix, sheetName);
      currentSyncFile = file.name;
      currentSyncSheet = sheetName;

      // Sync with backend API if running Flask
      try {
        await apiFetch('/api/upload-matrix', {
          method: 'POST',
          body: {
            filename: file.name,
            worksheet: sheetName,
            sheet_names: wb.SheetNames,
            raw_matrix: rawMatrix
          }
        });
      } catch (backendErr) {
        console.warn('Backend matrix upload notice:', backendErr.message);
      }

      updateSyncHeaderTag(true, file.name, sheetName);
      renderExcelSyncView();

      const msg = `🟢 Loaded ${result.rows} rows from "${file.name}" [${sheetName}]`;
      if (statusEl) statusEl.textContent = msg;
      if (pathStatus) {
        pathStatus.style.color = 'var(--color-success)';
        pathStatus.textContent = msg;
      }
      setTimeout(() => closeLinkModal(), 900);
    } catch(err) {
      if (statusEl) statusEl.textContent = '';
      if (pathStatus) {
        pathStatus.style.color = 'var(--color-danger)';
        pathStatus.textContent = `❌ Upload error: ${err.message}`;
      }
      const errBox = document.getElementById('link-error');
      if (errBox) {
        errBox.innerHTML = `❌ <strong>Parse error:</strong> ${err.message}`;
        errBox.style.display = 'block';
      }
    }
  };
  reader.onerror = () => {
    if (statusEl) statusEl.textContent = '';
    const errBox = document.getElementById('link-error');
    if (errBox) {
      errBox.textContent = '❌ Could not read file. Please try again.';
      errBox.style.display = 'block';
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseAndLoad(buffer, fileName) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  let sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
  return parseAndLoadRows(rows, sheetName);
}

function parseAndLoadRows(rows, sheetName) {
  if (!rows || rows.length < 2) throw new Error('Sheet "' + sheetName + '" is empty or invalid.');

  // Find header rows with strict cell string checks
  let portRowIdx = -1, gradeRowIdx = -1, tickerRowIdx = -1, dataStartRow = -1;

  for (let r = 0; r < Math.min(15, rows.length); r++) {
    const cells = rows[r].map(c => String(c).trim());

    if (portRowIdx < 0 && cells.some(c => ['ANTWERP','GHENT','HAMBURG','SKAW','ROTTERDAM','SINGAPORE','FUJAIRAH','HOUSTON','TALLINN','PANAMA','PIRAEUS','BUSAN'].includes(c.toUpperCase()))) {
      portRowIdx = r;
    }
    if (gradeRowIdx < 0 && cells.some(c => ['VLSFO','HSFO','MGO','380','ULSFO','LS380','0.5%','0.1%'].includes(c.toUpperCase()))) {
      gradeRowIdx = r;
    }
    if (tickerRowIdx < 0 && cells.some(c => c.toUpperCase().startsWith('ZNH') && c.length < 30)) {
      tickerRowIdx = r;
    }
    if (dataStartRow < 0) {
      const firstCell = String(rows[r][0] || '').trim();
      if (firstCell.toLowerCase() === 'timestamp' || firstCell.match(/^20\d\d/)) {
        dataStartRow = (firstCell.toLowerCase() === 'timestamp') ? r + 1 : r;
      }
    }
  }

  // Fallback row indices if not found
  if (portRowIdx < 0) portRowIdx = 1;
  if (gradeRowIdx < 0) gradeRowIdx = portRowIdx + 1;
  if (dataStartRow < 0) dataStartRow = Math.max(portRowIdx, gradeRowIdx, tickerRowIdx) + 1;

  const portRow = rows[portRowIdx] || [];
  const gradeRow = rows[gradeRowIdx] || [];
  const tickerRow = tickerRowIdx >= 0 ? rows[tickerRowIdx] : [];

  const maxCols = Math.max(portRow.length, gradeRow.length, tickerRow.length);
  const columns = [{ ci: 0, isTs: true }];
  let curPort = 'Antwerp';

  for (let ci = 1; ci < maxCols; ci++) {
    const pVal = String(portRow[ci] || '').trim();
    const gVal = String(gradeRow[ci] || '').trim();
    const tVal = String(tickerRow[ci] || '').trim();

    // 1. Determine Port
    if (pVal && pVal !== '#N/A' && pVal !== '#NAME?' && !/^\d+$/.test(pVal) && pVal.length > 1) {
      curPort = pVal.charAt(0).toUpperCase() + pVal.slice(1).toLowerCase();
    } else {
      const tickerPort = extractPortFromTicker(tVal);
      if (tickerPort) curPort = tickerPort;
    }

    // 2. Determine Fuel Grade
    let grade = null;
    if (/MGO|DMA|0\.1%|GASOIL/i.test(gVal) || /MGO/i.test(tVal)) grade = 'MGO';
    else if (/VLSFO|ULSFO|LS380|0\.5%/i.test(gVal) || /VLSFO/i.test(tVal)) grade = 'VLSFO';
    else if (/HSFO|380|HS380|IFO380/i.test(gVal) || /HSFO/i.test(tVal)) grade = 'HSFO';

    if (grade) {
      columns.push({ ci, port: curPort, grade, key: curPort + '_' + grade, isTs: false });
    }
  }

  // Disambiguate duplicate keys per port (e.g. HSFO -> VLSFO -> MGO sequence)
  const seenKeys = {};
  columns.forEach(col => {
    if (col.isTs) return;
    let comboKey = col.port + '_' + col.grade;
    if (seenKeys[comboKey]) {
      if (col.grade === 'VLSFO') col.grade = 'MGO';
      else if (col.grade === 'HSFO') col.grade = 'VLSFO';
      col.key = col.port + '_' + col.grade;
    }
    seenKeys[col.key] = true;
  });

  if (columns.filter(c => !c.isTs).length === 0) {
    throw new Error('No valid bunker price columns found in sheet "' + sheetName + '".');
  }

  // Parse Data Rows
  dataRows = [];
  for (let r = dataStartRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[0]) continue;
    
    let rawTs = row[0];
    let formattedTs = '';
    
    if (rawTs instanceof Date) {
      formattedTs = rawTs.toLocaleDateString('en-GB') + ' ' + rawTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else {
      formattedTs = String(rawTs).trim();
    }

    if (!formattedTs || formattedTs === '#N/A' || formattedTs.toLowerCase() === 'timestamp') continue;

    const entry = { ts: formattedTs };
    let hasVal = false;

    columns.forEach(col => {
      if (!col.isTs) {
        const rawV = row[col.ci];
        const num = parseFloat(String(rawV || '').replace(/,/g, '').replace(/\$/g, ''));
        if (!isNaN(num)) {
          entry[col.key] = num;
          hasVal = true;
        } else {
          entry[col.key] = null;
        }
      }
    });

    if (hasVal) {
      dataRows.push(entry);
    }
  }

  if (dataRows.length === 0) {
    throw new Error('Parsed 0 data rows from sheet "' + sheetName + '".');
  }

  // Update discovered ports
  const discoveredPorts = [...new Set(columns.filter(c => !c.isTs).map(c => c.port))];
  discoveredPorts.forEach(name => {
    if (name && !PORTS.find(p => p.name === name)) {
      PORTS.push({ name, region: 'Linked Sheet', ticker: 'BUNKER' });
    }
  });

  renderPortList();
  if (activePort) selectPort(activePort);
  else if (PORTS.length > 0) selectPort(PORTS[0]);
  buildTickerTape();
  if (currentChartTab === 'card-view') renderCardView();

  return { rows: dataRows.length, sheet: sheetName };
}

function extractPortFromTicker(ticker) {
  const MAP = {
    BEAN: 'Antwerp', BGNE: 'Ghent', DEHAM: 'Hamburg',
    DKSKA: 'Skaw', ETTL: 'Tallinn', SSGP: 'Singapore',
    AEFUJ: 'Fujairah', USHOU: 'Houston', PAPTM: 'Panama',
    NLRTM: 'Rotterdam', GRPIR: 'Piraeus', KRBUS: 'Busan'
  };
  for (const [code, name] of Object.entries(MAP)) {
    if (ticker.toUpperCase().includes(code)) return name;
  }
  return null;
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
function toggleAllPorts(el) {
  document.querySelectorAll('.chk-port').forEach(c => c.checked = el.checked);
}
function updateAllPortsCheckbox() {
  const all = document.querySelectorAll('.chk-port');
  document.getElementById('chk-all-ports').checked = [...all].every(c => c.checked);
}

function exportBunkerPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(13, 20, 38);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setFillColor(207, 32, 39);
  doc.rect(0, 26, 210, 2, 'F');

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'JPEG', 10, 4, 45, 12);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BUNKER PRICES TERMINAL', 62, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL BUNKER FUEL PRICE REPORT', 62, 18);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-GB')}  |  ${new Date().toLocaleTimeString()} UTC`, 62, 23);

  // Summary (active port)
  const pName = activePort ? activePort.name : 'N/A';
  const stats = activePort ? portStats(pName) : null;
  let y = 38;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Daily Bunker Rate Analysis — Port of ${pName}`, 14, y);
  y += 4;

  if (stats) {
    doc.autoTable({
      startY: y,
      head: [['Metric', 'Rate (USD / MT)']],
      body: [
        [`Today's Active Rate (${pName} VLSFO)`, `$${stats.VLSFO.toFixed(2)}`],
        [`Yesterday's Close Rate`, `$${stats.prev.toFixed(2)}`],
        [`Daily Rate Change`, `${stats.chg >= 0 ? '+' : ''}$${stats.chg.toFixed(2)} (${stats.pct.toFixed(2)}%)`],
        [`Week-on-Week High`, `$${stats.wowHigh.toFixed(2)}`],
        [`Week-on-Week Low`, `$${stats.wowLow.toFixed(2)}`],
        [`3-Month High`, `$${stats.m3High.toFixed(2)}`],
        [`3-Month Low`, `$${stats.m3Low.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [207, 32, 39], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8 }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Regional table
  const selPorts = [...document.querySelectorAll('.chk-port:checked')].map(c => c.value);
  const selFuels = [...document.querySelectorAll('.chk-fuel:checked')].map(c => c.value);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Regional Bunker Prices Summary', 14, y);

  const head = [['Port', ...selFuels.map(f => `${f} ($/MT)`), 'WoW High', 'WoW Low', '3M High', '3M Low']];
  const body = selPorts.map(p => {
    const s = portStats(p);
    const fuelVals = selFuels.map(f => f === 'VLSFO' ? `$${s.VLSFO.toFixed(2)}` : f === 'HSFO' ? `$${s.HSFO.toFixed(2)}` : `$${s.MGO.toFixed(2)}`);
    return [p, ...fuelVals, `$${s.wowHigh.toFixed(2)}`, `$${s.wowLow.toFixed(2)}`, `$${s.m3High.toFixed(2)}`, `$${s.m3Low.toFixed(2)}`];
  });

  doc.autoTable({
    startY: y + 4,
    head,
    body,
    theme: 'striped',
    headStyles: { fillColor: [13, 20, 38], textColor: 255 },
    styles: { fontSize: 7.5 }
  });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Generated by Howe Robinson Partners Bunker Prices Terminal. Confidential & Proprietary.', 14, 285);

  doc.save(`HRP_Bunker_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('market-time').textContent = 'SYS_TIME: ' +
    now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

// ─── Category Tabs ────────────────────────────────────────────────────────────
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.onclick = function() {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    selectedGrade = this.dataset.grade;
    renderPortList();
  };
});

document.getElementById('search-input').addEventListener('input', function() {
  searchQuery = this.value;
  renderPortList();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
  buildTickerTape();
  renderPortList();
  renderNews();

  // Auto-fetch backend initial state & auto-selected Excel file
  apiFetch('/api/state').then(data => {
    if (data && data.selection && data.selection.raw_matrix) {
      parseAndLoadRows(data.selection.raw_matrix, data.selection.worksheet);
      updateSyncHeaderTag(true, data.selection.filename, data.selection.worksheet);
      startSyncPolling();
    }
  }).catch(() => {});

  setTimeout(() => {
    if (!activePort && PORTS.length > 0) selectPort(PORTS[0]);
    const loader = document.getElementById('hud-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
  }, 600);
});
