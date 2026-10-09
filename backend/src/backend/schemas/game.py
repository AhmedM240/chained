from datetime import date

from pydantic import BaseModel, Field


class GuessCreateRequest(BaseModel):
    guess : str = Field(min_length=1, max_length=30)

class ChainWordState(BaseModel):
    position : int
    length : int
    revealed : str
    misses : int
    answer : str | None = None

class GameState(BaseModel):
    game_id : int
    puzzle_id : int
    puzzle_number : int
    puzzle_date : date
    current_pos : int
    lives : int
    game_status : str
    words : list[ChainWordState]

class GuessResponse(BaseModel):
    is_correct : bool
    game : GameState

