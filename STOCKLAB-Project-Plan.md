# STOCKLAB · Project Plan

지인 대상 무료 운영 가능한 한·미 통합 주식 분석 · 학습 · 포트폴리오 플랫폼.
와이어프레임 v2 + 디자인 v1 기준의 단일 기획서.

## Document Status

| 항목 | 값 |
| --- | --- |
| 버전 | v1 (와이어 v2 + 디자인 v1 통합) |
| 최종 수정 | 2026-05-06 |
| 데이터 정책 | 100% 공식 무료 · 재배포 가능 소스만 |
| 호스팅 | Vercel Hobby + Supabase Free + GitHub Actions |

## Vision and Scope

STOCKLAB 은 (1) 시장 전체 흐름을 한 화면에서 보고, (2) 거장의 13F 보유를 그대로 따라가며,
(3) 자기 포트폴리오의 수익률을 시장 평균과 비교하고, (4) 학술 · 매크로 리포트를 AI 요약으로 빠르게 소비하는 도구임.

| 구분 | 내용 |
| --- | --- |
| 1차 사용자 | 직접 운영자(지인) 50 ~ 100 명 |
| 핵심 가치 제안 | '내 수익률 vs 시장 평균' · 거장 13F · AI 리포트 요약 · 시세+학습 통합 |
| 비즈니스 모델 | 없음 · 운영비 = 도메인비 뿐 (~연 1.5만원) |
| 유료 전환 트리거 | DAU 1K 초과 또는 실시간 시세 요구 시 |
| 비목표 | 매매 체결 · 자동 트레이딩 · 한국주 분 단위 시세 · 컨센서스 데이터(KR) |

## Information Architecture

```text
STOCKLAB (app.stocklab.io)
 ├─ Public          로그인 · 회원가입 · 약관
 ├─ Auth required   1차 메뉴 + 개인 영역
 │   ├─ 홈 (Home)
 │   ├─ 분석 (Analysis)         · 4개 서브탭
 │   ├─ 종목 검색 (Screener)
 │   ├─ 고수 따라잡기 (Masters)
 │   ├─ 학습 (Learn)
 │   ├─ 포트폴리오 (Portfolio)  · 4개 서브탭
 │   ├─ 리포트 (Reports)        · 헤더 별도 메뉴
 │   ├─ 종목 상세 (Stock Detail) · 8개 서브탭
 │   └─ 개인 영역 (★ 드롭다운)
 │       ├─ 마이페이지 허브
 │       ├─ 거래 내역
 │       ├─ 메모 / 일지
 │       └─ 계정 설정
 └─ Admin only      /admin
     ├─ 대시보드
     ├─ 고수 / 13F CRUD
     ├─ 학습 콘텐츠 / 용어 사전
     ├─ 뉴스 큐레이션
     ├─ 사용자 / 권한
     └─ API 사용량 · Cron 로그
```

### Cross-cutting Behaviors

- 전역 검색 (`⌘K` / `Ctrl+K`) 은 종목 · 고수 · 용어 · 리포트를 통합 검색한다.
- `★` 즐겨찾기는 종목 · 고수 · 용어 · 리포트 어디서든 동작하며 동일한 watchlist · bookmark 테이블에 적재된다.
- 알림 종 (🔔) 은 가격 도달 · 기술 신호 · 13F 변경 · 배당 기준일 · 관심 공시 5종을 트리거 한다.
- 다크 / 라이트 토글은 헤더에 상시 노출되고 `data-theme` 속성으로 CSS 변수만 교체된다.
- 시장 지도(히트맵) 는 메뉴에서 빠지고 홈 위젯 + 분석 하위 풀 화면 두 진입점으로만 노출된다.

## Page Specifications

각 페이지의 목적, 주요 동작, 의존 데이터를 정리한다. 모든 화면은 다크 · 라이트 두 테마를 지원한다.

### Home · Dashboard

| 항목 | 내용 |
| --- | --- |
| 경로 | `/` |
| 목적 | 로그인 직후 시장 분위기 + 내 포지션을 1 스크롤 안에 보여주기 |
| 주요 위젯 | 인사 hero · 지수 스트립 (KR · US) · 미국 주요 종목 스트립 · 한국 주요 종목 스트립 · 시장 심리 게이지 · 관심종목 빠른 보기 · 주요 뉴스 (AI 요약) · 시장 지도 미니 · 내 수익률 vs 시장 평균 · 이번 주 일정 |
| 핵심 액션 | 지수 클릭 → 분석 시장 개요 / 종목 클릭 → 종목 상세 / 게이지 클릭 → 분석 시장 심리 |
| 데이터 의존 | `quotes` · `quotes_daily` · `indices` · `sentiment` · `news` · `holdings` · `watchlists` |

### Analysis · Hub

