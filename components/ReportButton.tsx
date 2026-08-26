"use client";

import { Flag } from "lucide-react";
import { FormEvent, useState } from "react";

const reasons = [
  ["SCAM", "Arnaque ou fraude"],
  ["WRONG_INFO", "Informations incorrectes"],
  ["DUPLICATE", "Annonce en double"],
  ["UNAVAILABLE", "Bien indisponible"],
  ["INAPPROPRIATE", "Contenu inapproprié"],
  ["OTHER", "Autre"],
];

export function ReportButton({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, reason: String(form.get("reason") || "OTHER"), details: String(form.get("details") || ""), email: String(form.get("email") || "") }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage("Merci. Le signalement a bien été transmis à TOGOVEST.");
      (event.currentTarget as HTMLFormElement).reset();
    } else setMessage(data.error || "Impossible d’envoyer le signalement.");
    setLoading(false);
  }

  return <div className="relative">
    <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink/70"><Flag size={17}/> Signaler</button>
    {open && <div className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] rounded-2xl border border-ink/10 bg-white p-5 shadow-xl">
      <h3 className="font-extrabold text-ink">Signaler cette annonce</h3>
      <p className="mt-1 text-xs leading-5 text-ink/55">Aidez-nous à identifier les annonces trompeuses, frauduleuses ou obsolètes.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <select name="reason" required className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm text-ink">{reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <textarea name="details" maxLength={1000} rows={3} placeholder="Précisez le problème (facultatif)" className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm text-ink"/>
        <input name="email" type="email" placeholder="Votre email (facultatif)" className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm text-ink"/>
        {message && <p className="text-xs font-semibold text-forest">{message}</p>}
        <button disabled={loading} className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Envoi…" : "Envoyer le signalement"}</button>
      </form>
    </div>}
  </div>;
}
