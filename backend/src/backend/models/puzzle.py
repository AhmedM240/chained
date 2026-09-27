from datetime import date as date_type

from sqlmodel import Field, SQLModel


class Puzzle(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date : date_type = Field(unique=True, index=True)
    chain_length: int = Field(ge=4,le=6)

