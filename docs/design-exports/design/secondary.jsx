// Secondary screens · 종목 검색 (Screener) / 시장 지도 (Heatmap) / 리포트 상세 (ReportDetail)

// ─────────────────────────────────────────────────────────────
// Screener · factor filter + result table
// ─────────────────────────────────────────────────────────────
function ScreenerDesign({ theme = 'light' }) {
  const filters = [
    ['시가총액', '$1B', '$500B', 15, 80],
    ['PER', '0', '20', 0, 60],
    ['PBR', '0', '3', 0, 80],
    ['ROE (%)', '12', '50', 60, 95],
    ['부채비율 (%)', '0', '70', 0, 70],
    ['배당수익률 (%)', '0', '10', 0, 100],
    ['6M 수익률 (%)', '−20', '100', 30, 95],
  ];
  const rows = [
    ['META', 'Meta Platforms', '484.10', '+1.2%', '24.1', '7.2', '32.4', 84, 92, 88, true],
    ['GOOGL', 'Alphabet', '171.40', '+0.8%', '22.8', '6.4', '28.1', 76, 90, 83, true],
    ['BRK.B', 'Berkshire Hathaway', '420.10', '+0.4%', '14.2', '1.6', '12.4', 52, 88, 70, true],
    ['ASML', 'ASML Holding', '912.40', '−0.6%', '34.2', '14.8', '52.1', 71, 95, 82, false],
    ['AVGO', 'Broadcom', '1480.20', '+2.1%', '38.4', '12.1', '42.8', 88, 90, 89, true],
    ['LLY', 'Eli Lilly', '824.10', '+1.6%', '78.2', '52.4', '54.8', 92, 84, 88, true],
    ['005930', '삼성전자', '78,400', '+0.5%', '12.4', '1.4', '11.2', 48, 76, 62, true],
    ['000660', 'SK하이닉스', '198,500', '−1.2%', '8.2', '1.8', '24.2', 72, 78, 75, false],
  ];

  return (
    <SLPage theme={theme}>
      <SLAppBar active="screener" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <h1 className="sl-h1">종목 검색</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>팩터 필터로 종목 발굴 · KR + US 통합 · 8,400개 종목</div>
            </div>
            <div className="sl-row" style={{ gap: 8 }}>
              <button className="sl-btn sl-btn-ghost">불러오기</button>
              <button className="sl-btn sl-btn-secondary">스크린 저장</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
            {/* Filters */}
            <div className="sl-card" style={{ padding: 20, alignSelf: 'flex-start' }}>
              <SectionHeader title="필터" subtitle="148개 종목 매치" />
              <div className="sl-col" style={{ gap: 18 }}>
                <div>
                  <div className="sl-label" style={{ marginBottom: 8 }}>시장</div>
                  <div className="sl-row" style={{ gap: 4, flexWrap: 'wrap' }}>
                    {['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'].map((m, i) => (
                      <span key={m} className="sl-pill" data-active={i < 2 ? 'true' : undefined} style={{ fontSize: 11 }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="sl-label" style={{ marginBottom: 8 }}>섹터</div>
                  <div className="sl-input" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <span style={{ color: 'var(--sl-muted)' }}>전체 (선택)</span>
                    <span style={{ color: 'var(--sl-muted)', fontSize: 10 }}>⌄</span>
                  </div>
                </div>
                {filters.map((f, i) => (
                  <div key={i}>
                    <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="sl-label" style={{ textTransform: 'none', color: 'var(--sl-ink)', fontWeight: 500 }}>{f[0]}</span>
                      <span className="sl-mono sl-caption">{f[1]} – {f[2]}</span>
                    </div>
                    <div style={{ position: 'relative', height: 6, background: 'var(--sl-surfaceAlt)', borderRadius: 3 }}>
                      <div style={{
                        position: 'absolute',
                        left: `${f[3]}%`, right: `${100 - f[4]}%`,
                        top: 0, bottom: 0, background: 'var(--sl-brand)', borderRadius: 3,
                      }} />
                      <div style={{
                        position: 'absolute', left: `${f[3]}%`, top: -4,
                        width: 14, height: 14, background: 'var(--sl-surface)',
                        border: '2px solid var(--sl-brand)', borderRadius: 7, transform: 'translateX(-50%)',
                      }} />
                      <div style={{
                        position: 'absolute', left: `${f[4]}%`, top: -4,
                        width: 14, height: 14, background: 'var(--sl-surface)',
                        border: '2px solid var(--sl-brand)', borderRadius: 7, transform: 'translateX(-50%)',
                      }} />
                    </div>
                  </div>
                ))}
                <div>
                  <div className="sl-label" style={{ marginBottom: 8 }}>퀀트 팩터</div>
                  <div className="sl-col" style={{ gap: 8 }}>
                    {[['모멘텀 상위 30%', true], ['퀄리티 상위 30%', true], ['저변동성', false], ['배당 그로스', false]].map(([p, on], i) => (
                      <div key={p} className="sl-row" style={{ gap: 8, fontSize: 13 }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: `1.5px solid ${on ? 'var(--sl-brand)' : 'var(--sl-line)'}`,
                          background: on ? 'var(--sl-brand)' : 'transparent',
                          color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{on ? '✓' : ''}</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="sl-btn sl-btn-primary" style={{ width: '100%' }}>필터 적용 (148)</button>
              </div>
            </div>

            {/* Results */}
            <div className="sl-card" style={{ padding: 20 }}>
              <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <SectionHeader title="결과" subtitle="148개 종목 · 종합 점수 순" />
                <div className="sl-row" style={{ gap: 4 }}>
                  <span className="sl-pill">표</span>
                  <span className="sl-pill" data-active="true">히트맵</span>
                  <span className="sl-pill">차트</span>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
                    {['', '종목', '현재가', '1D', 'PER', 'PBR', 'ROE', '모멘텀', '퀄리티', '점수'].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i < 2 ? 'left' : 'right', padding: '10px 8px',
                        fontSize: 10, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                        width: i === 0 ? 30 : i === 1 ? 'auto' : 'auto',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)', cursor: 'pointer' }}>
                      <td style={{ padding: '12px 8px', fontSize: 13, color: 'var(--sl-muted)' }}>★</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div className="sl-mono" style={{ fontWeight: 700, fontSize: 13 }}>{r[0]}</div>
                        <div className="sl-caption" style={{ fontSize: 11 }}>{r[1]}</div>
                      </td>
                      <td className="sl-mono" style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{r[2]}</td>
                      <td className="sl-mono" style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, color: r[10] ? 'var(--sl-up)' : 'var(--sl-down)' }}>{r[3]}</td>
                      <td className="sl-mono" style={{ padding: '12px 8px', textAlign: 'right' }}>{r[4]}</td>
                      <td className="sl-mono" style={{ padding: '12px 8px', textAlign: 'right' }}>{r[5]}</td>
                      <td className="sl-mono" style={{ padding: '12px 8px', textAlign: 'right' }}>{r[6]}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div className="sl-row" style={{ justifyContent: 'flex-end', gap: 4, alignItems: 'center' }}>
                          <div style={{ width: 28, height: 5, background: 'var(--sl-surfaceAlt)', borderRadius: 2 }}>
                            <div style={{ width: `${r[7]}%`, height: '100%', background: 'var(--sl-brand)', borderRadius: 2 }} />
                          </div>
                          <span className="sl-mono" style={{ fontSize: 11, fontWeight: 600, minWidth: 24 }}>{r[7]}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div className="sl-row" style={{ justifyContent: 'flex-end', gap: 4, alignItems: 'center' }}>
                          <div style={{ width: 28, height: 5, background: 'var(--sl-surfaceAlt)', borderRadius: 2 }}>
                            <div style={{ width: `${r[8]}%`, height: '100%', background: 'var(--sl-up)', borderRadius: 2 }} />
                          </div>
                          <span className="sl-mono" style={{ fontSize: 11, fontWeight: 600, minWidth: 24 }}>{r[8]}</span>
                        </div>
                      </td>
                      <td className="sl-mono" style={{
                        padding: '12px 8px', textAlign: 'right',
                        fontWeight: 700, fontSize: 13,
                        color: r[9] >= 80 ? 'var(--sl-up)' : 'var(--sl-ink)',
                      }}>{r[9]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="sl-row" style={{ justifyContent: 'center', gap: 4, marginTop: 16 }}>
                {['‹', '1', '2', '3', '4', '…', '19', '›'].map((p, i) => (
                  <span key={i} style={{
                    padding: '6px 12px', fontSize: 12, fontWeight: 600,
                    color: i === 1 ? '#fff' : 'var(--sl-inkSub)',
                    background: i === 1 ? 'var(--sl-brand)' : 'transparent',
                    borderRadius: 6, cursor: 'pointer',
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Heatmap · Finviz-style treemap
// ─────────────────────────────────────────────────────────────
function HeatmapDesign({ theme = 'light' }) {
  const sectors = [
    { n: 'IT', cols: 6, rows: 4, stocks: [
      ['AAPL', 18, 1.2], ['MSFT', 16, 0.8], ['NVDA', 14, 3.4], ['GOOGL', 9, 0.4],
      ['META', 7, 1.6], ['AVGO', 5, 2.1], ['ORCL', 3, -0.4], ['CRM', 3, 0.2],
    ]},
    { n: '금융', cols: 4, rows: 3, stocks: [
      ['BRK.B', 12, 0.4], ['JPM', 8, -0.2], ['V', 6, 0.8], ['MA', 5, 0.6], ['BAC', 4, -1.1],
    ]},
    { n: '헬스', cols: 4, rows: 3, stocks: [
      ['LLY', 10, 1.6], ['UNH', 7, -0.8], ['JNJ', 5, 0.0], ['ABBV', 4, 0.4], ['MRK', 4, -1.2],
    ]},
    { n: '소비순환', cols: 3, rows: 3, stocks: [
      ['AMZN', 12, 0.6], ['TSLA', 6, -2.1], ['HD', 4, 0.4],
    ]},
    { n: '에너지', cols: 3, rows: 2, stocks: [['XOM', 6, 1.2], ['CVX', 4, -0.8], ['COP', 3, 0.4]]},
    { n: '통신', cols: 3, rows: 2, stocks: [['NFLX', 5, 0.8], ['DIS', 3, -1.4], ['T', 2, -0.2]]},
  ];
  const colorFor = (v) => {
    const i = Math.min(0.85, Math.abs(v) * 0.22 + 0.15);
    if (v >= 0) return `rgba(15, 166, 122, ${i})`;
    return `rgba(232, 69, 74, ${i})`;
  };

  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <div className="sl-caption" style={{ marginBottom: 4 }}>분석 / 시장 지도</div>
              <h1 className="sl-h1">시장 히트맵</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>시총 가중 트리맵 · 셀 크기 = 시총, 색 = 일간 등락률</div>
            </div>
            <div className="sl-row" style={{ gap: 8 }}>
              <span className="sl-pill" data-active="true">S&P 500</span>
              <span className="sl-pill">NASDAQ 100</span>
              <span className="sl-pill">KOSPI 200</span>
              <div style={{ width: 1, height: 22, background: 'var(--sl-line)', margin: '0 6px', alignSelf: 'center' }} />
              <span className="sl-pill" data-active="true">1D</span>
              <span className="sl-pill">1W</span>
              <span className="sl-pill">1M</span>
              <span className="sl-pill">YTD</span>
            </div>
          </div>

          <div className="sl-card" style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: 80, gap: 4 }}>
              {sectors.map(sec => (
                <div key={sec.n} style={{
                  gridColumn: `span ${sec.cols}`, gridRow: `span ${sec.rows}`,
                  border: '1px solid var(--sl-line)', borderRadius: 6, position: 'relative',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                  <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, borderBottom: '1px solid var(--sl-line)', background: 'var(--sl-surface)' }}>
                    {sec.n}
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, padding: 2 }}>
                    {sec.stocks.map(s => (
                      <div key={s[0]} style={{
                        gridColumn: `span ${Math.max(1, Math.round(s[1] / 3))}`,
                        background: colorFor(s[2]),
                        borderRadius: 3,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        fontSize: 11, color: 'var(--sl-ink)', padding: 4, overflow: 'hidden',
                      }}>
                        <div className="sl-mono" style={{ fontWeight: 800, fontSize: 13 }}>{s[0]}</div>
                        <div className="sl-mono" style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>{s[2] >= 0 ? '+' : ''}{s[2].toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sl-row" style={{ justifyContent: 'center', marginTop: 14, gap: 4, alignItems: 'center' }}>
              <span className="sl-mono" style={{ fontSize: 11, color: 'var(--sl-down)', fontWeight: 600 }}>−5%</span>
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(v => (
                <div key={v} style={{ width: 32, height: 14, background: colorFor(v), borderRadius: 3 }} />
              ))}
              <span className="sl-mono" style={{ fontSize: 11, color: 'var(--sl-up)', fontWeight: 600 }}>+5%</span>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Report Detail · Docling + Gemini AI summary
// ─────────────────────────────────────────────────────────────
function ReportDetailDesign({ theme = 'light' }) {
  const toc = [
    ['I. 총평', 4, true],
    ['II. 물가', 12, false],
    ['  · 소비자물가', 14, false],
    ['  · 근원물가', 22, false],
    ['III. 가계부채', 38, false],
    ['IV. 부동산 시장', 56, false],
    ['V. 대외 환경', 78, false],
    ['VI. 향후 전망', 102, false],
    ['VII. 부록 · 통계', 118, false],
  ];

  return (
    <SLPage theme={theme}>
      <SLAppBar active="reports" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1480, margin: '0 auto', padding: '20px 32px 60px' }}>
          <div className="sl-caption" style={{ marginBottom: 12 }}>리포트 / 거시 / 한국은행 통화신용정책보고서 2025.09</div>

          <div className="sl-card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="sl-row" style={{ gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                width: 100, height: 132, background: 'linear-gradient(135deg, var(--sl-cat1), var(--sl-cat4))',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '0.05em', textAlign: 'center', padding: 12, lineHeight: 1.4,
              }}>한국은행<br />통화정책<br />보고서</div>
              <div className="sl-grow">
                <div className="sl-row" style={{ gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="sl-tag sl-tag-up">🇰🇷 KR</span>
                  <span className="sl-tag">거시</span>
                  <span className="sl-tag">통화신용정책</span>
                  <span className="sl-tag sl-tag-brand">✨ AI 요약 완료</span>
                </div>
                <h1 className="sl-h1">2025년 9월 통화신용정책보고서</h1>
                <div className="sl-caption" style={{ marginTop: 6, fontSize: 13 }}>
                  한국은행 · 통화정책국 · 2025.09.26 발간 · 124페이지 · 한국어
                </div>
                <div className="sl-row" style={{ gap: 10, marginTop: 16 }}>
                  <button className="sl-btn sl-btn-secondary">★ 북마크</button>
                  <button className="sl-btn sl-btn-secondary">원문 PDF 열기 ↗</button>
                  <button className="sl-btn sl-btn-secondary">메모 추가</button>
                  <span className="sl-grow" />
                  <span className="sl-caption" style={{ alignSelf: 'center' }}>조회 1,247회 · 북마크 89</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI summary */}
          <div className="sl-card" style={{ padding: 24, marginBottom: 16, background: 'linear-gradient(135deg, var(--sl-brandSoft) 0%, var(--sl-surface) 100%)', borderLeft: '4px solid var(--sl-brand)' }}>
            <div className="sl-row" style={{ gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <h2 className="sl-h2">AI 요약</h2>
              <span className="sl-caption">· Gemini 1.5 Flash</span>
              <span className="sl-grow" />
              <span className="sl-caption">1,238 토큰 · 처리 4.2초</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--sl-ink)', marginBottom: 16 }}>
              한국 경제는 물가 안정세가 이어지는 가운데 가계부채 증가세도 점진적으로 둔화되고 있다. 소비자물가 상승률은 2% 내외로 안정적이며, 가계부채 증가율은 분기 대비 0.4%p 하락했다. 대외적으로는 미국 연준의 금리 인하 사이클이 시작되며 원/달러 환율 압력이 완화될 전망이다. 한국은행은 현재 기준금리(3.25%)를 동결할 가능성이 높으며, 향후 인하 시점은 2026년 상반기로 예상된다.
            </p>
            <div className="sl-label" style={{ marginBottom: 8 }}>핵심 포인트</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--sl-inkSub)' }}>
              <li>소비자물가 상승률 2.0% — 목표치 부합</li>
              <li>가계부채 증가율 둔화 (전기 +1.2% → +0.8%)</li>
              <li>주택가격 안정세 진입, 일부 수도권은 여전히 상승</li>
              <li>대외 경상수지 흑자 지속, 외환보유액 4,200억 달러</li>
              <li>기준금리 동결 시사, 인하는 빨라야 2026 H1</li>
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: 20 }}>
            {/* TOC */}
            <div className="sl-card" style={{ padding: 18, alignSelf: 'flex-start', position: 'sticky', top: 20 }}>
              <SectionHeader title="목차" />
              <div className="sl-col" style={{ gap: 2 }}>
                {toc.map(([t, p, active], i) => (
                  <div key={i} className="sl-row" style={{
                    gap: 8, padding: '6px 10px', borderRadius: 6,
                    background: active ? 'var(--sl-brandSoft)' : 'transparent',
                    borderLeft: active ? '3px solid var(--sl-brand)' : '3px solid transparent',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    color: active ? 'var(--sl-brandInk)' : 'var(--sl-inkSub)',
                    cursor: 'pointer',
                  }}>
                    <span className="sl-grow">{t}</span>
                    <span className="sl-mono sl-caption" style={{ fontSize: 11 }}>{p}p</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="sl-card" style={{ padding: 28 }}>
              <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                <SectionHeader title="본문" subtitle="Docling 추출 · 마크다운 렌더" />
                <div className="sl-row" style={{ gap: 4 }}>
                  <span className="sl-pill">한글 원본</span>
                  <span className="sl-pill" data-active="true">읽기 모드</span>
                  <span className="sl-pill">원본 PDF</span>
                </div>
              </div>

              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--sl-ink)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.015em' }}>I. 총평</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--sl-inkSub)' }}>
                  2025년 9월 현재 한국 경제는 물가 안정세가 이어지는 가운데 가계부채 증가세도 점진적으로 둔화되고 있다. 다만 일부 수도권 부동산 시장에서는 여전히 가격 상승 압력이 남아 있으며, 대외적으로는 미국 연준의 금리 정책 변화가 향후 통화정책 운용에 중요한 변수로 작용할 전망이다.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '28px 0 14px', letterSpacing: '-0.015em' }}>II. 물가</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--sl-inkSub)' }}>
                  소비자물가 상승률은 2025년 8월 기준 전년 동월 대비 2.0%로 한국은행의 물가 안정 목표(2%)에 부합하는 수준을 유지하고 있다. 이는 국제 유가 안정과 식료품 가격 하락에 힘입은 결과로 분석된다.
                </p>

                <div className="sl-caption" style={{ marginBottom: 6, marginTop: 12 }}>표 1. 주요 물가 지표 (전년동월비, %)</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16, border: '1px solid var(--sl-line)', borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600 }}>구분</th>
                      {['2024.12', '2025.06', '2025.08'].map(d => (
                        <th key={d} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600 }}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[['소비자물가', 2.4, 2.1, 2.0], ['근원물가', 2.0, 1.9, 1.8], ['생활물가', 3.1, 2.4, 2.2], ['신선식품', 8.2, 3.4, 2.8]].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--sl-hairline)' }}>
                        <td style={{ padding: '10px 12px' }}>{r[0]}</td>
                        {r.slice(1).map((v, j) => (
                          <td key={j} className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ margin: '0 0 16px', color: 'var(--sl-inkSub)' }}>
                  근원물가도 1.8%로 안정세를 유지하고 있어 인플레이션 압력은 전반적으로 제어되고 있는 것으로 판단된다.
                </p>

                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '28px 0 14px', letterSpacing: '-0.015em' }}>III. 가계부채</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--sl-inkSub)' }}>
                  가계부채 증가율은 2분기 대비 0.4%p 하락한 0.8%를 기록했다. 정부의 DSR 규제 강화와 금리 인상 누적 효과가 점진적으로 나타나고 있는 것으로 평가된다…
                </p>

                <div className="sl-caption" style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--sl-hairline)', textAlign: 'center' }}>
                  ⋯ (이하 110페이지) — 마크다운으로 변환된 전체 본문
                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="sl-col" style={{ gap: 16 }}>
              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="관련 종목" subtitle="AI 자동 태깅" />
                <div className="sl-col" style={{ gap: 0 }}>
                  {[['005930', '삼성전자'], ['055550', '신한지주'], ['086790', '하나금융지주'], ['034730', 'SK']].map((t, i) => (
                    <div key={i} className="sl-row" style={{ gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
                      <span className="sl-mono" style={{ width: 60, fontWeight: 700, fontSize: 12 }}>{t[0]}</span>
                      <span className="sl-grow" style={{ fontSize: 13 }}>{t[1]}</span>
                      <span style={{ color: 'var(--sl-muted)', fontSize: 14 }}>★</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="태그" />
                <div className="sl-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {['금리', '부동산', '가계부채', '물가', '연준', '환율', 'DSR'].map(t => (
                    <span key={t} className="sl-tag">#{t}</span>
                  ))}
                </div>
              </div>

              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="관련 리포트" />
                <div className="sl-col" style={{ gap: 0 }}>
                  {[['KDI · 경제전망 25H2', '2025.11.05'], ['BOK이슈노트 · 가계부채', '2025.10.18'], ['IMF · WEO Oct 2025', '2025.10.15']].map((r, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--sl-hairline)' : 'none', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r[0]}</div>
                      <div className="sl-caption sl-mono" style={{ fontSize: 11, marginTop: 2 }}>{r[1]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="내 메모" />
                <div style={{ minHeight: 100, padding: 12, border: '1px dashed var(--sl-line)', borderRadius: 8, fontSize: 12, color: 'var(--sl-faint)', fontStyle: 'italic' }}>
                  메모 작성 — 인용·하이라이트·내 생각 기록
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

Object.assign(window, { ScreenerDesign, HeatmapDesign, ReportDetailDesign });
