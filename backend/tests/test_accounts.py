from sqlmodel import select

from backend.models.game import Game

EMAIL = "player@example.com"
PASSWORD = "correct-horse-battery"
OTHER_DEVICE = {"X-Session-Id": "second-device-session"}


def register(client, **kwargs):
    return client.post("/api/auth/register", json={"email": EMAIL, "password": PASSWORD}, **kwargs)


def login(client, **kwargs):
    return client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, **kwargs)


def start_game(client, **kwargs) -> dict:
    return client.post("/api/games", **kwargs).json()


def test_signing_up_claims_your_guest_game(client, session, todays_chain):
    game = start_game(client)
    client.post(f"/api/games/{game['game_id']}/guess", json={"guess": "fire"})

    register(client)
    after = start_game(client)

    assert after["game_id"] == game["game_id"]
    assert after["current_pos"] == 1
    assert session.exec(select(Game)).one().user_id is not None


def test_your_game_follows_you_to_another_device(client, todays_chain):
    register(client)
    game = start_game(client)

    client.cookies.clear()  # a different browser: no cookie, different session id
    login(client, headers=OTHER_DEVICE)
    elsewhere = start_game(client, headers=OTHER_DEVICE)

    assert elsewhere["game_id"] == game["game_id"]


def test_signing_out_gives_you_a_fresh_guest_game(client, todays_chain):
    register(client)
    account_game = start_game(client)
    client.post("/api/auth/logout")

    guest_game = start_game(client)
    assert guest_game["game_id"] != account_game["game_id"]


def test_account_game_wins_over_a_guest_copy(client, session, todays_chain):
    register(client)
    account_game = start_game(client)

    client.cookies.clear()
    guest_game = start_game(client, headers=OTHER_DEVICE)  # same puzzle, played as a guest elsewhere
    login(client, headers=OTHER_DEVICE)

    assert start_game(client, headers=OTHER_DEVICE)["game_id"] == account_game["game_id"]
    unclaimed = session.get(Game, guest_game["game_id"])
    assert unclaimed is not None and unclaimed.user_id is None


def test_stats_follow_the_account(client, todays_chain):
    register(client)
    game = start_game(client)
    for word in todays_chain:
        client.post(f"/api/games/{game['game_id']}/guess", json={"guess": word})

    client.cookies.clear()
    login(client, headers=OTHER_DEVICE)
    stats = client.get("/api/stats", headers=OTHER_DEVICE).json()
    assert stats["wins"] == 1