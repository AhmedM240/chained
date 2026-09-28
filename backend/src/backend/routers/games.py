from fastapi import APIRouter, HTTPException, Response
from sqlmodel import func, select

from backend.db import SessionDependency
from backend.models.chain_word import ChainWord
from backend.models.game import Game
from backend.models.guess import Guess
from backend.routers.queries import get_chain_words, get_puzzle
from backend.schemas.game import (
    ChainWordState,
    GameCreateRequest,
    GameState,
    GuessCreateRequest,
    GuessResponse,
)

router = APIRouter(prefix="/api/games", tags=["games"])


#GameStates
IN_PROGRESS = "in_progress"
LOST = "lost"
WON = "won"


def get_game_state(game: Game, chain_words: list[ChainWord]) -> GameState:
    assert game.id is not None
    finished = game.game_status != IN_PROGRESS

    return GameState(
        game_id= game.id,
        puzzle_id=game.puzzle_id,
        current_pos=game.current_position,
        lives = game.lives,
        game_status= game.game_status,
        words=[
            ChainWordState(
                position=word.position,
                first_letter=word.answer[0].upper(),
                answer=word.answer if finished or word.position < game.current_position else None,
            )
            for word in chain_words
        ],
    )

@router.post("", response_model=GameState)
def create_game(body: GameCreateRequest, session : SessionDependency, response : Response):
    puzzle = get_puzzle(session)

    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzle found for today")
    assert puzzle.id is not None

    game = session.exec(
        select(Game).where(
            Game.session_id == body.session_id,
            Game.puzzle_id == puzzle.id,
        )
    ).first()

    if game is None:
        game = Game(puzzle_id=puzzle.id, session_id= body.session_id)
        session.add(game)
        session.commit()
        session.refresh(game)
        response.status_code = 201

    return get_game_state(game, get_chain_words(session, puzzle.id))


@router.get("/{game_id}", response_model=GameState)
def get_game(game_id : int, session : SessionDependency):
    game = session.get(Game, game_id)

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return get_game_state(game, get_chain_words(session, game.puzzle_id))


@router.post("/{game_id}/guess", response_model= GuessResponse)
def submit_guess(game_id: int, body: GuessCreateRequest, session : SessionDependency):
    game = session.get(Game, game_id)

    if game is None:
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


    return GuessResponse(is_correct=is_correct, game = get_game_state(game, chain_words))

