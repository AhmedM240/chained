import json
from datetime import date as date_type
from pathlib import Path

from sqlmodel import Session, col, select

from backend.db import engine
from backend.models.chain_word import ChainWord
from backend.models.puzzle import Puzzle


def load_seed_data() -> list[dict]:
    path = Path(__file__).parent.parent / "seed_data" / "puzzles.json"
    with open(path) as f:
        return json.load(f)


def seed():
    data = load_seed_data()
    with Session(engine) as session:
        for entry in data:
            puzzle_date = date_type.fromisoformat(entry["date"])
            words = entry["words"]

            existing = session.exec(
                select(Puzzle).where(col(Puzzle.date) == puzzle_date)
            ).first()
            if existing:
                print(f"Skipping {puzzle_date} (already exists)")
                continue

            puzzle = Puzzle(date=puzzle_date, chain_length=len(words))
            session.add(puzzle)
            session.flush()  # assigns puzzle.id without committing yet
            assert puzzle.id is not None

            for position, answer in enumerate(words):
                session.add(
                    ChainWord(puzzle_id=puzzle.id, position=position, answer=answer)
                )

            session.commit()  # puzzle and all its words saved together
            print(f"Seeded puzzle for {puzzle_date} with {len(words)} words")


if __name__ == "__main__":
    seed()