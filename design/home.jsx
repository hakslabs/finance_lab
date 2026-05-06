// Home Dashboard — hi-fi design.
// Hero: portfolio summary + my watchlist quick view
// Below: indices strip, US/KR top stocks, market sentiment compact, news, performance vs market
function HomeDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="home" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>

          {/* Hero — greeting + portfolio summary */}
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="sl-caption" style={{ marginBottom: 4 }}>좋은 오후입니다</div>
              <h1 className="sl-h1">홍길동님, 오늘의 시장은 <span style={{ color: 'var(--sl-up)' }}>상승</span>으로 출발했어요</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>
                <span className="sl-mono">2025·12·15 (월) 14:32 KST</span>
                <span style={{ margin: '0 8px' }}>·</span>
                NYSE 정규장 진행 중 · KOSPI 마감
              </div>
            </div>
            <div className="sl-row" style={{ gap: 8 }}>
              <button className="sl-btn sl-btn-secondary">+ 거래 입력</button>
              <button className="sl-btn sl-btn-primary">+ 종목 추가</button>
            </div>
          </div>

          {/* Portfolio hero card */}
          <div className="sl-card" style={{ padding: 28, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div className="sl-row" style={{ gap: 32, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 auto' }}>
                <div className="sl-label" style={{ marginBottom: 8 }}>총 자산</div>
                <div className="sl-num-hero">$48,247.32</div>
                <div className="sl-row" style={{ gap: 10, marginTop: 12 }}>
                  <ChangePill pct={1.84} abs={875.40} size="lg" />
                  <span className="sl-caption">오늘</span>
                  <span className="sl-caption" style={{ color: 'var(--sl-line)' }}>|</span>
                  <span className="sl-mono sl-up" style={{ fontSize: 13, fontWeight: 600 }}>+$5,247.32</span>
                  <span className="sl-caption">전체 (+12.2%)</span>
                </div>
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0, height: 110 }}>
                <AreaChart2 seed="hero-port" width={720} height={110} color="var(--sl-up)" fillOpacity={0.18} />
              </div>
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PeriodSelector active="3M" />
                <div className="sl-row" style={{ gap: 14, fontSize: 12, color: 'var(--sl-muted)' }}>
                  <span>● <span style={{ color: 'var(--sl-up)' }}>내 수익률 +12.2%</span></span>
                </div>
                <div className="sl-row" style={{ gap: 14, fontSize: 12, color: 'var(--sl-muted)' }}>
                  <span>● S&P500 +8.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indices strip */}
          <div className="sl-row" style={{ gap: 12, marginBottom: 20, overflowX: 'auto' }}>
            {[
              { tk: 'S&P 500', val: '5,847.21', pct: 0.42, seed: 'spx', up: true },
              { tk: 'NASDAQ', val: '18,924.10', pct: 0.78, seed: 'ixic', up: true },
              { tk: 'DOW', val: '42,184.30', pct: -0.12, seed: 'dji', up: false },
              { tk: 'KOSPI', val: '2,498.34', pct: 0.55, seed: 'kospi', up: true },
              { tk: 'KOSDAQ', val: '724.18', pct: -0.34, seed: 'kosdaq', up: false },
              { tk: 'USD/KRW', val: '1,398.20', pct: -0.18, seed: 'usdkrw', up: false },
              { tk: 'WTI', val: '72.84', pct: 1.24, seed: 'wti', up: true },
              { tk: 'BTC', val: '$98,420', pct: 2.18, seed: 'btc', up: true },
            ].map((x, i) => (
              <div key={i} className="sl-card" style={{ padding: '12px 16px', minWidth: 160, flex: '0 0 auto' }}>
                <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="sl-label">{x.tk}</span>
                  <Sparkline2 seed={x.seed} up={x.up} width={48} height={20} />
                </div>
                <div className="sl-num-md" style={{ marginTop: 6 }}>{x.val}</div>
                <ChangePill pct={x.pct} size="sm" />
              </div>
            ))}
          </div>

          {/* Main grid — 8/4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Watchlist */}
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader
                title="관심종목"
                subtitle="12개 추적 중"
                size="lg"
                action={<Tabs items={[{label:'전체',id:'all'},{label:'미국',id:'us'},{label:'한국',id:'kr'}]} active="all" size="sm" />}
              />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sl-line)' }}>
                    {['종목', '현재가', '변동', '거래량', '7일 차트', ''].map((h, i) => (
                      <th key={h} style={{ textAlign: i < 1 ? 'left' : i === 4 ? 'center' : 'right', padding: '8px 10px', fontWeight: 500, color: 'var(--sl-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tk: 'AAPL', name: 'Apple Inc.', px: '178.32', chg: 1.32, vol: '52.4M', up: true },
                    { tk: 'NVDA', name: 'NVIDIA Corp.', px: '920.10', chg: 3.45, vol: '198.4M', up: true },
                    { tk: 'TSLA', name: 'Tesla Inc.', px: '218.45', chg: -2.18, vol: '88.2M', up: false },
                    { tk: '005930', name: '삼성전자', px: '74,200', chg: 0.81, vol: '12.4M', up: true },
                    { tk: '000660', name: 'SK하이닉스', px: '178,500', chg: 2.14, vol: '5.8M', up: true },
                    { tk: 'GOOGL', name: 'Alphabet Inc.', px: '184.20', chg: -0.45, vol: '24.1M', up: false },
                  ].map((r, i) => (
                    <tr key={r.tk} style={{ borderBottom: i < 5 ? '1px solid var(--sl-hairline)' : 'none' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600 }}>{r.tk}</div>
                        <div className="sl-caption">{r.name}</div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <span className="sl-num-md">{r.px}</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <ChangePill pct={r.chg} size="sm" />
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <span className="sl-mono" style={{ fontSize: 12, color: 'var(--sl-muted)' }}>{r.vol}</span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Sparkline2 seed={r.tk} up={r.up} width={80} height={28} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--sl-muted)', fontSize: 16 }}>›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="sl-row" style={{ justifyContent: 'center', marginTop: 12 }}>
                <button className="sl-btn sl-btn-ghost">전체 12개 보기 →</button>
              </div>
            </div>

            {/* Sentiment compact */}
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader
                title="시장 심리"
                subtitle="공포·탐욕 지수"
                size="lg"
                action={<a className="sl-caption" style={{ color: 'var(--sl-brand)', fontWeight: 600 }}>풀 분석 →</a>}
              />
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Gauge value={62} label="탐욕" sublabel="CNN F&G · US" size={180} />
              </div>
              <div className="sl-rule" style={{ margin: '16px 0' }} />
              <div className="sl-col" style={{ gap: 10 }}>
                {[
                  { name: 'VIX', val: '14.2', pct: -3.4, label: '낮음' },
                  { name: 'AAII Bull-Bear', val: '+28%', pct: 5.2, label: '강세' },
                  { name: 'Put/Call Ratio', val: '0.84', pct: -2.1, label: '강세' },
                  { name: 'KR 외국인 순매수', val: '+342억', pct: 1.2, label: '유입' },
                ].map(r => (
                  <div key={r.name} className="sl-row" style={{ justifyContent: 'space-between', fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div className="sl-caption">{r.label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="sl-num-sm">{r.val}</div>
                      <ChangePill pct={r.pct} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* US & KR top stocks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {[
              { title: '미국 주요 종목', sub: 'S&P 500 시총 상위', data: [
                { tk: 'AAPL', px: '178.32', chg: 1.32 }, { tk: 'MSFT', px: '418.20', chg: 0.84 },
                { tk: 'NVDA', px: '920.10', chg: 3.45 }, { tk: 'GOOGL', px: '184.20', chg: -0.45 },
                { tk: 'META', px: '512.40', chg: 2.18 }, { tk: 'AMZN', px: '218.30', chg: 1.04 },
                { tk: 'TSLA', px: '218.45', chg: -2.18 },
              ]},
              { title: '한국 주요 종목', sub: 'KOSPI 시총 상위', data: [
                { tk: '삼성전자', px: '74,200', chg: 0.81 }, { tk: 'SK하이닉스', px: '178,500', chg: 2.14 },
                { tk: 'LG에너지솔루션', px: '342,000', chg: -1.20 }, { tk: '삼성바이오로직스', px: '942,000', chg: 0.52 },
                { tk: '현대차', px: '218,500', chg: 1.84 }, { tk: '기아', px: '108,200', chg: 2.04 },
                { tk: 'NAVER', px: '194,800', chg: -0.42 },
              ]},
            ].map((sec, si) => (
              <div key={si} className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title={sec.title} subtitle={sec.sub} size="lg" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {sec.data.map(s => (
                    <div key={s.tk} className="sl-row" style={{
                      padding: '10px 12px', borderRadius: 8,
                      background: 'var(--sl-surfaceAlt)', justifyContent: 'space-between',
                    }}>
                      <div className="sl-row" style={{ gap: 10 }}>
                        <Sparkline2 seed={s.tk} up={s.chg >= 0} width={32} height={20} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{s.tk}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="sl-num-sm">{s.px}</div>
                        <div className="sl-mono" style={{ fontSize: 11, color: s.chg >= 0 ? 'var(--sl-up)' : 'var(--sl-down)', fontWeight: 600 }}>
                          {s.chg >= 0 ? '+' : ''}{s.chg.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* News + Heatmap mini */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader
                title="주요 뉴스"
                subtitle="AI 요약 · 30+ 소스"
                size="lg"
                action={<Tabs items={[{label:'전체'},{label:'미국'},{label:'한국'},{label:'관심'}]} active="전체" size="sm" />}
              />
              <div className="sl-col" style={{ gap: 14 }}>
                {[
                  { tag: '연준', tagColor: 'brand', title: 'Powell, "12월 FOMC에서 금리 25bp 인하 가능성 시사"', src: 'Reuters', time: '32분 전', tickers: ['SPY','QQQ'] },
                  { tag: '실적', tagColor: 'up', title: 'NVIDIA 4Q 가이던스 컨센서스 상회, AI 칩 수요 견조', src: 'Bloomberg', time: '1시간 전', tickers: ['NVDA','AMD','TSM'] },
                  { tag: '한국', tagColor: 'brand', title: '삼성전자, HBM4 양산 일정 6개월 단축 발표', src: '연합뉴스', time: '2시간 전', tickers: ['005930','000660'] },
                  { tag: '거시', tagColor: 'warn', title: '미국 11월 CPI 3.1% — 시장 예상치 부합', src: 'WSJ', time: '4시간 전', tickers: [] },
                ].map((n, i) => (
                  <div key={i} style={{ paddingBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <div className="sl-row" style={{ gap: 8, marginBottom: 6 }}>
                      <span className={`sl-tag sl-tag-${n.tagColor}`}>{n.tag}</span>
                      <span className="sl-caption">{n.src} · {n.time}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.45, marginBottom: n.tickers.length ? 6 : 0 }}>{n.title}</div>
                    {n.tickers.length > 0 && (
                      <div className="sl-row" style={{ gap: 6 }}>
                        {n.tickers.map(t => <span key={t} className="sl-tag sl-mono" style={{ fontSize: 10 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader
                title="시장 지도"
                subtitle="섹터 · 시총 가중"
                size="lg"
                action={<a className="sl-caption" style={{ color: 'var(--sl-brand)', fontWeight: 600 }}>풀 화면 →</a>}
              />
              <Heatmap />
            </div>
          </div>

          {/* Performance vs market + Calendar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader
                title="내 수익률 vs 시장 평균"
                subtitle="3개월 비교"
                size="lg"
                action={<PeriodSelector active="3M" />}
              />
              <div style={{ position: 'relative', height: 200 }}>
                <AreaChart2 seed="me" width={780} height={200} color="var(--sl-brand)" fillOpacity={0.15} />
                <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0.7 }}>
                  <AreaChart2 seed="spy" width={780} height={200} color="var(--sl-muted)" fillOpacity={0.05} />
                </div>
              </div>
              <div className="sl-row" style={{ gap: 24, marginTop: 12 }}>
                <Legend color="var(--sl-brand)" label="내 포트폴리오" value="+12.2%" up />
                <Legend color="var(--sl-muted)" label="S&P 500" value="+8.4%" />
                <Legend color="var(--sl-muted)" label="KOSPI" value="+3.2%" />
              </div>
            </div>

            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="이번 주 일정" subtitle="실적 · 경제지표" size="lg" />
              <div className="sl-col" style={{ gap: 10 }}>
                {[
                  { day: '화', date: '12·16', title: '엔비디아 GTC 컨퍼런스', tag: '관심', tagColor: 'brand', impact: 3 },
                  { day: '수', date: '12·17', title: 'FOMC 금리결정', tag: '거시', tagColor: 'warn', impact: 3 },
                  { day: '목', date: '12·18', title: 'Micron 실적 발표', tag: '실적', tagColor: 'up', impact: 2 },
                  { day: '금', date: '12·19', title: '한국 11월 수출입 동향', tag: 'KR', tagColor: 'brand', impact: 2 },
                ].map((e, i) => (
                  <div key={i} className="sl-row" style={{ gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <div style={{ width: 44, textAlign: 'center', flex: '0 0 auto' }}>
                      <div className="sl-mono" style={{ fontSize: 11, color: 'var(--sl-muted)' }}>{e.day}</div>
                      <div className="sl-mono" style={{ fontSize: 13, fontWeight: 600 }}>{e.date}</div>
                    </div>
                    <div className="sl-grow">
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</div>
                      <div className="sl-row" style={{ gap: 6, marginTop: 4 }}>
                        <span className={`sl-tag sl-tag-${e.tagColor}`} style={{ fontSize: 10 }}>{e.tag}</span>
                        <span className="sl-caption">{'★'.repeat(e.impact)}{'☆'.repeat(3 - e.impact)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

function Heatmap() {
  const sectors = [
    { n: 'Tech', w: 30, c: 1.2 }, { n: 'Health', w: 14, c: -0.4 },
    { n: 'Fin', w: 14, c: 0.3 }, { n: 'Cons.D', w: 11, c: 0.8 },
    { n: 'Comm', w: 10, c: -0.6 }, { n: 'Indust', w: 9, c: 0.2 },
    { n: 'Cons.S', w: 6, c: 0.5 }, { n: 'Energy', w: 4, c: -1.8 },
    { n: 'Util', w: 2.5, c: 0.1 }, { n: 'RE', w: 2.5, c: -0.3 },
  ];
  const totalW = sectors.reduce((a, b) => a + b.w, 0);
  const colorOf = c => {
    if (c > 1.5) return 'var(--sl-up)';
    if (c > 0.5) return 'color-mix(in srgb, var(--sl-up) 70%, var(--sl-surface))';
    if (c > 0) return 'color-mix(in srgb, var(--sl-up) 35%, var(--sl-surface))';
    if (c > -0.5) return 'color-mix(in srgb, var(--sl-down) 35%, var(--sl-surface))';
    if (c > -1.5) return 'color-mix(in srgb, var(--sl-down) 70%, var(--sl-surface))';
    return 'var(--sl-down)';
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridAutoRows: 32, gap: 3 }}>
      {sectors.map((s, i) => {
        const cells = Math.max(2, Math.round((s.w / totalW) * 30));
        const col = Math.min(10, Math.max(2, Math.round(Math.sqrt(cells * 1.6))));
        const row = Math.ceil(cells / col);
        return (
          <div key={i} style={{
            gridColumn: `span ${Math.min(col, 6)}`, gridRow: `span ${Math.min(row, 4)}`,
            background: colorOf(s.c), color: '#fff', borderRadius: 4,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 6, fontSize: 11, fontWeight: 600,
          }}>
            <div>{s.n}</div>
            <div className="sl-mono" style={{ fontSize: 10, opacity: 0.95 }}>{s.c >= 0 ? '+' : ''}{s.c.toFixed(1)}%</div>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ color, label, value, up }) {
  return (
    <div className="sl-row" style={{ gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ fontSize: 12, color: 'var(--sl-muted)' }}>{label}</span>
      <span className="sl-mono" style={{ fontSize: 13, fontWeight: 600, color: up ? 'var(--sl-up)' : 'var(--sl-ink)' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { HomeDesign, Heatmap, Legend });
