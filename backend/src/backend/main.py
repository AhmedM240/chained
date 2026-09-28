from fastapi import FastAPI

from backend.routers import games, puzzle

app = FastAPI()

app.include_router(puzzle.router)
app.include_router(games.router)

@app.get("/health")
def health():
    return {"status": "ok"}
