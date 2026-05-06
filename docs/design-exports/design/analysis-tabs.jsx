// Analysis sub-tabs · 시장 개요 / 시장 심리 / 기술적 / 재무
// 4 full-screen designs sharing AnalysisShell + tab strip

function AnalysisShell({ theme, active, children }) {
  const tabs = ['시장 개요', '시장 심리', '기술적', '재무'];
  return (
    <SLPage theme={theme}>
      <SLAppBar active="analysis" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 60px' }}>
          <div className="sl-row" style={{ alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <h1 className="sl-h1">분석</h1>
            <span className="sl-caption">시장 전체 데이터를 깊이 보는 도구들</span>
          </div>
          <div className="sl-row" style={{ gap: 4, borderBottom: '1px solid var(--sl-line)', marginBottom: 24, marginTop: 16 }}>
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
          {children}
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Analysis Tab 1 — 시장 개요
// ─────────────────────────────────────────────────────────────
function AnalysisOverviewDesign({ theme = 'light' }) {
  const indices = [
    ['S&P 500', '5,884.21', '+0.42%', 'up'],
    ['NASDAQ', '19,003.65', '+0.81%', 'up'],
    ['DOW', '43,828.06', '−0.18%', 'down'],
    ['KOSPI', '2,488.97', '+0.24%', 'up'],
    ['KOSDAQ', '692.37', '−0.66%', 'down'],
    ['Nikkei', '39,701.07', '+0.34%', 'up'],
  ];
  const sectors = [['IT', 2.4], ['커뮤니케이션', 1.8], ['임의소비재', 0.9], ['헬스케어', 0.4], ['금융', 0.1], ['필수소비재', -0.2], ['산업재', -0.4], ['에너지', -0.3], ['소재', -0.6], ['유틸리티', -0.8], ['부동산', -1.2]];
  const countries = [
    ['🇺🇸 미국', '+0.42%', '+24.8%'],
    ['🇰🇷 한국', '+0.24%', '−6.2%'],
    ['🇯🇵 일본', '+0.34%', '+18.4%'],
    ['🇨🇳 중국', '−0.81%', '+12.1%'],
    ['🇩🇪 독일', '+0.18%', '+19.7%'],
    ['🇬🇧 영국', '+0.04%', '+8.4%'],
    ['🇹🇼 대만', '+1.12%', '+28.4%'],
    ['🇮🇳 인도', '+0.42%', '+11.8%'],
  ];

  return (
    <AnalysisShell theme={theme} active="시장 개요">
      <div className="sl-row" style={{ gap: 6, marginBottom: 16 }}>
        {['전체', '미국', '한국', '선진국', '신흥국'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
        <span className="sl-grow" />
        <span className="sl-caption" style={{ alignSelf: 'center' }}>갱신 14:32 · KRX/Stooq</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
        {indices.map(([n, v, d, c], i) => (
          <div key={i} className="sl-card" style={{ padding: 14 }}>
            <div className="sl-label">{n}</div>
            <div className="sl-mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{v}</div>
            <div className="sl-mono" style={{ fontSize: 12, fontWeight: 600, color: c === 'up' ? 'var(--sl-up)' : 'var(--sl-down)', marginTop: 2 }}>{d}</div>
            <Sparkline2 seed={n} up={c === 'up'} width={150} height={36} fill />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="섹터별 등락률" subtitle="S&P 500 · 오늘" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 8 }}>
            {sectors.map(([l, v], i) => (
              <div key={i} className="sl-row" style={{ gap: 10, fontSize: 12 }}>
                <span style={{ width: 90, fontSize: 12 }}>{l}</span>
                <div style={{ flex: 1, height: 18, background: 'var(--sl-surfaceAlt)', borderRadius: 4, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--sl-line)' }} />
                  <div style={{
                    position: 'absolute',
                    left: v >= 0 ? '50%' : `${50 + v * 12}%`,
                    top: 0, bottom: 0,
                    width: `${Math.abs(v) * 12}%`,
                    background: v >= 0 ? 'var(--sl-up)' : 'var(--sl-down)',
                    borderRadius: 4,
                  }} />
                </div>
                <span className="sl-mono" style={{ width: 56, textAlign: 'right', fontSize: 12, fontWeight: 600, color: v >= 0 ? 'var(--sl-up)' : 'var(--sl-down)' }}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="국가별 — 오늘" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['국가', '등락', 'YTD'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '8px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--sl-hairline)' }}>
                  <td style={{ padding: '10px 8px', fontSize: 13 }}>{r[0]}</td>
                  <td className="sl-mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: r[1].startsWith('+') ? 'var(--sl-up)' : 'var(--sl-down)' }}>{r[1]}</td>
                  <td className="sl-mono sl-caption" style={{ padding: '10px 8px', textAlign: 'right' }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="거래대금 상위" subtitle="오늘 · 미국 + 한국" size="lg" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            { title: '🇺🇸 미국 (US$ M)', rows: [['NVDA', '12,840', '+1.6%'], ['TSLA', '9,420', '+3.4%'], ['AAPL', '7,180', '+0.4%'], ['MSFT', '5,940', '+0.8%'], ['META', '4,820', '−0.6%']] },
            { title: '🇰🇷 한국 (억원)', rows: [['삼성전자', '8,420', '+0.3%'], ['SK하이닉스', '7,210', '+1.2%'], ['LG에너지솔루션', '4,840', '−0.8%'], ['삼성바이오', '3,210', '+2.1%'], ['NAVER', '2,940', '+0.4%']] },
          ].map((g, i) => (
            <div key={i}>
              <div className="sl-label" style={{ marginBottom: 10 }}>{g.title}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {g.rows.map((r, j) => (
                    <tr key={j} style={{ borderTop: '1px solid var(--sl-hairline)' }}>
                      <td style={{ padding: '10px 6px', fontWeight: 500 }}>{r[0]}</td>
                      <td className="sl-mono" style={{ padding: '10px 6px', textAlign: 'right' }}>{r[1]}</td>
                      <td className="sl-mono" style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600, color: r[2].startsWith('+') ? 'var(--sl-up)' : 'var(--sl-down)' }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </AnalysisShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Analysis Tab 2 — 시장 심리 (9개 게이지 풀화면)
// ─────────────────────────────────────────────────────────────
function AnalysisSentimentDesign({ theme = 'light' }) {
  const gauges = [
    { n: 'VIX', v: 14.2, max: 50, d: '낮음 · 과도한 안도', c: 'down' },
    { n: 'Fear & Greed', v: 72, max: 100, d: '탐욕', c: 'up' },
    { n: 'Put/Call Ratio', v: 0.84, max: 2, d: '중립', c: 'muted' },
    { n: 'AAII 강세 비중', v: 47.2, max: 100, d: '강세 우위', c: 'up' },
    { n: 'NAAIM 노출지수', v: 88, max: 200, d: '높음 · 과열 징후', c: 'up' },
    { n: 'High-Low Index', v: 64, max: 100, d: '확장세', c: 'up' },
    { n: '신용잔고 (KR)', v: 18.4, max: 30, d: '+8.4% · 증가세', c: 'up' },
    { n: 'VKOSPI', v: 18.4, max: 50, d: '평균 수준', c: 'muted' },
    { n: '외국인 5일 순매수', v: -28, max: 100, d: '−$420M · 매도', c: 'down' },
  ];

  return (
    <AnalysisShell theme={theme} active="시장 심리">
      {/* AI Summary hero */}
      <div className="sl-card" style={{ padding: 24, marginBottom: 20, background: 'linear-gradient(135deg, var(--sl-brandSoft) 0%, var(--sl-surface) 100%)' }}>
        <div className="sl-row" style={{ gap: 24, alignItems: 'center' }}>
          <Gauge value={72} label="탐욕" sublabel="종합 심리 점수" size={160} />
          <div className="sl-grow">
            <div className="sl-row" style={{ gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>✨</span>
              <span className="sl-label" style={{ color: 'var(--sl-brand)' }}>AI 종합 진단</span>
            </div>
            <h2 className="sl-h2" style={{ marginBottom: 10 }}>오늘의 시장 심리 — 탐욕 (Greed)</h2>
            <p style={{ fontSize: 14, color: 'var(--sl-inkSub)', lineHeight: 1.7, margin: 0 }}>
              9개 지표 중 <strong style={{ color: 'var(--sl-up)' }}>6개 강세</strong> · <strong style={{ color: 'var(--sl-down)' }}>1개 약세</strong> · 2개 중립. VIX 14.2로 변동성 매우 낮음 — 과도한 안도 신호. 신용잔고 증가, 노출지수 88 — 단기 과열 가능성. 한국은 외국인 매도세로 약세 신호 혼재.
            </p>
            <div className="sl-caption" style={{ marginTop: 12, fontSize: 11 }}>출처: Gemini 1.5 Flash · 매 4시간 갱신</div>
          </div>
        </div>
      </div>

      {/* 9 gauges grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {gauges.map((g, i) => {
          const pct = Math.min(100, Math.max(0, ((g.v - (g.max < 0 ? -100 : 0)) / Math.abs(g.max)) * 100));
          const colorVar = g.c === 'up' ? 'var(--sl-up)' : g.c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)';
          return (
            <div key={i} className="sl-card" style={{ padding: 18 }}>
              <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 className="sl-h3">{g.n}</h3>
                <span className="sl-caption">실시간</span>
              </div>
              <div className="sl-row" style={{ alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span className="sl-num-lg">{g.v}</span>
                <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, color: colorVar }}>{g.d}</span>
              </div>
              <div style={{ height: 8, background: 'var(--sl-surfaceAlt)', borderRadius: 4, marginBottom: 12, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: colorVar, borderRadius: 4 }} />
              </div>
              <Sparkline2 seed={g.n + '-90d'} up={g.c === 'up'} width={300} height={42} fill />
              <div className="sl-caption" style={{ marginTop: 6 }}>90일 추이</div>
            </div>
          );
        })}
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="심리 종합 점수" subtitle="1년 추이 · 25 미만 = 극도 공포 / 75 초과 = 극도 탐욕" size="lg" />
        <AreaChart2 seed="sentiment-1y" width={1180} height={160} color="var(--sl-up)" fillOpacity={0.12} />
        <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
          <span className="sl-caption">1년 전</span>
          <span className="sl-mono" style={{ fontWeight: 600 }}>현재 72 · 탐욕</span>
        </div>
      </div>
    </AnalysisShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Analysis Tab 3 — 기술적
// ─────────────────────────────────────────────────────────────
function AnalysisTechnicalDesign({ theme = 'light' }) {
  const signals = [
    ['AAPL · Apple', '골든크로스', '$229.4', '+0.4%', 58, '1.2x', 'up'],
    ['NVDA · NVIDIA', '신고가 돌파', '$148.2', '+1.6%', 78, '2.1x', 'up'],
    ['TSLA · Tesla', 'RSI 과매수', '$378.4', '+3.4%', 82, '1.8x', 'down'],
    ['삼성전자', '이중 바닥', '55,400', '+0.3%', 42, '0.9x', 'up'],
    ['SK하이닉스', '데드크로스', '148,300', '−1.2%', 38, '1.4x', 'down'],
    ['META · Meta', '갭 상승', '$580.4', '+2.4%', 68, '1.6x', 'up'],
  ];

  return (
    <AnalysisShell theme={theme} active="기술적">
      <div className="sl-row" style={{ gap: 6, marginBottom: 16 }}>
        {['전체 시장', 'S&P500', 'KOSPI', '내 관심종목'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 1 ? 'true' : undefined}>{t}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['52주 신고가', '82', '종목 · 전일 71', 'up'],
          ['52주 신저가', '12', '종목 · 전일 18', 'up'],
          ['MA200 위', '78%', '상승추세 강함', 'up'],
          ['골든크로스 (7일)', '24', '건 · 매수 신호', 'up'],
        ].map(([l, v, d, c], i) => (
          <div key={i} className="sl-card" style={{ padding: 18 }}>
            <div className="sl-label">{l}</div>
            <div className="sl-num-lg" style={{ marginTop: 6 }}>{v}</div>
            <div className="sl-mono" style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color: 'var(--sl-up)' }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="RSI 분포" subtitle="S&P 500 · 종목 카운트" />
          <BarChart2 seed="rsi-dist" width={520} height={180} bars={20} signed={false} />
          <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
            <span className="sl-caption">과매도 &lt; 30</span>
            <span className="sl-caption">중립 30 ~ 70</span>
            <span className="sl-caption">과매수 &gt; 70</span>
          </div>
        </div>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="Advance / Decline Line" subtitle="상승 332 · 하락 168 · 보합 12" />
          <AreaChart2 seed="ad-line" width={520} height={180} color="var(--sl-up)" fillOpacity={0.14} />
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="오늘의 기술 신호" subtitle="자동 탐지 · 매 1시간" size="lg" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['종목', '신호', '현재가', '변동', 'RSI', '거래량 비율', '7일 추이'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i < 2 ? 'left' : 'right', padding: '10px 12px',
                  fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{r[0]}</td>
                <td style={{ padding: '12px' }}><span className={`sl-tag ${r[6] === 'up' ? 'sl-tag-up' : 'sl-tag-down'}`}>{r[1]}</span></td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{r[2]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: r[3].startsWith('+') ? 'var(--sl-up)' : 'var(--sl-down)' }}>{r[3]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', color: r[4] > 70 ? 'var(--sl-down)' : r[4] < 30 ? 'var(--sl-up)' : 'var(--sl-ink)' }}>{r[4]}</td>
                <td className="sl-mono sl-caption" style={{ padding: '12px', textAlign: 'right' }}>{r[5]}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <Sparkline2 seed={r[0]} up={r[6] === 'up'} width={100} height={28} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalysisShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Analysis Tab 4 — 재무 (시장 전체)
// ─────────────────────────────────────────────────────────────
function AnalysisFinancialDesign({ theme = 'light' }) {
  const compare = [
    ['PER (가중평균)', '24.8', '11.2', '−54.8%', '21.4', '12.4'],
    ['PBR', '4.8', '0.94', '−80.4%', '4.1', '1.04'],
    ['ROE', '18.4%', '8.1%', '−10.3%p', '17.2%', '8.8%'],
    ['배당수익률', '1.3%', '2.1%', '+0.8%p', '1.5%', '1.9%'],
    ['EPS 성장 (YoY)', '+12.4%', '+4.2%', '−8.2%p', '+9.8%', '+3.4%'],
    ['부채비율', '88%', '94%', '+6%p', '82%', '92%'],
  ];

  return (
    <AnalysisShell theme={theme} active="재무">
      <div className="sl-row" style={{ gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['섹터별', '시총별', '국가별'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
        <div style={{ width: 1, height: 22, background: 'var(--sl-line)', margin: '0 6px', alignSelf: 'center' }} />
        {['PER', 'PBR', 'ROE', '부채비율', '매출성장'].map((t, i) => (
          <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
        ))}
      </div>

      <div className="sl-card" style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader title="섹터별 평균 PER" subtitle="S&P 500 · 시가총액 가중" size="lg" />
        <BarChart2 seed="sector-per" width={1180} height={200} bars={11} signed={false} />
        <div className="sl-row" style={{ marginTop: 10, gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
          {['IT 32x', '커뮤니케이션 24x', '임의소비재 26x', '산업재 22x', '헬스케어 18x', '금융 14x', '필수소비재 21x', '에너지 11x', '유틸리티 18x', '부동산 28x', '소재 17x'].map((s, i) => (
            <span key={i} className="sl-caption sl-mono">{s}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="섹터별 ROE 분포" subtitle="시장 가중 평균" />
          <BarChart2 seed="roe-dist" width={520} height={180} bars={11} signed={false} />
        </div>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="섹터별 매출 성장률 (YoY)" />
          <BarChart2 seed="growth-dist" width={520} height={180} bars={11} signed />
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="국가별 시장 평균 — 한미 비교" subtitle="현재 + 5년 평균" size="lg" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['지표', 'S&P 500', 'KOSPI', '차이', '5Y 평균 (S&P)', '5Y 평균 (KOSPI)'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : 'right', padding: '10px 12px',
                  fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{r[0]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{r[1]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{r[2]}</td>
                <td className="sl-mono" style={{
                  padding: '12px', textAlign: 'right', fontWeight: 600,
                  color: r[3].startsWith('+') ? 'var(--sl-up)' : r[3].startsWith('−') ? 'var(--sl-down)' : 'var(--sl-muted)',
                }}>{r[3]}</td>
                <td className="sl-mono sl-caption" style={{ padding: '12px', textAlign: 'right' }}>{r[4]}</td>
                <td className="sl-mono sl-caption" style={{ padding: '12px', textAlign: 'right' }}>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalysisShell>
  );
}

Object.assign(window, { AnalysisShell, AnalysisOverviewDesign, AnalysisSentimentDesign, AnalysisTechnicalDesign, AnalysisFinancialDesign });