| 항목 | 내용 |
| --- | --- |
| 경로 | `/analysis` |
| 목적 | 시장 전체 데이터를 깊이 보는 8 가지 도구 진입점 |
| 주요 위젯 | 오늘의 추천 도구 hero · 8 개 도구 카드 그리드 · 미리보기 (섹터 등락 · 기술 신호) |
| 도구 8 종 | 시장 지도 / 시장 심리 / 기술적 분석 / 재무 비교 / 섹터 로테이션 / 상관계수 / 경제지표 / 환율 추적 |
| 핵심 액션 | 카드 hover → 우측 미리보기 갱신 / 클릭 → 풀화면 도구 진입 |
| 데이터 의존 | `quotes` · `financials` · `sentiment` · `news` |

### Analysis · Sub-tabs

분석 메뉴 안의 4 개 풀화면 탭. 각 탭은 상단 공유 헤더 + 탭 스트립을 가진다.

#### 분석 · 시장 개요

지수 6 종 카드 (스파크라인 포함) · 섹터별 등락률 (좌우 분기 막대) · 국가별 표 (등락 · YTD) · 거래대금 상위 (KR · US 분리).
액션은 지수 카드 / 종목 행 클릭으로 종목 상세 진입.

#### 분석 · 시장 심리

9 개 게이지 (VIX · F&G · Put/Call · AAII · NAAIM · High-Low · 신용잔고 · VKOSPI · 외국인 5d) 풀화면.
상단에 AI 종합 진단 (Gemini 4 시간 1 회) · 하단에 1 년 종합 점수 추이.

#### 분석 · 기술적

52 주 신/저가 카운트 · MA200 위 비율 · 골든크로스 카운트 KPI · RSI 분포 · A/D 라인 · 오늘의 신호 테이블 (스파크 포함).

#### 분석 · 재무

섹터별 평균 PER · ROE · 매출성장 막대 · 한미 시장 평균 비교 표.

### Stock Detail · 8 Tabs

| 항목 | 내용 |
| --- | --- |
| 경로 | `/stock/[ticker]` |
| 목적 | 단일 종목의 모든 의사결정 근거를 한 곳에 |
| 헤더 공통 | 로고 + 이름 + 티커 + 거래소 + 섹터 + 가격 + 전일 대비 + 시총 · 액션 (★ 관심 / 📝 메모 / + 거래 기록) |
| 사이드 공통 | 유사 종목 사이드 (우측 고정) · 메모 슬라이드 패널 (우상단) |
| 데이터 의존 | `quotes` · `financials` · `news` · `master_holdings` · 사용자 `notes` · `holdings` |

8 개 탭의 동작 정의:

| 탭 | 역할 |
| --- | --- |
| 개요 | 1 년 가격 차트 + 핵심 지표 카드 8 개 + 기술 신호 + 최근 실적 + 밸류 요약 + 고수 보유 + 회사 개요 |
| 차트 | 트레이딩뷰 풍 SVG 엔진 · 좌측 그리기 도구 11 종 · 우측 지표 레일 (40+ 지표) · 서브패널 3 개 (거래량 · RSI · MACD) · 그리기는 localStorage 저장 |
| 재무 | IS · BS · CF 토글 + 연/분기 토글 · 5 년 추이 + 비율 추이 + IS 본문표 (5 년 + CAGR + 업계 평균) |
| 적정가치 | PER · PBR · EV/EBITDA · 배당 카드 4 개 · PER · PBR 5 년 추이 · 3 가지 방법론 적정가 · 동종업계 비교 표 |
| 공시·실적 | 실적 발표 트렌드 (20 분기 막대) · 다음 발표 컨센서스 · 공시 타임라인 (필터: 전체 · 실적 · 정정 · 거버넌스 · M&A) |
| 뉴스 | AI 요약 hero · 키워드 트렌드 · 감성 추이 30 일 · 기사 리스트 (한/영 필터 + 카테고리 칩) |
| 수급 | 외국인 · 기관 · 개인 매매동향 (KR 일별, US 분기 13F) · 공매도 잔고 90 일 · 대형 보유 기관 표 |
| 목표주가 | 평균 · 최고 · 최저 목표가 · 의견 분포 (강력매수 ~ 강력매도) · 최근 애널리스트 리포트 표 · 이 종목을 보유한 고수 카드 6 개 |

### Screener

| 항목 | 내용 |
| --- | --- |
| 경로 | `/screener` |
| 목적 | 팩터 기반 종목 발굴 (KR + US 통합 8,400 종목) |
| 좌측 필터 | 시장 · 섹터 · 시가총액 · PER · PBR · ROE · 부채비율 · 배당수익률 · 6M 수익률 (이중 슬라이더) · 퀀트 팩터 4 종 (모멘텀 · 퀄리티 · 저변동 · 배당 그로스) |
| 결과 영역 | 표 · 히트맵 · 차트 3 가지 뷰 토글 / 종합 점수 막대 표시 / 페이지네이션 |
| 액션 | 필터 적용 (실시간 카운트) · 스크린 저장 → `saved_screens` · ★ 추가 → `watchlists` · 행 클릭 → 종목 상세 |
| 데이터 의존 | `quotes` · `financials` · `saved_screens` · `watchlists` |

