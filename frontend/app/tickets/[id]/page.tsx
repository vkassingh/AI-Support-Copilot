"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../lib/api";

type Ticket = {
  id: number;
  title: string;
  description: string;
  customerName: string;
  status: string;
  createdAt: string;
};

function TicketDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [editedReply, setEditedReply] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    fetch(`${API}/tickets/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTicket(data);
        if (data.status === "approved") setApproved(true);
      });
  }, [id]);

  const generateDraft = async () => {
    setLoadingDraft(true);
    setDraftReply("");
    setEditedReply("");
    setIsEditing(false);
    const res = await fetch(`${API}/tickets/${id}/draft-reply`, { method: "POST" });
    const data = await res.json();
    setDraftReply(data.draftReply);
    setEditedReply(data.draftReply);
    setLoadingDraft(false);
  };

  const handleApprove = async () => {
    await fetch(`${API}/tickets/${id}/approve`, { method: "PATCH" });
    setApproved(true);
    setIsEditing(false);
  };

  const handleRegenerateWithEdit = async () => {
    setLoadingDraft(true);
    const res = await fetch(`${API}/tickets/${id}/draft-reply`, { method: "POST" });
    const data = await res.json();
    setDraftReply(data.draftReply);
    setEditedReply(data.draftReply);
    setIsEditing(false);
    setLoadingDraft(false);
  };

  if (!ticket) return <div className="p-6 text-gray-400">Loading ticket...</div>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-black mb-4 flex items-center gap-1">
        ← Back to tickets
      </button>

      <div className="border rounded-lg p-5 mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold">{ticket.title}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {approved ? "approved" : ticket.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">From: {ticket.customerName} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-700 text-sm">{ticket.description}</p>
      </div>

      <button
        onClick={generateDraft}
        disabled={loadingDraft}
        className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50 mb-6"
      >
        {loadingDraft ? "✨ Generating..." : "✨ Generate AI Draft Reply"}
      </button>

      {(draftReply || isEditing) && (
        <div className="border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold">AI Draft Reply</h2>

          {isEditing ? (
            <textarea
              className="w-full border rounded px-3 py-2 text-sm min-h-[150px]"
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{draftReply}</p>
          )}

          {approved ? (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              ✅ Reply Approved & Sent
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                ✅ Approve & Send
              </button>

              {isEditing ? (
                <>
                  <button
                    onClick={handleRegenerateWithEdit}
                    disabled={loadingDraft}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    🔄 Regenerate with Gemini
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
                >
                  ✏️ Edit Reply
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <TicketDetail />
    </Suspense>
  );
}
