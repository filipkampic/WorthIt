const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use("/auth", authRoutes);
app.use("/items", itemsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
    res.send("WorthIt backend radi!");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
