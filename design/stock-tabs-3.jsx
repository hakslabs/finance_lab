// Stock Detail · Tab 7 수급 / Tab 8 목표주가
// Reuses StockShell from stock-tabs.jsx

// ─────────────────────────────────────────────────────────────
// Tab 7 — 수급 (Supply / Demand)
// ─────────────────────────────────────────────────────────────
function StockSupplyDesign({ theme = 'light' }) {
  const institutions = [
    ['Vanguard', '2.1B', '$311B', '8.5%', '+0.2%', '소폭 매수', 'up'],
    ['BlackRock', '1.8B', '$267B', '7.3%', '+0.1%', '소폭 매수', 'up'],
    ['State Street', '0.9B', '$133B', '3.7%', '0.0%', '유지', 'muted'],
    ['Fidelity', '0.6B', '$89B', '2.4%', '−0.3%', '매도', 'down'],
    ['T. Rowe Price', '0.3B', '$44B', '1.2%', '−0.1%', '매도', 'down'],
    ['Geode Capital', '0.3B', '$44B', '1.2%', '+0.05%', '매수', 'up'],
  ];

  return (
    <StockShell theme={theme} active="수급">
      <div className="sl-card-soft" style={{ padding: '12px 16px', fontSize: 12, color: 'var(--sl-muted)', marginBottom: 16, borderRadius: 10 }}>
        ⚠ 미국주는 분기별 13F 기관 보유 데이터만 제공 (한국주는 일별 외국인·기관 매매 KRX 무료 제공)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['외국인 보유율', '79.4%', '+0.3%p · 7일', 'up'],
          ['기관 보유율', '8.2%', '−0.1%p · 7일', 'down'],
          ['공매도 잔고', '0.42%', '낮은 수준', 'muted'],
          ['공매도 일평균', '$420M', '+18% · 30일', 'down'],
        ].map(([l, v, d, c], i) => (
          <div key={i} className="sl-card" style={{ padding: 18 }}>
            <div className="sl-label">{l}</div>
            <div className="sl-num-lg" style={{ marginTop: 6 }}>{v}</div>
            <div className="sl-mono" style={{
              fontSize: 11, fontWeight: 600, marginTop: 6,
              color: c === 'up' ? 'var(--sl-up)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
            }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="외국인·기관 매매동향" subtitle="30일 일별 순매수" />
          <BarChart2 seed="foreign-flow" width={520} height={200} bars={30} signed />
          <div className="sl-row" style={{ gap: 16, marginTop: 12, fontSize: 12, flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-up)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />외국인 순매수</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-brand)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />기관 순매수</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--sl-muted)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />개인</span>
          </div>
        </div>

        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="공매도 잔고 추이" subtitle="90일" />
          <AreaChart2 seed="short-trend" width={520} height={200} color="var(--sl-down)" fillOpacity={0.12} />
          <div className="sl-caption" style={{ marginTop: 8 }}>최근 30일 누적 공매도 잔고 +18% 증가 — 단기 부담 신호</div>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <SectionHeader title="대형 보유 기관" subtitle="2025 Q3 13F · 최근 변경" size="lg" />
          <span className="sl-caption">전체 1,247개 기관</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['기관', '보유 주식 수', '가치', '비중', '전 분기 대비', '최근 활동'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : 'right', padding: '10px 12px',
                  fontSize: 11, color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {institutions.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{r[0]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right' }}>{r[1]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right' }}>{r[2]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right' }}>{r[3]}</td>
                <td className="sl-mono" style={{
                  padding: '12px', textAlign: 'right', fontWeight: 600,
                  color: r[4].startsWith('+') ? 'var(--sl-up)' : r[4].startsWith('−') ? 'var(--sl-down)' : 'var(--sl-muted)',
                }}>{r[4]}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <span className={`sl-tag sl-tag-${r[6]}`}>{r[5]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StockShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab 8 — 목표주가 (Targets) — 컨센서스 + 고수 보유
// ─────────────────────────────────────────────────────────────
function StockTargetsDesign({ theme = 'light' }) {
  const opinions = [['강력 매수', 28, 'var(--sl-up)'], ['매수', 13, '#7da874'], ['보유', 9, 'var(--sl-muted)'], ['매도', 1, '#c08383'], ['강력 매도', 1, 'var(--sl-down)']];
  const reports = [
    ['12-18', 'Morgan Stanley · J. Moore', '매수', '$170', '$185', '데이터센터 가속기 점유율 88% 유지'],
    ['12-15', 'Wedbush · D. Ives', '강력매수', '$200', '$220', 'AI 슈퍼사이클 2027년까지 지속'],
    ['12-12', 'Bank of America · V. Arya', '매수', '$180', '$190', 'Blackwell 출하 가속'],
    ['12-08', 'Goldman Sachs · T. Hari', '매수', '$175', '$175', '실적 컨센서스 상향'],
    ['12-01', 'Morningstar · B. Colello', '보유', '$110', '$95', '고PER 부담 — 적정주가 하향'],
    ['11-25', 'JPMorgan · H. Sur', '매수', '$170', '$180', '경쟁 우위 지속'],
  ];
  const masters = [
    { n: 'Stanley Druckenmiller', f: '듀켄밀러 패밀리오피스', b: '비중 12.4%', c: '+ 매수 Q3', col: 'up', ic: 'D' },
    { n: 'Bill Ackman', f: 'Pershing Square', b: '비중 8.1%', c: '신규 매수', col: 'up', ic: 'A' },
    { n: 'Cathie Wood', f: 'ARK Invest', b: '비중 4.8%', c: '− 8% Q3', col: 'down', ic: 'W' },
    { n: 'Warren Buffett', f: 'Berkshire', b: '미보유', c: '—', col: 'muted', ic: 'B' },
    { n: 'Michael Burry', f: 'Scion', b: '미보유 (Put)', c: '+ Q3', col: 'down', ic: 'B' },
    { n: 'George Soros', f: 'Soros Fund', b: '비중 3.2%', c: '신규', col: 'up', ic: 'S' },
  ];

  return (
    <StockShell theme={theme} active="목표주가">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['평균 목표가', '$165.00', '+11.3% 상승여력', 'up'],
          ['최고 목표가', '$220.00', 'Wedbush', 'up'],
          ['최저 목표가', '$95.00', 'Morningstar', 'down'],
          ['커버 애널리스트', '52명', '매수 41 · 보유 9 · 매도 2', 'muted'],
        ].map(([l, v, d, c], i) => (
          <div key={i} className="sl-card" style={{ padding: 18 }}>
            <div className="sl-label">{l}</div>
            <div className="sl-num-lg" style={{ marginTop: 6, color: i === 0 ? 'var(--sl-up)' : undefined }}>{v}</div>
            <div className="sl-mono" style={{
              fontSize: 11, fontWeight: 600, marginTop: 6,
              color: c === 'up' ? 'var(--sl-up)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
            }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="목표가 분포" subtitle="$95 ~ $220 · 현재가 $148.20" />
          <div style={{ position: 'relative' }}>
            <BarChart2 seed="target-dist" width={580} height={200} bars={22} signed={false} />
            <div style={{ position: 'absolute', left: '32%', top: 0, bottom: 0, width: 2, background: 'var(--sl-brand)', borderRadius: 1 }} />
            <div style={{ position: 'absolute', left: '32%', top: -4, transform: 'translateX(-50%)', background: 'var(--sl-brand)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>현재가 $148.20</div>
          </div>
          <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
            <span className="sl-caption sl-mono">$95</span>
            <span className="sl-mono" style={{ fontWeight: 600 }}>평균 $165</span>
            <span className="sl-caption sl-mono">$220</span>
          </div>
        </div>

        <div className="sl-card" style={{ padding: 20 }}>
          <SectionHeader title="의견 분포" subtitle="52명 애널리스트" />
          <div className="sl-col" style={{ gap: 12 }}>
            {opinions.map(([l, v, c], i) => (
              <div key={i}>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l}</span>
                  <span className="sl-mono" style={{ fontSize: 13, fontWeight: 600 }}>{v}명</span>
                </div>
                <div style={{ height: 10, background: 'var(--sl-surfaceAlt)', borderRadius: 5 }}>
                  <div style={{ width: `${(v / 28) * 100}%`, height: '100%', background: c, borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sl-card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <SectionHeader title="최근 애널리스트 리포트" subtitle="30일" size="lg" />
          <span className="sl-caption">총 12건</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
              {['날짜', '증권사 / 애널리스트', '의견', '이전', '신규', '핵심 코멘트'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 3 || i === 4 ? 'right' : 'left',
                  padding: '10px 12px', fontSize: 11, color: 'var(--sl-muted)',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--sl-hairline)' }}>
                <td className="sl-mono" style={{ padding: '12px', color: 'var(--sl-inkSub)' }}>{r[0]}</td>
                <td style={{ padding: '12px', fontWeight: 500 }}>{r[1]}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`sl-tag ${r[2].includes('매수') ? 'sl-tag-up' : r[2].includes('매도') ? 'sl-tag-down' : ''}`}>{r[2]}</span>
                </td>
                <td className="sl-mono sl-caption" style={{ padding: '12px', textAlign: 'right' }}>{r[3]}</td>
                <td className="sl-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: parseInt(r[4].slice(1)) > parseInt(r[3].slice(1)) ? 'var(--sl-up)' : parseInt(r[4].slice(1)) < parseInt(r[3].slice(1)) ? 'var(--sl-down)' : undefined }}>{r[4]}</td>
                <td className="sl-sub" style={{ padding: '12px', fontSize: 12 }}>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        <SectionHeader title="이 종목을 보유한 고수" subtitle="13F 기준 · 분기별 갱신" size="lg" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {masters.map((m, i) => (
            <div key={i} className="sl-card-soft" style={{ padding: 16 }}>
              <div className="sl-row" style={{ gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--sl-cat${(i % 8) + 1}), var(--sl-cat${((i + 3) % 8) + 1}))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 12,
                }}>{m.ic}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.n}</div>
                  <div className="sl-caption" style={{ fontSize: 11 }}>{m.f}</div>
                </div>
              </div>
              <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>{m.b}</span>
                <span className="sl-mono" style={{
                  fontSize: 12, fontWeight: 700,
                  color: m.col === 'up' ? 'var(--sl-up)' : m.col === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                }}>{m.c}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StockShell>
  );
}

Object.assign(window, { StockSupplyDesign, StockTargetsDesign });
