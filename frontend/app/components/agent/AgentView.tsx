"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:3000";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: string;
  customerId: { email: string };
  assignedAgentId: { email: string } | null;
  aiDraft: string;
  finalReply: string;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

export default function AgentView() {
  const { token, user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchTickets = async () => {
    const res = await fetch(`${API}/tickets`, { headers });
    const data = await res.json();
    setTickets(data);
  };

  useEffect(() => { fetchTickets(); }, []);

  const selectTicket = (t: Ticket) => {
    setSelected(t);
    setDraftReply(t.aiDraft || "");
    setIsEditing(false);
  };

  const generateDraft = async () => {
    if (!selected) return;
    setLoadingDraft(true);
    setDraftReply("");
    const res = await fetch(`${API}/tickets/${selected._id}/draft-reply`, { method: "POST", headers });
    const data = await res.json();
    setDraftReply(data.draftReply || "");
    setSelected((prev) => prev ? { ...prev, aiDraft: data.draftReply } : prev);
    setLoadingDraft(false);
  };

  const handleApprove = async () => {
    if (!selected) return;
    await fetch(`${API}/tickets/${selected._id}/approve`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ finalReply: draftReply }),
    });
    await fetchTickets();
    setSelected((prev) => prev ? { ...prev, status: "resolved", finalReply: draftReply } : prev);
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">🛠 {user?.email}</p>
            <p className="text-xs text-gray-400">Agent</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-black">Logout</button>
        </div>

        <div className="p-3 border-b">
          <p className="text-xs text-gray-500 font-medium">All Tickets ({tickets.length})</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.map((t) => (
            <div
              key={t._id}
              onClick={() => selectTicket(t)}
              className={`p-3 border-b cursor-pointer hover:bg-white transition-colors ${selected?._id === t._id ? "bg-white border-l-2 border-l-black" : ""}`}
            >
              <div className="flex justify-between items-start gap-1 mb-1">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium ${statusStyles[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{t.customerId?.email}</p>
              <p className="text-xs text-gray-400 truncate">{t.description}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Agent Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a ticket to start working
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div>
                <h2 className="font-semibold">{selected.title}</h2>
                <p className="text-xs text-gray-400">
                  {selected.customerId?.email} · {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Customer Message */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer Message</p>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                      {selected.customerId?.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{selected.customerId?.email}</span>
                  </div>
                  <p className="text-sm text-gray-700">{selected.description}</p>
                </div>
              </div>

              {/* AI Draft Workspace */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Draft Reply</p>
                  <button
                    onClick={generateDraft}
                    disabled={loadingDraft || selected.status === "resolved"}
                    className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-40"
                  >
                    {loadingDraft ? "✨ Generating..." : "✨ Generate Draft"}
                  </button>
                </div>

                {!draftReply && !loadingDraft && (
                  <div className="border border-dashed rounded-lg p-6 text-center text-gray-400 text-sm">
                    Click "Generate Draft" to get an AI-powered reply
                  </div>
                )}

                {loadingDraft && (
                  <div className="border rounded-lg p-4 text-sm text-gray-400 animate-pulse">
                    Gemini is writing a reply...
                  </div>
                )}

                {draftReply && !loadingDraft && (
                  <div className="border rounded-lg p-4 space-y-3">
                    {isEditing ? (
                      <textarea
                        className="w-full border rounded px-3 py-2 text-sm min-h-[140px] focus:outline-none focus:ring-1 focus:ring-black"
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{draftReply}</p>
                    )}

                    {selected.status === "resolved" ? (
                      <p className="text-green-600 text-sm font-medium">✅ Reply Approved & Sent</p>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={handleApprove}
                          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
                        >
                          ✅ Approve & Send
                        </button>
                        {isEditing ? (
                          <button
                            onClick={() => setIsEditing(false)}
                            className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50"
                          >
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50"
                          >
                            ✏️ Edit Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
