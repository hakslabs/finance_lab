// Remaining wires — 분석허브 도구별 미리보기, 모바일, 빈/에러 상태, API 한도 재검증

// ===== 1. 분석 허브 v2 — 도구 카드 + 우측 미리보기 + 오늘의 추천 =====
function WireAnalysisHubV2() {
  const tools = [
    ['시장 개요', '지수·섹터·거래대금', '🌐', true],
    ['시장 심리', '9개 공포·탐욕 게이지', '🌡️', false],
    ['기술적', 'RSI·골든크로스·신호', '📈', false],
    ['재무', '시장 전체 PER/ROE', '💼', false],
    ['시장 지도', '히트맵 풀화면', '🗺️', false],
    ['섹터 로테이션', '돈이 흐르는 섹터', '🔄', false],
    ['경제 캘린더', 'CPI·FOMC·실적', '📅', false],
    ['관계 분석', '상관계수·베타', '🔗', false],
  ];
  return (
    <div className="w-root">
      <AppBar active="분석" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <div className="w-row" style={{ gap: 8, alignItems: 'baseline' }}>
          <h1 className="w-h1">분석</h1>
          <span className="w-faint" style={{ fontSize: 11 }}>· 시장 전체 데이터를 깊이 보는 도구들</span>
        </div>

        <div className="w-card" style={{ padding: 14, background: W.fill }}>
          <div className="w-row" style={{ gap: 12 }}>
            <div style={{ width: 56, height: 56, border: `2px solid ${W.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌡️</div>
            <div className="w-grow">
              <div className="w-h3" style={{ fontSize: 9 }}>오늘의 추천 도구</div>
              <h2 className="w-h2" style={{ marginTop: 2 }}>시장 심리</h2>
              <div className="w-faint" style={{ fontSize: 11 }}>F&G 72 (탐욕). VIX 14.2로 변동성 매우 낮음 — 단기 과열 가능성. 9개 게이지를 풀화면으로 살펴보세요.</div>
            </div>
            <button className="w-btn-primary w-btn">열기 →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {tools.map(([n,d,e,active],i) => (
              <div key={i} className="w-card" style={{ padding: 12, background: active ? W.fill : W.bg, borderColor: active ? W.ink : W.line, borderWidth: active ? 2 : 1 }}>
                <div className="w-row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{e}</span>
                  <div className="w-grow">
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n}</div>
                    <div className="w-faint" style={{ fontSize: 10 }}>{d}</div>
                  </div>
                  <span className="w-faint" style={{ fontSize: 12 }}>→</span>
                </div>
              </div>
            ))}
          </div>
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 className="w-h2">미리보기 — 시장 개요</h2>
              <span className="w-faint" style={{ fontSize: 9 }}>호버한 도구</span>
            </div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div className="w-col" style={{ gap: 6, fontSize: 11 }}>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>S&P 500</span><span className="w-mono w-up">5,884 +0.42%</span></div>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>NASDAQ</span><span className="w-mono w-up">19,003 +0.81%</span></div>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>KOSPI</span><span className="w-mono w-up">2,488 +0.24%</span></div>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>KOSDAQ</span><span className="w-mono w-down">692 −0.66%</span></div>
            </div>
            <div className="w-rule" style={{ margin: '10px 0' }} />
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 4 }}>섹터 (오늘 상위)</div>
            <div className="w-col" style={{ gap: 3, fontSize: 11 }}>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>IT</span><span className="w-mono w-up">+2.4%</span></div>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>커뮤니케이션</span><span className="w-mono w-up">+1.8%</span></div>
              <div className="w-row" style={{ justifyContent: 'space-between' }}><span>부동산</span><span className="w-mono w-down">−1.2%</span></div>
            </div>
            <button className="w-btn" style={{ marginTop: 12, width: '100%' }}>풀화면으로 보기 →</button>
          </div>
        </div>

        <div className="w-card-soft" style={{ padding: 10, fontSize: 11, color: W.muted }}>
          💡 도구 카드 위에 마우스를 올리면 우측 패널에 미리보기가 즉시 갱신됩니다 — 클릭하지 않고도 어떤 데이터가 있는지 확인할 수 있습니다.
        </div>
      </div>
    </div>
  );
}

// ===== 2. 모바일 — 홈 (iOS frame 480x900) =====
function WireMobileHome() {
  return (
    <div style={{ width: 380, height: 800, background: W.bg, fontFamily: 'inherit', overflow: 'hidden', border: `2px solid ${W.line}`, borderRadius: 32 }}>
      <div style={{ padding: '8px 16px', fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
        <span className="w-mono">9:41</span>
        <span>•••• 5G</span>
      </div>
      <div className="w-row" style={{ padding: '8px 16px', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${W.hairline}` }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>STOCKLAB</span>
        <div className="w-row" style={{ gap: 12, fontSize: 14 }}>
          <span>★</span><span>🔔</span><span>👤</span>
        </div>
      </div>
      <div style={{ padding: 12, overflow: 'auto', height: 'calc(100% - 110px)' }}>
        {/* 지수 스트립 가로 스크롤 */}
        <div className="w-row" style={{ gap: 8, overflow: 'auto', marginBottom: 10 }}>
          {[['S&P','5,884','+0.42%',W.up],['NDQ','19,003','+0.81%',W.up],['KOSPI','2,488','+0.24%',W.up],['KOSDAQ','692','−0.66%',W.down]].map((r,i) => (
            <div key={i} className="w-card" style={{ padding: 8, minWidth: 100 }}>
              <div className="w-h3" style={{ fontSize: 9 }}>{r[0]}</div>
              <div className="w-mono" style={{ fontSize: 12, fontWeight: 600 }}>{r[1]}</div>
              <div className="w-mono" style={{ fontSize: 10, color: r[3] }}>{r[2]}</div>
            </div>
          ))}
        </div>
        {/* 시장 심리 1줄 */}
        <div className="w-card" style={{ padding: 10, marginBottom: 10 }}>
          <div className="w-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="w-h3" style={{ fontSize: 9 }}>시장 심리</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>F&G <span className="w-mono w-up" style={{ fontWeight: 700 }}>72</span> 탐욕</div>
            </div>
            <Sparkline seed="m-fg" width={80} height={28} color={W.up} />
          </div>
        </div>
        {/* 관심종목 */}
        <div className="w-card" style={{ padding: 10, marginBottom: 10 }}>
          <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="w-h3" style={{ fontSize: 10 }}>★ 관심종목</div>
            <span className="w-faint" style={{ fontSize: 9 }}>편집</span>
          </div>
          <div className="w-rule" style={{ marginBottom: 6 }} />
          {[['AAPL','$229.4','+0.4%',W.up],['NVDA','$148.2','+1.6%',W.up],['삼성전자','55,400','+0.3%',W.up],['SK하이닉스','148,300','−1.2%',W.down]].map((r,i) => (
            <div key={i} className="w-row" style={{ justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderBottom: i < 3 ? `1px solid ${W.hairline}` : 'none' }}>
              <span>{r[0]}</span>
              <span><span className="w-mono">{r[1]}</span> <span className="w-mono" style={{ color: r[3], marginLeft: 6 }}>{r[2]}</span></span>
            </div>
          ))}
        </div>
        {/* 뉴스 */}
        <div className="w-card" style={{ padding: 10 }}>
          <div className="w-h3" style={{ fontSize: 10, marginBottom: 6 }}>📰 주요 뉴스</div>
          <div className="w-rule" style={{ marginBottom: 6 }} />
          {['Nvidia tops Q3 estimates as data-center revenue jumps 94%', '엔비디아 시총 3.6조달러 돌파', 'Druckenmiller adds NVDA in Q3 13F'].map((t,i) => (
            <div key={i} style={{ padding: '4px 0', fontSize: 11, borderBottom: i < 2 ? `1px solid ${W.hairline}` : 'none' }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Bottom tab bar */}
      <div className="w-row" style={{ borderTop: `1px solid ${W.line}`, height: 50 }}>
        {[['홈','■',true],['분석','◉',false],['검색','⌕',false],['포폴','◇',false],['더보기','⋯',false]].map(([l,e,a],i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: a ? W.ink : W.muted, fontWeight: a ? 600 : 400 }}>
            <div style={{ fontSize: 14 }}>{e}</div>
            <div>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 3. 모바일 — 종목 상세 =====
function WireMobileStock() {
  return (
    <div style={{ width: 380, height: 800, background: W.bg, fontFamily: 'inherit', overflow: 'hidden', border: `2px solid ${W.line}`, borderRadius: 32 }}>
      <div style={{ padding: '8px 16px', fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
        <span className="w-mono">9:41</span>
        <span>•••• 5G</span>
      </div>
      <div className="w-row" style={{ padding: '8px 16px', justifyContent: 'space-between', borderBottom: `1px solid ${W.hairline}` }}>
        <span style={{ fontSize: 14 }}>← 뒤로</span>
        <div className="w-row" style={{ gap: 12, fontSize: 14 }}>
          <span>★</span><span>📝</span><span>⋮</span>
        </div>
      </div>
      <div style={{ padding: 12, overflow: 'auto', height: 'calc(100% - 110px)' }}>
        <div style={{ marginBottom: 10 }}>
          <div className="w-row" style={{ gap: 8, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, border: `1px solid ${W.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>N</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>NVIDIA</div>
              <div className="w-faint" style={{ fontSize: 10 }}>NVDA · NASDAQ</div>
            </div>
          </div>
          <div className="w-row" style={{ alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span className="w-mono" style={{ fontSize: 22, fontWeight: 700 }}>$148.20</span>
            <span className="w-mono w-up" style={{ fontSize: 12 }}>+2.34 (+1.61%)</span>
          </div>
        </div>

        <div className="w-card" style={{ padding: 8, marginBottom: 10 }}>
          <AreaChart seed="m-stk" width={340} height={140} color={W.up} />
          <div className="w-row" style={{ gap: 4, marginTop: 6, justifyContent: 'space-between', fontSize: 10 }}>
            {['1D','1W','1M','3M','1Y','5Y'].map((t,i) => (
              <span key={t} className="w-pill" style={{ background: i === 4 ? W.fill : W.bg, fontSize: 9 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* 탭바 가로 스크롤 */}
        <div className="w-row" style={{ gap: 12, overflow: 'auto', marginBottom: 8, fontSize: 11, borderBottom: `1px solid ${W.hairline}`, paddingBottom: 6 }}>
          {['개요','차트','재무','적정가치','공시·실적','뉴스','수급','목표주가'].map((t,i) => (
            <span key={t} style={{ whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? W.ink : W.muted, borderBottom: i === 0 ? `2px solid ${W.ink}` : 'none', paddingBottom: 4 }}>{t}</span>
          ))}
        </div>

        <div className="w-card" style={{ padding: 10, marginBottom: 10 }}>
          <div className="w-h3" style={{ fontSize: 10, marginBottom: 6 }}>핵심 지표</div>
          <div className="w-rule" style={{ marginBottom: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
            {[['PER','55.4'],['ROE','91.5%'],['시총','$3.65T'],['52주 고가','$152.89']].map(([l,v],i) => (
              <div key={i}>
                <div className="w-faint" style={{ fontSize: 9 }}>{l}</div>
                <div className="w-mono" style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-card" style={{ padding: 10 }}>
          <div className="w-h3" style={{ fontSize: 10, marginBottom: 6 }}>최근 뉴스</div>
          <div className="w-rule" style={{ marginBottom: 6 }} />
          {['Nvidia tops Q3 estimates', 'Druckenmiller adds NVDA Q3'].map((t,i) => (
            <div key={i} style={{ padding: '4px 0', fontSize: 11, borderBottom: i < 1 ? `1px solid ${W.hairline}` : 'none' }}>{t}</div>
          ))}
        </div>
      </div>
      <div className="w-row" style={{ borderTop: `1px solid ${W.line}`, height: 50, padding: '0 12px', gap: 8, alignItems: 'center' }}>
        <button className="w-btn" style={{ flex: 1 }}>📝 메모</button>
        <button className="w-btn-primary w-btn" style={{ flex: 2 }}>+ 거래 추가</button>
      </div>
    </div>
  );
}

// ===== 4. 빈 상태 + 에러 상태 =====
function WireEmptyAndError() {
  return (
    <div className="w-root">
      <AppBar active="홈" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
        <h1 className="w-h1">빈 상태 · 에러 상태 가이드</h1>
        <div className="w-faint" style={{ fontSize: 11 }}>모든 데이터 위젯에 일관 적용. 디자인 단계에서 그대로 사용.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* 빈: 관심종목 */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>빈 상태 — 관심종목 0개</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ padding: 24, textAlign: 'center', border: `1px dashed ${W.line}`, borderRadius: 4 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>★</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>관심종목이 없어요</div>
              <div className="w-faint" style={{ fontSize: 11, marginBottom: 12 }}>★ 버튼으로 종목을 저장하면 여기 모입니다.</div>
              <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>추천 — 시총 상위</div>
              <div className="w-row" style={{ gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['AAPL','MSFT','NVDA','GOOGL','META','삼성전자','SK하이닉스'].map(t => <span key={t} className="w-pill" style={{ fontSize: 10 }}>+ {t}</span>)}
              </div>
            </div>
          </div>

          {/* 빈: 포트폴리오 */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>빈 상태 — 포트폴리오 첫 진입</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ padding: 24, textAlign: 'center', border: `1px dashed ${W.line}`, borderRadius: 4 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>아직 보유 종목이 없어요</div>
              <div className="w-faint" style={{ fontSize: 11, marginBottom: 12 }}>거래 내역을 추가하면 자동으로 포트폴리오가 구성됩니다.</div>
              <div className="w-row" style={{ gap: 8, justifyContent: 'center' }}>
                <button className="w-btn-primary w-btn">+ 거래 추가</button>
                <button className="w-btn">CSV 가져오기</button>
              </div>
              <div className="w-faint" style={{ fontSize: 10, marginTop: 12 }}>최근 조회 종목: AAPL, NVDA, 삼성전자</div>
            </div>
          </div>

          {/* 에러: 갱신 실패 (이전 데이터 유지) */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>에러 — 갱신 실패 · 이전 데이터 표시</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>VIX</span>
              <span className="w-mono" style={{ color: W.down, fontSize: 10 }}>⚠ 갱신 09:00 · 재시도 중</span>
            </div>
            <div className="w-mono" style={{ fontSize: 22, fontWeight: 700, opacity: 0.5 }}>14.2</div>
            <div className="w-faint" style={{ fontSize: 10 }}>5시간 전 데이터 · API 한도 초과 가능성</div>
            <div className="w-row" style={{ gap: 6, marginTop: 8 }}>
              <button className="w-btn" style={{ fontSize: 10 }}>↻ 재시도</button>
              <button className="w-btn" style={{ fontSize: 10 }}>로그 보기</button>
            </div>
          </div>

          {/* 에러: API 한도 초과 */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>에러 — API 한도 초과 (전체)</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ padding: 16, textAlign: 'center', background: '#fff8e1', border: `1px solid ${W.line}` }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>⚠</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>일일 API 한도에 도달했어요</div>
              <div className="w-faint" style={{ fontSize: 11, marginBottom: 8 }}>
                Alpha Vantage 무료 티어 25/일 사용 완료.<br/>
                다음 갱신: 내일 09:00 KST · 표시되는 데이터는 어제 종가 기준
              </div>
              <button className="w-btn" style={{ fontSize: 10 }}>관리자 알림 보내기</button>
            </div>
          </div>

          {/* 에러: 네트워크 실패 */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>에러 — 네트워크 실패</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6, color: W.down }}>✕</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>연결할 수 없어요</div>
              <div className="w-faint" style={{ fontSize: 11, marginBottom: 12 }}>인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.</div>
              <button className="w-btn-primary w-btn" style={{ fontSize: 11 }}>↻ 다시 시도</button>
            </div>
          </div>

          {/* 에러: 종목 데이터 없음 */}
          <div className="w-card" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>에러 — 종목 데이터 없음</div>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>"XYZW"를 찾을 수 없어요</div>
              <div className="w-faint" style={{ fontSize: 11, marginBottom: 12 }}>종목 코드를 확인해주세요. 한국주는 6자리 숫자, 미국주는 영문 티커.</div>
              <div className="w-row" style={{ gap: 4, justifyContent: 'center' }}>
                {['AAPL','005930'].map(t => <span key={t} className="w-pill" style={{ fontSize: 10 }}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* 갱신시각 표준 컴포넌트 */}
        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>갱신시각 컴포넌트 · 표준</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              ['정상', '갱신 14:32 ↻', W.muted],
              ['지연', '갱신 14:32 · 5분 전', '#b88a2e'],
              ['실패 (재시도)', '⚠ 갱신 09:00 · 재시도 중', W.down],
            ].map(([l,t,c],i) => (
              <div key={i}>
                <div className="w-h3" style={{ fontSize: 9, marginBottom: 4 }}>{l}</div>
                <div className="w-card-soft" style={{ padding: 8 }}>
                  <span className="w-mono" style={{ fontSize: 10, color: c }}>{t}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="w-faint" style={{ fontSize: 10, marginTop: 8 }}>
            모든 데이터 위젯의 우상단 헤더에 위 컴포넌트를 표시. 실패해도 이전 데이터는 opacity 0.5로 그대로 보여줌.
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 5. API 한도 재검증 표 =====
function WireApiBudget() {
  return (
    <div className="w-root">
      <AppBar active="" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <h1 className="w-h1">API 한도 vs Cron 호출량 — 재검증</h1>
        <div className="w-faint" style={{ fontSize: 11 }}>2025-12 기준 무료 티어. 모든 호출은 Supabase에 캐시 저장 후 사용자에게 서빙 (재배포 라이선스 OK인 소스만).</div>

        <div className="w-card" style={{ padding: 12 }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: W.fill }}>
              <th style={{ padding: 6, textAlign: 'left' }}>소스</th>
              <th style={{ padding: 6, textAlign: 'left' }}>용도</th>
              <th style={{ padding: 6, textAlign: 'right' }}>무료 한도</th>
              <th style={{ padding: 6, textAlign: 'right' }}>예상 호출</th>
              <th style={{ padding: 6, textAlign: 'right' }}>여유</th>
              <th style={{ padding: 6, textAlign: 'left' }}>Cron 빈도</th>
              <th style={{ padding: 6, textAlign: 'left' }}>상태</th>
            </tr></thead>
            <tbody>
              {[
                ['KRX OpenAPI', '한국주 일별 시세·지수', '10K/일', '~150', '66x', '매일 18:30', '✅ 충분'],
                ['DART', '한국 공시·재무', '10K/일', '~80', '125x', '매일 18:00 + 실시간 polling', '✅ 충분'],
                ['SEC EDGAR', '미국 공시·재무', '제한 없음', '~200', '∞', '매일 18:00', '✅ 충분'],
                ['Stooq (CSV)', '미국주 일별 시세', '제한 없음 (RSS/CSV)', '~500', '∞', '매일 06:00 KST', '✅ 충분'],
                ['Alpha Vantage', '경제지표·환율 (보조)', '25/일 · 5/분', '~20', '1.25x', '매일 09:00', '⚠ 빠듯'],
                ['Finnhub Free', '미국 시세 백업', '60/분 · 토큰별', '~120', '안전', '매시', '✅ 충분'],
                ['FRED', '경제지표 (CPI·금리)', '제한 없음', '~30', '∞', '매일', '✅ 충분'],
                ['Naver/Daum RSS', '한국 뉴스 (헤드라인만)', 'RSS 무제한', '~200', '∞', '매시', '✅ 충분'],
                ['NewsAPI', '글로벌 뉴스', '100/일', '~80', '1.25x', '매시', '⚠ 빠듯'],
                ['Gemini 1.5 Flash', '리포트 요약·번역', '1500/일 · 15/분', '~65', '23x', '큐 분산', '✅ 충분'],
                ['arXiv / SSRN RSS', '학술 RSS', '무제한', '~100', '∞', '매일 01:00', '✅ 충분'],
              ].map((r,i) => (
                <tr key={i}>
                  <td style={{ padding: 6, borderBottom: `1px solid ${W.hairline}`, fontWeight: 600 }}>{r[0]}</td>
                  <td style={{ padding: 6, borderBottom: `1px solid ${W.hairline}` }}>{r[1]}</td>
                  <td className="w-mono w-faint" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[2]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[3]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', color: r[4].includes('빠듯') ? W.down : W.up, borderBottom: `1px solid ${W.hairline}` }}>{r[4]}</td>
                  <td className="w-faint" style={{ padding: 6, fontSize: 10, borderBottom: `1px solid ${W.hairline}` }}>{r[5]}</td>
                  <td style={{ padding: 6, fontSize: 10, borderBottom: `1px solid ${W.hairline}` }}>{r[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="w-card-soft" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>⚠ 빠듯한 소스 — 대응책</div>
            <div className="w-rule" style={{ marginBottom: 6 }} />
            <ul className="w-faint" style={{ fontSize: 11, lineHeight: 1.6, paddingLeft: 16, margin: 0 }}>
              <li><strong>Alpha Vantage (25/일)</strong> — 환율·CPI 등 자주 안 변하는 지표만. CPI는 월 1회만 갱신해도 충분 → 실제 호출 ~5</li>
              <li><strong>NewsAPI (100/일)</strong> — Naver/Daum RSS로 한국 뉴스 우선 처리, NewsAPI는 글로벌 헤드라인만 → 실제 호출 ~30</li>
              <li>**둘 다 캐시 TTL 늘려서** 한도 안정 확보</li>
            </ul>
          </div>
          <div className="w-card-soft" style={{ padding: 12 }}>
            <div className="w-h3" style={{ fontSize: 9, marginBottom: 6 }}>📊 일일 총 호출량 합계</div>
            <div className="w-rule" style={{ marginBottom: 6 }} />
            <div className="w-mono" style={{ fontSize: 28, fontWeight: 700, color: W.up }}>~1,545 / day</div>
            <div className="w-faint" style={{ fontSize: 11, marginTop: 4 }}>
              GitHub Actions 무료 2,000분/월 · 각 cron 1~2분 → 월 ~600분 사용. 60% 여유.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WireAnalysisHubV2 = WireAnalysisHubV2;
window.WireMobileHome = WireMobileHome;
window.WireMobileStock = WireMobileStock;
window.WireEmptyAndError = WireEmptyAndError;
window.WireApiBudget = WireApiBudget;
