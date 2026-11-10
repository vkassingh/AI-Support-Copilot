require("dotenv").config();
const fetch = require("node-fetch");
globalThis.fetch = fetch;

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./db");
const Ticket = require("./models/Ticket");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /tickets - Create ticket
app.post("/tickets", async (req, res) => {
  const { title, description, customerId } = req.body;
  if (!title || !description || !customerId)
    return res.status(400).json({ error: "title, description, customerId required" });
  try {
    const ticket = await Ticket.create({ title, description, customerId });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tickets - List all tickets
app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("customerId", "email role")
      .populate("assignedAgentId", "email role")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tickets/:id - Get single ticket
app.get("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customerId", "email role")
      .populate("assignedAgentId", "email role");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tickets/:id/draft-reply - Generate AI draft via Gemini
app.post("/tickets/:id/draft-reply", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("customerId", "email");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const prompt = `You are a helpful customer support agent. Write a professional and empathetic reply to the following support ticket.

Customer: ${ticket.customerId?.email || "Customer"}
Ticket Title: ${ticket.title}
Issue Description: ${ticket.description}

Write a concise reply addressing their issue.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const aiDraft = result.response.text();

    // Save AI draft to ticket
    ticket.aiDraft = aiDraft;
    await ticket.save();

    res.json({ ticketId: ticket._id, draftReply: aiDraft });
  } catch (err) {
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
});

// PATCH /tickets/:id/approve - Approve and save final reply
app.patch("/tickets/:id/approve", async (req, res) => {
  try {
    const { finalReply } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", finalReply: finalReply || "" },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tickets/:id/assign - Assign agent to ticket
app.patch("/tickets/:id/assign", async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedAgentId: agentId, status: "pending" },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users - Create user
app.post("/users", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const user = await User.create({ email, password, role });
    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - List all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