### Masters

| 항목 | 내용 |
| --- | --- |
| 경로 | `/masters` (또는 `/masters/[id]`) |
| 목적 | 13F 공시 기반 24 명 거장 추적 + 따라잡기 |
| 레이아웃 | 좌 24 명 리스트 (검색 · 스타일 칩) + 우 상세 (프로필 hero + Top 10 보유 + 분기 변동 + 투자 철학 3 카드) |
| 액션 | 팔로우 → `follows` · 보유 종목 클릭 → 종목 상세 · 분기 변동 카드 클릭 → 종목 상세 수급 탭 |
| 데이터 의존 | `master_holdings` · `follows` · 관리자가 입력한 `master_profiles` |

### Reports + Report Detail

| 항목 | 내용 |
| --- | --- |
| 리스트 경로 | `/reports` |
| 상세 경로 | `/reports/[id]` |
| 목적 | 30+ RSS 소스에서 자동 수집한 PDF 리포트를 Docling 으로 마크다운 추출 + Gemini 로 요약하여 빠르게 소비 |
| 리스트 화면 | 검색 · 필터 칩 (전체 · 미국 IB · 한국 증권사 · 거시 · 섹터 · 종목분석 · ETF · 기간) · 추천 hero + 사이드 카드 2 + 최신 리포트 리스트 (각 카드 ✨ AI 요약 + 관련 티커 태그) |
| 상세 화면 | 표지 + 메타 + 액션 (★ 북마크 · 원문 PDF · 메모) / AI 요약 hero / 좌 목차 sticky + 본문 (마크다운) + 우 사이드 (관련 종목 · 태그 · 관련 리포트 · 내 메모) |
| 데이터 의존 | `reports` · `reports.tables_json` · `user_report_bookmarks` · `notes` |

### Portfolio · 4 Tabs

| 항목 | 내용 |
| --- | --- |
| 경로 | `/portfolio` |
| 목적 | 자기 자산을 시장 평균과 비교 |
| 탭 | 요약 · 보유 · 거래 · 성과 |
| 요약 탭 | 총자산 hero (KRW 환산) · 자산 배분 도넛 · 섹터 분산 · 내 수익률 vs 시장 평균 (1Y · 5Y) |
| 보유 탭 | 보유 종목 표 (수량 · 평단 · 현재가 · 평가손익 · 비중) |
| 거래 탭 | (별도 거래 내역 화면으로 흡수됨, 이 탭에서는 최근 10 건만 표시 + 전체 보기 링크) |
| 성과 탭 | 1 년 리포트 · 월별 히트맵 · 양도세 시뮬레이터 |
| 데이터 의존 | `holdings` · `transactions` · `quotes` · `indices` (벤치마크) |

### Learn

| 항목 | 내용 |
| --- | --- |
| 경로 | `/learn` |
| 목적 | 입문자용 가이드 + 용어 사전 |
| 구조 | 입문자 hero · 카테고리 칩 · 가이드 카드 그리드 · 자주 찾는 용어 미리보기 |
| 데이터 의존 | `articles` · `terms` · `bookmarks` |

### My Page · Hub

| 항목 | 내용 |
| --- | --- |
| 경로 | `/me` |
| 목적 | 모든 개인 데이터의 통합 허브 |
| 좌측 사이드 | 개요 · 내 관심종목 · 팔로우 고수 · 북마크 용어 · 저장 검색조건 · 메모 / 일지 · 활동 기록 |
| 본문 | 프로필 hero · KPI 카드 4 개 (관심종목 · 팔로우 · 북마크 · 저장 검색) · 관심종목 리스트 + 최근 활동 |
| 데이터 의존 | `auth.users` · `watchlists` · `follows` · `bookmarks` · `saved_screens` · `notes` |

### Transactions

| 항목 | 내용 |
| --- | --- |
| 경로 | `/me/transactions` |
| 목적 | 매수 · 매도 · 배당 · 입출금 직접 입력 (자동 연동 없음) |
| 상단 | 5 KPI 카드 (총 거래 · 올해 매수 · 올해 매도 · 실현 손익 · 수수료) · 검색 + 필터 칩 + 기간 / 통화 셀렉터 |
| 본문 | 거래 표 (날짜 · 구분 · 종목 · 수량 · 단가 · 통화 · 금액 · 수수료 · 편집) |
| 액션 | + 거래 입력 모달 · CSV 가져오기 · 내보내기 · 행 편집 / 삭제 |
| 데이터 의존 | `transactions` (`holdings` 는 트리거로 자동 계산) |

### Account Settings

