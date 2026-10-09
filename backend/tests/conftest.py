from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from backend.config import settings
from backend.db import get_session
from backend.main import app
from backend.models.chain_word import ChainWord
from backend.models.puzzle import Puzzle

TEST_URL = settings.test_database_url
if not TEST_URL or "test" not in TEST_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL must be set and point at a test database. "
        "Refusing to run tests against anything else."
    )

engine = create_engine(TEST_URL)

CHAIN = ["Fire", "Fly", "Wheel", "Chair"]

GUEST_SESSION = "test-session-1"


@pytest.fixture(scope="session", autouse=True)
def create_schema():
    """Build all tables once before the test run, and drop them afterward."""
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def session():
    """A database session for one test. Every table is emptied afterward."""
    with Session(engine) as session:
        yield session
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE guess, game, chainword, puzzle, users RESTART IDENTITY CASCADE"))


@pytest.fixture
def client(session):
    """A test client whose routes use the test database session."""

    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app, headers={"X-Session-Id": GUEST_SESSION})
    app.dependency_overrides.clear()


@pytest.fixture
def todays_chain(session) -> list[str]:
    """Seed a puzzle for today's UTC date and return its words."""
    puzzle = Puzzle(date=datetime.now(UTC).date(), chain_length=len(CHAIN))
    session.add(puzzle)
    session.flush()
    assert puzzle.id is not None
    for position, answer in enumerate(CHAIN):
        session.add(ChainWord(puzzle_id=puzzle.id, position=position, answer=answer))
    session.commit()
    return CHAIN