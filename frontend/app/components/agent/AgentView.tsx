"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import API from "../../lib/api";

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
  open: "bg-amber-100 text-amber-800",
  pending: "bg-violet-100 text-violet-800",
  resolved: "bg-emerald-100 text-emerald-800",
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
    setTickets(await res.json());
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
    <div className="flex h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200/80 bg-white flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{user?.email}</p>
                <p className="text-[10px] text-violet-600 font-medium">Agent</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-700 transition">Logout</button>
          </div>
        </div>

        {/* Ticket count */}
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            All Tickets
            <span className="ml-2 bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full text-[10px]">{tickets.length}</span>
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 && (
            <p className="text-xs text-slate-400 text-center mt-10">No tickets yet.</p>
          )}
          {tickets.map((t) => (
            <div
              key={t._id}
              onClick={() => selectTicket(t)}
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
              <p className="text-xs text-slate-500">{t.customerId?.email}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{t.description}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">✦</div>
            <p className="text-sm">Select a ticket to start working</p>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">{selected.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.customerId?.email} · {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Customer Message */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Customer Message</p>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                      {selected.customerId?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{selected.customerId?.email}</p>
                      <p className="text-[10px] text-slate-400">{new Date(selected.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
                </div>
              </div>

              {/* AI Draft Workspace */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">AI Draft Reply</p>
                    <span className="text-[10px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
                      Gemini
                    </span>
                  </div>
                  <button
                    onClick={generateDraft}
                    disabled={loadingDraft || selected.status === "resolved"}
                    className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 shadow-sm shadow-violet-200 transition-all"
                  >
                    {loadingDraft ? (
                      <><span className="animate-spin">✦</span> Generating...</>
                    ) : (
                      <>✦ Generate Draft</>
                    )}
                  </button>
                </div>

                {/* Empty state */}
                {!draftReply && !loadingDraft && (
                  <div className="bg-gradient-to-b from-violet-50/40 to-white border border-violet-100 border-dashed rounded-xl p-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-500 text-lg mx-auto mb-3">✦</div>
                    <p className="text-sm text-slate-500">Click <span className="text-violet-600 font-medium">Generate Draft</span> to get an AI-powered reply</p>
                  </div>
                )}

                {/* Loading */}
                {loadingDraft && (
                  <div className="bg-gradient-to-b from-violet-50/40 to-white border border-violet-100 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse">
                        <span className="text-white text-sm">✦</span>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-2.5 bg-violet-100 rounded-full animate-pulse w-3/4" />
                        <div className="h-2.5 bg-violet-100 rounded-full animate-pulse w-1/2" />
                      </div>
                    </div>
                    <p className="text-xs text-violet-500 mt-3 text-center">Gemini is crafting a reply...</p>
                  </div>
                )}

                {/* Draft content */}
                {draftReply && !loadingDraft && (
                  <div className="bg-gradient-to-b from-violet-50/40 to-white border border-violet-200 rounded-xl overflow-hidden shadow-sm">
                    {/* AI badge header */}
                    <div className="px-4 py-2.5 border-b border-violet-100 flex items-center gap-2 bg-violet-50/60">
                      <span className="w-4 h-4 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-[9px]">✦</span>
                      <span className="text-xs font-medium text-violet-700">AI Generated Draft</span>
                    </div>

                    <div className="p-4 space-y-4">
                      {isEditing ? (
                        <textarea
                          className="w-full border border-violet-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition"
                          value={draftReply}
                          onChange={(e) => setDraftReply(e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{draftReply}</p>
                      )}

                      {selected.status === "resolved" ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <span>✓</span> Reply Approved & Sent
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap pt-1">
                          <button
                            onClick={handleApprove}
                            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-violet-200 transition-all"
                          >
                            ✓ Approve & Send
                          </button>
                          {isEditing ? (
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
                            >
                              Done
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center gap-1.5 border border-violet-200 text-violet-700 hover:bg-violet-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              ✏️ Edit Reply
                            </button>
                          )}
                          <button
                            onClick={generateDraft}
                            className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
                          >
                            ↺ Regenerate
                          </button>
                        </div>
                      )}
                    </div>
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
