from dataclasses import dataclass
from typing import Annotated

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlmodel import and_, col

from backend.db import SessionDependency
from backend.models.game import Game
from backend.models.user import User
from backend.security import COOKIE_NAME, decode_access_token


@dataclass
class Player:
    session_id: str
    user: User | None

    @property
    def user_id(self) -> int | None:
        return self.user.id if self.user else None

    def game_filter(self):
        if self.user_id is not None:
            return col(Game.user_id) == self.user_id
        return and_(
            col(Game.session_id) == self.session_id, col(Game.user_id).is_(None)
        )

    def owns(self, game: Game) -> bool:
        if game.user_id is not None:
            return game.user_id == self.user_id
        return game.session_id == self.session_id


def get_current_user_optional(
    session: SessionDependency,
    token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None,
) -> User | None:

    if not token:
        return None

    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return session.get(User, user_id)


def get_current_user(
    user: Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in"
        )
    return user


OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def get_player(
    user: OptionalUser,
    x_session_id: Annotated[str, Header(min_length=8, max_length=64)],
) -> Player:
    return Player(session_id=x_session_id, user=user)


PlayerDependency = Annotated[Player, Depends(get_player)]