from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from backend.db import SessionDependency
from backend.models.user import User
from backend.security import COOKIE_NAME, decode_access_token


def get_current_user_optional(
    session : SessionDependency, 
    token : Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None,    
) -> User | None:

    if not token:
        return None

    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return session.get(User, user_id)



def get_current_user(
    user : Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in")
    return user

OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]
CurrentUser = Annotated[User, Depends(get_current_user)]



