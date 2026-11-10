require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(cors({
  origin: ["http://localhost:3001", process.env.FRONTEND_URL || ""],
  credentials: true,
}));
app.use(express.json());

connectDB();

app.use("/auth", require("./routes/auth"));
app.use("/tickets", require("./routes/tickets"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
