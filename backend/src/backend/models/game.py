from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Game(SQLModel, table = True):
    id : int | None = Field(default=None, primary_key=True)
    puzzle_id : int = Field(foreign_key="puzzle.id")
    session_id : str #replace with user_id later
    current_position : int = Field(default=0)
    lives : int = Field(default=3)
    game_status : str = Field(default="in_progress") #States will be in_progress, lost, won
    created_at : datetime = Field(default_factory=lambda: datetime.now(UTC))