| 항목 | 내용 |
| --- | --- |
| 경로 | `/me/settings` |
| 목적 | 프로필 · 보안 · 환경 설정 |
| 좌측 사이드 | 프로필 · 비밀번호 · 연결된 소셜 · 시장 / 통화 · 언어 / 타임존 · 테마 · 알림 설정 · 데이터 내보내기 · 회원 탈퇴 |
| 폼 항목 | 프로필 사진 · 이름 · 닉네임 · 이메일 · 기본 통화 · 언어 · 테마 · 알림 6 종 토글 |
| 데이터 의존 | `auth.users` · `user_preferences` |

### Login

| 항목 | 내용 |
| --- | --- |
| 경로 | `/login` |
| 목적 | 로그인 / 회원가입 / OAuth |
| 구조 | 좌측 브랜드 비주얼 + 우측 OAuth (Google · Apple · Kakao) + 이메일 로그인 폼 |
| 데이터 의존 | Supabase Auth |

### Admin Dashboard

| 항목 | 내용 |
| --- | --- |
| 경로 | `/admin` (RLS + role check) |
| 목적 | 콘텐츠 운영 + 시스템 모니터링 |
| 식별 | 다크 레드 톱바 + 별도 색상으로 구분 |
| 좌측 사이드 | 대시보드 · 고수 · 13F 파싱 · 학습 콘텐츠 · 용어 사전 · 뉴스 큐레이션 · 사용자 · API 사용량 · Cron 로그 · 공지사항 |
| KPI | DAU · 신규 가입 (7 일) · 오늘 API 호출 · Cron 실패 카운트 |
| 본문 카드 | 고수 CRUD · 학습 콘텐츠 CRUD · Cron 작업 / 데이터 품질 · 외부 API 사용량 (사용률 막대) |
| 데이터 의존 | 모든 테이블 + `cron_logs` · `api_quota` |

### Mobile · Home and Stock Detail

| 항목 | 내용 |
| --- | --- |
| 우선순위 | 홈 + 종목 상세 두 화면만 (PWA · iOS Safari 대응) |
| 패턴 | 가로 스크롤 지수 스트립 · 가로 스크롤 탭바 · 하단 5 칸 탭바 (홈 · 분석 · 검색 · 포폴 · 더보기) · 종목 상세에서 하단 액션바 (메모 · 거래 추가) |

### States · Empty / Error

모든 데이터 위젯에 일관 적용해야 한다.

| 상태 | 처리 |
| --- | --- |
| 빈 — 관심종목 0 개 | ★ 아이콘 + 안내 + 추천 종목 칩 (시총 상위 7 종) |
| 빈 — 포트폴리오 첫 진입 | 📊 + 안내 + (+ 거래 추가 / CSV 가져오기) + 최근 조회 종목 |
| 에러 — 갱신 실패 | 이전 데이터를 opacity 0.5 로 유지 + ⚠ 갱신시각 + 재시도 버튼 |
| 에러 — API 한도 초과 | warn 박스 + 다음 갱신 시각 + 어제 종가 기준 표시 |
| 에러 — 네트워크 실패 | ✕ + 안내 + 다시 시도 버튼 |
| 에러 — 종목 없음 | 🔍 + 입력값 + 형식 가이드 + 예시 칩 |
| 갱신시각 표준 | 정상 (`갱신 14:32 ↻`) · 지연 (warn 색) · 실패 재시도 (down 색) 3 패턴 |

## Data Architecture

100% 공식 무료 + 재배포 가능 소스만 사용한다. KIS 등 증권사 OpenAPI 는 계좌보유자 한정 + 재배포 금지라 사용하지 않는다.

### External Data Sources

| 소스 | 용도 | 한도 | 라이선스 |
| --- | --- | --- | --- |
| KRX OpenAPI | 한국주 일별 종가 · 지수 | 1 만 / 일 | 재배포 OK |
| DART | 한국 재무 · 공시 | 1 만 / 일 | 공공 · 재배포 OK |
| Finnhub Free | 미국 시세 (15 분 지연) | 60 / min | 개인 · 소규모 OK |
| SEC EDGAR | 미국 재무 · 공시 · 13F | 무제한 | 공공 · 재배포 OK |
| FRED | 매크로 · 금리 · 환율 | 무제한 | 공공 · 재배포 OK |
| Stooq (CSV) | 미국주 일별 백업 | 무제한 (RSS/CSV) | 재배포 OK |
| Alpha Vantage | 환율 · CPI 보조 | 25 / 일 · 5 / 분 | 빠듯 |
| 리포트 RSS 30+ | BOK · KDI · IMF · OECD · BIS · BlackRock 등 | 무제한 | 공식 RSS 헤드라인 + 링크 OK |
| NewsAPI | 글로벌 뉴스 | 100 / 일 | 빠듯 |
| Naver/Daum RSS | 한국 뉴스 헤드라인 | 무제한 | 헤드라인 + 링크만 |
| Gemini 1.5 Flash | 리포트 · 뉴스 AI 요약 | 1,500 / 일 | 무료 티어 OK |
| arXiv / SSRN RSS | 학술 RSS | 무제한 | 공식 RSS OK |

