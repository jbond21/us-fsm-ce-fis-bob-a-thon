#!/bin/bash
# =============================================================================
# generate-htpasswd.sh
# Generates an htpasswd file for workshop users.
#
# Usage:
#   ./generate-htpasswd.sh <num_users> --password <password>
#
# Example:
#   ./generate-htpasswd.sh 20 --password Workshop2026!
#
# Each user's password will be: <username><password>
# e.g. user01Workshop2026!
#
# Requirements:
#   - Python 3 with a virtualenv set up (see README.md for setup instructions)
# =============================================================================

set -euo pipefail

# ── Validate arguments ────────────────────────────────────────────────────────
if [[ $# -ne 3 ]] || [[ "$2" != "--password" ]]; then
  echo "Usage: $0 <num_users> --password <password>"
  echo "Example: $0 20 --password Workshop2024!"
  exit 1
fi

NUM_USERS="$1"
PASSWORD="$3"

if ! [[ "$NUM_USERS" =~ ^[0-9]+$ ]] || [[ "$NUM_USERS" -lt 1 ]]; then
  echo "ERROR: num_users must be a positive integer."
  exit 1
fi

# ── Check virtualenv is active ────────────────────────────────────────────────
if [[ -z "${VIRTUAL_ENV:-}" ]]; then
  echo "ERROR: No active Python virtualenv detected."
  echo ""
  echo "Activate your virtualenv first:"
  echo "  source .venv/bin/activate"
  echo ""
  echo "If you have not set up a virtualenv yet, see the setup instructions in README.md"
  exit 1
fi

# ── Check bcrypt is available ─────────────────────────────────────────────────
if ! python3 -c "import bcrypt" &>/dev/null; then
  echo "ERROR: bcrypt is not installed in the active virtualenv."
  echo ""
  echo "Install dependencies with:"
  echo "  pip install -r requirements.txt"
  exit 1
fi

# ── Generate ──────────────────────────────────────────────────────────────────
python3 generate-htpasswd.py "$NUM_USERS" --password "$PASSWORD"
