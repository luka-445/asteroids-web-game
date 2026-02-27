/**
 * db.js
 * 
 * creats the SQlite database file (leaderboard.db).
 * makes sure that the scores table exists
 */

const path = require("path"); // for building a safe file path to the database
const Database = require("better-sqlite3"); // SQlite driver

// absoulte path to the database file sotred in src/database/leaderboard.db
const DB_PATH = path.join(__dirname, "..", "database", "leaderboard.db"); 
const db = new Database(DB_PATH); // open or creates the database file if it doesn't exist

// creates the score table if its doesn't exist yet.
// id is an autoincrementing primary key
// player_name is the name the user submits
// score/time_seconds are integers with constraints to prevent negative values
// created_at records when the score was submitted.
db.exec(`
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db; // exports the database connection so other files can run queries