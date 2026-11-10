const router = require("express").Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Ticket = require("../models/Ticket");
const { auth, requireRole } = require("../middleware/auth");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /tickets - Customer creates ticket
router.post("/", auth, requireRole("customer"), async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ error: "title and description required" });
  try {
    const ticket = await Ticket.create({ title, description, customerId: req.user._id });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tickets - Customer sees own tickets, Agent sees all
router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "customer" ? { customerId: req.user._id } : {};
    const tickets = await Ticket.find(filter)
      .populate("customerId", "email")
      .populate("assignedAgentId", "email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tickets/:id - Get single ticket
router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customerId", "email")
      .populate("assignedAgentId", "email");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (req.user.role === "customer" && ticket.customerId._id.toString() !== req.user._id)
      return res.status(403).json({ error: "Access denied" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tickets/:id/draft-reply - Agent generates AI draft
router.post("/:id/draft-reply", auth, requireRole("agent"), async (req, res) => {
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

    ticket.aiDraft = aiDraft;
    await ticket.save();

    res.json({ ticketId: ticket._id, draftReply: aiDraft });
  } catch (err) {
    res.status(500).json({ error: "Gemini API error", details: err.message });
  }
});

// PATCH /tickets/:id/approve - Agent approves with final reply
router.patch("/:id/approve", auth, requireRole("agent"), async (req, res) => {
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

// PATCH /tickets/:id/assign - Agent assigns ticket to themselves
router.patch("/:id/assign", auth, requireRole("agent"), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedAgentId: req.user._id, status: "pending" },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
