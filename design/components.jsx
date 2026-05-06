// STOCKLAB Design System — shared components used across all hi-fi screens.
// Consumes CSS variables from tokens.jsx — toggle data-theme on a wrapper to switch.

// ---------------------------------------------------------------- Number helpers

function fmt(n, opts = {}) {
  const { decimals = 2, currency = '', sign = false } = opts;
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  let body;
  if (abs >= 1e12) body = (n / 1e12).toFixed(decimals) + 'T';
  else if (abs >= 1e9) body = (n / 1e9).toFixed(decimals) + 'B';
  else if (abs >= 1e6) body = (n / 1e6).toFixed(decimals) + 'M';
  else if (abs >= 1e3) body = n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  else body = n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (sign && n > 0) body = '+' + body;
  return currency + body;
}

function ChangePill({ pct, abs, size = 'md' }) {
  const up = pct >= 0;
  const cls = up ? 'sl-tag-up' : 'sl-tag-down';
  const arrow = up ? '▲' : '▼';
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 13 : 12;
  return (
    <span className={`sl-tag ${cls}`} style={{ fontSize, fontFamily: 'var(--sl-font-mono)', fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ fontSize: 8 }}>{arrow}</span>
      {abs != null && <span>{fmt(Math.abs(abs))}</span>}
      <span>{Math.abs(pct).toFixed(2)}%</span>
    </span>
  );
}

// ---------------------------------------------------------------- Spark / Charts

