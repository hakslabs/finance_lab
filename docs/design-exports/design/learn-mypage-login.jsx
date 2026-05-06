// Learn · MyPage · Login designs

function LearnDesign({ theme = 'light' }) {
  const guides = [
    { cat: '입문', title: '주식 처음이라면', sub: '계좌 개설부터 첫 매수까지 7단계', n: 7, c: 'var(--sl-cat1)' },
    { cat: '재무제표', title: '재무제표 30분에 끝내기', sub: '손익·재무상태·현금흐름 핵심', n: 12, c: 'var(--sl-cat2)' },
    { cat: '밸류에이션', title: 'PER·PBR 제대로 쓰는 법', sub: '오해와 진실 정리', n: 8, c: 'var(--sl-cat3)' },
    { cat: '기술적', title: '차트 패턴 24선', sub: '캔들·이평·추세선 실전', n: 24, c: 'var(--sl-cat4)' },
    { cat: '거시', title: '금리·환율과 주식', sub: '거시 변수 → 시장 영향', n: 9, c: 'var(--sl-cat5)' },
    { cat: '심리', title: '손실 회피와 군중심리', sub: '행동경제학으로 보는 투자', n: 6, c: 'var(--sl-cat6)' },
  ];
  const terms = [
    { t: 'PER', d: '주가수익비율 — 주가 ÷ 주당순이익. 낮으면 저평가 신호로 해석.' },
    { t: 'EPS', d: '주당순이익 — 순이익 ÷ 발행주식수. 기업 수익성의 핵심 지표.' },
    { t: 'ROE', d: '자기자본이익률 — 순이익 ÷ 자기자본. 자본 효율성을 본다.' },
    { t: 'EV/EBITDA', d: '기업가치 / 상각전영업이익. 자본구조에 덜 민감한 밸류에이션.' },
    { t: '베타', d: '시장 대비 변동성. 1보다 크면 시장보다 변동 큼.' },
  ];
  return (
    <SLPage theme={theme}>
      <SLAppBar active="learn" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 60px' }}>
          {/* Hero */}
          <div className="sl-card" style={{ padding: 32, marginBottom: 24, background: 'linear-gradient(135deg, var(--sl-brandSoft), var(--sl-surface))' }}>
            <div className="sl-row" style={{ gap: 32, alignItems: 'center' }}>
              <div className="sl-grow">
                <div className="sl-label" style={{ color: 'var(--sl-brand)' }}>학습</div>
                <h1 className="sl-h1" style={{ marginTop: 6 }}>처음부터 차근차근, 투자의 기본기</h1>
                <div className="sl-caption" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, maxWidth: 540 }}>
                  종목 상세에서 만나는 모든 지표·용어가 여기에 정리되어 있습니다. 모르는 단어는 ★로 저장해 마이페이지에서 다시 볼 수 있어요.
                </div>
                <div className="sl-row" style={{ gap: 10, marginTop: 18 }}>
                  <button className="sl-btn sl-btn-primary">입문 가이드 시작</button>
                  <button className="sl-btn sl-btn-ghost">용어사전 열기</button>
                </div>
              </div>
              <div style={{ flex: '0 0 auto', display: 'flex', gap: 12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: 80, height: 110, borderRadius: 10, background: `var(--sl-cat${i})`, opacity: 0.18, transform: `rotate(${(i-2)*6}deg)` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sl-row" style={{ gap: 4, borderBottom: '1px solid var(--sl-line)', marginBottom: 20 }}>
            {['입문서·칼럼', '용어사전'].map((t, i) => (
              <span key={t} style={{
                padding: '10px 16px', fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? 'var(--sl-brand)' : 'var(--sl-inkSub)',
                borderBottom: i === 0 ? '2px solid var(--sl-brand)' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}>{t}</span>
            ))}
          </div>

          {/* Category chips */}
          <div className="sl-row" style={{ gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {['전체','입문','재무제표','밸류에이션','기술적 분석','거시·경제','투자 심리','퀀트'].map((c, i) => (
              <span key={c} className="sl-pill" data-active={i === 0 ? 'true' : undefined}>{c}</span>
            ))}
          </div>

          {/* Guides grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {guides.map((g, i) => (
              <div key={g.title} className="sl-card" style={{ padding: 20, cursor: 'pointer', transition: 'transform 120ms', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: g.c, opacity: 0.12 }} />
                <div className="sl-row" style={{ gap: 8, marginBottom: 14 }}>
                  <span className="sl-tag sl-tag-brand">{g.cat}</span>
                  <span className="sl-grow" />
                  <span className="sl-caption sl-mono" style={{ fontSize: 11 }}>{g.n}편</span>
                </div>
                <h3 className="sl-h3" style={{ marginBottom: 6 }}>{g.title}</h3>
                <div className="sl-caption" style={{ fontSize: 13, lineHeight: 1.5 }}>{g.sub}</div>
                <div className="sl-row" style={{ gap: 4, marginTop: 16, alignItems: 'center' }}>
                  {Array.from({length: 5}).map((_, j) => (
                    <span key={j} style={{ width: 18, height: 3, borderRadius: 2, background: j < 2 ? g.c : 'var(--sl-surfaceAlt)' }} />
                  ))}
                  <span className="sl-caption" style={{ fontSize: 11, marginLeft: 8 }}>2/{g.n} 읽음</span>
                </div>
              </div>
            ))}
          </div>

          {/* Terms preview */}
          <SectionHeader title="자주 찾는 용어" subtitle="용어사전 1,240+개" action={<span className="sl-caption" style={{ cursor: 'pointer' }}>전체 보기 →</span>} size="lg" />
          <div className="sl-card" style={{ padding: 0 }}>
            {terms.map((t, i) => (
              <div key={t.t} className="sl-row" style={{ gap: 16, padding: '16px 20px', borderBottom: i < terms.length - 1 ? '1px solid var(--sl-hairline)' : 'none', alignItems: 'flex-start' }}>
                <span className="sl-tag sl-mono" style={{ fontWeight: 700, minWidth: 80, justifyContent: 'center' }}>{t.t}</span>
                <span className="sl-grow" style={{ fontSize: 13, lineHeight: 1.6 }}>{t.d}</span>
                <span className="sl-caption" style={{ cursor: 'pointer', fontSize: 12 }}>★</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ---------------------------------------------------------------- MyPage

function MyPageDesign({ theme = 'light' }) {
  const stats = [
    { l: '관심 종목', v: 18, sub: '+3 이번 주' },
    { l: '팔로우 고수', v: 5, sub: '13F 추적' },
    { l: '북마크 용어', v: 24, sub: '복습 12개' },
    { l: '저장 리포트', v: 9, sub: '미열람 3' },
  ];
  return (
    <SLPage theme={theme}>
      <SLAppBar active="" theme={theme} />
      <div style={{ overflow: 'auto', background: 'var(--sl-bg)', flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 60px' }}>
          {/* Profile hero */}
          <div className="sl-card" style={{ padding: 28, marginBottom: 20 }}>
            <div className="sl-row" style={{ gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>L</div>
              <div className="sl-grow">
                <h1 className="sl-h1">이학</h1>
                <div className="sl-caption" style={{ marginTop: 4 }}>hak@stocklab.local · 2025년 5월 가입</div>
                <div className="sl-row" style={{ gap: 6, marginTop: 12 }}>
                  <span className="sl-tag sl-tag-brand">베타 사용자</span>
                  <span className="sl-tag">기본 플랜</span>
                </div>
              </div>
              <button className="sl-btn sl-btn-ghost">프로필 편집</button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {stats.map(s => (
              <div key={s.l} className="sl-card" style={{ padding: 18, cursor: 'pointer' }}>
                <div className="sl-label">{s.l}</div>
                <div className="sl-num-lg sl-mono" style={{ marginTop: 6 }}>{s.v}</div>
                <div className="sl-caption" style={{ fontSize: 11, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Two column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="내 관심 종목" subtitle="기본 그룹 · 18개" action={<span className="sl-caption" style={{ cursor: 'pointer', fontSize: 12 }}>관리 →</span>} />
              <div className="sl-col" style={{ gap: 0 }}>
                {[
                  { tk: 'NVDA', n: 'NVIDIA', pct: 2.84 },
                  { tk: 'TSLA', n: 'Tesla', pct: -1.42 },
                  { tk: '005930', n: '삼성전자', pct: 0.84 },
                  { tk: 'MSFT', n: 'Microsoft', pct: 0.42 },
                  { tk: '000660', n: 'SK하이닉스', pct: 1.84 },
                ].map((s, i) => (
                  <div key={s.tk} className="sl-row" style={{ gap: 10, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: `var(--sl-cat${(i%6)+1})`, opacity: 0.2, flex: '0 0 auto' }} />
                    <div className="sl-grow">
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.tk}</div>
                      <div className="sl-caption" style={{ fontSize: 11 }}>{s.n}</div>
                    </div>
                    <Sparkline2 seed={s.tk} up={s.pct >= 0} width={60} height={20} />
                    <ChangePill pct={s.pct} size="sm" />
                  </div>
                ))}
              </div>
            </div>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="팔로우 중인 고수" subtitle="13F 분기 변동 알림" action={<span className="sl-caption" style={{ cursor: 'pointer', fontSize: 12 }}>관리 →</span>} />
              <div className="sl-col" style={{ gap: 0 }}>
                {[
                  { n: 'Warren Buffett', f: 'Berkshire Hathaway', last: '2일 전 13F 업데이트' },
                  { n: 'Stanley Druckenmiller', f: 'Duquesne', last: '1주 전 13F 업데이트' },
                  { n: 'Bill Ackman', f: 'Pershing Square', last: '2주 전 13F 업데이트' },
                  { n: 'David Tepper', f: 'Appaloosa', last: '3주 전 13F 업데이트' },
                ].map((m, i) => (
                  <div key={m.n} className="sl-row" style={{ gap: 12, padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--sl-hairline)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, var(--sl-cat${(i%6)+1}), var(--sl-cat${((i+2)%6)+1}))`, flex: '0 0 auto' }} />
                    <div className="sl-grow">
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.n}</div>
                      <div className="sl-caption" style={{ fontSize: 11 }}>{m.f}</div>
                    </div>
                    <span className="sl-caption" style={{ fontSize: 11 }}>{m.last}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="복습할 용어" subtitle="북마크 24개 · 12개 미숙지" />
              <div className="sl-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {['PER','PBR','EV/EBITDA','ROE','베타','샤프지수','VIX','13F','컨센서스','EPS','자유현금흐름','부채비율'].map(t => (
                  <span key={t} className="sl-tag sl-mono">{t}</span>
                ))}
              </div>
              <button className="sl-btn sl-btn-primary" style={{ marginTop: 16, width: '100%' }}>오늘의 복습 시작</button>
            </div>
            <div className="sl-card" style={{ padding: 20 }}>
              <SectionHeader title="저장한 리포트" subtitle="9개 · 미열람 3개" />
              <div className="sl-col" style={{ gap: 10 }}>
                {[
                  { src: '한국은행', title: '통화신용정책 보고서 2026.04', tag: '거시', unread: true },
                  { src: 'SEC', title: 'Berkshire 13F-HR · 2026 Q1', tag: '13F', unread: true },
                  { src: 'KDI', title: '경제전망 2026 상반기', tag: '거시', unread: false },
                  { src: 'IMF', title: 'World Economic Outlook · 2026', tag: '글로벌', unread: false },
                ].map((r, i) => (
                  <div key={i} className="sl-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    {r.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sl-brand)', marginTop: 6 }} />}
                    {!r.unread && <span style={{ width: 6, height: 6 }} />}
                    <div className="sl-grow">
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                      <div className="sl-caption" style={{ fontSize: 11, marginTop: 2 }}>{r.src} · {r.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

// ---------------------------------------------------------------- Login

function LoginDesign({ theme = 'light' }) {
  return (
    <SLPage theme={theme}>
      <div style={{ display: 'flex', height: '100%', minHeight: '100vh', background: 'var(--sl-bg)' }}>
        {/* Left — visual */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 40%)' }} />
          <div style={{ position: 'relative', padding: 48, height: '100%', display: 'flex', flexDirection: 'column', color: '#fff' }}>
            <div className="sl-row" style={{ gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>S</div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>STOCKLAB</div>
            </div>
            <div className="sl-grow" />
            <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: 480 }}>
              시장을 읽고,<br />고수를 따라가고,<br />내 포트폴리오를 키운다.
            </h1>
            <div style={{ marginTop: 20, fontSize: 15, opacity: 0.9, maxWidth: 480, lineHeight: 1.6 }}>
              미국·한국 시장을 한 화면에. 13F 추적·리포트·시장 심리까지 무료 공식 데이터로 모은 개인 트레이딩 룸.
            </div>
            <div className="sl-grow" />
            <div className="sl-row" style={{ gap: 28, opacity: 0.8 }}>
              <div><div style={{ fontSize: 22, fontWeight: 700 }}>24+</div><div style={{ fontSize: 12 }}>추적 중인 거장</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 700 }}>1,200+</div><div style={{ fontSize: 12 }}>용어사전</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 700 }}>30+</div><div style={{ fontSize: 12 }}>리포트 소스</div></div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <h2 className="sl-h2">로그인</h2>
            <div className="sl-caption" style={{ marginTop: 6, marginBottom: 28 }}>이메일과 비밀번호로 시작하세요</div>

            {/* OAuth */}
            <div className="sl-col" style={{ gap: 8, marginBottom: 20 }}>
              <button className="sl-btn sl-btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 10, padding: '12px 16px', fontSize: 14 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(from 0deg, #ea4335, #fbbc04, #34a853, #4285f4, #ea4335)' }} />
                Google로 계속하기
              </button>
              <button className="sl-btn sl-btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 10, padding: '12px 16px', fontSize: 14 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#3C1E1E' }}>K</span>
                카카오로 계속하기
              </button>
            </div>

            <div className="sl-row" style={{ gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--sl-line)' }} />
              <span className="sl-caption" style={{ fontSize: 11 }}>또는</span>
              <span style={{ flex: 1, height: 1, background: 'var(--sl-line)' }} />
            </div>

            {/* Form */}
            <div className="sl-col" style={{ gap: 12 }}>
              <div>
                <div className="sl-label" style={{ marginBottom: 6 }}>이메일</div>
                <div style={{ padding: '12px 14px', background: 'var(--sl-surface)', border: '1px solid var(--sl-line)', borderRadius: 8, fontSize: 14, color: 'var(--sl-muted)' }}>you@example.com</div>
              </div>
              <div>
                <div className="sl-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="sl-label">비밀번호</span>
                  <span className="sl-caption" style={{ fontSize: 11, cursor: 'pointer' }}>비밀번호 찾기</span>
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--sl-surface)', border: '1px solid var(--sl-line)', borderRadius: 8, fontSize: 14, color: 'var(--sl-muted)' }}>••••••••</div>
              </div>
              <div className="sl-row" style={{ gap: 8, marginTop: 4 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--sl-brand)', background: 'var(--sl-brand)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                <span style={{ fontSize: 12 }}>로그인 상태 유지</span>
              </div>
              <button className="sl-btn sl-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14, marginTop: 6 }}>로그인</button>
            </div>

            <div className="sl-row" style={{ justifyContent: 'center', gap: 6, marginTop: 24, fontSize: 13 }}>
              <span className="sl-caption">계정이 없으신가요?</span>
              <span style={{ color: 'var(--sl-brand)', fontWeight: 600, cursor: 'pointer' }}>회원가입</span>
            </div>
          </div>
        </div>
      </div>
    </SLPage>
  );
}

Object.assign(window, { LearnDesign, MyPageDesign, LoginDesign });
