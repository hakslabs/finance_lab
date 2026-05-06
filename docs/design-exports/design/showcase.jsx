// Design system showcase — visual reference for all tokens & components.
function DesignSystemShowcase({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <div style={{ overflow: 'auto', padding: 32, background: 'var(--sl-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 className="sl-h1">디자인 시스템</h1>
            <p className="sl-sub" style={{ marginTop: 6 }}>STOCKLAB · Robinhood + Toss 스타일 · 라이트/다크 토큰</p>
          </div>

          {/* Colors */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="컬러" subtitle="CSS 변수로 노출, data-theme로 라이트/다크 전환" size="lg" />
            <div className="sl-card" style={{ padding: 20 }}>
              <div className="sl-label" style={{ marginBottom: 10 }}>표면 / 잉크</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 20 }}>
                {['bg','surface','surfaceAlt','ink','inkSub','muted'].map(k => <Swatch key={k} name={k} v={`var(--sl-${k})`} />)}
              </div>
              <div className="sl-label" style={{ marginBottom: 10 }}>브랜드 / 시맨틱</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 20 }}>
                {['brand','up','down','warn','info','brandSoft'].map(k => <Swatch key={k} name={k} v={`var(--sl-${k})`} />)}
              </div>
              <div className="sl-label" style={{ marginBottom: 10 }}>차트 카테고리</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {[1,2,3,4,5,6,7,8].map(i => <Swatch key={i} name={`cat${i}`} v={`var(--sl-cat${i})`} />)}
              </div>
            </div>
          </section>

          {/* Type */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="타이포그래피" subtitle="Pretendard (UI) · JetBrains Mono (가격·티커)" size="lg" />
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-num-hero">$1,247.32</div>
              <div className="sl-caption" style={{ marginTop: 4, marginBottom: 24 }}>Hero 40 / mono / tabular</div>
              <h1 className="sl-h1">시장은 오늘도 움직인다</h1>
              <div className="sl-caption">H1 28 · -0.02em</div>
              <div style={{ height: 16 }} />
              <h2 className="sl-h2">시장 개요</h2>
              <div className="sl-caption">H2 20</div>
              <div style={{ height: 14 }} />
              <h3 className="sl-h3">관심종목</h3>
              <div className="sl-caption">H3 16</div>
              <div style={{ height: 14 }} />
              <p style={{ margin: 0 }}>본문 텍스트 · 14px · line-height 1.5 — 한국어 가독성을 위해 letter-spacing -0.5%.</p>
              <div style={{ height: 8 }} />
              <p className="sl-label">LABEL · UPPERCASE 12</p>
              <p className="sl-caption">Caption · 11px · 보조 메타정보</p>
              <div style={{ height: 12 }} />
              <div className="sl-num-lg">$178.32</div>
              <div className="sl-num-md">+2.34 (+1.32%)</div>
              <div className="sl-num-sm">VOL 198.4M</div>
            </div>
          </section>

          {/* Buttons */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="버튼 / 컨트롤" size="lg" />
            <div className="sl-card" style={{ padding: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="sl-btn sl-btn-primary">매수하기</button>
              <button className="sl-btn sl-btn-secondary">관심 추가</button>
              <button className="sl-btn sl-btn-ghost">취소</button>
              <button className="sl-btn sl-btn-primary sl-btn-sm">+ 추가</button>
              <span className="sl-pill" data-active="true">1M</span>
              <span className="sl-pill">3M</span>
              <span className="sl-pill">1Y</span>
              <input className="sl-input" placeholder="검색" defaultValue="" />
            </div>
          </section>

          {/* Tags */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="태그 · 변동률 · 기간" size="lg" />
            <div className="sl-card" style={{ padding: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="sl-tag">기본</span>
              <span className="sl-tag sl-tag-up">+1.32%</span>
              <span className="sl-tag sl-tag-down">−2.41%</span>
              <span className="sl-tag sl-tag-brand">팔로우</span>
              <span className="sl-tag sl-tag-warn">⚠ 갱신 실패</span>
              <ChangePill pct={2.34} />
              <ChangePill pct={-1.18} />
              <Tabs items={[{label:'개요'},{label:'차트'},{label:'재무'}]} active="개요" />
              <PeriodSelector active="1M" />
            </div>
          </section>

          {/* Charts */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="차트 · 데이터 시각화" size="lg" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Sparkline" subtitle="관심종목 · 미니 트렌드" />
                <div className="sl-row" style={{ gap: 16 }}>
                  <Sparkline2 seed="aapl" up width={120} height={40} fill />
                  <Sparkline2 seed="tsla" up={false} width={120} height={40} fill />
                </div>
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Area Chart" subtitle="포트폴리오 · 자산 추이" />
                <AreaChart2 seed="port" width={300} height={80} />
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Candle" subtitle="종목 차트 OHLC" />
                <CandleChart2 seed="nvda" width={300} height={140} bars={40} showVolume />
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Bar (signed)" subtitle="섹터 등락" />
                <BarChart2 seed="sec" width={300} height={100} bars={11} />
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Donut · Progress" />
                <div className="sl-row" style={{ gap: 20 }}>
                  <Donut value={72} label={<span><span className="sl-mono">72</span><div className="sl-caption">집중도</div></span>} />
                  <Donut value={45} color="var(--sl-up)" label={<span><span className="sl-mono">45</span></span>} />
                </div>
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Gauge · 공포·탐욕" />
                <div className="sl-row" style={{ gap: 16, justifyContent: 'space-around' }}>
                  <Gauge value={28} label="공포" sublabel="VIX 23.4" />
                  <Gauge value={62} label="탐욕" sublabel="CNN F&G" />
                </div>
              </div>
            </div>
          </section>

          {/* Spacing */}
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="간격 · 라운드" size="lg" />
            <div className="sl-card" style={{ padding: 24 }}>
              <div className="sl-row" style={{ gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
                {[4,8,12,16,20,24,32,40,48,64].map(s => (
                  <div key={s} style={{ textAlign: 'center' }}>
                    <div style={{ width: s, height: s, background: 'var(--sl-brand)', borderRadius: 2, marginBottom: 4 }} />
                    <div className="sl-caption sl-mono">{s}</div>
                  </div>
                ))}
              </div>
              <div className="sl-row" style={{ gap: 12 }}>
                {[{n:'sm',v:6},{n:'md',v:10},{n:'lg',v:14},{n:'xl',v:20}].map(r => (
                  <div key={r.n} style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, background: 'var(--sl-surfaceAlt)', borderRadius: r.v, marginBottom: 4, border: '1px solid var(--sl-line)' }} />
                    <div className="sl-caption sl-mono">{r.n} · {r.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </SLPage>
  );
}

function Swatch({ name, v }) {
  return (
    <div>
      <div style={{ height: 56, borderRadius: 8, background: v, border: '1px solid var(--sl-line)' }} />
      <div className="sl-caption sl-mono" style={{ marginTop: 6 }}>{name}</div>
    </div>
  );
}

Object.assign(window, { DesignSystemShowcase, Swatch });
