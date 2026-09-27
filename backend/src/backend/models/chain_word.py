from sqlmodel import Field, SQLModel


class ChainWord(SQLModel, table = True):
    id : int | None = Field(default=None, primary_key=True)
    puzzle_id : int = Field(foreign_key="puzzle.id")
    position : int
    answer : str

