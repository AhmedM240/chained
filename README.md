# Chained

A daily word-chain game, in the spirit of Wordle: each word in the chain forms a compound word/phrase with the one before it (e.g., Street → Sign → Language → Barrier). Players are shown only the first letter of each word and guess their way down the chain.

Built as a full-stack learning project — FastAPI backend, React frontend, PostgreSQL database, deployed manually on AWS EC2.

## Tech Stack

- **Backend**: FastAPI + SQLModel + PostgreSQL
- **Migrations**: Alembic
- **Frontend**: React + Vite (TypeScript)
- **Local dev database**: Docker Compose
- **Deployment**: AWS EC2 (manual setup — nginx, systemd, Let's Encrypt)

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package/dependency manager)
- Node.js (LTS)
- Docker Desktop

## Setup

### 1. Clone and enter the repo
```bash
git clone <repo-url>
cd chained
```

### 2. Start the local database
```bash
docker compose up -d
```

### 3. Backend setup
```bash
cd backend
cp .env.example .env   # then fill in real local values
uv sync
uv run fastapi dev src/backend/main.py
```
Backend runs at `http://127.0.0.1:8000` — interactive docs at `/docs`.

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Project Structure

```
chained/
  backend/
    src/backend/
      main.py       # FastAPI app entrypoint
      config.py     # environment/config loading
      models/       # SQLModel table definitions
      routers/       # API route definitions
    .env.example
  frontend/          # React + Vite app
  docker-compose.yml # local Postgres
  .env.example
```

## Environment Variables

Both `backend/.env.example` and the root `.env.example` show what's required. Copy each to `.env` and fill in real values before running locally — never commit `.env` files.

## Status

Actively in development.