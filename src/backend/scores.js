/**
 * scores.js
 * 
 * defines routes such as POST and GET
 * 
 * validates data before being sent to the database
 */

const express = require("express"); // provides Router() for defining API endpoints
const db = require("./db"); // SQlite database connection

const router = express.Router(); // creates a router

/**
 * POST /api/scores
 * 
 * expects JSON body:
 * {
 *  name: PlayerName;
 *  score: number
 *  timeSeconds: number
 * }
 * 
 * returns: ok: ture, id: RowId
 */
router.post("/", (req, res) => {
    // read request fields
    const nameRaw = (req.body?.name ?? "").toString().trim();
    const scoreRaw = req.body?.score;
    const timeRaw = req.body?.timeSeconds;

    const name = nameRaw.length ? nameRaw.slice(0, 16) : "Player"; // reads name, also ensures that its a max of 16 character long and defaults to Player if input field is empty
    
    // Convert score/time to numbers if they aren't already
    const score = Number(scoreRaw);
    const timeSeconds = Number(timeRaw);

    // validate score
    if (!Number.isFinite(score) || score < 0)
    {
        return res.status(400).json({ error: "Invalid Score" });
    }

    // validate time
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0)
    {
        return res.status(400).json({ error: "Invalid timeSeconds"});
    }

    // prepars SQL statement
    const stmt = db.prepare(
        "INSERT INTO scores (player_name, score, time_seconds) VALUES (?, ?, ?)"
    );

    const info = stmt.run(name, Math.floor(score), Math.floor(timeSeconds)); // insert the row

    return res.json({ ok: true, id: info.lastInsertRowid }); // returns row
});

// GET /api/scores limits it to 10 results since leaderboard only displays top 10 scores
router.get("/", (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 10) || 10, 50); // parse limit default is 10, max is 50

    // query leaderboard rows and map database column names to frontend friendly names
    const rows = db.prepare(
        `SELECT player_name AS name, score, time_seconds AS timeSeconds, created_at AS createdAt
       FROM scores
       ORDER BY score DESC, created_at ASC
       LIMIT ?`
    ).all(limit); 

    return res.json(rows); // send JSON list to the frontend
});

module.exports = router; // export router