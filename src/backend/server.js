const express = require("express");
const path = require("path");

const scoresRouter = require("./scores");

const app = express();
const PORT = 3000;

const ASSETS_DIR = path.join(__dirname, "..", "assets");
const FRONTEND_DIR =path.join(__dirname, "..", "frontend");


app.use(express.json());

app.use(express.static(FRONTEND_DIR));
app.use("/assets", express.static(ASSETS_DIR));

// api
app.use("/api/scores", scoresRouter);

app.listen(PORT, () => {
    console.log(`Server runnig at http://localhost:${PORT}`);
});
