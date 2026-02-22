const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const FRONTEND_DIR =path.join(__dirname, "..", "frontend");

app.use(express.static(FRONTEND_DIR));

app.listen(PORT, () => {
    console.log('Server runnig at http://localhost:${PORT}');
});
