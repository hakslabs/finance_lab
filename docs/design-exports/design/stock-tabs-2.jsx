// Stock Detail · Tab 4 적정가치 / Tab 5 공시·실적 / Tab 6 뉴스
// 같은 SLStockHeader / StockShell 재사용 (stock-tabs.jsx 에서 정의)

// ─────────────────────────────────────────────────────────────
// Tab 4 — 적정가치
// ─────────────────────────────────────────────────────────────
function StockValueDesign({ theme = 'light' }) {
  const peers = [
    ['NVDA · NVIDIA', '$3.65T', '55.4', '42.1', '91.5', '+126%', '54.1%', true],
    ['AMD · Advanced Micro', '$214B', '168.0', '4.2', '2.4', '+18%', '6.8%', false],
    ['TSM · Taiwan Semi', '$840B', '28.4', '6.8', '27.0', '+34%', '42.0%', false],
    ['AVGO · Broadcom', '$780B', '162.0', '12.4', '7.8', '+44%', '46.8%', false],
    ['INTC · Intel', '$92B', '—', '0.9', '—', '−4%', '−18%', false],
    ['업계 중간값', '—', '32.0', '5.4', '14.2', '+24%', '22.4%', null],
  ];
  const valuations = [
    ['DCF (5Y FCF 할인)', '$152.40', '+2.8%', 'up'],
    ['PER 멀티플 (52배 적용)', '$162.80', '+9.9%', 'up'],
    ['EV/EBITDA (업계 평균)', '$78.40', '−47.1%', 'down'],
    ['평균 (가중)', '$148.30', '+0.1%', 'muted'],
  ];

  return (
    <StockShell theme={theme} active="적정가치">
      {/* Hero metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['PER', '55.4', '업계 32 · 5Y 평균 48', 'down'],
          ['PBR', '42.1', '업계 8.4', 'down'],
          ['EV/EBITDA', '51.2', '업계 24', 'down'],
          ['배당수익률', '0.03%', '업계 1.8%', 'muted'],
        ].map(([l, v, d, c], i) => (
          <div key={i} className="sl-card" style={{ padding: 18 }}>
            <div className="sl-label">{l}</div>
            <div className="sl-num-lg" style={{ marginTop: 6, color: c === 'down' ? 'var(--sl-down)' : c === 'up' ? 'var(--sl-up)' : 'var(--sl-ink)' }}>{v}</div>
            <div className="sl-caption" style={{ marginTop: 6 }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="PER · PBR 5년 추이" subtitle="현재 PER 55배 · 5년 평균 48배 · 평균 대비 +14%" />
          <AreaChart2 seed="per-pbr" width={680} height={200} color="var(--sl-brand)" fillOpacity={0.12} />
          <div className="sl-row" style={{ gap: 16, marginTop: 12, fontSize: 12 }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-brand)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />PER</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-cat4)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />PBR</span>
            <span className="sl-grow" />
            <span className="sl-caption">업계 평균 대비 영역 표시</span>
          </div>
        </div>

        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="적정주가 추정" subtitle="3가지 방법론" />
          <div className="sl-col" style={{ gap: 0 }}>
            {valuations.map(([l, v, d, c], i) => (
              <div key={i} className="sl-row" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--sl-inkSub)', fontWeight: i === 3 ? 600 : 400 }}>{l}</span>
                <div className="sl-row" style={{ gap: 10 }}>
                  <span className="sl-mono" style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
                  <span className="sl-mono" style={{
                    fontSize: 12, fontWeight: 600,
                    color: c === 'up' ? 'var(--sl-up)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                  }}>{d}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="sl-btn sl-btn-secondary" style={{ marginTop: 14, width: '100%' }}>DCF 가정 직접 조정 →</button>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="동종업계 비교 — 반도체" size="lg" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['종목','시총','PER','PBR','ROE','매출성장','영업이익률'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : 'right', padding: '10px 12px',
                  fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {peers.map((r, i) => (
              <tr key={i} style={{
                borderBottom: '1px solid var(--sl-hairline)',
                background: r[7] === true ? 'var(--sl-brandSoft)' : r[7] === null ? 'var(--sl-surfaceAlt)' : 'transparent',
                fontWeight: (r[7] === true || r[7] === null) ? 600 : 400,
              }}>
                <td style={{ padding: '10px 12px' }}>{r[0]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{r[1]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{r[2]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{r[3]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{r[4]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right', color: typeof r[5] === 'string' && r[5].startsWith('+') ? 'var(--sl-up)' : typeof r[5] === 'string' && r[5].startsWith('−') ? 'var(--sl-down)' : undefined }}>{r[5]}</td>
                <td className="sl-mono" style={{ padding: '10px 12px', textAlign: 'right' }}>{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StockShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab 5 — 공시·실적
// ─────────────────────────────────────────────────────────────
function StockFilingsDesign({ theme = 'light' }) {
  const filings = [
    ['2025-11-19', '8-K', 'FY26 Q3 실적 발표', '+8.4%', 'up'],
    ['2025-11-15', '4', 'CFO 주식 매도 (10K shares)', '−1.2%', 'down'],
    ['2025-10-30', '10-Q', 'FY26 Q2 분기 보고서', '+2.1%', 'up'],
    ['2025-10-12', '8-K', '데이터센터 신규 계약 발표', '+4.6%', 'up'],
    ['2025-09-15', '14A', '주주총회 안건 위임장', '−0.3%', 'muted'],
    ['2025-08-28', '8-K', 'FY26 Q1 실적 발표', '+5.7%', 'up'],
    ['2025-07-22', '8-K', '자사주 매입 $50B 승인', '+3.4%', 'up'],
    ['2025-06-04', 'S-3', '증권 등록 (혼합 증권)', '−0.8%', 'muted'],
  ];

  return (
    <StockShell theme={theme} active="공시·실적">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="실적 발표 트렌드" subtitle="최근 20분기" />
          <BarChart2 seed="earn-trend" width={680} height={220} bars={20} signed />
          <div className="sl-row" style={{ gap: 16, marginTop: 12, fontSize: 12, flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-up)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />어닝 서프라이즈 (15회)</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-down)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />어닝 미스 (3회)</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-muted)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />컨센 일치 (2회)</span>
          </div>
        </div>

        <div className="sl-card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--sl-brandSoft) 0%, var(--sl-surface) 100%)' }}>
          <span className="sl-tag sl-tag-brand">D-43 · 다음 실적 발표</span>
          <h2 className="sl-h2" style={{ marginTop: 12, marginBottom: 4 }}>FY26 Q4</h2>
          <div className="sl-mono" style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>2026-02-26 · After Hours</div>
          <div className="sl-rule" />
          <div className="sl-label" style={{ marginTop: 14, marginBottom: 8 }}>컨센서스 추정</div>
          <div className="sl-col" style={{ gap: 8 }}>
            {[['매출', '$38.2B'], ['EPS', '$0.89'], ['영업이익률', '63.8%']].map(([l, v]) => (
              <div key={l} className="sl-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sl-inkSub)' }}>{l}</span>
                <span className="sl-mono" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="sl-btn sl-btn-primary" style={{ marginTop: 16, width: '100%' }}>🔔 실적 알림 받기</button>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionHeader title="공시 타임라인" size="lg" />
          <div className="sl-row" style={{ gap: 4 }}>
            {['전체', '실적', '정정', '거버넌스', 'M&A'].map((t, i) => (
              <span key={t} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{t}</span>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['제출일', '구분', '제목', '당일 주가', '원문'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 3 ? 'right' : i === 4 ? 'right' : 'left',
                  padding: '10px 12px', fontSize: 11, color: 'var(--sl-muted)',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                  width: i === 0 ? 110 : i === 1 ? 80 : i === 3 ? 110 : i === 4 ? 90 : 'auto',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filings.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)', cursor: 'pointer' }}>
                <td className="sl-mono" style={{ padding: '12px', color: 'var(--sl-inkSub)' }}>{r[0]}</td>
                <td style={{ padding: '12px' }}><span className="sl-tag sl-mono">{r[1]}</span></td>
                <td style={{ padding: '12px', fontWeight: 500 }}>{r[2]}</td>
                <td className="sl-mono" style={{
                  padding: '12px', textAlign: 'right', fontWeight: 600,
                  color: r[4] === 'up' ? 'var(--sl-up)' : r[4] === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                }}>{r[3]}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--sl-brand)', fontWeight: 600 }}>EDGAR ↗</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sl-caption" style={{ textAlign: 'center', marginTop: 12 }}>출처: SEC EDGAR (미국주) / DART (한국주) · 갱신 매일 18:00</div>
      </div>
    </StockShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab 6 — 뉴스 (AI 요약)
// ─────────────────────────────────────────────────────────────
function StockNewsDesign({ theme = 'light' }) {
  const news = [
    ['2025-12-19 14:32', 'Reuters', 'Nvidia tops Q3 estimates as data-center revenue jumps 94%', 3, 'up', 'AI 인프라 수요 지속·중국 수출 규제에도 매출 사상 최고치'],
    ['2025-12-19 11:08', 'Bloomberg', 'Druckenmiller adds to NVDA position in Q3 13F filing', 2, 'up', '듀켄밀러 패밀리오피스 NVDA 비중 확대 — Q3 13F 공시'],
    ['2025-12-18 22:14', '연합뉴스', '엔비디아 시총 3.6조달러 돌파 — AI 사이클 정점 논쟁', 2, 'muted', '국내 증권가 의견 — 단기 과열 vs 구조적 성장'],
    ['2025-12-18 09:45', 'WSJ', 'Morgan Stanley raises NVDA target to $185 from $170', 2, 'up', '데이터센터 가속기 점유율 88% 유지 전망'],
    ['2025-12-17 18:30', 'CNBC', "Cathie Wood's ARK trims NVDA in favor of Tesla Robotaxi play", 1, 'down', 'ARK 4분기 NVDA 비중 −8% 조정'],
    ['2025-12-17 14:22', '한국경제', '삼성전자 HBM 엔비디아 공급 본격화 전망', 2, 'up', 'HBM3E 12단 공급 협의 마무리 단계'],
  ];
  const keywords = [['데이터센터', 47, 'up'], ['HBM', 32, 'up'], ['목표가 상향', 18, 'up'], ['중국 규제', 12, 'down'], ['Q4 가이던스', 9, 'muted'], ['Robotaxi', 6, 'muted']];

  return (
    <StockShell theme={theme} active="뉴스">
      <div className="sl-row" style={{ gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="sl-pill" data-active="true">전체 (87)</span>
        <span className="sl-pill">한국어 (34)</span>
        <span className="sl-pill">영문 (53)</span>
        <div style={{ width: 1, height: 22, background: 'var(--sl-line)', margin: '0 6px', alignSelf: 'center' }} />
        {['실적', '제품', 'M&A', '애널리스트', '매크로'].map(t => (
          <span key={t} className="sl-pill">{t}</span>
        ))}
        <span className="sl-grow" />
        <span className="sl-caption" style={{ alignSelf: 'center' }}>최신순 ⌄</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="sl-col" style={{ gap: 12 }}>
          {news.map((r, i) => (
            <div key={i} className="sl-card" style={{ padding: 18, cursor: 'pointer' }}>
              <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="sl-row" style={{ gap: 8 }}>
                  <span className="sl-mono sl-caption">{r[0]}</span>
                  <span className="sl-tag">{r[1]}</span>
                  <span style={{ color: r[4] === 'up' ? 'var(--sl-up)' : r[4] === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)', fontSize: 11 }}>{'★'.repeat(r[3])}{'☆'.repeat(3 - r[3])}</span>
                </div>
                <span className="sl-caption">↗</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{r[2]}</div>
              <div className="sl-sub" style={{ fontSize: 12, lineHeight: 1.6 }}>{r[5]}</div>
            </div>
          ))}
        </div>

        <div className="sl-col" style={{ gap: 16 }}>
          <div className="sl-card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--sl-brandSoft) 0%, var(--sl-surface) 100%)' }}>
            <div className="sl-row" style={{ gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>✨</span>
              <span className="sl-label" style={{ color: 'var(--sl-brand)' }}>AI 뉴스 요약</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--sl-inkSub)', lineHeight: 1.7, margin: 0 }}>
              지난 7일간 NVDA 관련 뉴스 87건 중 <strong style={{ color: 'var(--sl-up)' }}>긍정 64%</strong>, 중립 28%, <strong style={{ color: 'var(--sl-down)' }}>부정 8%</strong>. 핵심 키워드는 <strong style={{ color: 'var(--sl-ink)' }}>"데이터센터", "HBM3E", "13F 매수", "목표가 상향"</strong> 순. 부정 뉴스는 ARK 비중 축소와 중국 수출 규제 우려가 중심.
            </p>
            <div className="sl-caption" style={{ marginTop: 12, fontSize: 11 }}>출처: Gemini 1.5 Flash · 매 6시간 갱신</div>
          </div>

          <div className="sl-card" style={{ padding: 20 }}>
            <SectionHeader title="키워드 트렌드" subtitle="지난 7일" />
            <div className="sl-col" style={{ gap: 10 }}>
              {keywords.map(([l, v, c], i) => (
                <div key={i}>
                  <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{l}</span>
                    <span className="sl-mono sl-caption">{v}건</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--sl-surfaceAlt)', borderRadius: 3 }}>
                    <div style={{
                      width: `${(v / 47) * 100}%`, height: '100%', borderRadius: 3,
                      background: c === 'up' ? 'var(--sl-up)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sl-card" style={{ padding: 20 }}>
            <SectionHeader title="감성 추이" subtitle="30일" />
            <AreaChart2 seed="news-sent" width={300} height={120} color="var(--sl-up)" fillOpacity={0.12} />
            <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
              <span className="sl-caption">11/19</span>
              <span className="sl-caption">12/19 (오늘)</span>
            </div>
          </div>
        </div>
      </div>
    </StockShell>
  );
}

Object.assign(window, { StockValueDesign, StockFilingsDesign, StockNewsDesign });
