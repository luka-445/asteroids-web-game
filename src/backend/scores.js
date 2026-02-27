const express = require("express");
const db = require("./db");

const router = express.Router();

// Post scores
router.post("/", (req, res) => {
    const nameRaw = (req.body?.name ?? "").toString().trim();
    const scoreRaw = req.body?.score;
    const timeRaw = req.body?.timeSeconds;

    const name = nameRaw.length ? nameRaw.slice(0, 16) : "Player";
    const score = Number(scoreRaw);
    const timeSeconds = Number(timeRaw);

    if (!Number.isFinite(score) || score < 0)
    {
        return res.status(400).json({ error: "Invalid Score" });
    }

    if (!Number.isFinite(timeSeconds) || timeSeconds < 0)
    {
        return res.status(400).json({ error: "Invalid timeSeconds"});
    }

    const stmt = db.prepare(
        "INSERT INTO scores (player_name, score, time_seconds) VALUES (?, ?, ?)"
    );

    const info = stmt.run(name, Math.floor(score), Math.floor(timeSeconds));

    return res.json({ ok: true, id: info.lastInsertRowid });
});

// GET scores
router.get("/", (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 10) || 10, 50);

    const rows = db.prepare(
        `SELECT player_name AS name, score, time_seconds AS timeSeconds, created_at AS createdAt
       FROM scores
       ORDER BY score DESC, created_at ASC
       LIMIT ?`
    ).all(limit);

    return res.json(rows);
});

module.exports = router;