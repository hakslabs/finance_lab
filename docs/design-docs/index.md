# Design Docs Index

Design docs explain the **why** behind durable choices that are not obvious
from the code itself. Architecture lives in `ARCHITECTURE.md`. Feature
specifications live in `docs/product-specs/`. This folder is for principles,
philosophies, and explanatory notes.

## Active

- [Core Beliefs](./core-beliefs.md) — non-negotiable product, engineering,
  and verification principles.

## Planned

- [ ] `chart-engine.md` — why a custom SVG chart engine instead of TradingView
      Lightweight or Chart.js. Add when M2 (stock detail) starts.
- [ ] `theme-system.md` — single `data-theme` toggle and CSS variable
      contract. Add when more than two component packs are themed.
- [ ] `report-pipeline.md` — RSS → Docling → Gemini design rationale and
      fallbacks. Add when M4 (reports) starts.
- [ ] `13f-parsing.md` — SEC EDGAR 13F ingestion strategy. Add when M4
      (masters / 13F) starts.

## Domain Guides

Domain guides live alongside the relevant code module once it exists. Link
back to them from this index.
