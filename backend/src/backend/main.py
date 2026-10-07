from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth, games, puzzle, stats

app = FastAPI()

app.include_router(puzzle.router)
app.include_router(games.router)
app.include_router(stats.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
