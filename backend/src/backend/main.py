from fastapi import FastAPI


from backend.routers import auth, games, puzzle, stats

app = FastAPI()

app.include_router(puzzle.router)
app.include_router(games.router)
app.include_router(stats.router)
app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "ok"}
