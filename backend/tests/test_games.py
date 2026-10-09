from sqlmodel import select

from backend.models.guess import Guess
import pytest
from sqlalchemy.exc import IntegrityError

from backend.models.game import Game
from backend.models.puzzle import Puzzle


INTRUDER = {"X-Session-Id": "someone-elses-session"}

def start_game(client, **kwargs) -> dict:
    res = client.post("/api/games", **kwargs)
    assert res.status_code == 201
    return res.json()


def guess(client, game_id: int, text: str):
    return client.post(f"/api/games/{game_id}/guess", json={"guess": text})


# ---------- starting a game ----------

def test_new_game_starts_fresh(client, todays_chain):
    game = start_game(client)
    assert game["current_pos"] == 0
    assert game["lives"] == 3
    assert game["game_status"] == "in_progress"
    assert game["words"][0]["revealed"] == "F___"


def test_answers_never_leak_for_unsolved_words(client, todays_chain):
    game = start_game(client)
    for word in game["words"]:
        assert word["answer"] is None
    for word in game["words"][1:]:
        assert set(word["revealed"]) == {"_"}


def test_starting_twice_returns_the_same_game(client, todays_chain):
    first = start_game(client)
    res = client.post("/api/games")
    assert res.status_code == 200
    assert res.json()["game_id"] == first["game_id"]


def test_no_puzzle_today_returns_404(client):
    res = client.post("/api/games")
    assert res.status_code == 404


# ---------- guessing ----------

def test_correct_guess_advances_and_reveals_the_word(client, todays_chain):
    game = start_game(client)
    res = guess(client, game["game_id"], "fire")  # lowercase on purpose: matching is case-insensitive
    body = res.json()
    assert res.status_code == 200
    assert body["is_correct"] is True
    assert body["game"]["current_pos"] == 1
    assert body["game"]["words"][0]["answer"] == "Fire"


def test_wrong_guess_costs_a_life_and_reveals_a_letter(client, todays_chain):
    game = start_game(client)
    body = guess(client, game["game_id"], "frog").json()
    assert body["is_correct"] is False
    assert body["game"]["lives"] == 2
    assert body["game"]["current_pos"] == 0
    assert body["game"]["words"][0]["revealed"] == "FI__"
    assert body["game"]["words"][0]["misses"] == 1


def test_guesses_are_recorded(client, session, todays_chain):
    game = start_game(client)
    guess(client, game["game_id"], "frog")
    guess(client, game["game_id"], "fire")
    rows = session.exec(select(Guess).order_by(Guess.id)).all() # type: ignore
    assert [(g.guess_text, g.is_correct, g.attempt_number) for g in rows] == [
        ("frog", False, 1),
        ("fire", True, 2),
    ]


def test_three_misses_loses_and_reveals_everything(client, todays_chain):
    game = start_game(client)
    for wrong in ["frog", "fish", "fork"]:
        body = guess(client, game["game_id"], wrong).json()
    assert body["game"]["game_status"] == "lost"
    assert body["game"]["lives"] == 0
    assert [w["answer"] for w in body["game"]["words"]] == todays_chain


def test_solving_every_word_wins(client, todays_chain):
    game = start_game(client)
    for word in todays_chain:
        body = guess(client, game["game_id"], word).json()
    assert body["game"]["game_status"] == "won"
    assert body["game"]["current_pos"] == len(todays_chain)


def test_guessing_on_a_finished_game_returns_409(client, todays_chain):
    game = start_game(client)
    for wrong in ["frog", "fish", "fork"]:
        guess(client, game["game_id"], wrong)
    res = guess(client, game["game_id"], "fire")
    assert res.status_code == 409


def test_unknown_game_returns_404(client):
    res = guess(client, 99999, "fire")
    assert res.status_code == 404


def test_empty_guess_is_rejected(client, todays_chain):
    game = start_game(client)
    res = guess(client, game["game_id"], "")
    assert res.status_code == 422


# ---------- stats ----------

def test_win_shows_up_in_stats(client, todays_chain):
    game = start_game(client)
    for word in todays_chain:
        guess(client, game["game_id"], word)
    stats = client.get("/api/stats").json()
    assert stats["played"] == 1
    assert stats["wins"] == 1
    assert stats["current_streak"] == 1
    assert stats["miss_distribution"] == [1, 0, 0]


def test_missing_session_header_is_rejected(client, todays_chain):
    res = client.post("/api/games", headers={"X-Session-Id": ""})
    assert res.status_code == 422


def test_another_player_cannot_guess_on_your_game(client, todays_chain):
    game = start_game(client)
    res = client.post(f"/api/games/{game['game_id']}/guess", json={"guess": "fire"}, headers=INTRUDER)
    assert res.status_code == 404


def test_another_player_cannot_view_your_game(client, todays_chain):
    game = start_game(client)
    res = client.get(f"/api/games/{game['game_id']}", headers=INTRUDER)
    assert res.status_code == 404


def test_database_rejects_a_second_game_for_the_same_player(session, todays_chain):
    puzzle = session.exec(select(Puzzle)).one()
    session.add(Game(puzzle_id=puzzle.id, session_id="dup-session"))
    session.commit()

    session.add(Game(puzzle_id=puzzle.id, session_id="dup-session"))
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()