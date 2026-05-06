// Stock Detail · 8개 탭별 풀화면 디자인
// 개요는 design/stock-portfolio.jsx 의 StockDetailDesign 으로 분리되어 있고, 본 파일은
// 차트 / 재무 / 적정가치 / 공시·실적 / 뉴스 / 수급 / 목표주가 7개 탭을 담는다.
// 각 탭은 동일한 SLStockHeader 를 공유한다.

// ─────────────────────────────────────────────────────────────
// Shared header — logo + ticker + price + tab strip
// ─────────────────────────────────────────────────────────────
function SLStockHeader({ active }) {
  const tabs = ['개요', '차트', '재무', '적정가치', '공시·실적', '뉴스', '수급', '목표주가'];
  return (
    <>
      <div className="sl-caption" style={{ marginBottom: 12 }}>홈 / 종목 검색 / NVDA</div>
      <div className="sl-card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="sl-row" style={{ gap: 20, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--sl-cat3), var(--sl-cat2))',
            flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 20,
          }}>N</div>
          <div className="sl-grow">
            <div className="sl-row" style={{ gap: 10, marginBottom: 6 }}>
              <h1 className="sl-h1">NVIDIA</h1>
              <span className="sl-tag sl-mono">NVDA</span>
              <span className="sl-tag">NASDAQ</span>
              <span className="sl-tag sl-tag-brand">반도체</span>
            </div>
            <div className="sl-row" style={{ gap: 16, alignItems: 'baseline' }}>
              <span className="sl-num-lg sl-mono">$148.20</span>
              <ChangePill pct={1.61} abs={2.34} size="lg" />
              <span className="sl-caption">실시간 · 14:32:18 ET · 시총 $3.65T</span>
            </div>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <div className="sl-row" style={{ gap: 8 }}>
              <button className="sl-btn sl-btn-ghost">★ 관심</button>
              <button className="sl-btn sl-btn-ghost">📝 메모</button>
              <button className="sl-btn sl-btn-primary">+ 거래 기록</button>
            </div>
          </div>
        </div>
      </div>
      <div className="sl-row" style={{ gap: 4, borderBottom: '1px solid var(--sl-line)', marginBottom: 20 }}>
        {tabs.map(t => (
          <span key={t} style={{
            padding: '10px 16px', fontSize: 13,
            fontWeight: t === active ? 600 : 500,
            color: t === active ? 'var(--sl-brand)' : 'var(--sl-inkSub)',
            borderBottom: t === active ? '2px solid var(--sl-brand)' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>{t}</span>
        ))}
      </div>
    </>
  );
}

