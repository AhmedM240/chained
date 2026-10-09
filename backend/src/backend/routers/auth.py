from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, select

from backend.config import settings
from backend.db import SessionDependency
from backend.deps import CurrentUser
from backend.models.game import Game
from backend.models.user import User
from backend.schemas.auth import LoginRequest, RegisterRequest, UserPublic
from backend.security import (
    COOKIE_NAME,
    DUMMY_HASH,
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
 

def _set_auth_cookie(response : Response, user_id : int) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value = create_access_token(user_id),
        max_age=settings.access_token_days * 24 * 60 * 60,
        httponly=True,
        secure = settings.cookie_secure,
        samesite="lax",
        path="/"
    )

def _claim_guest_games(session, user_id : int, session_id: str | None) -> None:
    """Attach this browser's guest games to the account, skipping puzzles the account already played."""
    if not session_id:
        return
    already_played = select(Game.puzzle_id).where(col(Game.user_id) == user_id)
    guest_games = session.exec(
        select(Game).where(
            col(Game.session_id) == session_id,
            col(Game.user_id).is_(None),
            col(Game.puzzle_id).not_in(already_played)
        )
    ).all()

    for game in guest_games:
        game.user_id = user_id
        session.add(game)
    session.commit()



def _public(user : User) -> UserPublic:
    assert user.id is not None
    return UserPublic(id=user.id, email=user.email)


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, session : SessionDependency, response : Response, x_session_id : Annotated[str | None, Header()] = None):
    user = User(email=body.email.lower(), hashed_password=hash_password(body.password))
    session.add(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    session.refresh(user)
    assert user.id is not None

    _claim_guest_games(session, user.id, x_session_id)
    _set_auth_cookie(response, user.id)

    return _public(user)


@router.post("/login", response_model=UserPublic)
def login(body: LoginRequest, session : SessionDependency, response : Response, x_session_id: Annotated[str | None, Header()] = None):
    user = session.exec(select(User).where(User.email == body.email.lower())).first()

    if user is None:
        verify_password(body.password, DUMMY_HASH)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "Incorrect email or password")

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    assert user.id is not None
    _claim_guest_games(session, user.id, x_session_id)
    _set_auth_cookie(response, user.id)
    
    return _public(user)


@router.post("/logout")
def logout() -> Response:
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(
        COOKIE_NAME, path ="/", httponly=True, secure = settings.cookie_secure, samesite = "lax"
    )
    return response


@router.get("/me", response_model=UserPublic)
def me(user : CurrentUser):
    return _public(user)

