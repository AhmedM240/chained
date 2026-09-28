#!/usr/bin/env bash
# Open a psql shell inside the local Postgres container.
# Extra arguments are passed through to psql, e.g. ./scripts/db-shell.sh -c "\dt"

cd "$(dirname "$0")/.." || exit 1

docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"' _ "$@"
