// My Page hub · Account Settings · Transactions · Admin Dashboard
// All four wires in one file — they share patterns (settings forms, list+detail, CRUD tables).

// ─────────────────────────────────────────────────────────────
// Shared local helpers
// ─────────────────────────────────────────────────────────────
function SidePanel({ active, items }) {
  return (
    <div className="w-col" style={{ width: 200, borderRight: `1px solid ${W.hairline}`, padding: 12, gap: 2, flexShrink: 0 }}>
      {items.map(it => (
        <div key={it} style={{
          padding: '7px 10px', fontSize: 12,
          background: it === active ? W.fill : 'transparent',
          fontWeight: it === active ? 600 : 400,
          borderLeft: it === active ? `2px solid ${W.ink}` : '2px solid transparent',
        }}>{it}</div>
      ))}
    </div>
  );
}

function FormRow({ label, hint, children }) {
  return (
    <div className="w-row" style={{ padding: '12px 0', borderBottom: `1px solid ${W.hairline}`, alignItems: 'flex-start', gap: 16 }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        {hint && <div className="w-faint" style={{ fontSize: 10.5, marginTop: 2 }}>{hint}</div>}
      </div>
      <div className="w-grow">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. My Page Hub — 통합 허브
// ─────────────────────────────────────────────────────────────
function WireMyPage() {
  return (
    <div className="w-root">
      <AppBar active="" />
      <div className="w-row" style={{ flex: 1, overflow: 'hidden' }}>
        <SidePanel active="개요" items={['개요', '내 관심종목', '팔로우한 고수', '북마크 용어', '저장한 검색조건', '내 메모/일지', '활동 기록']} />
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <div className="w-row" style={{ gap: 12, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, border: `1px solid ${W.line}`, borderRadius: '50%' }} />
            <div className="w-grow">
              <h1 className="w-h1">홍길동 <span className="w-pill" style={{ marginLeft: 8 }}>일반회원</span></h1>
              <div className="w-muted" style={{ fontSize: 12, marginTop: 2 }}>hong@example.com · 가입 2024-08-12</div>
            </div>
            <button className="w-btn">계정 설정 →</button>
          </div>

          <div className="w-h3" style={{ marginBottom: 8 }}>한눈에 보기</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: '관심종목', v: '24', s: '3개 리스트' },
              { l: '팔로우 고수', v: '5', s: 'Buffett 외' },
              { l: '북마크 용어', v: '18', s: '재무 12 · 기술 6' },
              { l: '저장한 검색', v: '7', s: '매일 자동 갱신' },
            ].map(c => (
              <div key={c.l} className="w-card" style={{ padding: 12 }}>
                <div className="w-h3" style={{ fontSize: 10 }}>{c.l}</div>
                <div className="w-num-md" style={{ fontSize: 22, marginTop: 4 }}>{c.v}</div>
                <div className="w-faint" style={{ fontSize: 10, marginTop: 2 }}>{c.s}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="w-card" style={{ padding: 12 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 className="w-h2">관심종목 리스트</h2>
                <span className="w-pill" style={{ borderStyle: 'dashed' }}>+ 새 리스트</span>
              </div>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              {[
                { n: '기본', c: 8, p: '+1.2%' },
                { n: '미국주', c: 7, p: '+2.4%' },
                { n: '배당주', c: 5, p: '+0.8%' },
                { n: 'AI 테마', c: 4, p: '+5.1%' },
              ].map(l => (
                <div key={l.n} className="w-row" style={{ padding: '8px 0', borderBottom: `1px solid ${W.hairline}`, gap: 10 }}>
                  <div className="w-grow" style={{ fontSize: 12 }}>{l.n}</div>
                  <div className="w-faint" style={{ fontSize: 11 }}>{l.c}개</div>
                  <div className="w-up w-mono" style={{ fontSize: 11, width: 50, textAlign: 'right' }}>{l.p}</div>
                  <span className="w-faint">⋯</span>
                </div>
              ))}
            </div>
            <div className="w-card" style={{ padding: 12 }}>
              <h2 className="w-h2" style={{ marginBottom: 8 }}>최근 활동</h2>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              {[
                ['관심종목 추가', 'NVDA · 2시간 전'],
                ['고수 팔로우', 'Peter Lynch · 어제'],
                ['용어 북마크', 'Free Cash Flow · 어제'],
                ['검색 저장', '저PER 고ROE · 3일 전'],
                ['거래 입력', 'AAPL 매수 10주 · 5일 전'],
              ].map(([a, t]) => (
                <div key={t} className="w-row" style={{ padding: '7px 0', borderBottom: `1px solid ${W.hairline}`, fontSize: 11.5 }}>
                  <div className="w-grow">{a}</div>
                  <div className="w-faint">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Account Settings
// ─────────────────────────────────────────────────────────────
function WireAccountSettings() {
  return (
    <div className="w-root">
      <AppBar active="" />
      <div className="w-row" style={{ flex: 1, overflow: 'hidden' }}>
        <SidePanel active="프로필" items={['프로필', '비밀번호', '연결된 소셜', '시장 / 통화', '언어 / 타임존', '테마', '알림 설정', '데이터 내보내기', '회원 탈퇴']} />
        <div style={{ flex: 1, padding: 24, overflow: 'auto', maxWidth: 720 }}>
          <h1 className="w-h1" style={{ marginBottom: 16 }}>계정 설정 <span className="w-faint" style={{ fontSize: 12, fontWeight: 400 }}>· 프로필</span></h1>

          <FormRow label="프로필 사진">
            <div className="w-row" style={{ gap: 10 }}>
              <div style={{ width: 56, height: 56, border: `1px solid ${W.line}`, borderRadius: '50%' }} />
              <button className="w-btn">업로드</button>
              <button className="w-btn-ghost w-btn">제거</button>
            </div>
          </FormRow>
          <FormRow label="이름">
            <input className="w-input" style={{ width: 280 }} defaultValue="홍길동" />
          </FormRow>
          <FormRow label="닉네임" hint="댓글·일지 작성 시 표시">
            <input className="w-input" style={{ width: 280 }} defaultValue="value_hunter" />
          </FormRow>
          <FormRow label="이메일">
            <div className="w-row" style={{ gap: 10 }}>
              <input className="w-input" style={{ width: 280 }} defaultValue="hong@example.com" />
              <span className="w-tag" style={{ borderColor: W.up, color: W.up }}>인증됨</span>
            </div>
          </FormRow>
          <FormRow label="기본 통화" hint="포트폴리오 환산 기준">
            <div className="w-row" style={{ gap: 6 }}>
              {['KRW', 'USD', 'EUR', 'JPY'].map(c => (
                <span key={c} className="w-pill" style={{ background: c === 'KRW' ? W.ink : W.bg, color: c === 'KRW' ? '#fff' : W.muted, borderColor: c === 'KRW' ? W.ink : W.hairline }}>{c}</span>
              ))}
            </div>
          </FormRow>
          <FormRow label="언어">
            <div className="w-row" style={{ gap: 6 }}>
              {['한국어', 'English', '한·영 혼용'].map((c, i) => (
                <span key={c} className="w-pill" style={{ background: i === 2 ? W.ink : W.bg, color: i === 2 ? '#fff' : W.muted, borderColor: i === 2 ? W.ink : W.hairline }}>{c}</span>
              ))}
            </div>
          </FormRow>
          <FormRow label="테마" hint="시스템 따르기 권장">
            <div className="w-row" style={{ gap: 6 }}>
              {['시스템', '라이트', '다크'].map((c, i) => (
                <span key={c} className="w-pill" style={{ background: i === 0 ? W.ink : W.bg, color: i === 0 ? '#fff' : W.muted, borderColor: i === 0 ? W.ink : W.hairline }}>{c}</span>
              ))}
            </div>
          </FormRow>
          <FormRow label="알림 환경설정">
            <div className="w-col" style={{ gap: 6, fontSize: 12 }}>
              {['가격 알림 (도달 시)', '기술적 신호 (골든크로스 등)', '관심 고수 13F 업데이트', '배당 기준일 임박', '관심종목 공시', '주간 시장 리포트'].map(t => (
                <label key={t} className="w-row" style={{ gap: 8 }}>
                  <span className="w-checkbox" style={{ background: W.ink }} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </FormRow>
          <div className="w-row" style={{ marginTop: 16, gap: 8, justifyContent: 'flex-end' }}>
            <button className="w-btn">취소</button>
            <button className="w-btn w-btn-primary">변경사항 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Transactions — 거래 내역
// ─────────────────────────────────────────────────────────────
function WireTransactions() {
  const txs = [
    { d: '2026-05-04', t: '매수', s: 'AAPL', q: 10, p: '184.32', cur: 'USD', total: '1,843.20', fee: '0.50' },
    { d: '2026-04-28', t: '매도', s: 'TSLA', q: 5, p: '224.10', cur: 'USD', total: '1,120.50', fee: '0.40' },
    { d: '2026-04-22', t: '매수', s: '005930', q: 50, p: '78,400', cur: 'KRW', total: '3,920,000', fee: '785' },
    { d: '2026-04-15', t: '배당', s: 'MSFT', q: 0, p: '0.83', cur: 'USD', total: '4.15', fee: '0' },
    { d: '2026-04-10', t: '매수', s: 'NVDA', q: 4, p: '880.40', cur: 'USD', total: '3,521.60', fee: '0.80' },
    { d: '2026-04-02', t: '매도', s: '000660', q: 20, p: '202,000', cur: 'KRW', total: '4,040,000', fee: '808' },
  ];
  const tColor = t => t === '매수' ? W.up : t === '매도' ? W.down : W.muted;
  return (
    <div className="w-root">
      <AppBar active="" />
      <div style={{ padding: 20, overflow: 'auto' }}>
        <div className="w-row" style={{ marginBottom: 16, gap: 12 }}>
          <div className="w-grow">
            <h1 className="w-h1">거래 내역 <span className="w-faint" style={{ fontSize: 12, fontWeight: 400 }}>Transactions</span></h1>
            <div className="w-muted" style={{ fontSize: 12, marginTop: 2 }}>매수·매도·배당 기록을 직접 입력하면 포트폴리오에 자동 반영됩니다.</div>
          </div>
          <button className="w-btn">CSV 가져오기</button>
          <button className="w-btn">내보내기</button>
          <button className="w-btn w-btn-primary">+ 거래 입력</button>
        </div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            ['총 거래', '124건'],
            ['올해 매수', '₩ 12.4M'],
            ['올해 매도', '₩ 8.2M'],
            ['실현 손익', '+₩ 1,840,200', W.up],
            ['수수료/세금', '₩ 84,300'],
          ].map(([l, v, c]) => (
            <div key={l} className="w-card-soft" style={{ padding: 10 }}>
              <div className="w-h3" style={{ fontSize: 10 }}>{l}</div>
              <div className="w-num-md" style={{ fontSize: 16, marginTop: 4, color: c || W.ink }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="w-row" style={{ gap: 8, marginBottom: 10 }}>
          <input className="w-input" placeholder="종목 검색" style={{ width: 200 }} />
          <span className="w-pill" style={{ background: W.fill }}>전체</span>
          <span className="w-pill">매수</span>
          <span className="w-pill">매도</span>
          <span className="w-pill">배당</span>
          <span className="w-pill">입출금</span>
          <div className="w-grow" />
          <span className="w-pill">기간 · 2026 ▾</span>
          <span className="w-pill">통화 · 전체 ▾</span>
        </div>

        {/* Table */}
        <div className="w-card" style={{ padding: 0 }}>
          <div className="w-row" style={{ padding: '8px 12px', background: W.fill, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${W.line}` }}>
            <div style={{ width: 100 }}>날짜</div>
            <div style={{ width: 60 }}>구분</div>
            <div style={{ width: 100 }}>종목</div>
            <div style={{ width: 70, textAlign: 'right' }}>수량</div>
            <div style={{ width: 100, textAlign: 'right' }}>단가</div>
            <div style={{ width: 60 }}>통화</div>
            <div style={{ width: 130, textAlign: 'right' }}>금액</div>
            <div style={{ width: 80, textAlign: 'right' }}>수수료</div>
            <div className="w-grow" />
            <div style={{ width: 60, textAlign: 'right' }}>편집</div>
          </div>
          {txs.map((r, i) => (
            <div key={i} className="w-row" style={{
              padding: '9px 12px', fontSize: 11.5,
              borderBottom: i < txs.length - 1 ? `1px solid ${W.hairline}` : 'none',
            }}>
              <div className="w-mono" style={{ width: 100 }}>{r.d}</div>
              <div style={{ width: 60 }}>
                <span className="w-tag" style={{ color: tColor(r.t), borderColor: tColor(r.t) }}>{r.t}</span>
              </div>
              <div className="w-mono" style={{ width: 100, fontWeight: 600 }}>{r.s}</div>
              <div className="w-mono" style={{ width: 70, textAlign: 'right' }}>{r.q || '—'}</div>
              <div className="w-mono" style={{ width: 100, textAlign: 'right' }}>{r.p}</div>
              <div className="w-faint" style={{ width: 60 }}>{r.cur}</div>
              <div className="w-mono" style={{ width: 130, textAlign: 'right' }}>{r.total}</div>
              <div className="w-mono w-faint" style={{ width: 80, textAlign: 'right' }}>{r.fee}</div>
              <div className="w-grow" />
              <div className="w-faint" style={{ width: 60, textAlign: 'right' }}>편집 · 삭제</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Admin Dashboard
// ─────────────────────────────────────────────────────────────
function WireAdmin() {
  return (
    <div className="w-root">
      {/* admin bar — visually distinct */}
      <div className="w-row" style={{ height: 48, borderBottom: `2px solid ${W.down}`, padding: '0 16px', gap: 16, flexShrink: 0, background: '#fdf3f3' }}>
        <div className="w-row" style={{ gap: 8 }}>
          <div style={{ width: 18, height: 18, border: `1.5px solid ${W.down}`, transform: 'rotate(45deg)' }} />
          <div style={{ fontWeight: 700, fontSize: 14, color: W.down }}>STOCKLAB · ADMIN</div>
        </div>
        <div className="w-grow" />
        <span className="w-pill" style={{ borderColor: W.down, color: W.down }}>관리자 모드</span>
        <span className="w-faint" style={{ fontSize: 11 }}>app.stocklab.io/admin</span>
        <div style={{ width: 28, height: 28, border: `1px solid ${W.hairline}`, borderRadius: '50%' }} />
      </div>
      <div className="w-row" style={{ flex: 1, overflow: 'hidden' }}>
        <SidePanel active="대시보드" items={[
          '대시보드', '고수 (Masters)', '13F 파싱', '학습 콘텐츠', '용어 사전',
          '뉴스 큐레이션', '사용자', 'API 사용량', '데이터 품질 / Cron', '공지사항',
        ]} />
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <h1 className="w-h1" style={{ marginBottom: 14 }}>관리자 대시보드</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              ['활성 사용자 (DAU)', '1,284'],
              ['신규 가입 (7일)', '+182'],
              ['오늘 API 호출', '38,420 / 60K'],
              ['Cron 실패', '2', W.down],
            ].map(([l, v, c]) => (
              <div key={l} className="w-card" style={{ padding: 12 }}>
                <div className="w-h3" style={{ fontSize: 10 }}>{l}</div>
                <div className="w-num-md" style={{ fontSize: 22, marginTop: 4, color: c || W.ink }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Two-column: Masters CRUD + Learn CRUD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="w-card" style={{ padding: 12 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 className="w-h2">고수 (Masters)</h2>
                <button className="w-btn">+ 새 고수</button>
              </div>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              {[
                ['Warren Buffett', '13F 자동 · 14d 전 갱신', '활성'],
                ['Peter Lynch', '수동 입력 · 분기별', '활성'],
                ['Ray Dalio', '13F 자동 · 14d 전 갱신', '활성'],
                ['Cathie Wood', '13F 자동 · 1d 전 갱신', '활성'],
                ['Michael Burry', '13F 자동 · 84d 전 갱신', '주의', W.down],
                ['Charlie Munger', '수동 (히스토리)', '비활성', W.muted],
              ].map(([n, s, st, c]) => (
                <div key={n} className="w-row" style={{ padding: '7px 0', borderBottom: `1px solid ${W.hairline}`, gap: 10, fontSize: 11.5 }}>
                  <div style={{ width: 24, height: 24, border: `1px solid ${W.hairline}`, borderRadius: '50%' }} />
                  <div className="w-grow">
                    <div style={{ fontWeight: 600 }}>{n}</div>
                    <div className="w-faint" style={{ fontSize: 10 }}>{s}</div>
                  </div>
                  <span className="w-tag" style={{ color: c || W.up, borderColor: c || W.up }}>{st}</span>
                  <span className="w-faint">편집 ·  ⋯</span>
                </div>
              ))}
            </div>
            <div className="w-card" style={{ padding: 12 }}>
              <div className="w-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 className="w-h2">학습 콘텐츠</h2>
                <button className="w-btn">+ 새 글</button>
              </div>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              <div className="w-row" style={{ gap: 4, marginBottom: 8 }}>
                {['전체', '발행됨', '초안', '비공개'].map((t, i) => (
                  <span key={t} className="w-pill" style={{ background: i === 0 ? W.fill : W.bg }}>{t}</span>
                ))}
              </div>
              {[
                ['재무제표 읽는 법 1편', '발행', '2026-05-01'],
                ['PER vs PBR 차이', '발행', '2026-04-22'],
                ['DCF 입문', '발행', '2026-04-10'],
                ['퀀트 팩터 가이드', '초안', '2026-05-04'],
                ['공포·탐욕 지수란', '발행', '2026-03-28'],
                ['ROE 분해 (DuPont)', '비공개', '2026-02-14'],
              ].map(([t, st, d], i) => (
                <div key={i} className="w-row" style={{ padding: '7px 0', borderBottom: `1px solid ${W.hairline}`, gap: 10, fontSize: 11.5 }}>
                  <div className="w-grow">{t}</div>
                  <span className="w-tag" style={{ fontSize: 9 }}>{st}</span>
                  <div className="w-mono w-faint" style={{ fontSize: 10, width: 80, textAlign: 'right' }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cron + API monitor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
            <div className="w-card" style={{ padding: 12 }}>
              <h2 className="w-h2" style={{ marginBottom: 8 }}>Cron 작업 / 데이터 품질</h2>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              {[
                ['시세 갱신 (5분)',     '12분 전', '✓', W.up],
                ['지수 갱신 (15분)',    '5분 전',  '✓', W.up],
                ['뉴스 수집 (30분)',    '12분 전', '✓', W.up],
                ['재무 갱신 (일 1회)',  '오늘 03:00', '✓', W.up],
                ['13F 분기 파싱',       '14일 전',  '✓', W.up],
                ['Fear & Greed 스크랩', '4시간 전', '⚠ 재시도', W.down],
              ].map(([n, t, s, c]) => (
                <div key={n} className="w-row" style={{ padding: '6px 0', borderBottom: `1px solid ${W.hairline}`, fontSize: 11.5 }}>
                  <div className="w-grow">{n}</div>
                  <div className="w-faint" style={{ width: 100, textAlign: 'right' }}>{t}</div>
                  <div className="w-mono" style={{ width: 80, textAlign: 'right', color: c }}>{s}</div>
                </div>
              ))}
            </div>
            <div className="w-card" style={{ padding: 12 }}>
              <h2 className="w-h2" style={{ marginBottom: 8 }}>외부 API 사용량</h2>
              <div className="w-rule" style={{ marginBottom: 6 }} />
              {[
                ['Finnhub',       '38,420 / 60K (분당)', 0.64],
                ['Alpha Vantage', '12 / 25 (일)',         0.48],
                ['DART',          '1,420 / 10K (일)',     0.14],
                ['SEC EDGAR',     '무제한',                0.05],
                ['NewsAPI',       '78 / 100 (일)',        0.78, W.down],
                ['FRED',          '무제한',                0.02],
              ].map(([n, v, p, c]) => (
                <div key={n} style={{ padding: '6px 0', borderBottom: `1px solid ${W.hairline}` }}>
                  <div className="w-row" style={{ fontSize: 11.5 }}>
                    <div className="w-grow">{n}</div>
                    <div className="w-faint w-mono" style={{ fontSize: 10 }}>{v}</div>
                  </div>
                  <div style={{ marginTop: 4, height: 4, background: W.fill, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${p * 100}%`, height: '100%', background: c || W.ink }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WireMyPage = WireMyPage;
window.WireAccountSettings = WireAccountSettings;
window.WireTransactions = WireTransactions;
window.WireAdmin = WireAdmin;
