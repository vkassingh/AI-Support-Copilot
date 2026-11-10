require("dotenv").config();
const fetch = require("node-fetch");
globalThis.fetch = fetch;

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", require("./routes/auth"));
app.use("/tickets", require("./routes/tickets"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
