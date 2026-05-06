// Home / Dashboard v2
// Added: US blue-chip strip, KR blue-chip strip, sentiment gauges (VIX·F&G·V-KOSPI),
// keeps watchlist · news · economic calendar · mini heatmap · portfolio vs benchmark.

// Half-circle gauge for sentiment indicators (VIX, Fear & Greed, V-KOSPI, etc.)
function SentimentGauge({ label, sub, value, min = 0, max = 100, thresholds, w = 140, h = 84 }) {
  // thresholds: [{ to: 25, color, label }, …] left-to-right semantic bands
  const t = thresholds || [
    { to: 25, color: W.down, label: 'Extreme Fear' },
    { to: 45, color: '#d97c41', label: 'Fear' },
    { to: 55, color: W.muted, label: 'Neutral' },
    { to: 75, color: '#7aa84a', label: 'Greed' },
    { to: 100, color: W.up, label: 'Extreme Greed' },
  ];
  const cx = w / 2;
  const cy = h - 8;
  const r = Math.min(w / 2 - 8, h - 16);
  const arc = (from, to, color) => {
    const a1 = Math.PI - (from - min) / (max - min) * Math.PI;
    const a2 = Math.PI - (to - min) / (max - min) * Math.PI;
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const segments = [];
  let prev = min;
  for (const seg of t) {
    segments.push({ from: prev, to: seg.to, color: seg.color, label: seg.label });
    prev = seg.to;
  }
  const ang = Math.PI - (value - min) / (max - min) * Math.PI;
  const nx = cx + (r - 4) * Math.cos(ang);
  const ny = cy - (r - 4) * Math.sin(ang);

  // active band (which segment value falls into)
  const active = segments.find(s => value <= s.to) || segments[segments.length - 1];

  return (
    <div className="w-card-soft" style={{ padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="w-row" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div className="w-h3" style={{ fontSize: 9 }}>{label}</div>
        {sub && <div className="w-faint" style={{ fontSize: 9 }}>{sub}</div>}
      </div>
      <svg width={w} height={h} style={{ display: 'block' }}>
        {segments.map((s, i) => (
          <path key={i} d={arc(s.from, s.to, s.color)} stroke={s.color} strokeWidth="6" fill="none" strokeLinecap="butt" />
        ))}
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={W.ink} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="2.5" fill={W.ink} />
      </svg>
      <div className="w-row" style={{ justifyContent: 'space-between', width: '100%', marginTop: -4 }}>
        <div className="w-num-md" style={{ fontSize: 16 }}>{value}</div>
        <div style={{ fontSize: 10, color: active.color, fontWeight: 600 }}>{active.label}</div>
      </div>
    </div>
  );
}

// Compact one-line market sentiment row — 4 representative indicators
// VIX (US 변동성) · CNN F&G (US 방향성) · V-KOSPI (KR 변동성) · ADR (KR 방향성)
function SentimentRow({ label, value, sub, dotIndex, color, link }) {
  // dotIndex: 0..4 — which of 5 dots is filled
  return (
    <div className="w-row" style={{ alignItems: 'center', gap: 10, padding: '6px 12px', borderBottom: `1px solid ${W.hairline}` }}>
      <div style={{ width: 22, fontSize: 13 }}>{label.flag}</div>
      <div className="w-mono" style={{ width: 70, fontSize: 11, fontWeight: 600 }}>{label.code}</div>
      <div className="w-mono" style={{ width: 64, fontSize: 12, textAlign: 'right' }}>{value}</div>
      <div className="w-mono" style={{ width: 54, fontSize: 10, color: sub.up === null ? W.muted : (sub.up ? W.up : W.down), textAlign: 'right' }}>{sub.chg}</div>
      <div className="w-row" style={{ gap: 3, width: 80, justifyContent: 'center' }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: 2,
            background: i === dotIndex ? color : W.fill,
            border: `1px solid ${i === dotIndex ? color : W.hairline}`,
          }} />
        ))}
      </div>
      <div className="w-grow w-faint" style={{ fontSize: 10 }}>{sub.label}</div>
      <Sparkline seed={'sent-' + label.code} up={sub.up !== null && sub.up} width={50} height={14} stroke={color} />
    </div>
  );
}

