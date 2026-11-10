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
  open: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">👤 {user?.email}</p>
            <p className="text-xs text-gray-400">Customer</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-black">Logout</button>
        </div>
        <div className="p-3 border-b">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-black text-white py-2 rounded text-xs hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "+ New Ticket"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={createTicket} className="p-3 border-b space-y-2">
            <input
              className="w-full border rounded px-2 py-1.5 text-xs"
              placeholder="Subject"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="w-full border rounded px-2 py-1.5 text-xs"
              placeholder="Describe your issue..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-1.5 rounded text-xs disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-8">No tickets yet.</p>
          )}
          {tickets.map((t) => (
            <div
              key={t._id}
              onClick={() => setSelected(t)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selected?._id === t._id ? "border-l-2 border-l-black bg-gray-50" : ""}`}
            >
              <div className="flex justify-between items-start gap-1 mb-1">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a ticket to view details
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selected.title}</h2>
                <p className="text-xs text-gray-400 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Your Message</p>
              <p className="text-sm text-gray-700">{selected.description}</p>
            </div>

            {selected.finalReply && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-600 uppercase mb-2">Agent Reply</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.finalReply}</p>
              </div>
            )}

            {!selected.finalReply && selected.status !== "resolved" && (
              <p className="text-sm text-gray-400 italic">Waiting for agent response...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
