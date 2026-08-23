"use client";

import { FormEvent, useState } from "react";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) e.currentTarget.reset();
  }

  return <form onSubmit={submit} className="mt-6 space-y-3">
    <input name="name" placeholder="Votre nom" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
    <input name="email" type="email" placeholder="Votre email" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
    <input name="phone" placeholder="Téléphone" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
    <textarea name="message" required minLength={10} rows={4} defaultValue="Bonjour, je souhaite obtenir plus d'informations sur ce bien." className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none" />
    <button disabled={status==="sending"} className="w-full rounded-full bg-lime px-5 py-3 font-bold text-ink">{status==="sending"?"Envoi...":"Envoyer ma demande"}</button>
    {status==="sent" && <p className="text-sm text-lime">Demande envoyée. L’annonceur pourra vous recontacter.</p>}
    {status==="error" && <p className="text-sm text-red-300">Impossible d’envoyer la demande.</p>}
  </form>;
}
