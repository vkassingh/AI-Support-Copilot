"use client";
import { useEffect, useState } from "react";
import { Ticket } from "./TicketList";

const API = "http://localhost:3000";

type Props = {
  ticket: Ticket;
  onStatusChange: (id: number, status: string) => void;
};

export default function TicketDetail({ ticket, onStatusChange }: Props) {
  const [draftReply, setDraftReply] = useState("");
  const [editedReply, setEditedReply] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [approved, setApproved] = useState(ticket.status === "approved");

  // Reset state when ticket changes
  useEffect(() => {
    setDraftReply("");
    setEditedReply("");
    setIsEditing(false);
    setApproved(ticket.status === "approved");
  }, [ticket.id]);

  const generateDraft = async () => {
    setLoadingDraft(true);
    setDraftReply("");
    setIsEditing(false);
    const res = await fetch(`${API}/tickets/${ticket.id}/draft-reply`, { method: "POST" });
    const data = await res.json();
    setDraftReply(data.draftReply);
    setEditedReply(data.draftReply);
    setLoadingDraft(false);
  };

  const handleApprove = async () => {
    await fetch(`${API}/tickets/${ticket.id}/approve`, { method: "PATCH" });
    setApproved(true);
    setIsEditing(false);
    onStatusChange(ticket.id, "approved");
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto">
      {/* Top Bar */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">{ticket.title}</h2>
          <p className="text-xs text-gray-500">
            {ticket.customerName} · {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          approved ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        }`}>
          {approved ? "approved" : ticket.status}
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Customer Message */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer Message</p>
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                {ticket.customerName[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">{ticket.customerName}</span>
            </div>
            <p className="text-sm text-gray-700">{ticket.description}</p>
          </div>
        </div>

        {/* AI Draft Box */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Draft Reply</p>
            <button
              onClick={generateDraft}
              disabled={loadingDraft}
              className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1"
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
                  value={editedReply}
                  onChange={(e) => setEditedReply(e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{draftReply}</p>
              )}

              {/* Action Controls */}
              {approved ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium pt-1">
                  ✅ Reply Approved & Sent
                </div>
              ) : (
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button
                    onClick={handleApprove}
                    className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
                  >
                    ✅ Approve & Send
                  </button>

                  {isEditing ? (
                    <>
                      <button
                        onClick={generateDraft}
                        disabled={loadingDraft}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="border px-4 py-1.5 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
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
    </div>
  );
}
