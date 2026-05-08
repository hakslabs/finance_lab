# Design Docs Index

Design docs explain the **why** behind durable choices that are not obvious
from the code itself. Architecture lives in `ARCHITECTURE.md`. Feature
specifications live in `docs/product-specs/`. This folder is for principles,
philosophies, and explanatory notes.

## Active

- [Core Beliefs](./core-beliefs.md) — non-negotiable product, engineering,
  and verification principles.
- [Docling Worker Contract](./docling-worker-contract.md) — report conversion
  input/output, persistence, and audit gates.
- [Scrapling Allowlist Contract](./scrapling-allowlist-contract.md) — compliant
  HTML extraction boundaries and banned uses.
- [Scrapling Operating Mode Decision](./scrapling-operating-mode-decision.md) —
  GitHub Actions Python package as default; MCP deferred; graduation gates.
- [Scrapling Evaluation Plan](./scrapling-evaluation-plan.md) — evaluation
  records, intake workflow, pass/reject criteria, and PoC requirements for the
  three EP-0011 allowed source classes.
- [Docling Audit Set](./docling-audit-set.md) — 20-document audit manifest,
  metadata fields, acceptance rubric, and gate thresholds.

## Planned

- [ ] `chart-engine.md` — why a custom SVG chart engine instead of TradingView
      Lightweight or Chart.js. Add before the interactive chart engine work.
- [ ] `theme-system.md` — single `data-theme` toggle and CSS variable
      contract. Add when more than two component packs are themed.
- [ ] `report-pipeline.md` — RSS → Docling → Gemini design rationale and
      fallbacks beyond the worker contract. Add before the production report
      pipeline starts.
- [ ] `13f-parsing.md` — SEC EDGAR 13F ingestion strategy. Add before the
      production refresh work starts.

## Domain Guides

Domain guides live alongside the relevant code module once it exists. Link
back to them from this index.
