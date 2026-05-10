const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("WorthIt backend radi!");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
