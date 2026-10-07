from sqlmodel import select

from backend.models.user import User
from backend.security import COOKIE_NAME

EMAIL = "player@example.com"
PASSWORD = "correct-horse-battery"


def register(client, email=EMAIL, password=PASSWORD):
    return client.post("/api/auth/register", json={"email": email, "password": password})


def login(client, email=EMAIL, password=PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


# ---------- register ----------

def test_register_creates_account_and_signs_in(client):
    res = register(client)
    assert res.status_code == 201
    assert res.json()["email"] == EMAIL
    assert client.get("/api/auth/me").status_code == 200


def test_auth_cookie_is_httponly(client):
    res = register(client)
    set_cookie = res.headers["set-cookie"].lower()
    assert COOKIE_NAME in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie


def test_password_is_never_stored_in_plain_text(client, session):
    register(client)
    user = session.exec(select(User)).one()
    assert user.hashed_password != PASSWORD
    assert user.hashed_password.startswith("$argon2")


def test_email_is_normalized_to_lowercase(client):
    res = register(client, email="Player@Example.COM")
    assert res.json()["email"] == "player@example.com"


def test_duplicate_email_is_rejected(client):
    register(client)
    res = register(client, email=EMAIL.upper())
    assert res.status_code == 409


def test_short_password_is_rejected(client):
    assert register(client, password="short").status_code == 422


def test_invalid_email_is_rejected(client):
    assert register(client, email="not-an-email").status_code == 422


# ---------- login ----------

def test_login_with_correct_password(client):
    register(client)
    client.cookies.clear()
    res = login(client)
    assert res.status_code == 200
    assert client.get("/api/auth/me").json()["email"] == EMAIL


def test_wrong_password_and_unknown_email_look_the_same(client):
    register(client)
    wrong_password = login(client, password="wrong-password")
    unknown_email = login(client, email="nobody@example.com")
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


# ---------- me / logout ----------

def test_me_requires_sign_in(client):
    assert client.get("/api/auth/me").status_code == 401


def test_logout_signs_out(client):
    register(client)
    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_tampered_token_is_rejected(client):
    client.cookies.set(COOKIE_NAME, "not.a.real-token")
    assert client.get("/api/auth/me").status_code == 401