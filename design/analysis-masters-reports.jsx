// Analysis Hub design — tools grid + preview rail (web-only)
function AnalysisDesign({ theme = 'light' }) {
  const tools = [
    { ic: '◐', name: '시장 지도', sub: '섹터·시총 가중 히트맵', tag: '인기' },
    { ic: '◉', name: '시장 심리', sub: '공포·탐욕 9개 지표', tag: '실시간' },
    { ic: '↗', name: '기술적 분석', sub: 'RSI·골든크로스·신호', tag: null },
    { ic: '$', name: '재무 비교', sub: 'PER·ROE 시장 전체', tag: null },
    { ic: '⚐', name: '섹터 로테이션', sub: '자금 이동 추적', tag: 'NEW' },
    { ic: '∿', name: '상관계수', sub: '종목간 상관 매트릭스', tag: null },
    { ic: '☷', name: '경제지표', sub: 'CPI·금리·실업률', tag: null },
    { ic: '⇆', name: '환율 추적', sub: 'USD/KRW·교차환율', tag: null },
  ];
  return (
    <SLPage theme={theme}>
      <SLAppBar active="analysis" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="sl-h1">분석</h1>
            <div className="sl-caption" style={{ marginTop: 6 }}>시장 전체를 보는 8가지 도구 · 갱신 14:32</div>
          </div>

          {/* Featured tool */}
          <div className="sl-card" style={{ padding: 28, marginBottom: 24, background: 'linear-gradient(135deg, var(--sl-brandSoft) 0%, var(--sl-surface) 60%)' }}>
            <div className="sl-row" style={{ gap: 24, alignItems: 'center' }}>
              <div style={{ flex: '1 1 auto' }}>
                <span className="sl-tag sl-tag-brand" style={{ marginBottom: 10 }}>오늘의 추천</span>
                <h2 className="sl-h2" style={{ marginTop: 8 }}>시장 심리 — 탐욕 영역 진입</h2>
                <p className="sl-sub" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
                  CNN F&G 62 → 어제보다 +5p. VIX는 14.2로 낮은 수준 유지. 외국인은 코스피에서 3일 연속 순매수.
                  과열 신호는 아직 약하지만 상승 베팅 비중을 늘리기 전 점검 필요.
                </p>
                <button className="sl-btn sl-btn-primary" style={{ marginTop: 14 }}>풀 분석 보기 →</button>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <Gauge value={62} label="탐욕" sublabel="CNN F&G" size={180} />
              </div>
            </div>
          </div>

          {/* Tools grid */}
          <SectionHeader title="분석 도구" subtitle="목적에 맞게 선택" size="lg" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {tools.map((t, i) => (
              <div key={i} className="sl-card" style={{ padding: 20, cursor: 'pointer', transition: 'all 180ms', position: 'relative' }}>
                {t.tag && (
                  <span className={`sl-tag ${t.tag === 'NEW' ? 'sl-tag-up' : 'sl-tag-brand'}`} style={{ position: 'absolute', top: 12, right: 12 }}>{t.tag}</span>
                )}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sl-surfaceAlt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--sl-brand)', marginBottom: 14 }}>{t.ic}</div>
                <h3 className="sl-h3">{t.name}</h3>
                <p className="sl-sub" style={{ marginTop: 4, fontSize: 13 }}>{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick previews */}
          <SectionHeader title="시장 한눈에" size="lg" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="섹터 등락" subtitle="S&P 500 · 오늘" />
              <div className="sl-col" style={{ gap: 8 }}>
                {[
                  { n: 'Technology', c: 1.84, v: 95 }, { n: 'Communication', c: 1.42, v: 85 },
                  { n: 'Consumer Disc.', c: 0.92, v: 65 }, { n: 'Industrials', c: 0.34, v: 45 },
                  { n: 'Financials', c: 0.18, v: 38 }, { n: 'Healthcare', c: -0.42, v: 50 },
                  { n: 'Real Estate', c: -0.68, v: 60 }, { n: 'Energy', c: -1.84, v: 92 },
                ].map(s => (
                  <div key={s.n} className="sl-row" style={{ gap: 12 }}>
                    <span style={{ flex: '0 0 130px', fontSize: 13 }}>{s.n}</span>
                    <div style={{ flex: '1 1 auto', height: 22, background: 'var(--sl-surfaceAlt)', borderRadius: 4, position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: s.c >= 0 ? '50%' : `${50 - s.v / 2}%`, top: 0, bottom: 0,
                        width: `${s.v / 2}%`, background: s.c >= 0 ? 'var(--sl-up)' : 'var(--sl-down)', borderRadius: 4,
                      }} />
                      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--sl-line)' }} />
                    </div>
                    <span className="sl-mono" style={{ flex: '0 0 60px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: s.c >= 0 ? 'var(--sl-up)' : 'var(--sl-down)' }}>{s.c >= 0 ? '+' : ''}{s.c.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="기술적 신호" subtitle="오늘 발생한 시그널" />
              <div className="sl-col" style={{ gap: 12 }}>
                {[
                  { tk: 'NVDA', sig: '골든크로스', dir: 'up', pct: 3.45, time: '09:48' },
                  { tk: 'AAPL', sig: 'RSI 과매수', dir: 'down', pct: 1.32, time: '10:24' },
                  { tk: '005930', sig: '52주 신고가', dir: 'up', pct: 0.81, time: '14:18' },
                  { tk: 'TSLA', sig: '데드크로스', dir: 'down', pct: -2.18, time: '11:02' },
                  { tk: 'META', sig: '거래량 폭증', dir: 'up', pct: 2.18, time: '13:30' },
                ].map((s, i) => (
                  <div key={i} className="sl-row" style={{ gap: 10, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <span className={`sl-tag ${s.dir === 'up' ? 'sl-tag-up' : 'sl-tag-down'}`} style={{ minWidth: 64, justifyContent: 'center' }}>{s.sig}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: '0 0 auto' }}>{s.tk}</span>
                    <span className="sl-grow" />
                    <ChangePill pct={s.pct} size="sm" />
                    <span className="sl-caption sl-mono">{s.time}</span>
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

// Masters — list + detail master-detail layout
function MastersDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="masters" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="sl-h1">고수 따라잡기</h1>
            <div className="sl-caption" style={{ marginTop: 6 }}>13F 공시 기반 · 매분기 자동 갱신 · 24명 추적</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
            {/* List */}
            <div className="sl-card" style={{ padding: 16 }}>
              <input className="sl-input" placeholder="이름 검색" style={{ width: '100%', marginBottom: 12 }} />
              <div className="sl-row" style={{ gap: 4, marginBottom: 12 }}>
                {['전체','가치','성장','매크로','퀀트'].map((t,i) => (
                  <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined} style={{ fontSize: 11, padding: '3px 10px' }}>{t}</span>
                ))}
              </div>
              <div className="sl-col" style={{ gap: 4 }}>
                {[
                  { n: 'Warren Buffett', f: 'Berkshire Hathaway', aum: '$285B', y: '+12.4%', sel: true, foll: true },
                  { n: 'Charlie Munger', f: 'Daily Journal', aum: '$430M', y: '+8.2%', foll: true },
                  { n: 'Howard Marks', f: 'Oaktree Capital', aum: '$192B', y: '+9.8%' },
                  { n: 'Ray Dalio', f: 'Bridgewater', aum: '$124B', y: '+6.4%' },
                  { n: 'Bill Ackman', f: 'Pershing Sq.', aum: '$18B', y: '+18.2%', foll: true },
                  { n: 'Michael Burry', f: 'Scion Asset', aum: '$190M', y: '+22.4%' },
                  { n: 'Stanley Druckenmiller', f: 'Duquesne', aum: '$5B', y: '+11.8%' },
                  { n: 'David Tepper', f: 'Appaloosa', aum: '$5.4B', y: '+14.2%' },
                ].map((m, i) => (
                  <div key={i} className="sl-row" style={{
                    gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                    background: m.sel ? 'var(--sl-brandSoft)' : 'transparent',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, var(--sl-cat${(i%8)+1}), var(--sl-cat${((i+3)%8)+1}))`, flex: '0 0 auto' }} />
                    <div className="sl-grow" style={{ minWidth: 0 }}>
                      <div className="sl-row" style={{ gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{m.n}</span>
                        {m.foll && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sl-brand)' }} />}
                      </div>
                      <div className="sl-caption" style={{ fontSize: 11 }}>{m.f}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="sl-mono sl-up" style={{ fontSize: 12, fontWeight: 600 }}>{m.y}</div>
                      <div className="sl-caption sl-mono" style={{ fontSize: 10 }}>{m.aum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="sl-col" style={{ gap: 20 }}>
              {/* Profile hero */}
              <div className="sl-card" style={{ padding: 24 }}>
                <div className="sl-row" style={{ gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sl-cat1), var(--sl-cat3))', flex: '0 0 auto' }} />
                  <div className="sl-grow">
                    <div className="sl-row" style={{ gap: 8 }}>
                      <h2 className="sl-h2">Warren Buffett</h2>
                      <span className="sl-tag sl-tag-brand">가치 투자</span>
                    </div>
                    <div className="sl-caption" style={{ marginTop: 4 }}>Berkshire Hathaway · CEO · 1965~</div>
                    <p style={{ fontSize: 13, color: 'var(--sl-inkSub)', marginTop: 12, lineHeight: 1.6 }}>
                      "오마하의 현인". 안전마진과 경제적 해자를 갖춘 우량 기업을 합리적 가격에 매수해 장기 보유. 코카콜라·아메리칸 익스프레스·애플 등 대표적인 장기 보유 종목.
                    </p>
                  </div>
                  <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                    <button className="sl-btn sl-btn-primary">팔로우 중 ✓</button>
                    <div className="sl-caption" style={{ marginTop: 8 }}>마지막 13F · 2025·11·14</div>
                  </div>
                </div>
                <div className="sl-rule" style={{ margin: '20px 0' }} />
                <div className="sl-row" style={{ gap: 32 }}>
                  {[
                    { l: 'AUM', v: '$285B' }, { l: '연평균 수익률', v: '+19.8%', up: true },
                    { l: 'YTD', v: '+12.4%', up: true }, { l: '보유 종목', v: '46개' },
                    { l: '집중도 (Top 5)', v: '78%' },
                  ].map(s => (
                    <div key={s.l}>
                      <div className="sl-label">{s.l}</div>
                      <div className="sl-num-md" style={{ marginTop: 4, color: s.up ? 'var(--sl-up)' : undefined }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top holdings + 13F changes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                <div className="sl-card" style={{ padding: 20 }}>
                  <SectionHeader title="포트폴리오 Top 10" subtitle="2025 Q3 · 13F 기준" />
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--sl-line)' }}>
                        {['#','종목','비중','평가액','변동'].map((h, i) => (
                          <th key={h} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '6px 8px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['AAPL', 22.4, '$63.8B', 0.0],
                        ['BAC',  9.8, '$27.9B', -1.2],
                        ['AXP',  8.4, '$23.9B', 0.0],
                        ['KO',   7.2, '$20.5B', 0.0],
                        ['CVX',  6.4, '$18.2B', 2.1],
                        ['OXY',  5.2, '$14.8B', 5.8],
                        ['KHC',  4.0, '$11.4B', 0.0],
                        ['MCO',  3.6, '$10.2B', 0.0],
                        ['DVA',  2.8, '$8.0B',  0.0],
                        ['VRSN', 2.4, '$6.8B',  0.0],
                      ].map((r, i) => (
                        <tr key={i} style={{ borderBottom: i < 9 ? '1px solid var(--sl-hairline)' : 'none' }}>
                          <td style={{ padding: '10px 8px', color: 'var(--sl-muted)', fontFamily: 'var(--sl-font-mono)' }}>{i+1}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r[0]}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <div className="sl-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                              <div style={{ width: 40, height: 6, background: 'var(--sl-surfaceAlt)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${(r[1]/22.4)*100}%`, height: '100%', background: 'var(--sl-brand)' }} />
                              </div>
                              <span className="sl-num-sm" style={{ minWidth: 40 }}>{r[1].toFixed(1)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}><span className="sl-num-sm">{r[2]}</span></td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            {r[3] === 0 ? <span className="sl-caption">—</span> : <ChangePill pct={r[3]} size="sm" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sl-card" style={{ padding: 20 }}>
                  <SectionHeader title="이번 분기 주요 변동" subtitle="13F · Q2 → Q3" />
                  <div className="sl-col" style={{ gap: 14 }}>
                    {[
                      { tag: '신규', tk: 'DPZ', name: 'Domino\'s Pizza', amt: '+$549M', dir: 'up' },
                      { tag: '확대', tk: 'OXY', name: 'Occidental Petroleum', amt: '+$405M', dir: 'up' },
                      { tag: '축소', tk: 'BAC', name: 'Bank of America', amt: '-$8.2B', dir: 'down' },
                      { tag: '청산', tk: 'PARA', name: 'Paramount Global', amt: '-$540M', dir: 'down' },
                    ].map((c, i) => (
                      <div key={i} style={{ paddingBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
                        <div className="sl-row" style={{ gap: 8, marginBottom: 4 }}>
                          <span className={`sl-tag ${c.dir === 'up' ? 'sl-tag-up' : 'sl-tag-down'}`}>{c.tag}</span>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{c.tk}</span>
                          <span className="sl-grow" />
                          <span className={`sl-mono ${c.dir === 'up' ? 'sl-up' : 'sl-down'}`} style={{ fontSize: 13, fontWeight: 600 }}>{c.amt}</span>
                        </div>
                        <div className="sl-caption">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investment philosophy */}
              <div className="sl-card" style={{ padding: 24 }}>
                <SectionHeader title="투자 철학 · 핵심 원칙" size="lg" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { t: '경제적 해자', d: '경쟁 우위가 지속 가능한 기업 — 브랜드·전환비용·네트워크 효과·원가우위 중 최소 1개를 강하게 보유.' },
                    { t: '안전마진', d: '내재가치보다 충분히 낮은 가격에서만 매수. 시장이 흔들릴 때 손실을 흡수하는 완충장치.' },
                    { t: '장기 보유', d: '"우리가 좋아하는 보유 기간은 영원이다." 단기 시세보다 사업의 장기 본질에 집중.' },
                  ].map(p => (
                    <div key={p.t} className="sl-card-soft" style={{ padding: 16 }}>
                      <h3 className="sl-h3" style={{ color: 'var(--sl-brand)' }}>{p.t}</h3>
                      <p style={{ fontSize: 13, color: 'var(--sl-inkSub)', marginTop: 8, lineHeight: 1.6 }}>{p.d}</p>
                    </div>
                  ))}
                </div>
                <button className="sl-btn sl-btn-secondary" style={{ marginTop: 16 }}>전체 글 4편 읽기 →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// Reports — wiki-style library + AI summary cards
function ReportsDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="reports" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h1 className="sl-h1">리포트</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>30+ 소스 자동 수집 · Gemini AI 요약 · 오늘 신규 12편</div>
            </div>
            <div className="sl-row" style={{ gap: 8 }}>
              <input className="sl-input" placeholder="제목·종목·키워드 검색" style={{ width: 280 }} />
              <button className="sl-btn sl-btn-secondary">필터 ⌄</button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="sl-row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              ['전체', true],['미국 IB', false],['한국 증권사', false],['거시', false],['섹터', false],
              ['종목 분석', false],['ETF', false],['오늘', false],['이번 주', false],['이번 달', false],
            ].map(([l, a], i) => (
              <span key={i} className="sl-pill" data-active={a ? 'true' : undefined}>{l}</span>
            ))}
          </div>

          {/* Featured */}
          <SectionHeader title="오늘의 추천 리포트" size="lg" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
            {/* Hero card */}
            <div className="sl-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, background: 'linear-gradient(135deg, var(--sl-brand), var(--sl-cat4))', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
                <span className="sl-tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>거시 · 미국</span>
              </div>
              <div style={{ padding: 20, flex: 1 }}>
                <div className="sl-caption" style={{ marginBottom: 8 }}>Goldman Sachs · 2025·12·15 · 32페이지</div>
                <h2 className="sl-h2" style={{ marginBottom: 10 }}>2026 미국 경제 전망 — Soft Landing은 끝났다</h2>
                <div className="sl-card-soft" style={{ padding: 14, marginBottom: 12 }}>
                  <div className="sl-row" style={{ gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 12 }}>✨</span>
                    <span className="sl-label" style={{ fontSize: 11 }}>AI 요약</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--sl-inkSub)', margin: 0, lineHeight: 1.6 }}>
                    GS는 2026년 미국 GDP 2.4% 성장 전망. 연준은 12월 25bp 인하 후 H2까지 50bp 추가. 노동시장 견조, 인플레는 2.3%로 안정. 위험 시나리오는 관세 인상 가능성.
                  </p>
                </div>
                <div className="sl-row" style={{ gap: 6 }}>
                  {['SPY','QQQ','TLT','DXY'].map(t => <span key={t} className="sl-tag sl-mono">{t}</span>)}
                </div>
              </div>
            </div>

            {/* Side cards */}
            {[
              { src: 'Morgan Stanley', tag: '섹터 · 반도체', tagColor: 'brand', title: 'AI 반도체 사이클 2026 전망', sum: 'NVDA 목표가 1,200달러 상향. HBM4 채택 확대로 메모리 사이클 H2 가속. 한국 메모리 3사 모두 매수.', tickers: ['NVDA','005930','000660','TSM'], color: 'var(--sl-cat2)' },
              { src: '한투증권', tag: '종목 · 한국', tagColor: 'up', title: '삼성전자 — HBM4 양산 6개월 단축', sum: 'AVP 사업부 분리 후 HBM4 양산 시점 6M 단축. 26년 영업이익 +28% 추정. TP 110,000원 (현재 +48%).', tickers: ['005930'], color: 'var(--sl-cat3)' },
            ].map((r, i) => (
              <div key={i} className="sl-card" style={{ padding: 20 }}>
                <div className="sl-row" style={{ gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: r.color, opacity: 0.15 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.src}</div>
                    <div className="sl-caption">2025·12·15</div>
                  </div>
                </div>
                <span className={`sl-tag sl-tag-${r.tagColor}`} style={{ marginBottom: 8 }}>{r.tag}</span>
                <h3 className="sl-h3" style={{ marginTop: 8, marginBottom: 12 }}>{r.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--sl-inkSub)', lineHeight: 1.55, marginBottom: 12 }}>{r.sum}</p>
                <div className="sl-row" style={{ gap: 4, flexWrap: 'wrap' }}>
                  {r.tickers.map(t => <span key={t} className="sl-tag sl-mono" style={{ fontSize: 10 }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* List */}
          <SectionHeader title="최신 리포트" subtitle="143편" size="lg" />
          <div className="sl-card">
            {[
              { src: 'JP Morgan', cat: '거시', cc: 'brand', date: '오늘 14:20', title: '2026 글로벌 자산배분 — Equity Overweight 유지', sum: '주식 비중 65% (+5%p), 채권 25% (-3%p), 대체 10%. 미국·일본 OW, 유럽 N, 신흥국 UW.', pages: 28, tickers: ['SPY','EFA','EEM'] },
              { src: '대신증권', cat: '종목 · KR', cc: 'up', date: '오늘 11:42', title: 'SK하이닉스 — Q4 가이던스 어닝 서프라이즈 가능성', sum: 'HBM3E 12단 출하 가속. 4Q OP 11.2조원 추정 (컨센 9.8조). TP 220,000원 유지.', pages: 18, tickers: ['000660'] },
              { src: 'Bank of America', cat: 'ETF', cc: 'brand', date: '오늘 09:15', title: 'AI 인프라 ETF Top Picks — 2026', sum: 'IGV·SOXX·BOTZ·AIQ·QQQ 순. AI 인프라 CapEx 26년 +35% 예상.', pages: 22, tickers: ['IGV','SOXX','AIQ'] },
              { src: 'Citi', cat: '거시', cc: 'brand', date: '어제 22:08', title: 'FOMC 12월 미리보기 — 25bp 인하 컨센서스', sum: '점도표는 26년 50bp 인하 시사 가능. SEP 발표 주목. DXY 105 하방 압력.', pages: 14, tickers: ['DXY','TLT','GLD'] },
              { src: '미래에셋', cat: '섹터 · KR', cc: 'up', date: '어제 16:30', title: '2차전지 — 바닥 신호 점검', sum: 'LG엔솔·삼성SDI·POSCO퓨처엠 모두 PBR 1배 하회. 26년 H2 회복 가능. 종목별 차별화.', pages: 24, tickers: ['373220','006400','003670'] },
            ].map((r, i) => (
              <div key={i} className="sl-row" style={{ gap: 16, padding: '16px 20px', borderBottom: i < 4 ? '1px solid var(--sl-hairline)' : 'none', cursor: 'pointer' }}>
                <div style={{ flex: '0 0 100px' }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{r.src}</div>
                  <span className={`sl-tag sl-tag-${r.cc}`} style={{ marginTop: 6 }}>{r.cat}</span>
                </div>
                <div className="sl-grow" style={{ minWidth: 0 }}>
                  <h3 className="sl-h3" style={{ marginBottom: 6 }}>{r.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--sl-inkSub)', lineHeight: 1.55, margin: 0, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--sl-brand)', fontWeight: 600 }}>✨ AI 요약 · </span>
                    {r.sum}
                  </p>
                  <div className="sl-row" style={{ gap: 4 }}>
                    {r.tickers.map(t => <span key={t} className="sl-tag sl-mono" style={{ fontSize: 10 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                  <div className="sl-caption">{r.date}</div>
                  <div className="sl-caption sl-mono" style={{ marginTop: 4 }}>{r.pages}p</div>
                </div>
                <span style={{ color: 'var(--sl-muted)', fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SLPage>
  );
}

Object.assign(window, { AnalysisDesign, MastersDesign, ReportsDesign });
