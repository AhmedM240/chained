# Chained

A daily word-chain game in the spirit of Wordle. Each word in the chain forms a compound word or phrase with the one before it (e.g., Street → Sign → Language → Barrier). Players see only the first letter of each word and guess their way down the chain.

Built as a full-stack learning project: FastAPI backend, React frontend, PostgreSQL database, deployed manually on AWS EC2.

## Features

- **A new chain every day** (4–6 words), shared by every player and reset at midnight UTC
- **Three lives**: each wrong guess breaks a link and reveals the next letter of the current word
- **Play as a guest or with an account**: guest progress (including your streak) moves into your account when you sign up or sign in
- **Stats and streaks**: games played, win rate, current and best streak, miss distribution
- **Spoiler-free sharing**: copy an emoji summary of your result
- **Server-authoritative game logic**: answers never reach the browser until a word is solved

## Tech Stack

- **Backend**: FastAPI, SQLModel, PostgreSQL, Alembic (migrations)
- **Auth**: email + password, Argon2 hashing (pwdlib), JWT (PyJWT) stored in an httpOnly cookie
- **Frontend**: React + Vite (TypeScript), Tailwind CSS v4, lucide-react icons
- **Testing**: pytest with a dedicated test database
- **Tooling**: uv (Python dependencies), Docker Compose (local Postgres)
- **Deployment**: AWS EC2 with nginx, systemd, and Let's Encrypt (in progress)

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Node.js (LTS)
- Docker Desktop

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/AhmedM240/chained.git
cd chained
```

### 2. Start the database

The root `.env` holds the credentials Docker Compose uses to create the local Postgres container.

```bash
cp .env.example .env   # then fill in a user, password, and database name
docker compose up -d
```

### 3. Backend

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env`: `DATABASE_URL` must match the credentials from the root `.env`, and `SECRET_KEY` should be a long random value:

```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Then install dependencies, create the tables, load the puzzles, and start the server:

```bash
uv sync
uv run alembic upgrade head
uv run python scripts/seed_puzzles.py
uv run fastapi dev src/backend/main.py
```

The API runs at `http://127.0.0.1:8000`, with interactive docs at `/docs`.

### 4. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies every `/api` request to the backend, so the frontend and API share one origin (the same arrangement nginx provides in production).

To try it on a phone, use the **Network** address Vite prints. The phone must be on the same Wi-Fi network.

## Running Tests

The tests use their own database and refuse to run against any database whose URL doesn't contain "test", since every table is emptied between tests.

```bash
# one time: create the test database
./scripts/db-shell.sh -c "CREATE DATABASE chained_test;"
```

Add `TEST_DATABASE_URL` to `backend/.env` (see `.env.example`), then:

```bash
cd backend
uv run pytest -v
```

## Useful Commands

| Task | Command |
|---|---|
| Open a `psql` shell on the local database | `./scripts/db-shell.sh` |
| Run one SQL statement | `./scripts/db-shell.sh -c "SELECT * FROM puzzle;"` |
| Stop the database (data is kept) | `docker compose down` |
| Stop the database and **delete all data** | `docker compose down -v` |
| Create a migration after changing a model | `uv run alembic revision --autogenerate -m "describe the change"` |
| Apply migrations | `uv run alembic upgrade head` |
| Add more puzzles | append to `backend/seed_data/puzzles.json`, then rerun the seed script (existing dates are skipped) |
| Production build of the frontend | `npm run build`, then `npm run preview` to serve it |
| Run the backend in production mode | `uv run fastapi run src/backend/main.py` |

Always read a generated migration before applying it. Autogenerate only knows about models imported in `backend/models/__init__.py`, and anything it can't see, it proposes to drop.

## API Overview

Every request includes an `X-Session-Id` header (a random ID the browser keeps) that identifies guests. Signed-in requests also carry the `chained_auth` cookie, which takes priority.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/puzzle/today` | Today's puzzle: chain length and first letters only |
| `POST` | `/api/games` | Get or create the player's game for today |
| `GET` | `/api/games/{id}` | Current state of one of the player's games |
| `POST` | `/api/games/{id}/guess` | Submit a guess for the current word |
| `GET` | `/api/stats` | The player's stats and streaks |
| `POST` | `/api/auth/register` | Create an account (claims this browser's guest games) |
| `POST` | `/api/auth/login` | Sign in (claims this browser's guest games) |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | The signed-in user, or `401` |

## Project Structure

```
chained/
  backend/
    src/backend/
      main.py          # FastAPI app entrypoint
      config.py        # settings loaded from environment / .env
      db.py            # database engine and session dependency
      deps.py          # current user and player dependencies
      security.py      # password hashing and JWT handling
      streaks.py       # streak calculations (pure functions)
      constants.py     # game status values, starting lives
      models/          # SQLModel table definitions
      schemas/         # request/response shapes
      routers/         # API routes: auth, games, puzzle, stats
    alembic/           # database migrations
    scripts/           # seed script
    seed_data/         # puzzle content (puzzles.json)
    tests/             # pytest suite
    .env.example
  frontend/
    src/
      App.tsx          # page layout and game-state tracking
      api.ts           # all requests go through here
      use*.ts          # hooks: game, auth, stats, settings
      *.tsx            # components: board, modals, header, footer
  scripts/
    db-shell.sh        # psql inside the Postgres container
  docker-compose.yml   # local Postgres
  .env.example
```

## Environment Variables

Never commit `.env` files. Both `.env.example` files list what's needed.

**Root `.env`** (read by Docker Compose): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

**`backend/.env`** (read by the backend):

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Postgres connection string |
| `SECRET_KEY` | yes | — | Signs login tokens; use a unique random value per environment |
| `COOKIE_SECURE` | no | `false` | Must be `true` in production (HTTPS only) |
| `ACCESS_TOKEN_DAYS` | no | `30` | How long a login lasts |
| `DB_ECHO` | no | `false` | Log every SQL query |
| `PUZZLE_EPOCH` | no | `2026-09-21` | Date of puzzle #1, used for puzzle numbers |
| `TEST_DATABASE_URL` | for tests | — | Must point at a separate test database |

## Status

The game, accounts, stats, and test suite are complete. Deployment to AWS EC2 is in progress.