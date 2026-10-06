from datetime import date

import pytest

from backend.streaks import current_streak, max_streak


def d(day: int) -> date:
    """Shorthand for a date in October 2026."""
    return date(2026, 10, day)


TODAY = d(10)


# ---------- max_streak ----------

def test_max_streak_empty():
    assert max_streak({}) == 0


def test_max_streak_counts_consecutive_wins():
    results = {d(1): True, d(2): True, d(3): True}
    assert max_streak(results) == 3


def test_max_streak_loss_breaks_the_run():
    results = {d(1): True, d(2): True, d(3): False, d(4): True}
    assert max_streak(results) == 2


def test_max_streak_skipped_day_breaks_the_run():
    results = {d(1): True, d(2): True, d(4): True, d(5): True, d(6): True}
    assert max_streak(results) == 3


def test_max_streak_ignores_insertion_order():
    results = {d(3): True, d(1): True, d(2): True}
    assert max_streak(results) == 3


# ---------- current_streak ----------

@pytest.mark.parametrize(
    ("results", "expected"),
    [
        pytest.param({}, 0, id="no games"),
        pytest.param({d(8): True, d(9): True, d(10): True}, 3, id="won today and the two days before"),
        pytest.param({d(8): True, d(9): True}, 2, id="today not finished, streak still alive"),
        pytest.param({d(9): True, d(10): False}, 0, id="lost today"),
        pytest.param({d(8): True}, 0, id="skipped yesterday"),
        pytest.param({d(9): False, d(10): True}, 1, id="won today after a loss"),
        pytest.param({d(8): True, d(10): True}, 1, id="gap before today"),
    ],
)
def test_current_streak(results, expected):
    assert current_streak(results, TODAY) == expected