CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
    created_at TEXT NOT NULL DEFAULT (datatime('now'))
);