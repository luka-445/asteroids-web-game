/**
 * server.js
 * 
 * Starts the server, serves the frontend and shares assets
 */


const express = require("express"); // web server framework (routing + middleware)
const path = require("path"); // node utility for safe file paths

// import the scores API router this handles GET/POST for leaderboard
const scoresRouter = require("./scores");

const app = express(); // create the express application instance
const PORT = 3000; // port the server will listen on

// absolute paths to directories for code and assets
const ASSETS_DIR = path.join(__dirname, "..", "assets");
const FRONTEND_DIR =path.join(__dirname, "..", "frontend");

app.use(express.json()); // parse JSON requests this is required for POST

app.use(express.static(FRONTEND_DIR)); // serve frontend files to the server
app.use("/assets", express.static(ASSETS_DIR)); // serve shared assets to the server

// api routes
app.use("/api/scores", scoresRouter);

// start the server and log where to open it
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