### Disallowed Sources

| 소스 | 사유 |
| --- | --- |
| 네이버 / 다음 본문 스크래핑 | 약관 위반 + 차단 |
| yfinance | 비공식 · 차단 위험 |
| KIS 등 증권사 OpenAPI | 계좌보유자 한정 + 재배포 금지 |

### Data Flow

```text
[외부 API · 공식 무료]
        │  scheduled fetch
        ▼
[Vercel Cron + GitHub Actions Worker]
        │  upsert
        ▼
[Supabase · Postgres (캐시 + 사용자 데이터)]
        │  Row-level Security
        ▼
[Next.js 14 App Router · 사용자 화면]
        │  read/write
        ▼
[관리자 화면 (/admin)]
```

### Report Pipeline

리포트 파이프라인은 별도 GitHub Actions Worker 에서 돌린다.

1. 매일 06:00 KR · 06:30 GLOBAL — 리포트 RSS 30+ 폴링하여 신규 PDF URL 을 `reports` 테이블에 insert.
2. 매일 07:00 — Docling 워커가 PDF → Markdown + 표 JSON 추출 후 `reports.markdown` 과 `reports.tables_json` 에 upsert. (GitHub Actions 무료 2,000 분 / 월, 작업당 약 1 ~ 2 분)
3. 매일 07:30 — Gemini 1.5 Flash 가 한글 요약 + 영문 번역 + 핵심 포인트 5 개 + 자동 티커 태깅을 생성하여 `reports.summary` 등에 upsert.

## Database Schema

Supabase Postgres. 모든 사용자 테이블에 RLS 적용.

### System / Cache Tables

| 테이블 | 핵심 컬럼 | 노트 |
| --- | --- | --- |
| `quotes` | symbol · px · pct · ts | 분 단위 미국 시세 캐시 |
| `quotes_daily` | symbol · date · open · high · low · close · vol | 한국주 일별 (KRX) + 미국주 백업 |
| `indices` | code · value · change · spark[] | KOSPI · S&P 등 |
| `sentiment` | code · value · band · ts | VIX · F&G · V-KOSPI 9 종 |
| `financials` | symbol · period (Y/Q) · is_json · bs_json · cf_json · ratios_json | DART + EDGAR |
| `news` | id · src · title · url · summary · tickers[] · sentiment · published_at | RSS + NewsAPI |
| `master_holdings` | master_id · symbol · weight · shares · qoq_delta · quarter | 13F 분기 갱신 |
| `master_profiles` | id · name · firm · style · philosophy_md · books · videos | 관리자 입력 |
| `reports` | id · src · category · title · pdf_url · markdown · summary · tickers[] · tags[] · published_at | Docling + Gemini |
| `reports_tables` | report_id · idx · table_json | Docling 추출 |
| `articles` | id · category · title · md · published_at · status | 학습 가이드 |
| `terms` | id · term · definition · related_tickers[] · category | 용어 사전 |
| `cron_logs` | id · job · started_at · finished_at · status · err | 관리자 모니터 |
| `api_quota` | provider · day · used · limit | 일별 사용량 누적 |
| `alerts_queue` | id · user_id · rule · status · evaluated_at | 알림 평가 큐 |

### User Data Tables (RLS)

| 테이블 | 핵심 컬럼 |
| --- | --- |
| `auth.users` | Supabase Auth 기본 |
| `user_preferences` | user_id · currency · language · theme · notif_json |
| `watchlists` | user_id · name · symbols[] |
| `follows` | user_id · master_id |
| `bookmarks` | user_id · type (term/article/report) · ref_id |
| `holdings` | user_id · symbol · qty · avg_px · currency |
| `transactions` | user_id · ts · type (buy/sell/div/cash) · symbol · qty · px · fee · currency |
| `notes` | user_id · symbol_or_ref · md · created_at |
| `saved_screens` | user_id · name · filters_json |
| `user_report_bookmarks` | user_id · report_id · note_md |
| `alerts` | user_id · rule_json · channel (push/email) · enabled |

### RLS Policies

- 모든 사용자 테이블은 `user_id = auth.uid()` 정책을 기본 SELECT / INSERT / UPDATE / DELETE 에 적용한다.
- 시스템 테이블 (`quotes` 등) 은 anon 에 SELECT 만 허용한다.
- 관리자 테이블은 `auth.jwt()->>'role' = 'admin'` 으로 게이트한다.

## Internal API Surface

Next.js 14 App Router 기준. 사용자 화면은 가능한 곳에서 Server Component 로 직접 Supabase 를 읽는다. 변경 / 외부 호출이 필요한 곳만 Route Handler 또는 Server Action.

