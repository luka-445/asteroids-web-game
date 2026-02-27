const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "database", "leaderboard.db");
const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;