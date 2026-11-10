const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "pending", "resolved"], default: "open" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  aiDraft: { type: String, default: "" },
  finalReply: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
