require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "https://worthit-fk.netlify.app"],
    methods: ["GET", "POST", "DELETE", "PUT"]
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const savedRoutes = require("./routes/savedRoutes");

app.use("/auth", authRoutes);
app.use("/items", itemsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/profile", profileRoutes);
app.use("/saved", savedRoutes);

app.get("/", (req, res) => {
    res.send("WorthIt backend radi!");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
