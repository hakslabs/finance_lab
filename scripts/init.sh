#!/usr/bin/env bash
set -euo pipefail

# :rst:
# Initialize the STOCKLAB harness directory layout.
#
# Creates the canonical ``docs/`` skeleton, the ``scripts/`` directory, and the
# baseline ``app/`` scaffold.
# Safe to run repeatedly (idempotent).
# :rst:

mkdir -p docs/design-docs
mkdir -p docs/design-exports
mkdir -p docs/exec-plans/active
mkdir -p docs/exec-plans/completed
mkdir -p docs/generated
mkdir -p docs/product-specs
mkdir -p docs/references
mkdir -p scripts
mkdir -p app/'(public)'
mkdir -p app/'(auth)'
mkdir -p app/admin
mkdir -p app/api
mkdir -p app/_lib/ai
mkdir -p app/_lib/auth
mkdir -p app/_lib/charts
mkdir -p app/_lib/data
mkdir -p app/_lib/env
mkdir -p app/_lib/hooks
mkdir -p app/_lib/ui
mkdir -p app/_lib/utils
