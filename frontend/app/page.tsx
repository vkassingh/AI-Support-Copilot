"use client";
import { useEffect, useState } from "react";
import TicketList, { Ticket } from "./components/TicketList";
import TicketDetail from "./components/TicketDetail";

const API = "http://localhost:3000";

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    const res = await fetch(`${API}/tickets`);
    const data = await res.json();
    setTickets(data);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleStatusChange = (id: number, status: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <TicketList
        tickets={tickets}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        onCreated={fetchTickets}
      />

      <main className="flex-1 overflow-hidden">
        {selected ? (
          <TicketDetail
            key={selected.id}
            ticket={selected}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a ticket to view details
          </div>
        )}
      </main>
    </div>
  );
}
