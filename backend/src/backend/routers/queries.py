from datetime import UTC, datetime

from sqlmodel import Session, col, select

from backend.models.chain_word import ChainWord
from backend.models.puzzle import Puzzle


def get_puzzle(session: Session) -> Puzzle | None:
    today = datetime.now(UTC).date()
    
    return session.exec(
        select(Puzzle).where(Puzzle.date == today)
    ).first()


def get_chain_words(session: Session, puzzle_id : int) -> list[ChainWord]:
    return list(session.exec(
        select(ChainWord)
        .where(ChainWord.puzzle_id == puzzle_id)
        .order_by(col(ChainWord.position))).all())