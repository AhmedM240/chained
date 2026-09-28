
from fastapi import APIRouter, HTTPException

from backend.db import SessionDependency
from backend.routers.queries import get_chain_words, get_puzzle
from backend.schemas.puzzle import ChainWordPublic, PuzzleTodayResponse

router = APIRouter(prefix="/api/puzzle", tags=["puzzle"])


@router.get("/today")
def get_today_puzzle(session: SessionDependency):
    puzzle = get_puzzle(session)

    if not puzzle:
        raise HTTPException(status_code=404, detail="No Puzzle found for today")
    
    assert puzzle.id is not None

    chain_words = get_chain_words(session, puzzle.id)

    return PuzzleTodayResponse(
        puzzle_id=puzzle.id,
        chain_length=puzzle.chain_length,
        words=[
            ChainWordPublic(position=word.position, first_letter=word.answer[0].upper())
            for word in chain_words
        ],
    )


