// Stock Detail design — header + tabs + chart + key metrics
function StockDetailDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 32px 60px' }}>
          {/* Breadcrumb */}
          <div className="sl-caption" style={{ marginBottom: 12 }}>홈 / 종목 검색 / NVDA</div>

          {/* Header */}
          <div className="sl-card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="sl-row" style={{ gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--sl-cat3), var(--sl-cat2))', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>N</div>
              <div className="sl-grow">
                <div className="sl-row" style={{ gap: 10, marginBottom: 6 }}>
                  <h1 className="sl-h1">NVIDIA</h1>
                  <span className="sl-tag sl-mono">NVDA</span>
                  <span className="sl-tag">NASDAQ</span>
                  <span className="sl-tag sl-tag-brand">반도체</span>
                </div>
                <div className="sl-row" style={{ gap: 16, alignItems: 'baseline' }}>
                  <span className="sl-num-xl sl-mono">$487.32</span>
                  <ChangePill pct={2.84} abs={13.42} size="lg" />
                  <span className="sl-caption">실시간 · 14:32:18 ET</span>
                </div>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <div className="sl-row" style={{ gap: 8 }}>
                  <button className="sl-btn sl-btn-ghost">★ 관심</button>
                  <button className="sl-btn sl-btn-ghost">🔔 알림</button>
                  <button className="sl-btn sl-btn-primary">+ 거래 기록</button>
                </div>
                <div className="sl-row" style={{ gap: 16, marginTop: 12, justifyContent: 'flex-end' }}>
                  <div><div className="sl-label">시가총액</div><div className="sl-num-sm sl-mono" style={{ marginTop: 2 }}>$1.20T</div></div>
                  <div><div className="sl-label">거래량</div><div className="sl-num-sm sl-mono" style={{ marginTop: 2 }}>42.8M</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sl-row" style={{ gap: 4, borderBottom: '1px solid var(--sl-line)', marginBottom: 20 }}>
            {['개요','차트','재무','적정가치','공시·실적','뉴스','수급','컨센서스'].map((t, i) => (
              <span key={t} style={{
                padding: '10px 16px', fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? 'var(--sl-brand)' : 'var(--sl-inkSub)',
                borderBottom: i === 0 ? '2px solid var(--sl-brand)' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}>{t}</span>
            ))}
          </div>

          {/* Content: 3-column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div className="sl-col" style={{ gap: 16 }}>
              {/* Chart */}
              <div className="sl-card" style={{ padding: 20 }}>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
                  <div className="sl-row" style={{ gap: 4 }}>
                    {['1D','1W','1M','3M','6M','1Y','5Y','MAX'].map((p, i) => (
                      <span key={p} className="sl-pill" data-active={i === 5 ? 'true' : undefined}>{p}</span>
                    ))}
                  </div>
                  <div className="sl-row" style={{ gap: 4 }}>
                    <span className="sl-pill" data-active="true">캔들</span>
                    <span className="sl-pill">선</span>
                    <span className="sl-pill">영역</span>
                  </div>
                </div>
                <PriceChart up={true} width={780} height={300} />
                <div className="sl-row" style={{ gap: 8, marginTop: 12 }}>
                  {['MA20','MA60','볼린저','거래량','RSI'].map((ind, i) => (
                    <span key={ind} className="sl-pill" data-active={i < 2 ? 'true' : undefined} style={{ fontSize: 11 }}>{ind}</span>
                  ))}
                  <span className="sl-grow" />
                  <span className="sl-caption">전체 지표 40+ →</span>
                </div>
              </div>

              {/* Key metrics */}
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="핵심 지표" subtitle="동종업계 대비" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { l: 'PER', v: '68.4', sub: '업계 32.1', high: true },
                    { l: 'PBR', v: '52.8', sub: '업계 18.4', high: true },
                    { l: 'ROE', v: '124.1%', sub: '업계 22.4%', good: true },
                    { l: '영업이익률', v: '62.1%', sub: '업계 18.2%', good: true },
                    { l: '부채비율', v: '17.2%', sub: '업계 42.1%', good: true },
                    { l: '배당수익률', v: '0.03%', sub: '업계 1.2%' },
                    { l: '52주 고가', v: '$502.18', sub: '-2.9%' },
                    { l: '52주 저가', v: '$108.13', sub: '+350.6%' },
                  ].map(m => (
                    <div key={m.l} className="sl-card-soft" style={{ padding: 14 }}>
                      <div className="sl-label">{m.l}</div>
                      <div className="sl-num-md sl-mono" style={{ marginTop: 4, color: m.high ? 'var(--sl-down)' : m.good ? 'var(--sl-up)' : undefined }}>{m.v}</div>
                      <div className="sl-caption" style={{ marginTop: 2, fontSize: 11 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News */}
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="관련 뉴스" subtitle="최신 24시간" />
                <div className="sl-col" style={{ gap: 0 }}>
                  {[
                    { src: 'Reuters', time: '2시간 전', title: 'NVIDIA, H200 양산 본격화 — Microsoft·Meta가 첫 출하', tag: '신제품' },
                    { src: 'Bloomberg', time: '5시간 전', title: 'AI 칩 수출 규제 완화 검토 — 중국 매출 회복 기대', tag: '규제' },
                    { src: 'CNBC', time: '8시간 전', title: 'Goldman, NVDA 목표가 $620으로 상향', tag: '리포트' },
                    { src: 'WSJ', time: '12시간 전', title: 'OpenAI, NVIDIA에 H200 100만대 추가 발주', tag: '대형' },
                  ].map((n, i) => (
                    <div key={i} className="sl-row" style={{ gap: 12, padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none', cursor: 'pointer' }}>
                      <span className="sl-tag sl-tag-brand">{n.tag}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }} className="sl-grow">{n.title}</span>
                      <span className="sl-caption">{n.src} · {n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side */}
            <div className="sl-col" style={{ gap: 16 }}>
              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="컨센서스" subtitle="42명 애널리스트" />
                <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                  <div className="sl-num-lg" style={{ color: 'var(--sl-up)' }}>매수</div>
                  <div className="sl-caption" style={{ marginTop: 4 }}>강력 매수 18 · 매수 16 · 보유 6 · 매도 2</div>
                </div>
                <div className="sl-rule" />
                <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                  <span className="sl-label">목표주가</span>
                  <span className="sl-num-md sl-mono">$582.40</span>
                </div>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="sl-caption">상승 여력</span>
                  <span className="sl-mono sl-up" style={{ fontSize: 13, fontWeight: 600 }}>+19.5%</span>
                </div>
              </div>

              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="유사 종목" subtitle="섹터·시총 기준" />
                <div className="sl-col" style={{ gap: 10 }}>
                  {[
                    { tk: 'AMD', n: 'AMD', pct: 1.84 },
                    { tk: 'TSM', n: 'TSMC', pct: 0.94 },
                    { tk: 'AVGO', n: 'Broadcom', pct: 2.18 },
                    { tk: 'MU', n: 'Micron', pct: -0.42 },
                    { tk: 'INTC', n: 'Intel', pct: -1.24 },
                  ].map(s => (
                    <div key={s.tk} className="sl-row" style={{ gap: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: '0 0 50px' }}>{s.tk}</span>
                      <span className="sl-caption sl-grow" style={{ fontSize: 12 }}>{s.n}</span>
                      <ChangePill pct={s.pct} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="sl-card" style={{ padding: 18 }}>
                <SectionHeader title="고수 보유" subtitle="13F 추적" />
                <div className="sl-col" style={{ gap: 10 }}>
                  {[
                    { n: 'Stanley Druckenmiller', pct: 12.4, dir: 'up' },
                    { n: 'Bill Ackman', pct: 8.2, dir: 'up' },
                    { n: 'David Tepper', pct: 6.8, dir: 'down' },
                  ].map(m => (
                    <div key={m.n} className="sl-row" style={{ gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sl-cat4)', flex: '0 0 auto' }} />
                      <span style={{ fontSize: 12, fontWeight: 500 }} className="sl-grow">{m.n}</span>
                      <span className="sl-mono" style={{ fontSize: 11, color: 'var(--sl-inkSub)' }}>{m.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// Portfolio design
function PortfolioDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <SLAppBar active="portfolio" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <h1 className="sl-h1">포트폴리오</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>주 계좌 · 갱신 14:32</div>
            </div>
            <button className="sl-btn sl-btn-primary">+ 거래 기록</button>
          </div>

          {/* Hero */}
          <div className="sl-card" style={{ padding: 28, marginBottom: 20, background: 'linear-gradient(135deg, var(--sl-brandSoft), var(--sl-surface))' }}>
            <div className="sl-row" style={{ alignItems: 'flex-end', gap: 32, marginBottom: 24 }}>
              <div>
                <div className="sl-label">총 자산</div>
                <div className="sl-num-xl sl-mono" style={{ marginTop: 4 }}>₩ 124,820,400</div>
                <div className="sl-row" style={{ gap: 10, marginTop: 8 }}>
                  <ChangePill pct={3.42} abs={4128400} size="lg" />
                  <span className="sl-caption">전일 대비</span>
                </div>
              </div>
              <div className="sl-grow" />
              <div style={{ flex: '0 0 auto' }}>
                <PriceChart up={true} width={380} height={120} />
              </div>
            </div>
            <div className="sl-row" style={{ gap: 32 }}>
              {[
                { l: '평가손익', v: '+₩ 18,420,400', up: true },
                { l: '수익률', v: '+17.32%', up: true },
                { l: '실현손익 (YTD)', v: '+₩ 4,820,000', up: true },
                { l: '예수금', v: '₩ 8,400,000' },
              ].map(s => (
                <div key={s.l}>
                  <div className="sl-label">{s.l}</div>
                  <div className="sl-num-md sl-mono" style={{ marginTop: 4, color: s.up ? 'var(--sl-up)' : undefined }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="sl-row" style={{ gap: 4, borderBottom: '1px solid var(--sl-line)', marginBottom: 20 }}>
            {['요약','보유 종목','거래 내역','성과'].map((t, i) => (
              <span key={t} style={{
                padding: '10px 16px', fontSize: 13, fontWeight: i === 1 ? 600 : 500,
                color: i === 1 ? 'var(--sl-brand)' : 'var(--sl-inkSub)',
                borderBottom: i === 1 ? '2px solid var(--sl-brand)' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}>{t}</span>
            ))}
          </div>

          {/* Holdings table */}
          <div className="sl-card">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sl-line)' }}>
                  {['종목','보유수량','평단','현재가','평가액','평가손익','수익률','비중'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '14px 16px', fontSize: 11, color: 'var(--sl-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { tk: 'NVDA', n: 'NVIDIA', qty: 80, avg: '$324.18', cur: '$487.32', val: '₩ 50,840,200', pl: '+₩ 17,028,400', plPct: 50.32, w: 40.7 },
                  { tk: '005930', n: '삼성전자', qty: 420, avg: '₩ 68,400', cur: '₩ 74,200', val: '₩ 31,164,000', pl: '+₩ 2,436,000', plPct: 8.48, w: 25.0 },
                  { tk: 'AAPL', n: 'Apple', qty: 60, avg: '$178.42', cur: '$192.84', val: '₩ 15,124,800', pl: '+₩ 1,128,400', plPct: 8.08, w: 12.1 },
                  { tk: '000660', n: 'SK하이닉스', qty: 80, avg: '₩ 142,000', cur: '₩ 156,800', val: '₩ 12,544,000', pl: '+₩ 1,184,000', plPct: 10.42, w: 10.0 },
                  { tk: 'MSFT', n: 'Microsoft', qty: 25, avg: '$378.20', cur: '$412.18', val: '₩ 13,506,400', pl: '+₩ 1,108,400', plPct: 8.98, w: 10.8 },
                ].map((h, i) => (
                  <tr key={h.tk} style={{ borderBottom: i < 4 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="sl-row" style={{ gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `var(--sl-cat${(i%8)+1})`, opacity: 0.2, flex: '0 0 auto' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{h.tk}</div>
                          <div className="sl-caption" style={{ fontSize: 11 }}>{h.n}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} className="sl-mono">{h.qty}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} className="sl-mono">{h.avg}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} className="sl-mono">{h.cur}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }} className="sl-mono">{h.val}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} className="sl-mono sl-up" >{h.pl}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}><ChangePill pct={h.plPct} size="sm" /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div className="sl-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <div style={{ width: 50, height: 6, background: 'var(--sl-surfaceAlt)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(h.w/40.7)*100}%`, height: '100%', background: 'var(--sl-brand)' }} />
                        </div>
                        <span className="sl-num-sm" style={{ minWidth: 40 }}>{h.w}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Allocation + performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="자산 배분" subtitle="섹터별" />
              <div className="sl-col" style={{ gap: 10 }}>
                {[
                  { n: '반도체', pct: 50.7, c: 'var(--sl-cat1)' },
                  { n: '소비재 (Tech)', pct: 22.9, c: 'var(--sl-cat2)' },
                  { n: '소프트웨어', pct: 10.8, c: 'var(--sl-cat3)' },
                  { n: '통신', pct: 8.4, c: 'var(--sl-cat4)' },
                  { n: '기타', pct: 7.2, c: 'var(--sl-cat5)' },
                ].map(s => (
                  <div key={s.n} className="sl-row" style={{ gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: s.c, flex: '0 0 auto' }} />
                    <span className="sl-grow" style={{ fontSize: 13 }}>{s.n}</span>
                    <span className="sl-num-sm">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="내 수익률 vs 벤치마크" subtitle="YTD" />
              <PriceChart up={true} width={520} height={200} />
              <div className="sl-row" style={{ gap: 24, marginTop: 12 }}>
                <div className="sl-row" style={{ gap: 6 }}>
                  <span style={{ width: 12, height: 2, background: 'var(--sl-brand)' }} />
                  <span className="sl-caption">내 포트폴리오 +17.3%</span>
                </div>
                <div className="sl-row" style={{ gap: 6 }}>
                  <span style={{ width: 12, height: 2, background: 'var(--sl-muted)' }} />
                  <span className="sl-caption">S&P 500 +12.8%</span>
                </div>
                <div className="sl-row" style={{ gap: 6 }}>
                  <span style={{ width: 12, height: 2, background: 'var(--sl-cat3)' }} />
                  <span className="sl-caption">KOSPI +6.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

Object.assign(window, { StockDetailDesign, PortfolioDesign });
