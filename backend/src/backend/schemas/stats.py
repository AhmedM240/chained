from pydantic import BaseModel


class StatsResponse(BaseModel):
    played: int
    wins: int
    win_rate: int  # whole-number percent, 0-100
    current_streak: int
    max_streak: int
    miss_distribution: list[int]  # index = misses in a won game: [perfect, 1 miss, 2 misses]