| 메서드 + 경로 | 용도 |
| --- | --- |
| `GET /api/search?q=` | 종목 · 고수 · 용어 · 리포트 통합 검색 |
| `GET /api/stock/[ticker]` | 종목 상세 한 번에 묶음 (개요 탭 시드) |
| `POST /api/transactions` | 거래 입력 (트리거로 `holdings` 재계산) |
| `POST /api/screener/save` | 스크리너 조건 저장 |
| `POST /api/alerts` | 알림 규칙 등록 |
| `POST /api/admin/master/[id]` | 고수 CRUD (admin only) |
| `POST /api/admin/article` | 학습 글 CRUD (admin only) |
| `POST /api/cron/quotes-us` | Vercel Cron 트리거 (시크릿 헤더로 보호) |
| `POST /api/cron/reports-rss` | 리포트 RSS 폴링 |
| `POST /api/cron/reports-docling` | Docling 처리 (GitHub Actions 호출) |
| `POST /api/cron/reports-summary` | Gemini 요약 |
| `POST /api/cron/alerts-eval` | 알림 평가 (DB 만 사용, 외부 호출 0) |

모든 cron 엔드포인트는 `Authorization: Bearer ${CRON_SECRET}` 헤더로 보호한다.

## Cron and Scheduled Jobs

Vercel Cron + GitHub Actions Worker 조합. 모든 작업의 호출량 합계가 무료 한도 안에 들어가도록 설계됨.

| 작업 | 빈도 | 1 회 호출 | 일 총 | 외부 API | 한도 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| 미 시세 (15 분 · 장중) | 32 회 / 일 | 600 | 19,200 | Finnhub Free | 60/min · 86,400/일 | 안전 |
| 한 시세 (일 1 회 18:30) | 1 회 / 일 | 1 bulk | 1 | KRX OpenAPI | ~10K / 일 | 안전 |
| 지수 · 환율 (15 분) | 96 회 / 일 | 12 | 1,152 | Finnhub + FRED | 여유 | 안전 |
| 시장 심리 (15 분) | 96 회 / 일 | 6 | 576 | Finnhub + 스크랩 | 여유 | 안전 |
| 재무 (일 1 회 03:00) | 1 회 / 일 | ~500 | 500 | DART + EDGAR | DART 10K · EDGAR 무제한 | 안전 |
| 뉴스 (30 분) | 48 회 / 일 | ~10 | 480 | RSS + NewsAPI | RSS 무제한 · NewsAPI 100 | 빠듯 |
| 13F (분기 1 회) | 1 회 / 90 일 | ~10 | ~0.1 | SEC EDGAR | 무제한 | 안전 |
| 알림 평가 (1 분, DB) | 1,440 회 / 일 | 0 | 0 | — (외부 호출 없음) | — | 안전 |
| 리포트 RSS 폴링 | 2 회 / 일 | ~30 | ~60 | RSS | 무제한 | 안전 |
| Docling 워커 | 1 회 / 일 | 가변 | 약 1~2 분 / 작업 | (외부 호출 없음) | GH Actions 2K 분 / 월 | 안전 |
| Gemini 요약 | 1 회 / 일 | ~65 | ~65 | Gemini 1.5 Flash | 1,500 / 일 | 안전 |

> [!NOTE]
> '장중' 정의는 한국 09:00 ~ 15:30 + 미국 22:30 ~ 익일 05:00 (KST) · 합계 약 8 시간 → 32 회 (15 분 간격).

> [!CAUTION]
> NewsAPI 100 / 일 은 빠듯하므로 한국 뉴스는 Naver / Daum RSS 우선, NewsAPI 는 글로벌 헤드라인만 사용. 캐시 TTL 을 길게 잡아 한도 안정 확보.

## Tech Stack

| 영역 | 선택 | 사유 |
| --- | --- | --- |
| 프론트 | Next.js 14 App Router · React 18 | Server Component 로 캐시 활용 + Vercel 친화 |
| 스타일 | CSS 변수 + Pretendard + JetBrains Mono | 라이트/다크 토글 단일 속성 + 한국어 우선 + 숫자 mono |
| UI 토큰 | 자체 토큰 (`design/tokens.jsx` 기반) | Robinhood + Toss 하이브리드 핀테크 룩 |
| 차트 | 자체 SVG 엔진 (그리기 도구 포함) | TradingView 라이트는 워터마크 · Chart.js 는 그리기 도구 부족 |
| DB | Supabase Postgres | RLS + Auth + Edge Function 통합 + 무료 500MB |
| Auth | Supabase Auth (Email + Google + Apple + Kakao) | OAuth 통합 |
| Cron 단기 | Vercel Cron | Hobby 무료 |
| Cron 무거움 | GitHub Actions Worker | Docling · Gemini 처리 (2K 분 / 월 무료) |
| AI | Gemini 1.5 Flash | 1,500 req / 일 무료 + 한국어 우수 |
| PDF 추출 | Docling (Python) | 표 JSON 까지 추출 |
| 모니터링 | Vercel Analytics + Supabase Logs | 기본 |
| 에러 추적 | Sentry Free | 5K event / 월 |
| 분석 | Plausible (자체 호스팅 옵션) 또는 Umami | 가벼운 트래커 |

