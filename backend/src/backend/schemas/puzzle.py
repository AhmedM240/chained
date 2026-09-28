from pydantic import BaseModel


class ChainWordPublic(BaseModel):
    position : int
    first_letter : str


class PuzzleTodayResponse(BaseModel):
    puzzle_id : int
    chain_length : int
    words : list[ChainWordPublic]

