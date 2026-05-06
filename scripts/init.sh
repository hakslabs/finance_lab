#!/usr/bin/env bash
set -euo pipefail

# :rst:
# Initialize the STOCKLAB harness directory layout.
#
# Creates the canonical ``docs/`` skeleton and the ``scripts/`` directory.
# Safe to run repeatedly (idempotent).
# :rst:

mkdir -p docs/design-docs
mkdir -p docs/exec-plans/active
mkdir -p docs/exec-plans/completed
mkdir -p docs/generated
mkdir -p docs/product-specs
mkdir -p docs/references
mkdir -p scripts
