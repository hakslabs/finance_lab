# Feature Spec — Masters & 13F

**ID:** PS-05 · **Milestone:** M4 · **Path:** `/masters`, `/masters/[id]`

## Problem

A retail investor benefits from "shadowing" well-known investors. SEC EDGAR
13F filings are the only free, redistribution-friendly source for this. The
data exists but is hard to read, and the masters' philosophies are not
captured anywhere navigable.

## Scope

- A curated roster of **24 masters** (admin-managed).
- 13F holdings parsed from EDGAR, refreshed quarterly.
- Per-master profile with Top 10 holdings, quarterly delta, philosophy
  notes (admin-curated Markdown), and a link to books / videos.

## Layout

- **Left** — list of 24 masters with search and "style" chips (value,
  growth, quant, macro, …).
- **Right** — selected master's profile hero + Top 10 holdings + quarterly
  changes + 3 philosophy cards.

## User Actions

- Click a master → load that master's profile in the right pane.
- Click a holding → stock detail.
- Click a delta card → stock detail Supply / Demand tab.
- "Follow" toggle → writes `follows` row.

## Data Dependencies

`master_holdings` (auto), `master_profiles` (admin-edited), `follows`
(per-user).

## Constraints

- 13F parser handles the EDGAR `INFORMATION TABLE` XML and tolerates
  per-filer schema quirks. Failures fall back to "no update this quarter"
  with an admin alert.
- Holdings are stored per quarter (`quarter` column) so historical changes
  remain visible.
- Master profile Markdown renders through DOMPurify.

## Done When

- 24 masters have at least one quarter of `master_holdings` rows.
- Each master has a `master_profiles` row with at least the "philosophy"
  block populated.
- Follow / unfollow round-trips successfully.
- Quarterly refresh job runs end-to-end on a schedule and writes a
  `cron_logs` entry.
