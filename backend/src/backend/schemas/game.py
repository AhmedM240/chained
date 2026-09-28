from pydantic import BaseModel, Field


class GameCreateRequest(BaseModel):
    session_id : str = Field(min_length=8, max_length=64)

class GuessCreateRequest(BaseModel):
    guess : str = Field(min_length=1, max_length=30)

class ChainWordState(BaseModel):
    position : int
    first_letter : str
    answer : str | None = None

class GameState(BaseModel):
    game_id : int
    puzzle_id : int
    current_pos : int
    lives : int
    game_status : str
    words : list[ChainWordState]

class GuessResponse(BaseModel):
    is_correct : bool
    game : GameState

    