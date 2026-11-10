require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const allowedOrigins = [
  "http://localhost:3001",
  "https://ai-support-copilot-frontend.vercel.app",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ""));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

connectDB();

app.use("/auth", require("./routes/auth"));
app.use("/tickets", require("./routes/tickets"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
