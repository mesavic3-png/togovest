"use client";

import { FormEvent, useEffect, useState } from "react";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [contact, setContact] = useState<{ phone: string | null; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/properties/${propertyId}/contact`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (active && data) setContact(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [propertyId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setEmailSent(null);
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
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) {
      setEmailSent(Boolean(data.emailSent));
      e.currentTarget.reset();
    }
  }

  const phone = contact?.phone || null;
  const whatsappPhone = phone?.replace(/\D/g, "") || "";
  const whatsappMessage = encodeURIComponent(`Bonjour, je vous contacte depuis TOGOVEST au sujet de l’annonce « ${contact?.title || "ce bien"} ».`);

  return <div className="mt-6 space-y-4">
    {phone && <div className="grid gap-3 sm:grid-cols-2">
      <a href={`tel:${phone}`} className="rounded-full border border-white/20 px-5 py-3 text-center font-bold text-white">Appeler</a>
      <a href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-5 py-3 text-center font-bold text-ink">WhatsApp</a>
    </div>}

    <form onSubmit={submit} className="space-y-3">
      <input name="name" placeholder="Votre nom" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
      <input name="email" type="email" placeholder="Votre email" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
      <input name="phone" placeholder="Téléphone" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
      <textarea name="message" required minLength={10} rows={4} defaultValue="Bonjour, je souhaite obtenir plus d'informations sur ce bien." className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none" />
      <button disabled={status==="sending"} className="w-full rounded-full bg-lime px-5 py-3 font-bold text-ink">{status==="sending"?"Envoi...":"Envoyer ma demande"}</button>
      {status==="sent" && emailSent === true && <p className="text-sm text-lime">Demande envoyée et annonceur notifié par email.</p>}
      {status==="sent" && emailSent === false && <p className="text-sm text-amber-200">Demande enregistrée, mais la notification email n’a pas pu être envoyée.</p>}
      {status==="error" && <p className="text-sm text-red-300">Impossible d’envoyer la demande.</p>}
    </form>
  </div>;
}