## Deployment Topology

```text
[GitHub repo: stocklab]
    │  push to main
    ├──► [Vercel Production · app.stocklab.io]
    │       └─ Next.js 14 + Cron jobs (≤10s)
    │
    ├──► [GitHub Actions]
    │       ├─ Docling worker (07:00 KST 매일)
    │       └─ Gemini summary (07:30 KST 매일)
    │
    └──► [Preview deploys per PR]

[Supabase project: stocklab]
    ├─ Postgres (DB · RLS)
    ├─ Auth (Email · Google · Apple · Kakao)
    ├─ Storage (PDF 백업, 옵션)
    └─ Edge Functions (선택, 가벼운 변환)
```

### Environments

| 환경 | URL | DB | 용도 |
| --- | --- | --- | --- |
| dev | `localhost:3000` | Supabase project (dev) | 개발 |
| preview | `*.vercel.app` | Supabase project (preview) | PR 단위 |
| production | `app.stocklab.io` | Supabase project (prod) | 운영 |

### Secrets / Environment Variables

| 변수 | 용도 |
| --- | --- |
| `SUPABASE_URL` | 클라이언트 · 서버 공통 |
| `SUPABASE_ANON_KEY` | 클라이언트 |
| `SUPABASE_SERVICE_KEY` | 서버 (cron · admin) |
| `CRON_SECRET` | Vercel Cron 헤더 인증 |
| `KRX_API_KEY` | 한국주 시세 |
| `DART_API_KEY` | 한국 재무 / 공시 |
| `FINNHUB_API_KEY` | 미국 시세 |
| `FRED_API_KEY` | 매크로 |
| `NEWSAPI_KEY` | 뉴스 보조 |
| `ALPHAVANTAGE_KEY` | 환율 / CPI 보조 |
| `GEMINI_API_KEY` | AI 요약 |
| `OAUTH_GOOGLE_*` · `OAUTH_KAKAO_*` · `OAUTH_APPLE_*` | 소셜 로그인 |
| `SENTRY_DSN` | 에러 추적 |

### CI/CD

- main 브랜치 push → Vercel 자동 배포.
- PR 생성 → Preview 배포 + 프리뷰 Supabase 환경.
- 빌드 시 `next build` + 타입체크 + 린트 + e2e (Playwright) 일부.
- 배포 게이트: 빌드 실패 / 타입 에러 / e2e smoke 실패 시 머지 차단.

## Operations

### Monitoring

| 신호 | 도구 | 임계 |
| --- | --- | --- |
| Cron 실패 | `cron_logs` + Admin 대시보드 | 1 회 실패 → warn · 3 회 연속 → 알림 (이메일) |
| API 사용량 | `api_quota` + Admin 대시보드 | 한도 80% 도달 시 warn · 100% 시 캐시 전용 모드 |
| 에러율 | Sentry | 5xx > 1% / 15 min |
| 페이지 성능 | Vercel Analytics + Lighthouse CI | LCP > 2.5s / TTI > 4s 시 점검 |
| DB 사용량 | Supabase 대시보드 | 350 MB 이상 시 archive 정책 발동 |

### Backups

- Supabase 자동 일별 백업 (Free 7 일 보관).
- 주 1 회 `pg_dump` 를 GitHub Actions 로 받아 별도 저장소 (private) 에 보관.

### Incident Playbook

| 상황 | 대응 |
| --- | --- |
| 외부 API 한도 초과 | Admin 대시보드 알림 → 캐시 데이터 표시 (opacity 0.5 + 경고 배지) → 다음 갱신 시각 안내 |
| 갱신 실패 (cron) | 자동 재시도 3 회 (지수 백오프) → 실패 지속 시 Admin 알림 + 해당 위젯에 경고 배지 |
| Supabase 다운 | 정적 fallback 페이지 (지난 종가 · 오늘 일정만) |
| Vercel 다운 | 사용자에게는 에러 화면 · 별도 대안 없음 (지인 서비스) |
| 데이터 품질 이상 | Admin → 데이터 품질 페이지 → 13F 보정 · 뉴스 핀/숨김 |

### Maintenance Windows

- 점검은 한국 시간 새벽 03:00 ~ 04:00 사이로 한정 (재무 cron 후, 시장 심리 cron 직전).
- 점검 시 헤더 배너 (`<!-- @formatter:off -->` 안의 정적 메시지) 로 사전 공지.

## Security

