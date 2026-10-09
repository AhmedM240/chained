from datetime import UTC, datetime

from sqlmodel import Field, SQLModel
from sqlalchemy import Index, text

from backend.constants import STARTING_LIVES


class Game(SQLModel, table = True):
    __table_args__ = (
        Index(
            "uq_game_user_puzzle",
            "user_id",
            "puzzle_id",
            unique=True,
            postgresql_where=text("user_id IS NOT NULL"),
        ),
        Index(
            "uq_game_guest_puzzle",
            "session_id",
            "puzzle_id",
            unique=True,
            postgresql_where=text("user_id IS NULL"),
        ),
    )
    id : int | None = Field(default=None, primary_key=True)
    puzzle_id : int = Field(foreign_key="puzzle.id")
    session_id : str #replace with user_id later
    current_position : int = Field(default=0)
    lives : int = Field(default=STARTING_LIVES)
    game_status : str = Field(default="in_progress") #States will be in_progress, lost, won
    created_at : datetime = Field(default_factory=lambda: datetime.now(UTC))
    user_id: int | None = Field(default=None, foreign_key="users.id", index=True)