function WireHome() {
  const indices = [
    { code: 'KOSPI', val: '2,684.32', chg: '+18.42', pct: '+0.69%', up: true },
    { code: 'KOSDAQ', val: '852.10', chg: '−4.21', pct: '−0.49%', up: false },
    { code: 'S&P 500', val: '5,812.44', chg: '+22.10', pct: '+0.38%', up: true },
    { code: 'NASDAQ', val: '18,940.18', chg: '+98.55', pct: '+0.52%', up: true },
    { code: 'USD/KRW', val: '1,387.20', chg: '−3.10', pct: '−0.22%', up: false },
    { code: 'WTI', val: '$71.84', chg: '+0.42', pct: '+0.59%', up: true },
  ];
  const watchlist = [
    { tk: 'AAPL', nm: 'Apple', px: '184.32', chg: '+1.24%', up: true },
    { tk: 'NVDA', nm: 'NVIDIA', px: '912.18', chg: '+3.42%', up: true },
    { tk: 'TSLA', nm: 'Tesla', px: '218.40', chg: '−2.10%', up: false },
    { tk: '005930', nm: '삼성전자', px: '78,400', chg: '+0.51%', up: true },
    { tk: '000660', nm: 'SK하이닉스', px: '198,500', chg: '−1.24%', up: false },
    { tk: 'MSFT', nm: 'Microsoft', px: '424.10', chg: '+0.82%', up: true },
  ];
  // US mega-cap strip (시총 상위)
  const usBlueChips = [
    { tk: 'AAPL',  px: '184.32', pct: '+1.24%', up: true  },
    { tk: 'MSFT',  px: '424.10', pct: '+0.82%', up: true  },
    { tk: 'NVDA',  px: '912.18', pct: '+3.42%', up: true  },
    { tk: 'GOOGL', px: '178.50', pct: '+0.41%', up: true  },
    { tk: 'AMZN',  px: '188.74', pct: '−0.62%', up: false },
    { tk: 'META',  px: '512.30', pct: '+1.80%', up: true  },
    { tk: 'TSLA',  px: '218.40', pct: '−2.10%', up: false },
  ];
  // KR blue-chip strip
  const krBlueChips = [
    { tk: '005930', nm: '삼성전자',     px: '78,400',  pct: '+0.51%', up: true  },
    { tk: '000660', nm: 'SK하이닉스',   px: '198,500', pct: '−1.24%', up: false },
    { tk: '373220', nm: 'LG엔솔',       px: '362,000', pct: '+0.83%', up: true  },
    { tk: '207940', nm: '삼성바이오',   px: '928,000', pct: '+1.42%', up: true  },
    { tk: '005380', nm: '현대차',       px: '241,500', pct: '−0.62%', up: false },
    { tk: '000270', nm: '기아',         px: '108,200', pct: '+0.18%', up: true  },
    { tk: '035420', nm: 'NAVER',        px: '184,300', pct: '+0.27%', up: true  },
  ];

  const Strip = ({ items, getLabel, height = 60 }) => (
    <div className="w-row" style={{ overflow: 'hidden' }}>
      {items.map((s, idx) => (
        <div key={s.tk} className="w-grow" style={{
          padding: '8px 10px',
          borderRight: idx < items.length - 1 ? `1px solid ${W.hairline}` : 'none',
          minWidth: 0,
        }}>
          <div className="w-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ minWidth: 0 }}>
              <div className="w-mono" style={{ fontSize: 11, fontWeight: 600 }}>{s.tk}</div>
              <div className="w-faint" style={{ fontSize: 9.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getLabel(s)}
              </div>
              <div className={'w-mono ' + (s.up ? 'w-up' : 'w-down')} style={{ fontSize: 10, marginTop: 1 }}>
                {s.pct}
              </div>
            </div>
            <Sparkline seed={s.tk} up={s.up} width={40} height={16} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-root">
      <AppBar active="home" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>

        {/* Greeting + portfolio glance */}
        <div className="w-row" style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 className="w-h1">안녕하세요, Hak Lee 님</h1>
            <div className="w-muted" style={{ fontSize: 12, marginTop: 2 }}>
              2026년 5월 6일 화 · 시장 개장 중 (KRX) · 다음 주요 발표: FOMC 5/8
            </div>
          </div>
          <div className="w-card-soft w-row" style={{ padding: '8px 14px', gap: 16 }}>
            <div>
              <div className="w-h3">내 자산</div>
              <div className="w-num-md">₩ 48,210,400</div>
            </div>
            <div className="w-vrule" />
            <div>
              <div className="w-h3">오늘 손익</div>
              <div className="w-num-md w-up">+₩ 184,320 (+0.38%)</div>
            </div>
            <div className="w-vrule" />
            <div>
              <div className="w-h3">총 수익률</div>
              <div className="w-num-md w-up">+12.4%</div>
            </div>
          </div>
        </div>

        {/* Index strip — KR/US/FX/원자재 */}
        <div className="w-card" style={{ padding: 0 }}>
          <div className="w-row" style={{ justifyContent: 'space-between', padding: '6px 12px', borderBottom: `1px solid ${W.hairline}` }}>
            <div className="w-h3">주요 지수 · Indices</div>
            <div className="w-faint" style={{ fontSize: 10 }}>15분 지연</div>
          </div>
          <div className="w-row" style={{ overflow: 'hidden' }}>
            {indices.map((i, idx) => (
              <div key={i.code} className="w-grow" style={{
                padding: '10px 14px',
                borderRight: idx < indices.length - 1 ? `1px solid ${W.hairline}` : 'none',
              }}>
                <div className="w-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="w-h3" style={{ fontSize: 10 }}>{i.code}</div>
                    <div className="w-num-md" style={{ marginTop: 2, fontSize: 14 }}>{i.val}</div>
                    <div className={'w-mono ' + (i.up ? 'w-up' : 'w-down')} style={{ fontSize: 11, marginTop: 1 }}>
                      {i.chg} <span style={{ opacity: 0.7 }}>{i.pct}</span>
                    </div>
                  </div>
                  <Sparkline seed={i.code} up={i.up} width={56} height={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* US blue-chip + KR blue-chip strips (NEW v2) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="w-card" style={{ padding: 0 }}>
            <div className="w-row" style={{ justifyContent: 'space-between', padding: '6px 12px', borderBottom: `1px solid ${W.hairline}` }}>
              <div className="w-h3">🇺🇸 미국 주요 종목 · US Mega Caps</div>
              <span className="w-faint" style={{ fontSize: 10 }}>전체 보기 →</span>
            </div>
            <Strip items={usBlueChips} getLabel={s => s.tk} />
          </div>
          <div className="w-card" style={{ padding: 0 }}>
            <div className="w-row" style={{ justifyContent: 'space-between', padding: '6px 12px', borderBottom: `1px solid ${W.hairline}` }}>
              <div className="w-h3">🇰🇷 한국 주요 종목 · KR Blue Chips</div>
              <span className="w-faint" style={{ fontSize: 10 }}>전체 보기 →</span>
            </div>
            <Strip items={krBlueChips} getLabel={s => s.nm} />
          </div>
        </div>

        {/* Compact sentiment row — 4 indicators inline */}
        <div className="w-card" style={{ padding: 0 }}>
          <div className="w-row" style={{ justifyContent: 'space-between', padding: '6px 12px', borderBottom: `1px solid ${W.hairline}` }}>
            <h2 className="w-h2">시장 심리 <span className="w-faint" style={{ fontSize: 11, fontWeight: 400 }}>Sentiment</span></h2>
            <a className="w-faint" style={{ fontSize: 10, cursor: 'pointer' }}>전체 9개 지표 보기 → 리서치 / 시장 심리</a>
          </div>
          <SentimentRow
            label={{ flag: '🇺🇸', code: 'VIX' }}
            value="14.2"
            sub={{ chg: '▼ 0.8', up: true, label: '안정 · 변동성 낮음' }}
            dotIndex={0}
            color={W.up}
          />
          <SentimentRow
            label={{ flag: '🇺🇸', code: 'F&G' }}
            value="62"
            sub={{ chg: '▲ 4', up: false, label: '탐욕 · 과열 주의' }}
            dotIndex={3}
            color="#d97c41"
          />
          <SentimentRow
            label={{ flag: '🇰🇷', code: 'V-KOSPI' }}
            value="18.4"
            sub={{ chg: '▲ 0.4', up: null, label: '안정 · 변동성 평균' }}
            dotIndex={1}
            color="#7aa84a"
          />
          <SentimentRow
            label={{ flag: '🇰🇷', code: 'ADR' }}
            value="0.96"
            sub={{ chg: '▼ 0.04', up: false, label: '매도 우위 · 약세' }}
            dotIndex={1}
            color="#d97c41"
          />
        </div>

        {/* Main grid: watchlist + news + heatmap mini */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 12 }}>

          {/* Watchlist */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 className="w-h2">관심종목 <span className="w-faint" style={{ fontSize: 11, fontWeight: 400 }}>Watchlist</span></h2>
              <div className="w-row" style={{ gap: 6 }}>
                <span className="w-pill">기본</span>
                <span className="w-pill">미국주</span>
                <span className="w-pill" style={{ borderStyle: 'dashed' }}>+ 새 리스트</span>
              </div>
            </div>
            <div className="w-rule" style={{ marginBottom: 6 }} />
            <div className="w-col" style={{ gap: 0 }}>
              {watchlist.map((s, i) => (
                <div key={s.tk} className="w-row" style={{
                  padding: '8px 4px', gap: 10,
                  borderBottom: i < watchlist.length - 1 ? `1px solid ${W.hairline}` : 'none',
                }}>
                  <div style={{ width: 24, height: 24, border: `1px solid ${W.hairline}`, borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.tk[0]}
                  </div>
                  <div className="w-grow">
                    <div className="w-mono" style={{ fontSize: 12, fontWeight: 600 }}>{s.tk}</div>
                    <div className="w-faint" style={{ fontSize: 10 }}>{s.nm}</div>
                  </div>
                  <Sparkline seed={s.tk} up={s.up} width={50} height={16} />
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <div className="w-mono" style={{ fontSize: 12 }}>{s.px}</div>
                    <div className={'w-mono ' + (s.up ? 'w-up' : 'w-down')} style={{ fontSize: 10 }}>{s.chg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 className="w-h2">주요 뉴스 <span className="w-faint" style={{ fontSize: 11, fontWeight: 400 }}>News</span></h2>
              <div className="w-row" style={{ gap: 4 }}>
                <span className="w-pill" style={{ background: W.fill }}>전체</span>
                <span className="w-pill">관심종목</span>
                <span className="w-pill">매크로</span>
              </div>
            </div>
            <div className="w-rule" style={{ marginBottom: 6 }} />
            <div className="w-col" style={{ gap: 8 }}>
              {[
                { src: 'Bloomberg', t: '엔비디아 신규 칩 발표, 시간외 +4%', tags: ['NVDA'], time: '12분 전' },
                { src: '한경', t: '삼성전자, 2분기 실적 컨센서스 상회 전망', tags: ['005930'], time: '34분 전' },
                { src: 'Reuters', t: 'Fed 의사록: 6월 금리 동결 시그널', tags: ['MACRO'], time: '1시간 전' },
                { src: 'WSJ', t: 'Apple Vision Pro 2세대 9월 공개 관측', tags: ['AAPL'], time: '2시간 전' },
                { src: '연합', t: '코스피 외국인 8거래일 연속 순매수', tags: ['KOSPI'], time: '3시간 전' },
              ].map((n, i) => (
                <div key={i} className="w-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <div className="w-faint w-mono" style={{ fontSize: 10, width: 56, flexShrink: 0, paddingTop: 2 }}>
                    {n.time}
                  </div>
                  <div className="w-grow">
                    <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 2 }}>{n.t}</div>
                    <div className="w-row" style={{ gap: 6 }}>
                      <span className="w-faint" style={{ fontSize: 10 }}>{n.src}</span>
                      {n.tags.map(t => <span key={t} className="w-tag" style={{ fontSize: 9, padding: '0 4px' }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-faint" style={{ fontSize: 10, marginTop: 10, textAlign: 'center' }}>더 보기 →</div>
          </div>

          {/* Heatmap mini + economic calendar */}
          <div className="w-col" style={{ gap: 12 }}>
            <div className="w-card" style={{ padding: 12 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 className="w-h2">시장 지도 <span className="w-faint" style={{ fontSize: 11, fontWeight: 400 }}>Heatmap</span></h2>
                <span className="w-faint" style={{ fontSize: 10 }}>S&P 500 · 시총 가중</span>
              </div>
              {/* mini treemap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridAutoRows: 22, gap: 1 }}>
                {Array.from({ length: 48 }).map((_, i) => {
                  const v = ((i * 17) % 7 - 3) / 3;
                  const up = v >= 0;
                  const intensity = Math.abs(v);
                  const c = up
                    ? `rgba(31,138,91,${0.15 + intensity * 0.45})`
                    : `rgba(211,65,65,${0.15 + intensity * 0.45})`;
                  return <div key={i} style={{ background: c, gridRow: i === 0 ? 'span 2' : i === 5 ? 'span 2' : 'span 1', gridColumn: i === 0 ? 'span 2' : 'span 1' }} />;
                })}
              </div>
              <div className="w-row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 10 }}>
                <span className="w-down">−5%</span>
                <span className="w-faint">분석 → 시장 지도 풀화면 →</span>
                <span className="w-up">+5%</span>
              </div>
            </div>

            <div className="w-card" style={{ padding: 12, flex: 1 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 className="w-h2">경제 캘린더</h2>
                <span className="w-faint" style={{ fontSize: 10 }}>이번 주</span>
              </div>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              <div className="w-col" style={{ gap: 6, fontSize: 11 }}>
                {[
                  { d: '5/06 화', e: '미 무역수지', imp: 2 },
                  { d: '5/07 수', e: '한 외환보유액', imp: 1 },
                  { d: '5/08 목', e: 'FOMC 의사록', imp: 3 },
                  { d: '5/09 금', e: '미 미시간 소비심리', imp: 2 },
                  { d: '5/10 토', e: '중 CPI', imp: 2 },
                ].map((e, i) => (
                  <div key={i} className="w-row" style={{ gap: 8 }}>
                    <div className="w-mono w-faint" style={{ fontSize: 10, width: 50 }}>{e.d}</div>
                    <div className="w-grow" style={{ fontSize: 11 }}>{e.e}</div>
                    <div className="w-row" style={{ gap: 1 }}>
                      {[1, 2, 3].map(k => (
                        <div key={k} style={{ width: 4, height: 9, background: k <= e.imp ? W.ink : W.hairline }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: portfolio summary chart full width */}
        <div className="w-card" style={{ padding: 12 }}>
          <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 className="w-h2">내 수익률 vs 시장 평균 <span className="w-faint" style={{ fontSize: 11, fontWeight: 400 }}>My return vs market</span></h2>
            <div className="w-row" style={{ gap: 6 }}>
              <span className="w-pill">비교 대상 ▾ KOSPI · S&P 500</span>
              <span style={{ width: 1, height: 14, background: W.hairline, alignSelf: 'center' }} />
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((p, i) => (
                <span key={p} className="w-pill" style={{ background: i === 3 ? W.ink : W.bg, color: i === 3 ? '#fff' : W.muted, borderColor: i === 3 ? W.ink : W.hairline }}>{p}</span>
              ))}
            </div>
          </div>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <div style={{ position: 'relative', width: '100%', height: 140 }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <AreaChart seed="portfolio" width={1224} height={140} color={W.accent} />
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
              <AreaChart seed="bench" width={1224} height={140} color={W.muted} fill={false} />
            </div>
          </div>
          <div className="w-row" style={{ gap: 16, marginTop: 8, fontSize: 11 }}>
            <span className="w-row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: W.accent }} /> 내 포트폴리오 +12.4%</span>
            <span className="w-row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: W.muted }} /> KOSPI +4.1%</span>
            <span className="w-row" style={{ gap: 6 }}><span style={{ width: 10, height: 2, background: W.muted, borderTop: `2px dashed ${W.muted}` }} /> S&P 500 +8.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WireHome = WireHome;
window.SentimentGauge = SentimentGauge;
