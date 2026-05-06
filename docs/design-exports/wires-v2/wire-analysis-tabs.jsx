// Analysis sub-tabs — 시장 개요 / 시장 심리 / 기술적 / 재무
// 분석 허브에서 들어가는 4개 풀화면 와이어

const ANL_HEADER = ({ tabActive }) => {
  const tabs = ['시장 개요', '시장 심리', '기술적', '재무'];
  return (
    <div style={{ borderBottom: `1px solid ${W.hairline}`, padding: '12px 16px 0' }}>
      <div className="w-row" style={{ gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
        <h1 className="w-h1">분석</h1>
        <span className="w-faint" style={{ fontSize: 11 }}>· 시장 전체 데이터를 깊이 보는 도구들</span>
      </div>
      <div className="w-row">
        {tabs.map(t => (
          <div key={t} style={{
            padding: '8px 14px', fontSize: 12, cursor: 'pointer',
            fontWeight: t === tabActive ? 600 : 400, color: t === tabActive ? W.ink : W.muted,
            borderBottom: t === tabActive ? `2px solid ${W.ink}` : '2px solid transparent',
          }}>{t}</div>
        ))}
      </div>
    </div>
  );
};

// Analysis Tab 1 — 시장 개요
function WireAnalysisOverview() {
  return (
    <div className="w-root">
      <AppBar active="분석" />
      <ANL_HEADER tabActive="시장 개요" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <div className="w-row" style={{ gap: 6 }}>
          {['전체','미국','한국','선진국','신흥국'].map((t,i) => (
            <span key={t} className="w-pill" style={{ background: i === 0 ? W.fill : W.bg }}>{t}</span>
          ))}
          <div className="w-grow" />
          <span className="w-faint" style={{ fontSize: 10, alignSelf: 'center' }}>갱신 14:32 · KRX/Stooq</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {[
            ['S&P 500','5,884.21','+0.42%',W.up],
            ['NASDAQ','19,003.65','+0.81%',W.up],
            ['DOW','43,828.06','−0.18%',W.down],
            ['KOSPI','2,488.97','+0.24%',W.up],
            ['KOSDAQ','692.37','−0.66%',W.down],
            ['Nikkei','39,701.07','+0.34%',W.up],
          ].map(([n,v,d,c],i) => (
            <div key={i} className="w-card" style={{ padding: 10 }}>
              <div className="w-h3" style={{ fontSize: 9 }}>{n}</div>
              <div className="w-mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{v}</div>
              <div className="w-mono" style={{ fontSize: 10, color: c }}>{d}</div>
              <Sparkline seed={n} width={140} height={30} color={c} style={{ marginTop: 4 }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>섹터별 등락률 (오늘)</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[['IT',2.4],['커뮤니케이션',1.8],['소비재(임의)',0.9],['헬스케어',0.4],['금융',0.1],['에너지',-0.3],['소재',-0.6],['산업재',-0.4],['유틸리티',-0.8],['부동산',-1.2],['필수소비재',-0.2]].map(([l,v],i) => (
                <div key={i} className="w-row" style={{ gap: 8, fontSize: 11, padding: '3px 0' }}>
                  <span style={{ width: 90 }}>{l}</span>
                  <div style={{ flex: 1, height: 14, background: W.fill, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: W.line }} />
                    <div style={{ position: 'absolute', left: v >= 0 ? '50%' : `${50 + v*8}%`, top: 0, bottom: 0, width: `${Math.abs(v)*8}%`, background: v >= 0 ? W.up : W.down }} />
                  </div>
                  <span className="w-mono" style={{ width: 50, textAlign: 'right', color: v >= 0 ? W.up : W.down }}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>국가별 — 오늘</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <table style={{ width: '100%', fontSize: 11 }}>
              <thead><tr style={{ background: W.fill }}>
                <th style={{ padding: 4, textAlign: 'left' }}>국가</th>
                <th style={{ padding: 4, textAlign: 'right' }}>지수</th>
                <th style={{ padding: 4, textAlign: 'right' }}>등락</th>
                <th style={{ padding: 4, textAlign: 'right' }}>YTD</th>
              </tr></thead>
              <tbody>
                {[['🇺🇸 미국','+0.42%','+24.8%'],['🇰🇷 한국','+0.24%','−6.2%'],['🇯🇵 일본','+0.34%','+18.4%'],['🇨🇳 중국','−0.81%','+12.1%'],['🇩🇪 독일','+0.18%','+19.7%'],['🇬🇧 영국','+0.04%','+8.4%'],['🇹🇼 대만','+1.12%','+28.4%'],['🇮🇳 인도','+0.42%','+11.8%']].map((r,i) => (
                  <tr key={i}><td style={{ padding: 4 }}>{r[0]}</td><td className="w-mono" style={{ padding: 4, textAlign: 'right' }}>—</td><td className="w-mono" style={{ padding: 4, textAlign: 'right', color: r[1].startsWith('+') ? W.up : W.down }}>{r[1]}</td><td className="w-mono w-faint" style={{ padding: 4, textAlign: 'right' }}>{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>거래대금 상위 (오늘)</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['🇺🇸 미국 (US$ M)',[['NVDA','12,840','+1.6%'],['TSLA','9,420','+3.4%'],['AAPL','7,180','+0.4%'],['MSFT','5,940','+0.8%'],['META','4,820','−0.6%']]],['🇰🇷 한국 (억원)',[['삼성전자','8,420','+0.3%'],['SK하이닉스','7,210','+1.2%'],['LG에너지솔루션','4,840','−0.8%'],['삼성바이오','3,210','+2.1%'],['NAVER','2,940','+0.4%']]]].map(([title, rows],i) => (
              <div key={i}>
                <div className="w-h3" style={{ fontSize: 10, marginBottom: 6 }}>{title}</div>
                <table style={{ width: '100%', fontSize: 11 }}>
                  <tbody>
                    {rows.map((r,j) => (
                      <tr key={j}><td style={{ padding: 3 }}>{r[0]}</td><td className="w-mono" style={{ padding: 3, textAlign: 'right' }}>{r[1]}</td><td className="w-mono" style={{ padding: 3, textAlign: 'right', color: r[2].startsWith('+') ? W.up : W.down }}>{r[2]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Analysis Tab 2 — 시장 심리 (공포·탐욕 게이지 9개 풀화면)
function WireAnalysisSentiment() {
  const gauges = [
    ['VIX', 14.2, '낮음 (과도한 안도)', W.down],
    ['Fear & Greed Index', 72, '탐욕', W.up],
    ['Put/Call Ratio', 0.84, '중립', W.muted],
    ['AAII 투자자 심리', '47.2%', '강세 우위', W.up],
    ['NAAIM 노출지수', 88, '높음', W.up],
    ['High-Low Index', 64, '확장세', W.up],
    ['신용잔고', '+8.4%', '증가세', W.up],
    ['VKOSPI', 18.4, '평균', W.muted],
    ['외국인 순매수 (5d)', '−$420M', '매도세', W.down],
  ];
  return (
    <div className="w-root">
      <AppBar active="분석" />
      <ANL_HEADER tabActive="시장 심리" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <div className="w-card-soft" style={{ padding: 10 }}>
          <div className="w-row" style={{ gap: 12 }}>
            <div style={{ width: 80, height: 80, border: `2px solid ${W.up}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="w-mono" style={{ fontSize: 22, fontWeight: 700, color: W.up }}>72</div>
                <div className="w-faint" style={{ fontSize: 9 }}>탐욕</div>
              </div>
            </div>
            <div className="w-grow">
              <h2 className="w-h2" style={{ marginBottom: 4 }}>오늘의 시장 심리: 탐욕 (Greed)</h2>
              <div className="w-faint" style={{ fontSize: 11, lineHeight: 1.6 }}>
                9개 지표 중 6개 강세·1개 약세·2개 중립. VIX 14.2로 변동성 매우 낮음 — 과도한 안도 신호. 신용잔고 증가, 노출지수 88 — 단기 과열 가능성. 한국은 외국인 매도세로 약세 신호 혼재.
              </div>
              <div className="w-faint" style={{ fontSize: 9, marginTop: 4 }}>출처: Gemini 1.5 Flash · 매 4시간 갱신</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {gauges.map(([n,v,d,c],i) => (
            <div key={i} className="w-card" style={{ padding: 12 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="w-h3">{n}</div>
                <span className="w-faint" style={{ fontSize: 9 }}>실시간</span>
              </div>
              <div className="w-rule" style={{ marginBottom: 8 }} />
              <div className="w-row" style={{ alignItems: 'baseline', gap: 8 }}>
                <span className="w-mono" style={{ fontSize: 22, fontWeight: 700 }}>{v}</span>
                <span className="w-mono" style={{ fontSize: 11, color: c }}>{d}</span>
              </div>
              <div style={{ height: 6, background: W.fill, marginTop: 8, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '70%', background: c, opacity: 0.7 }} />
              </div>
              <Sparkline seed={n+'-90d'} width={300} height={36} color={c} style={{ marginTop: 8 }} />
              <div className="w-faint" style={{ fontSize: 9, marginTop: 4 }}>90일 추이</div>
            </div>
          ))}
        </div>

        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>심리 종합 점수 — 1년 추이</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <AreaChart seed="sentiment-1y" width={1080} height={140} color={W.up} />
          <div className="w-row" style={{ marginTop: 4, justifyContent: 'space-between', fontSize: 10 }}>
            <span className="w-faint">1Y ago</span>
            <span className="w-faint">현재 72 (탐욕)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analysis Tab 3 — 기술적
function WireAnalysisTechnical() {
  return (
    <div className="w-root">
      <AppBar active="분석" />
      <ANL_HEADER tabActive="기술적" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <div className="w-row" style={{ gap: 6 }}>
          {['전체 시장','S&P500','KOSPI','내 관심종목'].map((t,i) => (
            <span key={t} className="w-pill" style={{ background: i === 1 ? W.fill : W.bg }}>{t}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[['52주 신고가','82종목','전일 71',W.up],['52주 신저가','12종목','전일 18',W.up],['MA200 위','78%','상승추세 강함',W.up],['골든크로스 (7일)','24건','매수 신호',W.up]].map(([l,v,d,c],i) => (
            <div key={i} className="w-card" style={{ padding: 10 }}>
              <div className="w-h3">{l}</div>
              <div className="w-mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{v}</div>
              <div className="w-mono" style={{ fontSize: 10, color: c }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>RSI 분포 (S&P500)</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <BarChart seed="rsi-dist" width={460} height={140} bars={20} />
            <div className="w-row" style={{ justifyContent: 'space-between', marginTop: 4, fontSize: 10 }}>
              <span className="w-faint">과매도 (&lt;30)</span><span className="w-faint">중립</span><span className="w-faint">과매수 (&gt;70)</span>
            </div>
          </div>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>Advance/Decline Line</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <AreaChart seed="ad-line" width={460} height={140} color={W.up} />
            <div className="w-faint" style={{ fontSize: 10, marginTop: 4 }}>상승 332 · 하락 168 · 보합 12</div>
          </div>
        </div>

        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>오늘의 기술 신호</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead><tr style={{ background: W.fill }}>
              <th style={{ padding: 6, textAlign: 'left' }}>종목</th>
              <th style={{ padding: 6, textAlign: 'left' }}>신호</th>
              <th style={{ padding: 6, textAlign: 'right' }}>현재가</th>
              <th style={{ padding: 6, textAlign: 'right' }}>변동</th>
              <th style={{ padding: 6, textAlign: 'right' }}>RSI</th>
              <th style={{ padding: 6, textAlign: 'right' }}>거래량 비율</th>
              <th style={{ padding: 6, textAlign: 'right' }}>차트</th>
            </tr></thead>
            <tbody>
              {[
                ['AAPL · Apple','골든크로스','$229.4','+0.4%',58,'1.2x',W.up],
                ['NVDA · NVIDIA','신고가 돌파','$148.2','+1.6%',78,'2.1x',W.up],
                ['TSLA · Tesla','RSI 과매수','$378.4','+3.4%',82,'1.8x',W.down],
                ['삼성전자','이중 바닥','55,400','+0.3%',42,'0.9x',W.up],
                ['SK하이닉스','데드크로스','148,300','−1.2%',38,'1.4x',W.down],
                ['META · Meta','갭 상승','$580.4','+2.4%',68,'1.6x',W.up],
              ].map((r,i) => (
                <tr key={i}>
                  <td style={{ padding: 6, borderBottom: `1px solid ${W.hairline}` }}>{r[0]}</td>
                  <td style={{ padding: 6, borderBottom: `1px solid ${W.hairline}` }}><span className="w-pill" style={{ fontSize: 9, color: r[6] }}>{r[1]}</span></td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[2]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', color: r[3].startsWith('+') ? W.up : W.down, borderBottom: `1px solid ${W.hairline}` }}>{r[3]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[4]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[5]}</td>
                  <td style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}><Sparkline seed={r[0]} width={80} height={20} color={r[6]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analysis Tab 4 — 재무 (시장 전체 재무 비교)
function WireAnalysisFinancial() {
  return (
    <div className="w-root">
      <AppBar active="분석" />
      <ANL_HEADER tabActive="재무" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <div className="w-row" style={{ gap: 6 }}>
          {['섹터별','시총별','국가별'].map((t,i) => (
            <span key={t} className="w-pill" style={{ background: i === 0 ? W.fill : W.bg }}>{t}</span>
          ))}
          <div className="w-vrule" />
          {['PER','PBR','ROE','부채비율','매출성장'].map((t,i) => (
            <span key={t} className="w-pill" style={{ background: i === 0 ? W.fill : W.bg }}>{t}</span>
          ))}
        </div>

        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>섹터별 평균 PER (S&P500)</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <BarChart seed="sector-per" width={1080} height={160} bars={11} />
          <div className="w-row" style={{ marginTop: 8, gap: 12, fontSize: 10, flexWrap: 'wrap' }}>
            {['IT 32x','커뮤니케이션 24x','임의소비재 26x','산업재 22x','헬스케어 18x','금융 14x','필수소비재 21x','에너지 11x','유틸리티 18x','부동산 28x','소재 17x'].map((s,i) => (
              <span key={i} className="w-faint">{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>섹터별 ROE 분포</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <BarChart seed="roe-dist" width={460} height={140} bars={11} />
          </div>
          <div className="w-card" style={{ padding: 12 }}>
            <h2 className="w-h2" style={{ marginBottom: 8 }}>섹터별 매출 성장률 (YoY)</h2>
            <div className="w-rule" style={{ marginBottom: 8 }} />
            <BarChart seed="growth-dist" width={460} height={140} bars={11} />
          </div>
        </div>

        <div className="w-card" style={{ padding: 12 }}>
          <h2 className="w-h2" style={{ marginBottom: 8 }}>국가별 시장 평균 (한미 비교)</h2>
          <div className="w-rule" style={{ marginBottom: 8 }} />
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead><tr style={{ background: W.fill }}>
              <th style={{ padding: 6, textAlign: 'left' }}>지표</th>
              <th style={{ padding: 6, textAlign: 'right' }}>S&P500</th>
              <th style={{ padding: 6, textAlign: 'right' }}>KOSPI</th>
              <th style={{ padding: 6, textAlign: 'right' }}>차이</th>
              <th style={{ padding: 6, textAlign: 'right' }}>5Y 평균 (S&P500)</th>
              <th style={{ padding: 6, textAlign: 'right' }}>5Y 평균 (KOSPI)</th>
            </tr></thead>
            <tbody>
              {[
                ['PER (가중평균)', '24.8', '11.2', '−54.8%', '21.4', '12.4'],
                ['PBR', '4.8', '0.94', '−80.4%', '4.1', '1.04'],
                ['ROE', '18.4%', '8.1%', '−10.3%p', '17.2%', '8.8%'],
                ['배당수익률', '1.3%', '2.1%', '+0.8%p', '1.5%', '1.9%'],
                ['EPS 성장 (YoY)', '+12.4%', '+4.2%', '−8.2%p', '+9.8%', '+3.4%'],
                ['부채비율', '88%', '94%', '+6%p', '82%', '92%'],
              ].map((r,i) => (
                <tr key={i}>
                  <td style={{ padding: 6, borderBottom: `1px solid ${W.hairline}` }}>{r[0]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[1]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[2]}</td>
                  <td className="w-mono" style={{ padding: 6, textAlign: 'right', color: W.muted, borderBottom: `1px solid ${W.hairline}` }}>{r[3]}</td>
                  <td className="w-mono w-faint" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[4]}</td>
                  <td className="w-mono w-faint" style={{ padding: 6, textAlign: 'right', borderBottom: `1px solid ${W.hairline}` }}>{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.WireAnalysisOverview = WireAnalysisOverview;
window.WireAnalysisSentiment = WireAnalysisSentiment;
window.WireAnalysisTechnical = WireAnalysisTechnical;
window.WireAnalysisFinancial = WireAnalysisFinancial;
