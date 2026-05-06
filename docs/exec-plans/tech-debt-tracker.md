# Tech Debt Tracker

Track tradeoffs that were made knowingly and need follow-up. Items here are
**known compromises**, not unknown bugs.

## Open Debt

| ID | Item | Origin | Cost If Ignored | Earliest Fix |
| --- | --- | --- | --- | --- |
| TD-001 | KR minute-level quotes are not available on free tiers | Plan §Open Questions | Real-time KR price gap on home and stock detail | Re-evaluate KRX additional APIs at M1 review |
| TD-002 | KR analyst consensus data is missing | Plan §Open Questions | "목표주가" tab is partial for KR tickers | Investigate brokerage RSS / IR scraping at M2 |
| TD-003 | NewsAPI 100 / day quota is tight | Plan §Cron table | Global news pipeline can hit the wall on busy days | Lengthen TTL, prefer Naver/Daum RSS for KR |
| TD-004 | Docling table extraction accuracy unverified | Plan §Open Questions | "공시·실적" tables may be wrong for some PDFs | Sample audit on a 20-PDF set at M4 entry |
| TD-005 | CSV import format for transactions is undecided | Plan §Open Questions | Manual entry friction on M5 launch | Define schema for Kiwoom / Mirae / Toss / IBKR at M5 |
| TD-006 | Push notifications vs. email priority undecided | Plan §Open Questions | Alerts ship without a delivery channel | Decide before M6 (settings + alerts) |
| TD-007 | Privacy policy and ToS drafts are missing | Plan §Open Questions | Cannot legally invite friends in beta | Draft before M9 beta open |

## Prioritized Debt

Order in which open debt should be addressed:

1. TD-007 — required gate for M9 beta open.
2. TD-006 — gates M6 (alerts).
3. TD-005 — gates a pleasant M5 (transactions).
4. TD-004 — gates M4 confidence.
5. TD-001 / TD-002 — accept and document as a known limitation in
   `docs/PRODUCT_SENSE.md` until evidence changes.
6. TD-003 — operational, not blocking; address only if breached.

## Resolved Debt

(empty)

## Conventions

- Add an entry whenever a deliberate compromise is accepted.
- Add an `Earliest Fix` column entry tied to a milestone in
  `docs/PLANS.md`.
- Move resolved items to the "Resolved Debt" section with a one-line note on
  how they were closed; do not delete history.
