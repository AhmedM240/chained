
from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, func, select

from backend.config import settings
from backend.constants import IN_PROGRESS, LOST, WON
from backend.db import SessionDependency
from backend.deps import Player, PlayerDependency
from backend.models.chain_word import ChainWord
from backend.models.game import Game
from backend.models.guess import Guess
from backend.models.puzzle import Puzzle
from backend.routers.queries import get_chain_words, get_puzzle
from backend.schemas.game import (
    ChainWordState,
    GameState,
    GuessCreateRequest,
    GuessResponse,
)

router = APIRouter(prefix="/api/games", tags=["games"])

def _find_game(session, player: Player, puzzle_id: int) -> Game | None:
    return session.exec(
        select(Game).where(Game.puzzle_id == puzzle_id, player.game_filter())
    ).first()


def _misses_by_word(session, game_id: int) -> dict[int, int]:
    rows = session.exec(
        select(Guess.chain_word_id, func.count())
        .where(Guess.game_id == game_id, col(Guess.is_correct).is_(False))
        .group_by(col(Guess.chain_word_id))
    ).all()
    return {chain_word_id: count for chain_word_id, count in rows}



def get_game_state(game: Game, chain_words: list[ChainWord], session) -> GameState:
    assert game.id is not None
    puzzle = session.get(Puzzle, game.puzzle_id)
    assert puzzle is not None

    misses = _misses_by_word(session, game.id)
    finished = game.game_status != IN_PROGRESS
    words = []

    for i, w in enumerate(chain_words):
        assert w.id is not None
        answer_upper = w.answer.upper()
        solved = finished or i < game.current_position
        word_misses = misses.get(w.id, 0)

        if solved:
            revealed = answer_upper
        elif i == game.current_position:
            reveal_len = min(1 + word_misses, len(w.answer) - 1)
            revealed = answer_upper[:reveal_len] + "_" * (len(w.answer) - reveal_len)
        else:
            revealed = "_" * len(w.answer)

        words.append(
            ChainWordState(
                position=w.position,
                length=len(w.answer),
                revealed=revealed,
                misses=word_misses,
                answer=w.answer if solved else None,
            )
        )

    assert game.id is not None
    return GameState(
        game_id=game.id,
        puzzle_id=game.puzzle_id,
        puzzle_number= (puzzle.date - settings.puzzle_epoch).days + 1,
        puzzle_date= puzzle.date,
        current_pos=game.current_position,
        lives=game.lives,
        game_status=game.game_status,
        words=words,
    )

@router.post("", response_model=GameState)
def create_game(player: PlayerDependency, session: SessionDependency, response: Response):
    puzzle = get_puzzle(session)
    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzle found for today")
    assert puzzle.id is not None

    game = _find_game(session, player, puzzle.id)

    if game is None:
        game = Game(puzzle_id=puzzle.id, session_id=player.session_id, user_id=player.user_id)
        session.add(game)
        try:
            session.commit()
            session.refresh(game)
            response.status_code = 201
        except IntegrityError:
            # another request created this player's game a moment ago; use that one
            session.rollback()
            game = _find_game(session, player, puzzle.id)
            assert game is not None

    return get_game_state(game, get_chain_words(session, puzzle.id), session)


@router.get("/{game_id}", response_model=GameState)
def get_game(player: PlayerDependency, game_id : int, session : SessionDependency):
    game = session.get(Game, game_id)

    if game is None or not player.owns(game):
        raise HTTPException(status_code=404, detail="Game not found")
    return get_game_state(game, get_chain_words(session, game.puzzle_id), session)


@router.post("/{game_id}/guess", response_model= GuessResponse)
def submit_guess(player: PlayerDependency, game_id: int, body: GuessCreateRequest, session : SessionDependency):
    game = session.get(Game, game_id)

    if game is None or not player.owns(game):
        raise HTTPException(status_code=404, detail="Game not found")
    if game.game_status != IN_PROGRESS:
        raise HTTPException(status_code=409, detail="Game already completed")
    assert game.id is not None

    chain_words = get_chain_words(session, game.puzzle_id)

    current_word = chain_words[game.current_position]
    assert current_word.id is not None

    guess_text = body.guess.strip()
    is_correct = guess_text.lower() == current_word.answer.strip().lower()

    previous_attempt = session.exec(
        select(func.count())
        .select_from(Guess)
        .where(Guess.game_id == game.id, Guess.chain_word_id == current_word.id)
    ).one()

    session.add(
        Guess(
            game_id=game.id,
            chain_word_id=current_word.id,
            guess_text=guess_text,
            is_correct=is_correct,
            attempt_number= previous_attempt + 1,
        )
    )

    if is_correct:
        game.current_position += 1
        if game.current_position >= len(chain_words):
            game.game_status = WON
    else:
        game.lives -= 1
        if game.lives <= 0:
            game.game_status = LOST

    session.add(game)
    session.commit()
    session.refresh(game)


    return GuessResponse(is_correct=is_correct, game = get_game_state(game, chain_words, session))

