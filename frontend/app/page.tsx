"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:3000";

type Ticket = {
  id: number;
  title: string;
  customerName: string;
  status: string;
  createdAt: string;
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [form, setForm] = useState({ title: "", description: "", customerName: "" });
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    const res = await fetch(`${API}/tickets`);
    setTickets(await res.json());
  };

  useEffect(() => { fetchTickets(); }, []);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", customerName: "" });
    await fetchTickets();
    setLoading(false);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🎫 AI Support Copilot</h1>

      {/* Create Ticket Form */}
      <form onSubmit={createTicket} className="bg-gray-50 border rounded-lg p-4 mb-8 space-y-3">
        <h2 className="font-semibold text-lg">New Ticket</h2>
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Describe the issue..."
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>

      {/* Ticket List */}
      <h2 className="font-semibold text-lg mb-3">All Tickets ({tickets.length})</h2>
      {tickets.length === 0 && <p className="text-gray-400 text-sm">No tickets yet. Create one above.</p>}
      <div className="space-y-3">
        {tickets.map((t) => (
          <Link href={`/tickets/${t.id}`} key={t.id}>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-500">{t.customerName} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                t.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {t.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
