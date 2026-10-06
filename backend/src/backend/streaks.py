from datetime import date, timedelta


def max_streak(results: dict[date, bool]) -> int:
    """Longest run of consecutive days won. A loss or a skipped day ends a run."""
    best = run = 0
    last_win: date | None = None
    for day in sorted(results):
        if results[day]:
            run = run + 1 if last_win == day - timedelta(days=1) else 1
            last_win = day
            best = max(best, run)
        else:
            run = 0
            last_win = None
    return best


def current_streak(results: dict[date, bool], today: date) -> int:
    """Consecutive days won, counting back from today (or yesterday if today isn't finished)."""
    day = today if today in results else today - timedelta(days=1)
    streak = 0
    while results.get(day) is True:
        streak += 1
        day -= timedelta(days=1)
    return streak