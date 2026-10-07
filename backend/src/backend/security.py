from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from backend.config import settings

ALGORITHM = "HS256"
COOKIE_NAME = "chained_auth"

password_hash = PasswordHash.recommended()


DUMMY_HASH = password_hash.hash("not-a-real-password")


def hash_password(password : str) -> str:
    return password_hash.hash(password)

def verify_password(password : str, hashed : str) -> bool:
    return password_hash.verify(password, hashed)


def create_access_token(user_id : int) -> str:
    expires = datetime.now(UTC) + timedelta(days = settings.access_token_days)
    return jwt.encode({"sub" : str(user_id), "exp" : expires}, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token : str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None

    