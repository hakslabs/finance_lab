// Mobile (Home + Stock) · Empty / Error states · API budget verification

// ─────────────────────────────────────────────────────────────
// Mobile Home — 380×800 polished, hi-fi
// ─────────────────────────────────────────────────────────────
function MobileHomeDesign({ theme = 'light' }) {
  const indices = [
    ['S&P', '5,884', '+0.42%', 'up'],
    ['NDQ', '19,003', '+0.81%', 'up'],
    ['KOSPI', '2,488', '+0.24%', 'up'],
    ['KOSDAQ', '692', '−0.66%', 'down'],
  ];
  const watch = [
    ['AAPL', '$229.4', '+0.4%', 'up'],
    ['NVDA', '$148.2', '+1.6%', 'up'],
    ['삼성전자', '55,400', '+0.3%', 'up'],
    ['SK하이닉스', '148,300', '−1.2%', 'down'],
  ];

  return (
    <div data-theme={theme} className="sl-root" style={{
      width: 380, height: 800, fontFamily: 'var(--sl-font-sans)',
      background: 'var(--sl-bg)', borderRadius: 32, overflow: 'hidden',
      border: '8px solid #1a1a1a', display: 'flex', flexDirection: 'column',
    }}>
      {/* Status bar */}
      <div className="sl-row" style={{ padding: '12px 24px', fontSize: 12, justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span className="sl-mono" style={{ fontWeight: 700 }}>9:41</span>
        <div style={{ width: 80, height: 22, background: '#1a1a1a', borderRadius: 11 }} />
        <span className="sl-mono" style={{ fontWeight: 600 }}>•••• 5G</span>
      </div>
      {/* Top app bar */}
      <div className="sl-row" style={{ padding: '8px 16px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sl-hairline)', flexShrink: 0 }}>
        <div className="sl-row" style={{ gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--sl-brand) 0%, var(--sl-up) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 12,
          }}>S</div>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em' }}>STOCKLAB</div>
        </div>
        <div className="sl-row" style={{ gap: 14, fontSize: 14, color: 'var(--sl-inkSub)' }}>
          <span>★</span><span>🔔</span>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sl-cat4), var(--sl-cat1))' }} />
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
        {/* Hero greeting */}
        <div style={{ marginBottom: 12 }}>
          <div className="sl-caption" style={{ fontSize: 11 }}>좋은 오후입니다</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, lineHeight: 1.4 }}>
            홍길동님, 오늘 시장은 <span style={{ color: 'var(--sl-up)' }}>상승</span>으로 출발했어요
          </div>
        </div>

        {/* 지수 스트립 가로 스크롤 */}
        <div className="sl-row" style={{ gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
          {indices.map((r, i) => (
            <div key={i} className="sl-card" style={{ padding: 10, minWidth: 100, flexShrink: 0 }}>
              <div className="sl-label" style={{ fontSize: 10 }}>{r[0]}</div>
              <div className="sl-mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{r[1]}</div>
              <div className="sl-mono" style={{ fontSize: 10, fontWeight: 600, color: r[3] === 'up' ? 'var(--sl-up)' : 'var(--sl-down)' }}>{r[2]}</div>
            </div>
          ))}
        </div>

        {/* 시장 심리 */}
        <div className="sl-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="sl-label" style={{ fontSize: 10 }}>시장 심리</div>
              <div className="sl-row" style={{ alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>F&G</span>
                <span className="sl-mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--sl-up)' }}>72</span>
                <span className="sl-tag sl-tag-up">탐욕</span>
              </div>
            </div>
            <Sparkline2 seed="m-fg" up width={80} height={36} fill />
          </div>
        </div>

        {/* 관심종목 */}
        <div className="sl-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="sl-label" style={{ fontSize: 10 }}>★ 관심종목</div>
            <span className="sl-caption" style={{ fontSize: 10, color: 'var(--sl-brand)' }}>전체 →</span>
          </div>
          {watch.map((r, i) => (
            <div key={i} className="sl-row" style={{ justifyContent: 'space-between', padding: '8px 0', fontSize: 12, borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
              <span style={{ fontWeight: 600 }}>{r[0]}</span>
              <div className="sl-row" style={{ gap: 10 }}>
                <span className="sl-mono">{r[1]}</span>
                <span className="sl-mono" style={{ color: r[3] === 'up' ? 'var(--sl-up)' : 'var(--sl-down)', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>{r[2]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* News */}
        <div className="sl-card" style={{ padding: 14 }}>
          <div className="sl-label" style={{ fontSize: 10, marginBottom: 10 }}>📰 주요 뉴스</div>
          {[
            'Nvidia tops Q3 estimates as data-center revenue jumps 94%',
            '엔비디아 시총 3.6조달러 돌파 — AI 사이클 정점 논쟁',
            'Druckenmiller adds NVDA in Q3 13F filing',
          ].map((t, i) => (
            <div key={i} style={{ padding: '8px 0', fontSize: 12, borderBottom: i < 2 ? '1px solid var(--sl-hairline)' : 'none', lineHeight: 1.5 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="sl-row" style={{ borderTop: '1px solid var(--sl-line)', height: 64, flexShrink: 0, background: 'var(--sl-surface)' }}>
        {[['홈', '⌂', true], ['분석', '◉', false], ['검색', '⌕', false], ['포폴', '◇', false], ['더보기', '⋯', false]].map(([l, e, a], i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: a ? 'var(--sl-brand)' : 'var(--sl-muted)', fontWeight: a ? 600 : 500 }}>
            <div style={{ fontSize: 18 }}>{e}</div>
            <div style={{ marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile Stock Detail
// ─────────────────────────────────────────────────────────────
function MobileStockDesign({ theme = 'light' }) {
  return (
    <div data-theme={theme} className="sl-root" style={{
      width: 380, height: 800, fontFamily: 'var(--sl-font-sans)',
      background: 'var(--sl-bg)', borderRadius: 32, overflow: 'hidden',
      border: '8px solid #1a1a1a', display: 'flex', flexDirection: 'column',
    }}>
      <div className="sl-row" style={{ padding: '12px 24px', fontSize: 12, justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span className="sl-mono" style={{ fontWeight: 700 }}>9:41</span>
        <div style={{ width: 80, height: 22, background: '#1a1a1a', borderRadius: 11 }} />
        <span className="sl-mono" style={{ fontWeight: 600 }}>•••• 5G</span>
      </div>
      <div className="sl-row" style={{ padding: '10px 16px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sl-hairline)', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>← 뒤로</span>
        <div className="sl-row" style={{ gap: 14, fontSize: 14, color: 'var(--sl-inkSub)' }}>
          <span>★</span><span>📝</span><span>⋮</span>
        </div>
      </div>
      <div style={{ padding: 14, overflow: 'auto', flex: 1 }}>
        {/* Stock identity */}
        <div className="sl-row" style={{ gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11,
            background: 'linear-gradient(135deg, var(--sl-cat3), var(--sl-cat2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
          }}>N</div>
          <div className="sl-grow">
            <div style={{ fontSize: 16, fontWeight: 700 }}>NVIDIA</div>
            <div className="sl-caption" style={{ fontSize: 11 }}>NVDA · NASDAQ · 반도체</div>
          </div>
        </div>
        <div className="sl-row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          <span className="sl-mono" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>$148.20</span>
          <ChangePill pct={1.61} abs={2.34} size="sm" />
        </div>

        {/* Chart card */}
        <div className="sl-card" style={{ padding: 12, marginBottom: 12 }}>
          <PriceChart up width={332} height={140} />
          <div className="sl-row" style={{ gap: 4, marginTop: 8, justifyContent: 'space-between' }}>
            {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((t, i) => (
              <span key={t} className="sl-pill" data-active={i === 4 ? 'true' : undefined} style={{ fontSize: 10, padding: '4px 10px' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Tab strip horizontal scroll */}
        <div className="sl-row" style={{ gap: 14, overflowX: 'auto', marginBottom: 12, fontSize: 12, borderBottom: '1px solid var(--sl-hairline)', paddingBottom: 8 }}>
          {['개요', '차트', '재무', '적정가치', '공시·실적', '뉴스', '수급', '목표주가'].map((t, i) => (
            <span key={t} style={{
              whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 500,
              color: i === 0 ? 'var(--sl-brand)' : 'var(--sl-muted)',
              borderBottom: i === 0 ? '2px solid var(--sl-brand)' : 'none', paddingBottom: 6, marginBottom: -9,
            }}>{t}</span>
          ))}
        </div>

        {/* Key metrics */}
        <div className="sl-card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="sl-label" style={{ fontSize: 10, marginBottom: 10 }}>핵심 지표</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
            {[['PER', '55.4'], ['ROE', '91.5%'], ['시총', '$3.65T'], ['52주 고가', '$152.89']].map(([l, v], i) => (
              <div key={i}>
                <div className="sl-caption" style={{ fontSize: 11 }}>{l}</div>
                <div className="sl-mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sl-card" style={{ padding: 14 }}>
          <div className="sl-label" style={{ fontSize: 10, marginBottom: 10 }}>최근 뉴스</div>
          {['Nvidia tops Q3 estimates as data-center revenue jumps 94%', 'Druckenmiller adds NVDA in Q3 13F filing'].map((t, i) => (
            <div key={i} style={{ padding: '8px 0', fontSize: 12, borderBottom: i < 1 ? '1px solid var(--sl-hairline)' : 'none', lineHeight: 1.5 }}>{t}</div>
          ))}
        </div>
      </div>
      <div className="sl-row" style={{ borderTop: '1px solid var(--sl-line)', height: 60, padding: '0 12px', gap: 8, alignItems: 'center', flexShrink: 0, background: 'var(--sl-surface)' }}>
        <button className="sl-btn sl-btn-secondary" style={{ flex: 1 }}>📝 메모</button>
        <button className="sl-btn sl-btn-primary" style={{ flex: 2 }}>+ 거래 추가</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty + Error states guide
// ─────────────────────────────────────────────────────────────
function EmptyErrorDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <h1 className="sl-h1">빈 상태 · 에러 상태 가이드</h1>
          <div className="sl-caption" style={{ marginTop: 6, marginBottom: 24 }}>모든 데이터 위젯에 일관 적용 — 디자인 단계에서 그대로 사용</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Empty: watchlist */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>빈 상태 — 관심종목 0개</div>
              <div style={{ padding: 32, textAlign: 'center', border: '2px dashed var(--sl-line)', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12, color: 'var(--sl-faint)' }}>★</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>관심종목이 없어요</div>
                <div className="sl-sub" style={{ fontSize: 13, marginBottom: 18 }}>★ 버튼으로 종목을 저장하면 여기 모입니다</div>
                <div className="sl-label" style={{ marginBottom: 10 }}>추천 — 시총 상위</div>
                <div className="sl-row" style={{ gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', '삼성전자', 'SK하이닉스'].map(t => (
                    <span key={t} className="sl-pill" style={{ fontSize: 11 }}>+ {t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty: portfolio */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>빈 상태 — 포트폴리오 첫 진입</div>
              <div style={{ padding: 32, textAlign: 'center', border: '2px dashed var(--sl-line)', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>아직 보유 종목이 없어요</div>
                <div className="sl-sub" style={{ fontSize: 13, marginBottom: 18 }}>거래 내역을 추가하면 자동으로 포트폴리오가 구성됩니다</div>
                <div className="sl-row" style={{ gap: 8, justifyContent: 'center' }}>
                  <button className="sl-btn sl-btn-primary">+ 거래 추가</button>
                  <button className="sl-btn sl-btn-secondary">CSV 가져오기</button>
                </div>
                <div className="sl-caption" style={{ marginTop: 16, fontSize: 11 }}>최근 조회 종목: AAPL, NVDA, 삼성전자</div>
              </div>
            </div>

            {/* Error: stale data */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>에러 — 갱신 실패 · 이전 데이터 표시</div>
              <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>VIX</span>
                <span className="sl-mono" style={{ color: 'var(--sl-down)', fontSize: 12, fontWeight: 600 }}>⚠ 갱신 09:00 · 재시도 중</span>
              </div>
              <div className="sl-num-lg" style={{ opacity: 0.5 }}>14.2</div>
              <div className="sl-caption" style={{ marginTop: 4 }}>5시간 전 데이터 · API 한도 초과 가능성</div>
              <div className="sl-row" style={{ gap: 6, marginTop: 14 }}>
                <button className="sl-btn sl-btn-secondary sl-btn-sm">↻ 재시도</button>
                <button className="sl-btn sl-btn-ghost sl-btn-sm">로그 보기</button>
              </div>
            </div>

            {/* Error: API limit */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>에러 — API 한도 초과 (전체)</div>
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--sl-warnSoft)', border: '1px solid var(--sl-warn)', borderRadius: 10 }}>
                <div style={{ fontSize: 32, marginBottom: 10, color: 'var(--sl-warn)' }}>⚠</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>일일 API 한도에 도달했어요</div>
                <div className="sl-sub" style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                  Alpha Vantage 무료 티어 25/일 사용 완료.<br />다음 갱신: 내일 09:00 KST · 표시 데이터는 어제 종가 기준
                </div>
                <button className="sl-btn sl-btn-secondary sl-btn-sm">관리자 알림 보내기</button>
              </div>
            </div>

            {/* Error: network */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>에러 — 네트워크 실패</div>
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: 'var(--sl-down)' }}>✕</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>연결할 수 없어요</div>
                <div className="sl-sub" style={{ fontSize: 13, marginBottom: 14 }}>인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요</div>
                <button className="sl-btn sl-btn-primary">↻ 다시 시도</button>
              </div>
            </div>

            {/* Error: ticker not found */}
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-label" style={{ marginBottom: 14 }}>에러 — 종목 데이터 없음</div>
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>"XYZW"를 찾을 수 없어요</div>
                <div className="sl-sub" style={{ fontSize: 13, marginBottom: 14 }}>종목 코드를 확인해주세요. 한국주는 6자리 숫자, 미국주는 영문 티커</div>
                <div className="sl-row" style={{ gap: 6, justifyContent: 'center' }}>
                  {['AAPL', '005930'].map(t => <span key={t} className="sl-pill" style={{ fontSize: 11 }}>{t}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Refresh time pattern */}
          <div className="sl-card" style={{ padding: 24 }}>
            <SectionHeader title="갱신시각 컴포넌트 · 표준" subtitle="모든 데이터 위젯의 우상단 헤더에 표시" size="lg" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                ['정상', '갱신 14:32 ↻', 'muted'],
                ['지연', '갱신 14:32 · 5분 전', 'warn'],
                ['실패 (재시도)', '⚠ 갱신 09:00 · 재시도 중', 'down'],
              ].map(([l, t, c], i) => (
                <div key={i}>
                  <div className="sl-label" style={{ marginBottom: 8 }}>{l}</div>
                  <div className="sl-card-soft" style={{ padding: 14 }}>
                    <span className="sl-mono" style={{
                      fontSize: 12, fontWeight: 600,
                      color: c === 'warn' ? 'var(--sl-warn)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                    }}>{t}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="sl-caption" style={{ marginTop: 14, lineHeight: 1.6 }}>
              실패해도 이전 데이터는 opacity 0.5로 그대로 보여줌. 재시도 버튼은 hover 시 출현. 자동 재시도는 최대 3회 백오프.
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

Object.assign(window, { MobileHomeDesign, MobileStockDesign, EmptyErrorDesign });