| 항목 | 내용 |
| --- | --- |
| 인증 | Supabase Auth (이메일 + OAuth Google / Apple / Kakao) |
| 인가 | Postgres RLS + 관리자 role JWT 클레임 |
| 비밀 관리 | Vercel · GitHub Secrets 만 사용 · 코드 / 클라이언트 노출 금지 |
| Cron 보호 | `CRON_SECRET` 헤더 + IP allowlist (가능 시) |
| HTTPS | Vercel 자동 |
| CSRF | Next.js Server Action + same-site cookie 기본 |
| XSS | React 기본 + Markdown 렌더 시 sanitize (DOMPurify) |
| Rate limit | Edge middleware + Supabase row count 제한 |
| 로그 PII | 사용자 식별 정보는 로그에 남기지 않음 (user_id 만) |

## License and Compliance

| 항목 | 내용 |
| --- | --- |
| 데이터 라이선스 | KRX · DART · EDGAR · FRED 공공 재배포 OK / Finnhub Free 약관 준수 / RSS 헤드라인 + 링크만 |
| 사용 금지 | 네이버 / 다음 본문 스크래핑 · yfinance · 증권사 OpenAPI |
| 면책 | 모든 시세는 참고용 · 투자 판단 책임은 사용자 (페이지 푸터 + 첫 로그인 안내) |
| 개인정보 | 최소 수집 (이메일 · 닉네임) · 거래 내역은 사용자 본인만 접근 (RLS) |

## Costs and Scaling Triggers

| 항목 | 현재 | 트리거 시 |
| --- | --- | --- |
| 도메인 | 연 1.5 만원 (.io) | — |
| Vercel | Hobby 무료 | DAU 1K 초과 또는 Cron 시간 초과 시 Pro ($20/월) |
| Supabase | Free 500MB / 50K MAU | DB 350MB 초과 시 archive 정책 / 50K 초과 시 Pro ($25/월) |
| GitHub Actions | 2K 분 / 월 무료 | 리포트 폭주 시 Pro 분 추가 ($0.008/분) |
| Gemini | 1,500 / 일 무료 | 사용자 증가 시 paid tier 검토 |
| Sentry | 5K event 무료 | — |
| 모니터링 | 기본 무료 | — |

## Open Questions

- [ ] 한국주 분 단위 시세를 무료로 확보할 길이 정말 없는지 재조사 (예: KRX 정보데이터시스템 추가 API)
- [ ] 컨센서스 (KR) 데이터를 증권사 RSS / 회사 IR 자동 수집으로 보완 가능 여부
- [ ] PWA 푸시 알림 vs 이메일 알림 우선순위 결정
- [ ] 거래 내역 자동 가져오기 (CSV) 표준 포맷 정의 (키움 · 미래에셋 · 토스 · IBKR 등)
- [ ] Docling 표 추출 정확도 샘플 검증 후 fallback 정책 결정
- [ ] 약관 / 개인정보 처리방침 초안 작성 (지인 한정이라도 필요)

## Roadmap

| 단계 | 범위 | 기간 추정 |
| --- | --- | --- |
| M0 · 인프라 | Supabase 프로젝트 · 스키마 · RLS · OAuth 3 종 · Vercel 연결 · 시크릿 세팅 | 1 주 |
| M1 · 시세 + 홈 | 시세 cron · 지수 cron · 홈 화면 (지수 + 관심종목 + 시장 심리) | 2 주 |
| M2 · 종목 상세 8 탭 | 차트 SVG 엔진 · 재무 · 적정가치 · 공시 · 뉴스 · 수급 · 목표주가 | 3 주 |
| M3 · 분석 + 스크리너 | 분석 4 탭 · 시장 지도 · 스크리너 + 저장 | 2 주 |
| M4 · 고수 + 13F + 리포트 | 13F 파싱 · 거장 24 명 · 리포트 RSS + Docling + Gemini | 3 주 |
| M5 · 포트폴리오 + 거래 | 4 탭 · 트랜잭션 모달 · holdings 트리거 | 2 주 |
| M6 · 학습 + 마이 + 설정 | Learn · 마이페이지 · 설정 폼 · 알림 | 1 주 |
| M7 · 관리자 | /admin · CRUD · 모니터 | 1 주 |
| M8 · 모바일 + 상태 가이드 | PWA · 모바일 두 화면 · 빈 / 에러 상태 적용 | 1 주 |
| M9 · 베타 오픈 | 지인 50 명 초대 · 피드백 수집 | — |

## References

- 와이어프레임: [STOCKLAB Wireframes v2](computer:///Users/hakseong/Downloads/finance/STOCKLAB%20Wireframes%20v2.html)
- 디자인: [STOCKLAB Design v1](computer:///Users/hakseong/Downloads/finance/STOCKLAB%20Design.html)
- 데이터 다이어그램: 와이어프레임 v2 의 `데이터 아키텍처` 섹션