function Sparkline2({ seed = 'x', up = true, width = 80, height = 24, strokeWidth = 1.5, fill = false }) {
  const rng = seedRng(seed);
  const n = 30;
  const pts = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += (rng() - 0.5) * 14 + (up ? 0.7 : -0.7);
    v = Math.max(8, Math.min(92, v));
    pts.push(v);
  }
  const path = pts.map((y, i) => {
    const x = (i / (n - 1)) * width;
    const yy = height - (y / 100) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`;
  }).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  const color = up ? 'var(--sl-up)' : 'var(--sl-down)';
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} fillOpacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function seedRng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 13), 16777619); return ((h >>> 0) / 4294967296); };
}

function AreaChart2({ seed = 'a', width, height, color = 'var(--sl-brand)', points = 80, fillOpacity = 0.1 }) {
  const rng = seedRng(seed);
  const pts = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    v += (rng() - 0.45) * 6;
    v = Math.max(5, Math.min(95, v));
    pts.push(v);
  }
  const path = pts.map((y, i) => {
    const x = (i / (points - 1)) * width;
    const yy = height - (y / 100) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`;
  }).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={area} fill={color} fillOpacity={fillOpacity} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CandleChart2({ seed = 'c', width, height, bars = 60, showGrid = true, showVolume = false }) {
  const rng = seedRng(seed);
  const data = [];
  let last = 100;
  for (let i = 0; i < bars; i++) {
    const drift = (rng() - 0.48) * 4;
    const open = last;
    const close = Math.max(20, open + drift + (rng() - 0.5) * 3);
    const high = Math.max(open, close) + rng() * 2;
    const low = Math.min(open, close) - rng() * 2;
    data.push({ open, close, high, low, vol: 0.3 + rng() * 0.7 });
    last = close;
  }
  const max = Math.max(...data.map(d => d.high));
  const min = Math.min(...data.map(d => d.low));
  const pad = (max - min) * 0.05;
  const range = (max - min) + pad * 2;
  const chartH = showVolume ? height * 0.78 : height;
  const volH = showVolume ? height * 0.18 : 0;
  const y = v => chartH - ((v - min + pad) / range) * chartH;
  const bw = (width / bars) * 0.7;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {showGrid && [0.25, 0.5, 0.75].map(p => (
        <line key={p} x1="0" x2={width} y1={chartH * p} y2={chartH * p}
          stroke="var(--sl-hairline)" strokeWidth="1" strokeDasharray="2,4" />
      ))}
      {data.map((d, i) => {
        const cx = (i + 0.5) * (width / bars);
        const up = d.close >= d.open;
        const c = up ? 'var(--sl-up)' : 'var(--sl-down)';
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(d.high)} y2={y(d.low)} stroke={c} strokeWidth="1" />
            <rect x={cx - bw / 2} y={y(Math.max(d.open, d.close))}
              width={bw} height={Math.max(1, Math.abs(y(d.open) - y(d.close)))}
              fill={c} stroke={c} strokeWidth="1" rx="1" />
            {showVolume && (
              <rect x={cx - bw / 2} y={height - d.vol * volH}
                width={bw} height={d.vol * volH}
                fill={c} opacity="0.4" rx="1" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function BarChart2({ seed = 'b', width, height, bars = 20, signed = true }) {
  const rng = seedRng(seed);
  const vals = [];
  for (let i = 0; i < bars; i++) {
    const sign = signed ? (rng() > 0.5 ? 1 : -1) : 1;
    vals.push(sign * (0.2 + rng() * 0.8));
  }
  const max = Math.max(...vals.map(Math.abs));
  const bw = (width / bars) * 0.72;
  const mid = signed ? height / 2 : height;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {signed && <line x1="0" x2={width} y1={mid} y2={mid} stroke="var(--sl-line)" strokeWidth="1" />}
      {vals.map((v, i) => {
        const cx = (i + 0.5) * (width / bars);
        const h = (Math.abs(v) / max) * (signed ? mid - 4 : mid - 4);
        const up = v >= 0;
        return (
          <rect key={i} x={cx - bw / 2} y={up ? mid - h : mid}
            width={bw} height={h} rx="2"
            fill={up ? 'var(--sl-up)' : 'var(--sl-down)'} opacity="0.85" />
        );
      })}
    </svg>
  );
}

// Price chart — area + line, used on stock detail / portfolio hero
function PriceChart({ seed = 'p', up = true, width = 780, height = 300, showGrid = true }) {
  const rng = seedRng(seed + (up ? 'u' : 'd'));
  const n = 120;
  const pts = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += (rng() - 0.5) * 5 + (up ? 0.4 : -0.4);
    v = Math.max(8, Math.min(92, v));
    pts.push(v);
  }
  const path = pts.map((y, i) => {
    const x = (i / (n - 1)) * width;
    const yy = height - (y / 100) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`;
  }).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  const color = up ? 'var(--sl-up)' : 'var(--sl-down)';
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {showGrid && [0.25, 0.5, 0.75].map(p => (
        <line key={p} x1="0" x2={width} y1={height * p} y2={height * p}
          stroke="var(--sl-hairline)" strokeWidth="1" strokeDasharray="2,4" />
      ))}
      <defs>
        <linearGradient id={`pg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#pg-${seed})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Donut / progress ring
function Donut({ value = 60, size = 80, stroke = 8, color = 'var(--sl-brand)', track = 'var(--sl-surfaceAlt)', label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 320ms ease' }} />
      </svg>
      {label != null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontSize: 13, fontFamily: 'var(--sl-font-mono)', fontWeight: 600 }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Fear & Greed gauge — semicircle with needle
function Gauge({ value = 60, size = 140, label = '탐욕', sublabel }) {
  const cx = size / 2;
  const cy = size * 0.75;
  const r = size * 0.42;
  // Color zones for value 0-100
  const zoneColor = (v) =>
    v < 25 ? 'var(--sl-down)' :
    v < 45 ? 'var(--sl-warn)' :
    v < 55 ? 'var(--sl-muted)' :
    v < 75 ? 'var(--sl-up)' :
    'var(--sl-brand)';
  const angle = -Math.PI + (value / 100) * Math.PI; // -180 to 0
  const nx = cx + Math.cos(angle) * r * 0.85;
  const ny = cy + Math.sin(angle) * r * 0.85;

  // Build arc
  const arc = (startPct, endPct, color) => {
    const a1 = -Math.PI + startPct * Math.PI;
    const a2 = -Math.PI + endPct * Math.PI;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} stroke={color} strokeWidth={size * 0.08} fill="none" strokeLinecap="round" />;
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.65}>
        {arc(0, 0.245, 'var(--sl-down)')}
        {arc(0.255, 0.495, 'var(--sl-warn)')}
        {arc(0.505, 0.745, 'var(--sl-up)')}
        {arc(0.755, 1, 'var(--sl-brand)')}
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--sl-ink)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={size * 0.04} fill="var(--sl-ink)" />
      </svg>
      <div style={{ marginTop: -size * 0.06, textAlign: 'center' }}>
        <div className="sl-mono" style={{ fontSize: size * 0.22, fontWeight: 700, color: zoneColor(value), letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: zoneColor(value) }}>{label}</div>
        {sublabel && <div className="sl-caption" style={{ marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- App chrome

function SLAppBar({ active = 'home', theme = 'light', onToggleTheme }) {
  const items = [
    { id: 'home', label: '홈' },
    { id: 'analysis', label: '분석' },
    { id: 'screener', label: '종목 검색' },
    { id: 'masters', label: '고수 따라잡기' },
    { id: 'reports', label: '리포트' },
    { id: 'learn', label: '학습' },
    { id: 'portfolio', label: '포트폴리오' },
  ];
  return (
    <header style={{
      height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24,
      background: 'var(--sl-surface)', borderBottom: '1px solid var(--sl-line)',
      flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div className="sl-row" style={{ gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'linear-gradient(135deg, var(--sl-brand) 0%, var(--sl-up) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.04em',
        }}>S</div>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>STOCKLAB</div>
      </div>

      {/* Nav */}
      <nav className="sl-row" style={{ gap: 4, marginLeft: 8 }}>
        {items.map(it => (
          <a key={it.id} style={{
            padding: '8px 14px', fontSize: 14,
            fontWeight: it.id === active ? 600 : 500,
            color: it.id === active ? 'var(--sl-ink)' : 'var(--sl-muted)',
            background: it.id === active ? 'var(--sl-surfaceAlt)' : 'transparent',
            borderRadius: 8, cursor: 'pointer',
            transition: 'all 120ms ease',
          }}>{it.label}</a>
        ))}
      </nav>

      <div className="sl-grow" />

      {/* Search */}
      <div className="sl-row" style={{
        gap: 8, padding: '8px 14px', width: 280,
        background: 'var(--sl-surfaceAlt)', borderRadius: 10,
        color: 'var(--sl-muted)', fontSize: 13,
      }}>
        <span style={{ fontSize: 14 }}>⌕</span>
        <span className="sl-grow">종목 / 티커 검색</span>
        <span className="sl-mono" style={{ fontSize: 11, padding: '1px 5px', background: 'var(--sl-surface)', borderRadius: 4, border: '1px solid var(--sl-line)' }}>⌘K</span>
      </div>

      {/* Right cluster */}
      <div className="sl-row" style={{ gap: 6 }}>
        <IconBtn glyph="★" label="관심종목" />
        <IconBtn glyph="🔔" label="알림" badge />
        <IconBtn glyph={theme === 'dark' ? '☼' : '☾'} label="테마" onClick={onToggleTheme} />
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sl-cat4), var(--sl-cat1))', marginLeft: 4 }} />
      </div>
    </header>
  );
}

function IconBtn({ glyph, label, badge, onClick }) {
  return (
    <button title={label} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: 'transparent', color: 'var(--sl-inkSub)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, position: 'relative',
      transition: 'background 120ms ease',
    }} onMouseEnter={e => e.currentTarget.style.background = 'var(--sl-surfaceAlt)'}
       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {glyph}
      {badge && <span style={{
        position: 'absolute', top: 8, right: 8, width: 7, height: 7,
        borderRadius: '50%', background: 'var(--sl-down)',
        border: '1.5px solid var(--sl-surface)',
      }} />}
    </button>
  );
}

// Section header — used inside cards / page sections
function SectionHeader({ title, subtitle, action, size = 'md' }) {
  const Title = size === 'lg' ? 'h2' : 'h3';
  const cls = size === 'lg' ? 'sl-h2' : 'sl-h3';
  return (
    <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: size === 'lg' ? 16 : 12 }}>
      <div>
        <Title className={cls}>{title}</Title>
        {subtitle && <div className="sl-caption" style={{ marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// Tabs — inline pill style
function Tabs({ items, active, size = 'md' }) {
  return (
    <div className="sl-row" style={{
      gap: 4, padding: 4,
      background: 'var(--sl-surfaceAlt)', borderRadius: 10,
      width: 'fit-content',
    }}>
      {items.map(it => {
        const id = it.id || it.label;
        const isActive = id === active;
        return (
          <div key={id} style={{
            padding: size === 'sm' ? '5px 10px' : '7px 14px',
            fontSize: size === 'sm' ? 12 : 13, fontWeight: 600,
            color: isActive ? 'var(--sl-ink)' : 'var(--sl-muted)',
            background: isActive ? 'var(--sl-surface)' : 'transparent',
            borderRadius: 7,
            boxShadow: isActive ? 'var(--sl-shadow-sm, 0 1px 2px rgba(0,0,0,0.04))' : 'none',
            cursor: 'pointer',
          }}>{it.label}</div>
        );
      })}
    </div>
  );
}

// Range / period selector
function PeriodSelector({ items = ['1D','1W','1M','3M','6M','1Y','5Y'], active = '1M' }) {
  return (
    <div className="sl-row" style={{ gap: 2 }}>
      {items.map(t => (
        <span key={t} style={{
          padding: '5px 10px', fontSize: 12, fontWeight: 600,
          color: t === active ? 'var(--sl-ink)' : 'var(--sl-muted)',
          background: t === active ? 'var(--sl-surfaceAlt)' : 'transparent',
          borderRadius: 6, cursor: 'pointer',
          fontFamily: 'var(--sl-font-mono)',
        }}>{t}</span>
      ))}
    </div>
  );
}

// Page wrapper that applies the theme + scrolling
function SLPage({ theme = 'light', children }) {
  return (
    <div data-theme={theme} className="sl-root" style={{ overflow: 'hidden' }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  fmt, ChangePill, Sparkline2, AreaChart2, CandleChart2, BarChart2, PriceChart, Donut, Gauge,
  SLAppBar, IconBtn, SectionHeader, Tabs, PeriodSelector, SLPage, seedRng,
});
