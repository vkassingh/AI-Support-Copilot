"use client";

const API = "http://localhost:3000";

export type Ticket = {
  id: number;
  title: string;
  description: string;
  customerName: string;
  status: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  resolved: "bg-gray-100 text-gray-600",
};

type Props = {
  tickets: Ticket[];
  selectedId: number | null;
  onSelect: (ticket: Ticket) => void;
  onCreated: () => void;
};

import { useState } from "react";

export default function TicketList({ tickets, selectedId, onSelect, onCreated }: Props) {
  const [form, setForm] = useState({ title: "", description: "", customerName: "" });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch(`${API}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", customerName: "" });
    setShowForm(false);
    setCreating(false);
    onCreated();
  };

  return (
    <aside className="w-80 min-w-[280px] border-r bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <h1 className="font-bold text-base">🎫 Support Tickets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-3 border-b bg-white space-y-2">
          <input
            className="w-full border rounded px-2 py-1.5 text-xs"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
          <input
            className="w-full border rounded px-2 py-1.5 text-xs"
            placeholder="Subject"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded px-2 py-1.5 text-xs"
            placeholder="Describe the issue..."
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-black text-white py-1.5 rounded text-xs hover:bg-gray-800 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      )}

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8">No tickets yet.</p>
        )}
        {tickets.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            className={`p-3 border-b cursor-pointer hover:bg-white transition-colors ${
              selectedId === t.id ? "bg-white border-l-2 border-l-black" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium truncate">{t.title}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyles[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                {t.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">{t.customerName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
