"use client";
import { useState } from "react";

export function CheckoutButton({ plan }: { plan: "PRO" | "AGENCY" }) {
  const [loading, setLoading] = useState<"card" | "mobile" | null>(null);

  async function checkout(method: "card" | "mobile") {
    setLoading(method);
    try {
      const endpoint = method === "card" ? "/api/billing/checkout" : "/api/billing/mobile/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paiement indisponible");
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur de paiement");
      setLoading(null);
    }
  }

  return <div className="mt-8 grid gap-2"><button onClick={()=>checkout("mobile")} disabled={!!loading} className="w-full rounded-full bg-forest px-5 py-3 font-bold text-white disabled:opacity-60">{loading === "mobile" ? "Redirection…" : "Payer par Mobile Money"}</button><button onClick={()=>checkout("card")} disabled={!!loading} className="w-full rounded-full border border-forest px-5 py-3 font-bold text-forest disabled:opacity-60">{loading === "card" ? "Redirection…" : "Payer par carte"}</button></div>;
}
