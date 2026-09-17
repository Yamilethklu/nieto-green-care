"use client";
import { useState } from "react";

type Lead = { id: string; status: string; full_name: string | null; created_at: string; phone: string | null; property_address: string | null };
export function AdminLeadsPanel({ leads }: { leads: Lead[] }) {
  const [items, setItems] = useState(leads);
  const [message, setMessage] = useState("");
  async function update(id: string, status: string) {
    const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setMessage("Lead status could not be updated."); return; }
    setItems((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
    setMessage("Saved.");
  }
  return <section className="admin-card"><h2>Quote requests</h2>{message && <p role="status">{message}</p>}<div className="admin-table">{items.map((lead) => <div className="admin-row" key={lead.id}><div><strong>{lead.full_name || "Unnamed customer"}</strong><small>{lead.property_address || "Address not provided"}</small></div><select value={lead.status} onChange={(event) => update(lead.id, event.target.value)}><option value="scheduled">Pending / Scheduled</option><option value="completed">Confirmed / Completed</option><option value="cancelled">Cancelled</option></select></div>)}</div>{!items.length && <p>No quote requests yet.</p>}</section>;
}