function StockShell({ theme, active, children }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 32px 60px' }}>
          <SLStockHeader active={active} />
          {children}
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab 2 — 차트 (TradingView 스타일)
// ─────────────────────────────────────────────────────────────
function StockChartDesign({ theme = 'light' }) {
  const overlays = [
    { l: 'MA 5', on: false, c: '#3b82f6' },
    { l: 'MA 20', on: true, c: '#e0a64a' },
    { l: 'MA 60', on: true, c: 'var(--sl-brand)' },
    { l: 'MA 120', on: true, c: '#7e4ec5' },
    { l: 'EMA 12', on: false, c: '#22c55e' },
    { l: 'EMA 26', on: false, c: '#ef4444' },
    { l: '볼린저 (20,2)', on: true, c: 'var(--sl-muted)' },
    { l: '일목균형표', on: false, c: '#999' },
    { l: 'VWAP', on: false, c: '#a855f7' },
  ];
  const subpanels = [['거래량', true], ['RSI (14)', true], ['MACD (12,26,9)', true],
    ['Stochastic', false], ['ATR (14)', false], ['OBV', false], ['CCI', false]];
  const tools = [['↕','수평선'],['╱','추세선'],['▭','박스'],['◯','원'],['⌖','피보나치'],['#','패턴'],['✎','텍스트'],['📏','측정'],['🎯','앵커'],['↺','되돌리기'],['✕','지우기']];

  return (
    <StockShell theme={theme} active="차트">
      <div className="sl-card-soft" style={{ padding: '10px 14px', fontSize: 12, color: 'var(--sl-muted)', marginBottom: 12 }}>
        출처: KRX 일별 종가 (한국주) · Stooq 일별 (미국주) · 갱신 14:32 · <span className="sl-up" style={{ fontWeight: 600 }}>정상</span> · 자체 SVG 차트 엔진
      </div>

      <div className="sl-row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['1D','1W','1M','3M','6M','1Y','3Y','5Y','전체'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 5 ? 'true' : undefined}>{t}</span>
        ))}
        <div style={{ width: 1, height: 22, background: 'var(--sl-line)', margin: '0 8px', alignSelf: 'center' }} />
        {['캔들','OHLC','선','영역','Heikin-Ashi'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
        <span className="sl-grow" />
        <span className="sl-caption" style={{ alignSelf: 'center' }}>마우스 휠 줌 · 드래그 팬</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 240px', gap: 10, marginBottom: 12 }}>
        {/* Drawing tools rail */}
        <div className="sl-card" style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tools.map(([g, t], i) => (
            <div key={i} title={t} style={{
              width: 40, height: 36, borderRadius: 8,
              border: `1px solid ${i === 1 ? 'var(--sl-brand)' : 'var(--sl-hairline)'}`,
              background: i === 1 ? 'var(--sl-brandSoft)' : 'transparent',
              color: i === 1 ? 'var(--sl-brand)' : 'var(--sl-inkSub)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, cursor: 'pointer',
            }}>{g}</div>
          ))}
        </div>

        {/* Main chart */}
        <div className="sl-card" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Legend overlay */}
          <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 2, background: 'var(--sl-surface)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--sl-line)', fontSize: 11 }}>
            <div className="sl-mono" style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>NVDA · 1Y · D</div>
            <div className="sl-row" style={{ gap: 10, fontSize: 10 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 2, background: '#e0a64a', verticalAlign: 'middle', marginRight: 4 }} />MA20 142.3</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 2, background: 'var(--sl-brand)', verticalAlign: 'middle', marginRight: 4 }} />MA60 128.4</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 2, background: '#7e4ec5', verticalAlign: 'middle', marginRight: 4 }} />MA120 110.8</span>
            </div>
          </div>
          {/* Crosshair tooltip */}
          <div style={{ position: 'absolute', top: 80, right: 110, zIndex: 2, background: 'var(--sl-ink)', color: 'var(--sl-bg)', padding: '8px 10px', borderRadius: 8, fontSize: 11 }}>
            <div className="sl-mono" style={{ opacity: 0.6, fontSize: 10 }}>2025-12-15</div>
            <div className="sl-mono" style={{ marginTop: 2 }}>O 145.20  H 149.40</div>
            <div className="sl-mono">L 144.80  C 148.20</div>
            <div className="sl-mono" style={{ opacity: 0.6, fontSize: 10, marginTop: 2 }}>V 198.4M</div>
          </div>
          {/* Vertical crosshair */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '62%', width: 1, borderLeft: '1px dashed var(--sl-muted)', zIndex: 1 }} />
          <CandleChart2 seed="full-chart" width={748} height={360} bars={120} showGrid showVolume />
        </div>

        {/* Indicators rail */}
        <div className="sl-card" style={{ padding: 14 }}>
          <div className="sl-label">가격 오버레이</div>
          <div className="sl-rule" style={{ margin: '8px 0' }} />
          <div className="sl-col" style={{ gap: 6, fontSize: 12 }}>
            {overlays.map((o, i) => (
              <div key={i} className="sl-row" style={{ gap: 8 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 4,
                  border: `1.5px solid ${o.on ? 'var(--sl-brand)' : 'var(--sl-line)'}`,
                  background: o.on ? 'var(--sl-brand)' : 'transparent',
                  color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{o.on ? '✓' : ''}</span>
                <span style={{ display: 'inline-block', width: 12, height: 2, background: o.c }} />
                <span style={{ color: o.on ? 'var(--sl-ink)' : 'var(--sl-muted)', flex: 1 }}>{o.l}</span>
                {o.on && <span className="sl-muted" style={{ fontSize: 10 }}>⚙</span>}
              </div>
            ))}
          </div>
          <div className="sl-rule" style={{ margin: '12px 0' }} />
          <div className="sl-label">서브패널</div>
          <div className="sl-rule" style={{ margin: '8px 0' }} />
          <div className="sl-col" style={{ gap: 6, fontSize: 12 }}>
            {subpanels.map(([l, on], i) => (
              <div key={i} className="sl-row" style={{ gap: 8 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 4,
                  border: `1.5px solid ${on ? 'var(--sl-brand)' : 'var(--sl-line)'}`,
                  background: on ? 'var(--sl-brand)' : 'transparent',
                  color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{on ? '✓' : ''}</span>
                <span style={{ color: on ? 'var(--sl-ink)' : 'var(--sl-muted)', flex: 1 }}>{l}</span>
                {on && <span className="sl-muted" style={{ fontSize: 10 }}>⚙</span>}
              </div>
            ))}
          </div>
          <button className="sl-btn sl-btn-secondary sl-btn-sm" style={{ marginTop: 12, width: '100%' }}>+ 지표 추가 (40+)</button>
        </div>
      </div>

      {/* Sub panels */}
      <div className="sl-col" style={{ gap: 8, marginBottom: 12 }}>
        {[
          { l: '거래량', meta: '198.4M (1.2x avg)', col: 'var(--sl-muted)' },
          { l: 'RSI (14)', meta: '78.4 · 과매수', col: 'var(--sl-down)' },
          { l: 'MACD (12,26,9)', meta: 'MACD 2.4 · Signal 1.8 · Hist +0.6', col: 'var(--sl-up)' },
        ].map((s, i) => (
          <div key={i} className="sl-card" style={{ padding: 12 }}>
            <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="sl-label" style={{ color: 'var(--sl-ink)', textTransform: 'none', fontSize: 12, fontWeight: 600 }}>{s.l}</span>
              <span className="sl-mono" style={{ fontSize: 11, color: s.col, fontWeight: 600 }}>{s.meta}</span>
            </div>
            {i === 0 ? <BarChart2 seed={'vol-'+i} width={1180} height={64} bars={120} signed={false} />
              : <AreaChart2 seed={'sub-'+i} width={1180} height={64} color={i === 1 ? 'var(--sl-brand)' : 'var(--sl-up)'} fillOpacity={0.08} />}
          </div>
        ))}
      </div>

      <div className="sl-card-soft" style={{ padding: 14, fontSize: 12, color: 'var(--sl-muted)', lineHeight: 1.6 }}>
        💡 구현 메모: 자체 SVG 엔진 (Lightweight Charts·TradingView 무료판은 워터마크). MA·EMA·볼린저 계산은 Supabase Edge Function 또는 클라이언트에서 직접. 그리기 도구는 SVG 레이어로 마우스 이벤트 처리 — localStorage 저장.
      </div>
    </StockShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab 3 — 재무 (IS / BS / CF)
// ─────────────────────────────────────────────────────────────
function StockFinancialsDesign({ theme = 'light' }) {
  const ratios = [
    ['매출총이익률', 64.9, 64.9, 56.9, 72.7, 75.0],
    ['영업이익률', 27.2, 37.3, 15.7, 54.1, 58.4],
    ['순이익률', 25.9, 36.2, 16.2, 48.9, 51.7],
    ['ROE', 25.4, 44.9, 17.9, 99.3, 91.5],
    ['ROA', 14.7, 21.0, 10.6, 55.7, 58.4],
    ['부채비율', 48, 52, 42, 28, 22],
  ];
  const is = [
    ['매출', 16.7, 26.9, 27.0, 60.9, 113.3, '+47%', '$28B', true],
    ['매출원가', 5.9, 9.4, 11.6, 16.6, 28.3, '', '', false],
    ['매출총이익', 10.8, 17.5, 15.4, 44.3, 85.0, '+51%', '', false],
    ['판관비', 2.7, 5.5, 11.1, 11.3, 17.7, '', '', false],
    ['영업이익', 4.5, 10.0, 4.2, 32.9, 66.0, '+71%', '$5B', true],
    ['세전이익', 4.5, 9.9, 4.0, 33.2, 67.0, '', '', false],
    ['법인세', 0.1, 0.2, -0.2, 4.1, 7.4, '', '', false],
    ['순이익', 4.3, 9.8, 4.4, 29.8, 58.6, '+69%', '$3B', true],
    ['EPS (희석)', 0.17, 0.39, 0.17, 1.19, 2.34, '', '', false],
  ];

  return (
    <StockShell theme={theme} active="재무">
      <div className="sl-row" style={{ gap: 6, marginBottom: 16 }}>
        {['손익계산서', '재무상태표', '현금흐름표'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
        <div style={{ width: 1, height: 22, background: 'var(--sl-line)', margin: '0 6px', alignSelf: 'center' }} />
        {['연간', '분기'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
        <span className="sl-grow" />
        <span className="sl-caption" style={{ alignSelf: 'center' }}>출처 EDGAR · 10-K · 갱신 11/14</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="매출 / 영업이익 / 순이익" subtitle="5년" />
          <AreaChart2 seed="stk-fin-trend" width={680} height={220} color="var(--sl-brand)" fillOpacity={0.12} />
          <div className="sl-row" style={{ gap: 16, marginTop: 12, fontSize: 12 }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-brand)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />매출 +47% CAGR</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-up)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />영업이익 +71%</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-cat4)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />순이익 +69%</span>
          </div>
        </div>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="주요 비율 추이" subtitle="FY21 → FY25" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 500 }}>지표</th>
                {['FY21','FY22','FY23','FY24','FY25'].map(y => (
                  <th key={y} style={{ textAlign: 'right', padding: '6px 8px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 500, fontFamily: 'var(--sl-font-mono)' }}>{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ratios.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--sl-hairline)' }}>
                  <td style={{ padding: '8px', fontSize: 12 }}>{r[0]}</td>
                  {r.slice(1).map((v, j) => (
                    <td key={j} className="sl-mono" style={{ padding: '8px', textAlign: 'right', fontSize: 12, fontWeight: j === 4 ? 600 : 400 }}>{v}{r[0].includes('률') || r[0].includes('ROE') || r[0].includes('ROA') ? '%' : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="손익계산서" subtitle="단위: $B · FY21 → FY25" size="lg" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>항목</th>
              {['FY21','FY22','FY23','FY24','FY25','5Y CAGR','업계 평균'].map(y => (
                <th key={y} style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {is.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)', background: r[8] ? 'var(--sl-brandSoft)' : 'transparent' }}>
                <td style={{ padding: '10px 12px', fontWeight: r[8] ? 600 : 400 }}>{r[0]}</td>
                {r.slice(1, 8).map((v, j) => (
                  <td key={j} className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: r[8] ? 600 : 400, color: j === 5 && v ? 'var(--sl-up)' : undefined }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StockShell>
  );
}

Object.assign(window, { SLStockHeader, StockShell, StockChartDesign, StockFinancialsDesign });
