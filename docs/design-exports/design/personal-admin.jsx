// Personal & admin · Transactions / Account Settings / Admin Dashboard
// MyPage is already in design/learn-mypage-login.jsx

// ─────────────────────────────────────────────────────────────
// Shared local helpers
// ─────────────────────────────────────────────────────────────
function SLSidePanel({ active, items, danger }) {
  return (
    <div style={{ width: 220, padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map(it => (
        <div key={it} style={{
          padding: '9px 12px', fontSize: 13, borderRadius: 8,
          background: it === active ? (danger ? 'var(--sl-downSoft)' : 'var(--sl-brandSoft)') : 'transparent',
          color: it === active ? (danger ? 'var(--sl-down)' : 'var(--sl-brand)') : 'var(--sl-inkSub)',
          fontWeight: it === active ? 600 : 500, cursor: 'pointer',
        }}>{it}</div>
      ))}
    </div>
  );
}

function FormRow({ label, hint, children }) {
  return (
    <div className="sl-row" style={{ padding: '20px 0', borderBottom: '1px solid var(--sl-hairline)', alignItems: 'flex-start', gap: 24 }}>
      <div style={{ width: 180, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        {hint && <div className="sl-caption" style={{ marginTop: 4 }}>{hint}</div>}
      </div>
      <div className="sl-grow">{children}</div>
    </div>
  );
}

function PillGroup({ items, active }) {
  return (
    <div className="sl-row" style={{ gap: 6 }}>
      {items.map(c => (
        <span key={c} className="sl-pill" data-active={c === active ? 'true' : undefined}>{c}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────
function TransactionsDesign({ theme = 'light' }) {
  const txs = [
    { d: '2026-05-04', t: '매수', s: 'AAPL', name: 'Apple Inc.', q: 10, p: '184.32', cur: 'USD', total: '1,843.20', fee: '0.50' },
    { d: '2026-04-28', t: '매도', s: 'TSLA', name: 'Tesla Inc.', q: 5, p: '224.10', cur: 'USD', total: '1,120.50', fee: '0.40' },
    { d: '2026-04-22', t: '매수', s: '005930', name: '삼성전자', q: 50, p: '78,400', cur: 'KRW', total: '3,920,000', fee: '785' },
    { d: '2026-04-15', t: '배당', s: 'MSFT', name: 'Microsoft', q: 0, p: '0.83', cur: 'USD', total: '4.15', fee: '0' },
    { d: '2026-04-10', t: '매수', s: 'NVDA', name: 'NVIDIA', q: 4, p: '880.40', cur: 'USD', total: '3,521.60', fee: '0.80' },
    { d: '2026-04-02', t: '매도', s: '000660', name: 'SK하이닉스', q: 20, p: '202,000', cur: 'KRW', total: '4,040,000', fee: '808' },
    { d: '2026-03-28', t: '입금', s: '—', name: 'KRW 계좌 입금', q: 0, p: '—', cur: 'KRW', total: '5,000,000', fee: '0' },
  ];
  const tagFor = t => t === '매수' ? 'sl-tag-up' : t === '매도' ? 'sl-tag-down' : t === '배당' ? 'sl-tag-brand' : '';

  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div className="sl-caption" style={{ marginBottom: 4 }}>마이페이지 / 거래 내역</div>
              <h1 className="sl-h1">거래 내역</h1>
              <div className="sl-caption" style={{ marginTop: 6 }}>매수·매도·배당 기록을 입력하면 포트폴리오에 자동 반영됩니다 · 124건</div>
            </div>
            <div className="sl-row" style={{ gap: 8 }}>
              <button className="sl-btn sl-btn-ghost">CSV 가져오기</button>
              <button className="sl-btn sl-btn-secondary">내보내기</button>
              <button className="sl-btn sl-btn-primary">+ 거래 입력</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              ['총 거래', '124', '건'],
              ['올해 매수', '₩ 12.4M', null],
              ['올해 매도', '₩ 8.2M', null],
              ['실현 손익', '+₩ 1,840,200', 'up'],
              ['수수료/세금', '₩ 84,300', null],
            ].map(([l, v, c], i) => (
              <div key={i} className="sl-card" style={{ padding: 18 }}>
                <div className="sl-label">{l}</div>
                <div className="sl-num-md sl-mono" style={{ marginTop: 6, color: c === 'up' ? 'var(--sl-up)' : undefined }}>{v}</div>
                {typeof c === 'string' && c !== 'up' && <div className="sl-caption" style={{ marginTop: 2 }}>{c}</div>}
              </div>
            ))}
          </div>

          <div className="sl-row" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <input className="sl-input" placeholder="종목 검색" style={{ width: 240 }} />
            <PillGroup items={['전체', '매수', '매도', '배당', '입출금']} active="전체" />
            <span className="sl-grow" />
            <span className="sl-pill">기간 · 2026 ⌄</span>
            <span className="sl-pill">통화 · 전체 ⌄</span>
          </div>

          <div className="sl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--sl-surfaceAlt)' }}>
                  {[['날짜', 'left'], ['구분', 'left'], ['종목', 'left'], ['수량', 'right'], ['단가', 'right'], ['통화', 'left'], ['금액', 'right'], ['수수료', 'right'], ['', 'right']].map(([h, a], i) => (
                    <th key={i} style={{
                      textAlign: a, padding: '14px 16px', fontSize: 11,
                      color: 'var(--sl-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--sl-hairline)' }}>
                    <td className="sl-mono" style={{ padding: '14px 16px', color: 'var(--sl-inkSub)' }}>{r.d}</td>
                    <td style={{ padding: '14px 16px' }}><span className={`sl-tag ${tagFor(r.t)}`}>{r.t}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="sl-mono" style={{ fontWeight: 700, fontSize: 13 }}>{r.s}</div>
                      <div className="sl-caption" style={{ fontSize: 11 }}>{r.name}</div>
                    </td>
                    <td className="sl-mono" style={{ padding: '14px 16px', textAlign: 'right' }}>{r.q || '—'}</td>
                    <td className="sl-mono" style={{ padding: '14px 16px', textAlign: 'right' }}>{r.p}</td>
                    <td className="sl-mono sl-caption" style={{ padding: '14px 16px' }}>{r.cur}</td>
                    <td className="sl-mono" style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700 }}>{r.total}</td>
                    <td className="sl-mono sl-caption" style={{ padding: '14px 16px', textAlign: 'right' }}>{r.fee}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--sl-muted)' }}>⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Account Settings
// ─────────────────────────────────────────────────────────────
function SettingsDesign({ theme = 'light' }) {
  const sidebar = ['프로필', '비밀번호', '연결된 소셜', '시장 / 통화', '언어 / 타임존', '테마', '알림 설정', '데이터 내보내기', '회원 탈퇴'];

  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 60px' }}>
          <div className="sl-row" style={{ alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <h1 className="sl-h1">계정 설정</h1>
            <span className="sl-caption">프로필</span>
          </div>

          <div className="sl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="sl-row" style={{ alignItems: 'stretch' }}>
              <div style={{ borderRight: '1px solid var(--sl-hairline)', flexShrink: 0 }}>
                <SLSidePanel active="프로필" items={sidebar} />
              </div>
              <div style={{ flex: 1, padding: '32px 40px', maxWidth: 760 }}>
                <FormRow label="프로필 사진">
                  <div className="sl-row" style={{ gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--sl-cat4), var(--sl-cat1))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 26,
                    }}>홍</div>
                    <button className="sl-btn sl-btn-secondary">업로드</button>
                    <button className="sl-btn sl-btn-ghost">제거</button>
                  </div>
                </FormRow>
                <FormRow label="이름">
                  <input className="sl-input" style={{ width: 320 }} defaultValue="홍길동" />
                </FormRow>
                <FormRow label="닉네임" hint="댓글·일지 작성 시 표시됩니다">
                  <input className="sl-input" style={{ width: 320 }} defaultValue="value_hunter" />
                </FormRow>
                <FormRow label="이메일">
                  <div className="sl-row" style={{ gap: 12, alignItems: 'center' }}>
                    <input className="sl-input" style={{ width: 320 }} defaultValue="hong@example.com" />
                    <span className="sl-tag sl-tag-up">✓ 인증됨</span>
                  </div>
                </FormRow>
                <FormRow label="기본 통화" hint="포트폴리오 환산 기준">
                  <PillGroup items={['KRW', 'USD', 'EUR', 'JPY']} active="KRW" />
                </FormRow>
                <FormRow label="언어">
                  <PillGroup items={['한국어', 'English', '한·영 혼용']} active="한·영 혼용" />
                </FormRow>
                <FormRow label="테마" hint="시스템 따르기 권장">
                  <PillGroup items={['시스템', '라이트', '다크']} active="시스템" />
                </FormRow>
                <FormRow label="알림 환경설정">
                  <div className="sl-col" style={{ gap: 10 }}>
                    {['가격 알림 (도달 시)', '기술적 신호 (골든크로스 등)', '관심 고수 13F 업데이트', '배당 기준일 임박', '관심종목 공시', '주간 시장 리포트'].map((t, i) => (
                      <label key={t} className="sl-row" style={{ gap: 10, fontSize: 13 }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: '1.5px solid var(--sl-brand)',
                          background: 'var(--sl-brand)',
                          color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✓</span>
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </FormRow>
                <div className="sl-row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button className="sl-btn sl-btn-ghost">취소</button>
                  <button className="sl-btn sl-btn-primary">변경사항 저장</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────
function AdminDesign({ theme = 'light' }) {
  const sidebar = ['대시보드', '고수 (Masters)', '13F 파싱', '학습 콘텐츠', '용어 사전', '뉴스 큐레이션', '사용자', 'API 사용량', '데이터 품질 / Cron', '공지사항'];

  return (
    <SLPage theme={theme}>
      {/* Admin top bar — distinct */}
      <header style={{
        height: 56, padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 18,
        background: 'var(--sl-downSoft)',
        borderBottom: '2px solid var(--sl-down)',
        flexShrink: 0,
      }}>
        <div className="sl-row" style={{ gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--sl-down)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
          }}>S</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--sl-down)' }}>STOCKLAB · ADMIN</div>
        </div>
        <span className="sl-grow" />
        <span className="sl-tag sl-tag-down">관리자 모드</span>
        <span className="sl-caption sl-mono">app.stocklab.io/admin</span>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sl-cat6), var(--sl-cat3))' }} />
      </header>

      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100%' }}>
          <div style={{ borderRight: '1px solid var(--sl-line)', background: 'var(--sl-surface)' }}>
            <SLSidePanel active="대시보드" items={sidebar} danger />
          </div>
          <div style={{ padding: '28px 32px' }}>
            <div className="sl-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <h1 className="sl-h1">관리자 대시보드</h1>
              <div className="sl-row" style={{ gap: 8 }}>
                <button className="sl-btn sl-btn-ghost">활동 로그</button>
                <button className="sl-btn sl-btn-secondary">시스템 상태 →</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                ['활성 사용자 (DAU)', '1,284', '+12% · 7일', 'up'],
                ['신규 가입 (7일)', '+182', '평균 +156', 'up'],
                ['오늘 API 호출', '38,420 / 60K', '64% 사용', 'muted'],
                ['Cron 실패', '2', '재시도 필요', 'down'],
              ].map(([l, v, d, c], i) => (
                <div key={i} className="sl-card" style={{ padding: 18 }}>
                  <div className="sl-label">{l}</div>
                  <div className="sl-num-lg" style={{ marginTop: 6, color: c === 'down' ? 'var(--sl-down)' : undefined }}>{v}</div>
                  <div className="sl-mono" style={{
                    fontSize: 11, fontWeight: 600, marginTop: 6,
                    color: c === 'up' ? 'var(--sl-up)' : c === 'down' ? 'var(--sl-down)' : 'var(--sl-muted)',
                  }}>{d}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="sl-card" style={{ padding: 20 }}>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                  <SectionHeader title="고수 (Masters)" subtitle="24명 추적" />
                  <button className="sl-btn sl-btn-secondary sl-btn-sm">+ 새 고수</button>
                </div>
                <div className="sl-col" style={{ gap: 0 }}>
                  {[
                    ['Warren Buffett', '13F 자동 · 14d 전 갱신', '활성', 'up'],
                    ['Peter Lynch', '수동 입력 · 분기별', '활성', 'up'],
                    ['Ray Dalio', '13F 자동 · 14d 전 갱신', '활성', 'up'],
                    ['Cathie Wood', '13F 자동 · 1d 전 갱신', '활성', 'up'],
                    ['Michael Burry', '13F 자동 · 84d 전', '주의', 'warn'],
                    ['Charlie Munger', '수동 (히스토리)', '비활성', 'muted'],
                  ].map((m, i) => (
                    <div key={i} className="sl-row" style={{ padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--sl-hairline)' : 'none', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, var(--sl-cat${(i % 8) + 1}), var(--sl-cat${((i + 3) % 8) + 1}))`, flexShrink: 0 }} />
                      <div className="sl-grow">
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{m[0]}</div>
                        <div className="sl-caption" style={{ fontSize: 11 }}>{m[1]}</div>
                      </div>
                      <span className={`sl-tag ${m[3] === 'warn' ? 'sl-tag-warn' : m[3] === 'up' ? 'sl-tag-up' : ''}`}>{m[2]}</span>
                      <span className="sl-caption" style={{ fontSize: 14 }}>⋯</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sl-card" style={{ padding: 20 }}>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                  <SectionHeader title="학습 콘텐츠" subtitle="142편" />
                  <button className="sl-btn sl-btn-secondary sl-btn-sm">+ 새 글</button>
                </div>
                <PillGroup items={['전체', '발행됨', '초안', '비공개']} active="전체" />
                <div className="sl-col" style={{ gap: 0, marginTop: 12 }}>
                  {[
                    ['재무제표 읽는 법 1편', '발행', '2026-05-01'],
                    ['PER vs PBR 차이', '발행', '2026-04-22'],
                    ['DCF 입문', '발행', '2026-04-10'],
                    ['퀀트 팩터 가이드', '초안', '2026-05-04'],
                    ['공포·탐욕 지수란', '발행', '2026-03-28'],
                    ['ROE 분해 (DuPont)', '비공개', '2026-02-14'],
                  ].map((p, i) => (
                    <div key={i} className="sl-row" style={{ padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--sl-hairline)' : 'none', gap: 12 }}>
                      <div className="sl-grow" style={{ fontSize: 13 }}>{p[0]}</div>
                      <span className={`sl-tag ${p[1] === '발행' ? 'sl-tag-up' : p[1] === '비공개' ? '' : 'sl-tag-warn'}`}>{p[1]}</span>
                      <span className="sl-mono sl-caption" style={{ fontSize: 11, width: 88, textAlign: 'right' }}>{p[2]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="Cron 작업 / 데이터 품질" subtitle="자동 작업 모니터" />
                <div className="sl-col" style={{ gap: 0 }}>
                  {[
                    ['시세 갱신 (5분)', '12분 전', '✓', 'up'],
                    ['지수 갱신 (15분)', '5분 전', '✓', 'up'],
                    ['뉴스 수집 (30분)', '12분 전', '✓', 'up'],
                    ['재무 갱신 (일 1회)', '오늘 03:00', '✓', 'up'],
                    ['13F 분기 파싱', '14일 전', '✓', 'up'],
                    ['Fear & Greed 스크랩', '4시간 전', '⚠ 재시도', 'down'],
                  ].map((c, i) => (
                    <div key={i} className="sl-row" style={{ padding: '12px 0', borderBottom: i < 5 ? '1px solid var(--sl-hairline)' : 'none', fontSize: 13 }}>
                      <div className="sl-grow">{c[0]}</div>
                      <div className="sl-caption sl-mono" style={{ width: 100, textAlign: 'right' }}>{c[1]}</div>
                      <div className="sl-mono" style={{ width: 100, textAlign: 'right', fontWeight: 600, color: c[3] === 'up' ? 'var(--sl-up)' : 'var(--sl-down)' }}>{c[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sl-card" style={{ padding: 20 }}>
                <SectionHeader title="외부 API 사용량" subtitle="오늘 기준" />
                <div className="sl-col" style={{ gap: 14 }}>
                  {[
                    ['Finnhub', '38,420 / 60K (분당)', 0.64, 'brand'],
                    ['Alpha Vantage', '12 / 25 (일)', 0.48, 'brand'],
                    ['DART', '1,420 / 10K (일)', 0.14, 'brand'],
                    ['SEC EDGAR', '무제한', 0.05, 'muted'],
                    ['NewsAPI', '78 / 100 (일)', 0.78, 'down'],
                    ['FRED', '무제한', 0.02, 'muted'],
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="sl-row" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span className="sl-grow" style={{ fontWeight: 500 }}>{r[0]}</span>
                        <span className="sl-mono sl-caption" style={{ fontSize: 11 }}>{r[1]}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--sl-surfaceAlt)', borderRadius: 3 }}>
                        <div style={{
                          width: `${r[2] * 100}%`, height: '100%', borderRadius: 3,
                          background: r[3] === 'down' ? 'var(--sl-down)' : r[3] === 'muted' ? 'var(--sl-muted)' : 'var(--sl-brand)',
                        }} />
                      </div>
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

Object.assign(window, { SLSidePanel, FormRow, PillGroup, TransactionsDesign, SettingsDesign, AdminDesign });
