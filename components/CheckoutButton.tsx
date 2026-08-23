"use client";
import { useState } from "react";

export function CheckoutButton({ plan }: { plan: "PRO" | "AGENCY" }) {
  const [loading, setLoading] = useState(false);
  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paiement indisponible");
      window.location.href = data.url;
    } catch (e) { alert(e instanceof Error ? e.message : "Erreur de paiement"); setLoading(false); }
  }
  return <button onClick={checkout} disabled={loading} className="mt-8 w-full rounded-full bg-forest px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? "Redirection…" : "Choisir cette offre"}</button>;
}
