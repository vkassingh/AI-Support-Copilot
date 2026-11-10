require("dotenv").config();
const fetch = require("node-fetch");
globalThis.fetch = fetch;
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tickets = [];
let nextId = 1;

app.post("/tickets", (req, res) => {
  const { title, description, customerName } = req.body;
  if (!title || !description || !customerName)
    return res.status(400).json({ error: "title, description, customerName required" });
  const ticket = {
    id: nextId++,
    title,
    description,
    customerName,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.get("/tickets", (req, res) => res.json(tickets));

app.get("/tickets/:id", (req, res) => {
  const ticket = tickets.find((t) => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
});

app.post("/tickets/:id/draft-reply", async (req, res) => {
  const ticket = tickets.find((t) => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const prompt = `You are a helpful customer support agent. Write a professional and empathetic reply to the following support ticket.

Customer Name: ${ticket.customerName}
Ticket Title: ${ticket.title}
Issue Description: ${ticket.description}

Write a concise reply addressing their issue.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent(prompt);
    res.json({ ticketId: ticket.id, draftReply: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
});

app.patch("/tickets/:id/approve", (req, res) => {
  const ticket = tickets.find((t) => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  ticket.status = "approved";
  res.json(ticket);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
