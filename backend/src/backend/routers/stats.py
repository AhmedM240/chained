from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import col, select

from backend.constants import IN_PROGRESS, STARTING_LIVES, WON
from backend.db import SessionDependency
from backend.models.game import Game
from backend.models.puzzle import Puzzle
from backend.schemas.stats import StatsResponse
from backend.streaks import current_streak, max_streak
from backend.deps import PlayerDependency
router = APIRouter(prefix="/api/stats", tags=["stats"])




@router.get("", response_model=StatsResponse)
def get_stats(
    player : PlayerDependency,
    session: SessionDependency,
):
    rows = session.exec(
        select(col(Puzzle.date), col(Game.game_status), col(Game.lives))
        .select_from(Game)
        .join(Puzzle, col(Puzzle.id) == col(Game.puzzle_id))
        .where(player.game_filter(), Game.game_status != IN_PROGRESS)
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
        current_streak=current_streak(results, datetime.now(UTC).date()),
        max_streak=max_streak(results),
        miss_distribution=distribution,
    )