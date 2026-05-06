# STOCKLAB

지인 대상 무료 운영을 전제로 만드는 한 · 미 통합 주식 분석 · 학습 · 포트폴리오 플랫폼.
와이어프레임 v2 + 디자인 v1 통합 기획을 단일 코드베이스로 구현한다.

## Vision

- 시장 전체 흐름을 한 화면에서 보기.
- 거장 24명의 13F 보유 그대로 따라가기.
- 자기 포트폴리오 수익률을 시장 평균과 비교하기.
- 학술 · 매크로 리포트를 AI 요약으로 빠르게 소비하기.

## Tech Stack

| 영역 | 선택 |
| --- | --- |
| 프론트 | Next.js 14 App Router · React 18 · Server Components 우선 |
| 스타일 | CSS 변수 + Pretendard + JetBrains Mono · `data-theme` 단일 토글 |
| 차트 | 자체 SVG 엔진 (그리기 도구 11종 + 지표 40종+) |
| DB · Auth | Supabase Postgres + Auth (Email · Google · Apple · Kakao) |
| Cron | Vercel Cron (10초 이내) + GitHub Actions Worker (Docling · Gemini) |
| AI | Gemini 1.5 Flash (1,500 req / 일 무료) |
| 모니터링 | Vercel Analytics · Sentry (5K event 무료) |

## Current State

현재 레포는 M0 인프라 스캐폴드와 FinanceDatabase 종목 seed가 들어간 Next.js 14 App Router 앱이다. 인증, 홈, cron 헬스 체크는 최소 동작 검증용으로 구현되어 있고, 실제 제품 화면은 이후 실행 계획에서 확장한다.

디자인 기준 자료는 이미 HTML / JSX export로 존재하며 `docs/design-exports/` 아래에 모아 둔다.

- `docs/design-exports/STOCKLAB Design.html`
- `docs/design-exports/STOCKLAB Wireframes v2.html`
- `docs/design-exports/design-canvas.jsx`
- `docs/design-exports/tweaks-panel.jsx`
- `docs/design-exports/design/`
- `docs/design-exports/wires-v2/`

## Installation

아래 명령으로 로컬 개발과 검증을 실행한다.

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정 (.env.local)
cp .env.example .env.local
# SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY,
# CRON_SECRET, KRX_API_KEY, DART_API_KEY, FINNHUB_API_KEY,
# FRED_API_KEY, NEWSAPI_KEY, ALPHAVANTAGE_KEY, GEMINI_API_KEY,
# OAUTH_GOOGLE_*, OAUTH_KAKAO_*, OAUTH_APPLE_*, SENTRY_DSN

# 3. Supabase 마이그레이션 적용
pnpm supabase db push
```

## Run

```bash
# 개발 서버
pnpm dev               # http://localhost:3000

# 타입체크 + 린트
pnpm typecheck
pnpm lint

# 테스트
pnpm test              # 단위
pnpm e2e               # Playwright

# FinanceDatabase 종목 seed (US / South Korea equities + ETFs)
pnpm seed:financedatabase:dry-run
pnpm seed:financedatabase
pnpm seed:financedatabase:verify

# 프로덕션 빌드
pnpm build
pnpm start
```

## Usage

### 사용자

1. `/login` 에서 OAuth 또는 이메일로 로그인.
2. 홈에서 시장 개요 + 관심종목 + 내 수익률 확인.
3. 종목 검색(`⌘K` / `Ctrl+K`) 또는 스크리너로 종목 발굴.
4. 종목 상세 8탭에서 차트 · 재무 · 적정가치 · 공시 · 뉴스 · 수급 · 목표주가 분석.
5. `/me/transactions` 에서 거래 직접 입력 → `holdings` 자동 갱신.
6. `/reports` 에서 AI 요약된 학술 · 매크로 리포트 소비.

### 관리자

`/admin` (RLS + role 체크) 에서 거장 / 13F / 학습 콘텐츠 / 용어 사전 / 뉴스 큐레이션 / Cron 로그 / API 사용량을 운영한다.

## Generated Structure

```text
.
├── README.md                         이 문서
├── AGENTS.md                         에이전트 진입 문서 (영문)
├── ARCHITECTURE.md                   레포 최상위 구조 문서 (영문)
├── CLAUDE.md                         Claude Code 전용 운영 메모 (영문)
├── app/                              Next.js 14 App Router 스캐폴드
│   ├── README.md                     app 폴더 구조 계약
│   ├── (public)/                     로그인 · 공개 페이지 예정
│   ├── (auth)/                       인증 사용자 페이지 예정
│   ├── admin/                        /admin 라우트 예정
│   ├── api/                          Route Handlers 예정
│   └── _lib/                         shared app modules 예정
├── docs/
│   ├── CODE_STRUCTURE.md             구현 전 app 폴더 구조 계약
│   ├── FRONTEND.md                   Next.js 14 RSC 전략 + 컴포넌트 구조
│   ├── SECURITY.md                   Supabase Auth + RLS + 시크릿 관리
│   ├── RELIABILITY.md                무료 티어 한도 + cron + 다운그레이드 정책
│   ├── DESIGN.md                     설계 결정 로그
│   ├── PLANS.md                      M0~M9 마일스톤 인덱스
│   ├── PRODUCT_SENSE.md              사용자 정의 + 가치 제안 + 비목표
│   ├── QUALITY_SCORE.md              Lighthouse · 5xx · 커버리지 목표
│   ├── design-docs/
│   │   ├── index.md
│   │   └── core-beliefs.md
│   ├── exec-plans/
│   │   ├── tech-debt-tracker.md
│   │   ├── active/                   EP-0001 ~ EP-0010 진행 중
│   │   └── completed/                완료된 EP 보관
│   ├── generated/
│   │   └── db-schema.md              Supabase 스키마 자동 생성 / 갱신
│   ├── design-exports/               HTML / JSX 디자인 export 보관
│   ├── product-specs/
│   │   ├── index.md
│   │   ├── home-dashboard.md
│   │   ├── stock-detail.md
│   │   ├── portfolio.md
│   │   ├── reports-pipeline.md
│   │   └── masters-13f.md
│   └── references/
│       ├── nextjs-llms.txt
│       ├── supabase-llms.txt
│       ├── react-llms.txt
│       └── vercel-llms.txt
├── scripts/
│   └── init.sh                       하네스 + app 스캐폴드 초기화
└── supabase/                         Supabase config + migrations
```

## References

- 와이어프레임: `docs/design-exports/STOCKLAB Wireframes v2.html`
- 디자인: `docs/design-exports/STOCKLAB Design.html`
- 단일 기획서: `STOCKLAB-Project-Plan.md`
- 디자인 토큰: `docs/design-exports/design/tokens.jsx`, `docs/design-exports/design-canvas.jsx`, `docs/design-exports/tweaks-panel.jsx`
