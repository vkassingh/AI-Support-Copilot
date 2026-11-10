"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:3000";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: string;
  finalReply: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  pending: "bg-violet-100 text-violet-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

export default function CustomerView() {
  const { token, user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchTickets = async () => {
    const res = await fetch(`${API}/tickets`, { headers });
    setTickets(await res.json());
  };

  useEffect(() => { fetchTickets(); }, []);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API}/tickets`, { method: "POST", headers, body: JSON.stringify(form) });
    setForm({ title: "", description: "" });
    setShowForm(false);
    await fetchTickets();
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200/80 bg-white flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{user?.email}</p>
                <p className="text-[10px] text-violet-500 font-medium">Customer</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-700 transition">Logout</button>
          </div>
        </div>

        {/* New Ticket Button */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
              showForm
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm shadow-violet-200"
            }`}
          >
            {showForm ? "✕ Cancel" : "+ New Ticket"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={createTicket} className="p-3 border-b border-slate-100 space-y-2 bg-violet-50/40">
            <input
              className="w-full border border-violet-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition"
              placeholder="Subject"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="w-full border border-violet-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition"
              placeholder="Describe your issue..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition shadow-sm shadow-violet-200"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-12 gap-2 text-slate-400">
              <span className="text-2xl">🎫</span>
              <p className="text-xs">No tickets yet.</p>
            </div>
          )}
          {tickets.map((t) => (
            <div
              key={t._id}
              onClick={() => setSelected(t)}
              className={`p-3 border-b border-slate-100 cursor-pointer transition-colors ${
                selected?._id === t._id
                  ? "bg-violet-50 border-l-2 border-l-violet-500"
                  : "hover:bg-violet-50/50"
              }`}
            >
              <div className="flex justify-between items-start gap-1 mb-1">
                <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium ${statusStyles[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail Panel */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">🎫</div>
            <p className="text-sm">Select a ticket to view details</p>
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            {/* Title row */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            {/* Your message */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Your Message</p>
              <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
            </div>

            {/* Agent reply */}
            {selected.finalReply && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</span>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Agent Reply</p>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.finalReply}</p>
              </div>
            )}

            {/* Waiting state */}
            {!selected.finalReply && selected.status !== "resolved" && (
              <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-500 animate-pulse">✦</div>
                <p className="text-sm text-slate-500 italic">Our agent is reviewing your ticket...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
