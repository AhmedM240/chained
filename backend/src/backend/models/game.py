from datetime import UTC, datetime

from sqlmodel import Field, SQLModel

from backend.constants import STARTING_LIVES


class Game(SQLModel, table = True):
    id : int | None = Field(default=None, primary_key=True)
    puzzle_id : int = Field(foreign_key="puzzle.id")
    session_id : str #replace with user_id later
    current_position : int = Field(default=0)
    lives : int = Field(default=STARTING_LIVES)
    game_status : str = Field(default="in_progress") #States will be in_progress, lost, won
    created_at : datetime = Field(default_factory=lambda: datetime.now(UTC))

