"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none transition focus:border-forest";

export function AdvertisingRequestForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const payload = {
      companyName: form.get("companyName"),
      contactName: form.get("contactName"),
      email: form.get("email"),
      phone: form.get("phone"),
      website: form.get("website"),
      placement: form.get("placement"),
      durationWeeks: Number(form.get("durationWeeks") || 1),
      message: form.get("message"),
    };

    try {
      const response = await fetch("/api/advertising-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Demande impossible.");
      setSuccess(true);
      setMessage("Votre demande publicitaire a bien été enregistrée. L'équipe TOGOVEST pourra vous recontacter.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 text-left sm:grid-cols-2">
      <label><span className="mb-2 block text-sm font-bold">Entreprise</span><input name="companyName" required minLength={2} className={inputClass} placeholder="Nom de l’entreprise" /></label>
      <label><span className="mb-2 block text-sm font-bold">Personne à contacter</span><input name="contactName" required minLength={2} className={inputClass} placeholder="Nom et prénom" /></label>
      <label><span className="mb-2 block text-sm font-bold">Email</span><input name="email" required type="email" className={inputClass} placeholder="contact@entreprise.com" /></label>
      <label><span className="mb-2 block text-sm font-bold">Téléphone</span><input name="phone" className={inputClass} placeholder="+228 ..." /></label>
      <label><span className="mb-2 block text-sm font-bold">Site web</span><input name="website" type="url" className={inputClass} placeholder="https://..." /></label>
      <label><span className="mb-2 block text-sm font-bold">Emplacement souhaité</span><select name="placement" className={inputClass} defaultValue="HOME_BANNER"><option value="HOME_BANNER">Bannière Accueil</option><option value="SEARCH_INLINE">Résultats immobiliers</option><option value="PREMIUM">Premium multi-emplacements</option></select></label>
      <label><span className="mb-2 block text-sm font-bold">Durée souhaitée</span><select name="durationWeeks" className={inputClass} defaultValue="4"><option value="1">1 semaine</option><option value="2">2 semaines</option><option value="4">1 mois</option><option value="8">2 mois</option><option value="12">3 mois</option></select></label>
      <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Message</span><textarea name="message" rows={4} maxLength={1500} className={inputClass} placeholder="Décrivez votre campagne, votre cible ou vos besoins..." /></label>
      {message && <div className={`sm:col-span-2 rounded-2xl px-4 py-3 text-sm font-semibold ${success ? "bg-lime/25 text-forest" : "bg-red-50 text-red-700"}`}>{success && <CheckCircle2 className="mr-2 inline" size={18}/>} {message}</div>}
      <div className="sm:col-span-2"><button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-7 py-3.5 font-bold text-white disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin"/>} Envoyer ma demande</button></div>
    </form>
  );
}
