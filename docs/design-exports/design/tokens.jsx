// STOCKLAB Design Tokens — Robinhood / Toss-inspired modern fintech
// Light + Dark, Korean-first typography (Pretendard) with mono accent (JetBrains Mono)

const TOKENS = {
  // Color — light theme
  light: {
    // Surfaces
    bg: '#fafafa',           // page background, slightly off-white
    surface: '#ffffff',       // cards
    surfaceAlt: '#f4f5f7',    // recessed wells / secondary cards
    surfaceHover: '#f0f1f4',
    overlay: 'rgba(15, 18, 26, 0.5)',

    // Ink
    ink: '#0f121a',           // primary text — near black with slight blue
    inkSub: '#454956',        // secondary text
    muted: '#7d818c',         // tertiary / labels
    faint: '#b8bcc6',         // disabled / hint

    // Lines
    line: '#e6e8ed',          // primary divider
    lineStrong: '#d2d5dd',
    hairline: '#eef0f4',

    // Brand — Toss-blue / Robinhood-green hybrid
    brand: '#3461ff',         // primary action
    brandHover: '#2a52e0',
    brandSoft: '#eef2ff',     // brand-tinted background
    brandInk: '#1f3aa3',      // text on soft brand bg

    // Semantic — finance directional
    up: '#0fa67a',            // gains — clean green, slightly desaturated for less retina fatigue
    upSoft: '#e6f7f1',
    down: '#e8454a',          // losses
    downSoft: '#fde9ea',
    warn: '#f59e0b',
    warnSoft: '#fef3e2',
    info: '#3b82f6',
    infoSoft: '#eaf2fe',

    // Chart palette — categorical
    cat1: '#3461ff', cat2: '#0fa67a', cat3: '#f59e0b',
    cat4: '#a855f7', cat5: '#06b6d4', cat6: '#ef4444',
    cat7: '#14b8a6', cat8: '#f97316',
  },

  dark: {
    bg: '#0b0d12',
    surface: '#13161d',
    surfaceAlt: '#1a1e27',
    surfaceHover: '#222632',
    overlay: 'rgba(0, 0, 0, 0.65)',

    ink: '#f1f3f7',
    inkSub: '#bdc1cb',
    muted: '#7d818c',
    faint: '#4a4e58',

    line: '#272b35',
    lineStrong: '#363b46',
    hairline: '#1d2029',

    brand: '#5b7fff',
    brandHover: '#7491ff',
    brandSoft: '#1a2042',
    brandInk: '#a9bcff',

    up: '#1ec48f',
    upSoft: '#0f2a22',
    down: '#ff5d62',
    downSoft: '#2e1517',
    warn: '#fbbf24',
    warnSoft: '#2c2010',
    info: '#60a5fa',
    infoSoft: '#0f1f33',

    cat1: '#5b7fff', cat2: '#1ec48f', cat3: '#fbbf24',
    cat4: '#c084fc', cat5: '#22d3ee', cat6: '#ff5d62',
    cat7: '#2dd4bf', cat8: '#fb923c',
  },

  // Typography scale
  font: {
    sans: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
  },
  size: {
    display: 40,   // hero numbers
    h1: 28,        // page titles
    h2: 20,        // section titles
    h3: 16,        // card titles
    body: 14,      // default body
    bodySm: 13,
    label: 12,     // form labels, table headers
    caption: 11,   // subdued meta
    micro: 10,
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  // numeric — prefer mono + tabular-nums for prices

  // Spacing — 4px base
  space: { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:32, 8:40, 9:48, 10:64, 11:80 },

  // Radius — soft modern (Toss-ish)
  radius: { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 },

  // Shadow — subtle, very low-contrast (Robinhood-clean)
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(15, 18, 26, 0.04), 0 1px 1px rgba(15, 18, 26, 0.03)',
    md: '0 4px 12px rgba(15, 18, 26, 0.06), 0 2px 4px rgba(15, 18, 26, 0.04)',
    lg: '0 12px 32px rgba(15, 18, 26, 0.08), 0 4px 12px rgba(15, 18, 26, 0.04)',
    focus: '0 0 0 3px rgba(52, 97, 255, 0.18)',
  },

  // Motion
  motion: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '320ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Inject global styles once. Provide CSS variables so child components can opt
// into theme switching just by toggling a `data-theme` attribute on the root.
function installTokens() {
  if (typeof document === 'undefined' || document.getElementById('sl-tokens')) return;
  const t = TOKENS;
  const cssVars = (mode) => Object.entries(t[mode])
    .map(([k, v]) => `--sl-${k}: ${v};`).join('\n  ');
  const style = document.createElement('style');
  style.id = 'sl-tokens';
  style.textContent = `
    :root, [data-theme="light"] {
      ${cssVars('light')}
      --sl-font-sans: ${t.font.sans};
      --sl-font-mono: ${t.font.mono};
    }
    [data-theme="dark"] {
      ${cssVars('dark')}
    }
    .sl-root {
      font-family: var(--sl-font-sans);
      color: var(--sl-ink);
      background: var(--sl-bg);
      font-size: ${t.size.body}px;
      line-height: 1.5;
      letter-spacing: -0.005em;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .sl-root *, .sl-root *::before, .sl-root *::after { box-sizing: border-box; }
    .sl-mono { font-family: var(--sl-font-mono); font-variant-numeric: tabular-nums; }
    .sl-up { color: var(--sl-up); }
    .sl-down { color: var(--sl-down); }
    .sl-muted { color: var(--sl-muted); }
    .sl-sub { color: var(--sl-inkSub); }

    /* Buttons */
    .sl-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font: inherit; font-weight: ${t.weight.semibold}; font-size: 13px;
      padding: 8px 14px; border-radius: ${t.radius.md}px;
      border: 1px solid transparent; cursor: pointer;
      transition: background ${t.motion.fast}, border-color ${t.motion.fast};
      white-space: nowrap;
    }
    .sl-btn-primary { background: var(--sl-brand); color: #fff; }
    .sl-btn-primary:hover { background: var(--sl-brandHover); }
    .sl-btn-secondary { background: var(--sl-surfaceAlt); color: var(--sl-ink); border-color: var(--sl-line); }
    .sl-btn-secondary:hover { background: var(--sl-surfaceHover); }
    .sl-btn-ghost { background: transparent; color: var(--sl-inkSub); }
    .sl-btn-ghost:hover { background: var(--sl-surfaceAlt); color: var(--sl-ink); }
    .sl-btn-sm { padding: 5px 10px; font-size: 12px; border-radius: ${t.radius.sm}px; }

    /* Cards */
    .sl-card {
      background: var(--sl-surface); border: 1px solid var(--sl-line);
      border-radius: ${t.radius.lg}px;
    }
    .sl-card-soft {
      background: var(--sl-surfaceAlt); border-radius: ${t.radius.md}px;
    }

    /* Tags / Pills / Chips */
    .sl-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: ${t.radius.sm}px;
      font-size: 11px; font-weight: ${t.weight.semibold};
      background: var(--sl-surfaceAlt); color: var(--sl-inkSub);
    }
    .sl-tag-up { background: var(--sl-upSoft); color: var(--sl-up); }
    .sl-tag-down { background: var(--sl-downSoft); color: var(--sl-down); }
    .sl-tag-brand { background: var(--sl-brandSoft); color: var(--sl-brandInk); }
    .sl-tag-warn { background: var(--sl-warnSoft); color: var(--sl-warn); }

    .sl-pill {
      display: inline-flex; align-items: center;
      padding: 5px 12px; border-radius: ${t.radius.pill}px;
      font-size: 12px; font-weight: ${t.weight.medium};
      background: var(--sl-surfaceAlt); color: var(--sl-inkSub);
      border: 1px solid transparent; cursor: pointer;
      transition: background ${t.motion.fast};
    }
    .sl-pill[data-active="true"] {
      background: var(--sl-ink); color: var(--sl-bg);
    }

    /* Inputs */
    .sl-input {
      font: inherit; font-size: 13px;
      padding: 9px 12px; border-radius: ${t.radius.md}px;
      background: var(--sl-surface); color: var(--sl-ink);
      border: 1px solid var(--sl-line);
      transition: border-color ${t.motion.fast}, box-shadow ${t.motion.fast};
    }
    .sl-input:focus { outline: none; border-color: var(--sl-brand); box-shadow: ${t.shadow.focus}; }

    /* Section headers */
    .sl-h1 { font-size: ${t.size.h1}px; font-weight: ${t.weight.bold}; letter-spacing: -0.02em; line-height: 1.2; margin: 0; }
    .sl-h2 { font-size: ${t.size.h2}px; font-weight: ${t.weight.semibold}; letter-spacing: -0.015em; line-height: 1.3; margin: 0; }
    .sl-h3 { font-size: ${t.size.h3}px; font-weight: ${t.weight.semibold}; letter-spacing: -0.01em; line-height: 1.4; margin: 0; }
    .sl-label { font-size: ${t.size.label}px; font-weight: ${t.weight.medium}; color: var(--sl-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; }
    .sl-caption { font-size: ${t.size.caption}px; color: var(--sl-muted); }

    /* Numeric display */
    .sl-num-hero { font-family: var(--sl-font-mono); font-variant-numeric: tabular-nums; font-size: ${t.size.display}px; font-weight: ${t.weight.bold}; letter-spacing: -0.025em; line-height: 1.0; }
    .sl-num-lg { font-family: var(--sl-font-mono); font-variant-numeric: tabular-nums; font-size: 22px; font-weight: ${t.weight.semibold}; letter-spacing: -0.015em; }
    .sl-num-md { font-family: var(--sl-font-mono); font-variant-numeric: tabular-nums; font-size: 15px; font-weight: ${t.weight.semibold}; }
    .sl-num-sm { font-family: var(--sl-font-mono); font-variant-numeric: tabular-nums; font-size: 13px; font-weight: ${t.weight.medium}; }

    /* Layout helpers */
    .sl-row { display: flex; align-items: center; }
    .sl-col { display: flex; flex-direction: column; }
    .sl-grow { flex: 1 1 auto; min-width: 0; }
    .sl-rule { height: 1px; background: var(--sl-line); }
  `;
  document.head.appendChild(style);
}

if (typeof document !== 'undefined') installTokens();

Object.assign(window, { TOKENS, installTokens });
