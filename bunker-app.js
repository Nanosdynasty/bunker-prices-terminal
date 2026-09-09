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

  const datasets = [];
  if (showVLSFO) {
    datasets.push({
      label: 'VLSFO ($/MT)',
      data: data.map(d => d.VLSFO),
      borderColor: FUEL_COLORS.VLSFO,
      backgroundColor: 'rgba(56, 189, 248, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: FUEL_COLORS.VLSFO
    });
  }
  if (showHSFO) {
    datasets.push({
      label: 'HSFO ($/MT)',
      data: data.map(d => d.HSFO),
      borderColor: FUEL_COLORS.HSFO,
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: FUEL_COLORS.HSFO
    });
  }
  if (showMGO) {
    datasets.push({
      label: 'MGO ($/MT)',
      data: data.map(d => d.MGO),
      borderColor: FUEL_COLORS.MGO,
      backgroundColor: 'rgba(0, 255, 135, 0.08)',
      borderWidth: 2.2,
      pointRadius: data.length > 30 ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      pointBackgroundColor: FUEL_COLORS.MGO
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
  const sliderBox = document.getElementById('chart-slider-container');
  const btns = document.querySelectorAll('.chart-tab-btn');

  btns.forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.chart-tab-btn')[tab === 'historical' ? 0 : 1].classList.add('active');

  if (tab === 'historical') {
    hist.style.display = 'block';
    tv.style.display = 'none';
    sliderBox.style.display = 'flex';
    rebuildChart();
  } else {
    hist.style.display = 'none';
    tv.style.display = 'block';
    sliderBox.style.display = 'none';
    buildTradingViewWidget();
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

// ─── OneDrive Link Modal ──────────────────────────────────────────────────────
function openLinkModal() {
  document.getElementById('link-modal').style.display = 'flex';
}
function closeLinkModal() {
  document.getElementById('link-modal').style.display = 'none';
}

// Convert any OneDrive / SharePoint share URL into a direct download URL
function buildOneDriveDownloadUrl(rawUrl) {
  // Already a direct download — return as-is
  if (rawUrl.includes('/download?') || rawUrl.match(/[?&]download=1/)) return rawUrl;

  // 1drv.ms short links → append ?download=1
  if (rawUrl.includes('1drv.ms') || rawUrl.includes('onedrive.live.com')) {
    return rawUrl + (rawUrl.includes('?') ? '&download=1' : '?download=1');
  }

  // SharePoint / O365 sharing URL
  // e.g. https://company.sharepoint.com/sites/.../Shared%20Documents/.../file.xlsx?web=1
  // → replace ?web=1 with ?download=1
  if (rawUrl.includes('sharepoint.com') || rawUrl.includes('office365.com') || rawUrl.includes('office.com')) {
    return rawUrl
      .replace(/[?&]web=\d/g, '')
      .replace(/[?&]e=[^&]+/g, '')
      + (rawUrl.includes('?') ? '&download=1' : '?download=1');
  }

  // Generic fallback
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

  const dlUrl = buildOneDriveDownloadUrl(rawUrl);

  // CORS proxy chain — tries each in order until one works
  const PROXIES = [
    u => u,                                                            // 1. Direct (works if CORS is enabled)
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,  // 2. allorigins
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,               // 3. corsproxy.io
    u => `https://cors-anywhere.herokuapp.com/${u}`,                     // 4. cors-anywhere
    u => `https://proxy.cors.sh/${u}`                                     // 5. cors.sh
  ];

  let lastError = '';
  for (let i = 0; i < PROXIES.length; i++) {
    const proxyUrl = PROXIES[i](dlUrl);
    if (progEl) progEl.textContent = `Trying method ${i + 1} of ${PROXIES.length}...`;
    try {
      const resp = await fetch(proxyUrl, {
        headers: i > 0 ? {} : {},   // no special headers needed
        signal: AbortSignal.timeout(12000)
      });
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

  // All proxies failed
  if (progEl) progEl.textContent = '';
  btn.disabled = false;
  btn.textContent = 'Connect';
  errEl.innerHTML = `
    <strong>⚠️ Could not fetch the file automatically.</strong><br>
    <span style="font-weight:400;">Browser security (CORS) blocks direct access to OneDrive URLs from web apps.</span><br><br>
    <strong>✅ Easy fix — use the local file picker below:</strong><br>
    Since OneDrive syncs to your PC, find the file in your local OneDrive folder and select it directly.
    <br><small style="opacity:0.7;margin-top:4px;display:block;">Last error: ${lastError}</small>
  `;
  errEl.style.display = 'block';
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('file-status');
  if (statusEl) statusEl.textContent = `📂 Reading "${file.name}"...`;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const result = parseAndLoad(ev.target.result, file.name);
      if (statusEl) statusEl.textContent = `✅ Loaded ${result.rows} rows from "${result.sheet}"`;
      setTimeout(() => closeLinkModal(), 900);
    } catch(err) {
      if (statusEl) statusEl.textContent = '';
      document.getElementById('link-error').innerHTML = `❌ <strong>Parse error:</strong> ${err.message}`;
      document.getElementById('link-error').style.display = 'block';
    }
  };
  reader.onerror = () => {
    if (statusEl) statusEl.textContent = '';
    document.getElementById('link-error').textContent = '❌ Could not read file. Please try again.';
    document.getElementById('link-error').style.display = 'block';
  };
  reader.readAsArrayBuffer(file);
}

function parseAndLoad(buffer, fileName) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  
  // 1. Select the best sheet (e.g. 'Table_Data', 'Data', 'Bunker', or fallback to first sheet)
  let sheetName = wb.SheetNames[0];
  for (const sn of wb.SheetNames) {
    if (/table_data|bunker|price|rate|data|sheet1/i.test(sn)) { sheetName = sn; break; }
  }
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
  if (!rows || rows.length < 2) throw new Error('Sheet "' + sheetName + '" appears empty or has too few rows.');

  // Fuel grade regex patterns (extremely broad matching)
  const VLSFO_PAT = /vlsfo|ulsfo|ls380|0\.5%|0\.5\s*%|low\s*sul|lsfo|vls/i;
  const HSFO_PAT  = /hsfo|380|hs380|ifo380|high\s*sul|hs/i;
  const MGO_PAT   = /mgo|dma|0\.1%|0\.1\s*%|gasoil|mdo|lsmgo/i;
  const GRADE_ANY = /vlsfo|ulsfo|ls380|0\.5%|0\.5\s*%|low\s*sul|lsfo|vls|hsfo|380|hs380|ifo380|high\s*sul|hs|mgo|dma|0\.1%|0\.1\s*%|gasoil|mdo|lsmgo|znh/i;

  const PORT_MAP = {
    antwerp: 'Antwerp', ghent: 'Ghent', hamburg: 'Hamburg', skaw: 'Skaw',
    tallinn: 'Tallinn', rotterdam: 'Rotterdam', singapore: 'Singapore',
    fujairah: 'Fujairah', houston: 'Houston', panama: 'Panama',
    piraeus: 'Piraeus', busan: 'Busan', bean: 'Antwerp', bgne: 'Ghent',
    deham: 'Hamburg', dkska: 'Skaw', ettl: 'Tallinn', ssgp: 'Singapore',
    aefuj: 'Fujairah', ushou: 'Houston', paptm: 'Panama', nlrtm: 'Rotterdam',
    grpir: 'Piraeus', krbus: 'Busan'
  };

  let portRowIdx = -1, gradeRowIdx = -1, dataStartRow = -1;

  // 2. Scan top 25 rows for port / grade headers
  for (let r = 0; r < Math.min(25, rows.length); r++) {
    const cells = rows[r].map(c => String(c).trim());
    const ne = cells.filter(c => c && c !== '#N/A' && c !== '#NAME?');
    if (gradeRowIdx < 0 && ne.some(c => GRADE_ANY.test(c))) gradeRowIdx = r;
    if (portRowIdx < 0 && ne.some(c => Object.keys(PORT_MAP).some(p => c.toLowerCase().includes(p)))) portRowIdx = r;
  }

  if (gradeRowIdx < 0 && portRowIdx >= 0) gradeRowIdx = portRowIdx;
  if (portRowIdx < 0 && gradeRowIdx >= 0) portRowIdx = gradeRowIdx;
  if (gradeRowIdx < 0 && portRowIdx < 0) {
    gradeRowIdx = 0;
    portRowIdx = 0;
  }

  dataStartRow = Math.max(portRowIdx, gradeRowIdx) + 1;

  // 3. Build Column Map
  const portRow  = rows[portRowIdx]  || [];
  const gradeRow = rows[gradeRowIdx] || [];
  const maxCols  = Math.max(portRow.length, gradeRow.length);
  let columns    = [];
  let curPort    = 'Antwerp';

  for (let ci = 0; ci < maxCols; ci++) {
    const pText = String(portRow[ci]  || '').trim();
    const gText = String(gradeRow[ci] || '').trim();
    const combined = (pText + ' ' + gText).trim();

    if (ci === 0 || /date|time|stamp|period|day/i.test(combined)) {
      columns.push({ ci, isTs: true });
      continue;
    }

    // Determine Port
    let port = null;
    for (const [k, v] of Object.entries(PORT_MAP)) {
      if (combined.toLowerCase().includes(k)) { port = v; break; }
    }
    if (!port && pText && pText.length > 2 && !/^\d+$/.test(pText) && pText !== '#N/A') {
      port = pText;
    }
    if (port) curPort = port;
    else port = curPort;

    // Determine Grade
    let grade = null;
    if (VLSFO_PAT.test(gText) || VLSFO_PAT.test(pText)) grade = 'VLSFO';
    else if (HSFO_PAT.test(gText) || HSFO_PAT.test(pText)) grade = 'HSFO';
    else if (MGO_PAT.test(gText) || MGO_PAT.test(pText)) grade = 'MGO';

    // Auto grade fallback if missing
    if (!grade && combined && combined !== '#N/A') {
      const portColCount = columns.filter(c => c.port === port).length;
      if (portColCount === 0) grade = 'VLSFO';
      else if (portColCount === 1) grade = 'HSFO';
      else if (portColCount === 2) grade = 'MGO';
    }

    if (grade) {
      columns.push({ ci, port, grade, key: `${port}_${grade}`, isTs: false });
    }
  }

  // 4. Matrix Fallback: If no grade headers matched, auto-assign numeric columns
  if (columns.filter(c => !c.isTs).length === 0) {
    const sampleRow = rows[Math.min(dataStartRow + 1, rows.length - 1)] || rows[rows.length - 1] || [];
    const portsList = ['Antwerp', 'Hamburg', 'Rotterdam', 'Singapore', 'Fujairah', 'Houston', 'Skaw', 'Tallinn', 'Panama', 'Piraeus', 'Ghent', 'Busan'];
    const gradesList = ['VLSFO', 'HSFO', 'MGO'];
    
    columns = [{ ci: 0, isTs: true }];
    let pIdx = 0, gIdx = 0;
    
    for (let ci = 1; ci < sampleRow.length; ci++) {
      const val = String(sampleRow[ci]).replace(/,/g, '').trim();
      if (!isNaN(parseFloat(val)) || val === '') {
        const p = portsList[pIdx % portsList.length];
        const g = gradesList[gIdx % gradesList.length];
        columns.push({ ci, port: p, grade: g, key: `${p}_${g}`, isTs: false });
        gIdx++;
        if (gIdx >= 3) { gIdx = 0; pIdx++; }
      }
    }
  }

  // 5. Parse Data Rows
  dataRows = [];
  for (let r = dataStartRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const tsVal = String(row[0] || '').trim();
    if (!tsVal || tsVal === '#N/A' || tsVal.toLowerCase().includes('total')) continue;
    
    const entry = {};
    let hasVal = false;

    columns.forEach(col => {
      const rawV = row[col.ci];
      if (col.isTs) {
        if (rawV instanceof Date) {
          entry.ts = rawV.toLocaleDateString('en-GB') + ' ' + rawV.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } else {
          entry.ts = String(rawV).trim();
        }
      } else {
        const num = parseFloat(String(rawV || '').replace(/,/g, '').replace(/\$/g, ''));
        if (!isNaN(num)) {
          entry[col.key] = num;
          hasVal = true;
        } else {
          entry[col.key] = null;
        }
      }
    });

    if (entry.ts && (hasVal || columns.length <= 2)) {
      dataRows.push(entry);
    }
  }

  if (dataRows.length === 0) {
    throw new Error('Parsed 0 data rows from sheet "' + sheetName + '". Please ensure your Excel sheet has dates in Column A and numeric price values.');
  }

  // 6. Discover & Register Ports
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

  // Auto-select Antwerp on load
  setTimeout(() => {
    selectPort(PORTS[0]);
    document.getElementById('hud-loader').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('hud-loader').style.display = 'none';
    }, 500);
  }, 800);
});
