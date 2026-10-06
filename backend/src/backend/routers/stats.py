from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import col, select

from backend.constants import IN_PROGRESS, STARTING_LIVES, WON
from backend.db import SessionDependency
from backend.models.game import Game
from backend.models.puzzle import Puzzle
from backend.schemas.stats import StatsResponse

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _max_streak(results: dict[date, bool]) -> int:
    best = run = 0
    last_win: date | None = None
    for day in sorted(results):
        if results[day]:
            run = run + 1 if last_win == day - timedelta(days=1) else 1
            last_win = day
            best = max(best, run)
        else:
            run = 0
            last_win = None
    return best


def _current_streak(results: dict[date, bool], today: date) -> int:
    # if today's chain isn't finished yet, the streak is still alive from yesterday
    day = today if today in results else today - timedelta(days=1)
    streak = 0
    while results.get(day) is True:
        streak += 1
        day -= timedelta(days=1)
    return streak


@router.get("", response_model=StatsResponse)
def get_stats(
    session_id: Annotated[str, Query(min_length=8, max_length=64)],
    session: SessionDependency,
):
    rows = session.exec(
        select(col(Puzzle.date), col(Game.game_status), col(Game.lives))
        .select_from(Game)
        .join(Puzzle, col(Puzzle.id) == col(Game.puzzle_id))
        .where(Game.session_id == session_id, Game.game_status != IN_PROGRESS)
    ).all()

    results: dict[date, bool] = {}
    distribution = [0] * STARTING_LIVES
    for puzzle_date, status, lives in rows:
        won = status == WON
        results[puzzle_date] = won
        if won:
            distribution[STARTING_LIVES - lives] += 1

    played = len(results)
    wins = sum(results.values())

    return StatsResponse(
        played=played,
        wins=wins,
        win_rate=round(100 * wins / played) if played else 0,
        current_streak=_current_streak(results, datetime.now(UTC).date()),
        max_streak=_max_streak(results),
        miss_distribution=distribution,
    )