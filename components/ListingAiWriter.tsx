"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function ListingAiWriter() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generate(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form || loading) return;

    const data = new FormData(form);
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        type: data.get("type"),
        transactionType: data.get("transactionType"),
        city: data.get("city"),
        district: data.get("district"),
        bedrooms: data.get("bedrooms"),
        bathrooms: data.get("bathrooms"),
        areaSqm: data.get("areaSqm"),
        landAreaSqm: data.get("landAreaSqm"),
        parkingSpaces: data.get("parkingSpaces"),
        furnished: data.get("furnished") === "on",
        price: data.get("price"),
        nightlyPrice: data.get("nightlyPrice"),
        maxGuests: data.get("maxGuests"),
      };

      const response = await fetch("/api/assistant-annonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible de générer l’annonce.");

      const title = form.elements.namedItem("title") as HTMLInputElement | null;
      const description = form.elements.namedItem("description") as HTMLTextAreaElement | null;
      if (title) title.value = result.title;
      if (description) description.value = result.description;
      setMessage("Titre et description générés. Vous pouvez les modifier avant d’enregistrer.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:col-span-2 rounded-2xl border border-forest/15 bg-sand p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-extrabold text-forest"><Sparkles size={18}/> Assistant IA de rédaction</p>
          <p className="mt-1 text-sm leading-6 text-ink/60">Remplissez les caractéristiques du bien, puis laissez TOGOVEST préparer un titre et une description professionnels.</p>
        </div>
        <button type="button" onClick={generate} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {loading ? <Loader2 size={17} className="animate-spin"/> : <Sparkles size={17}/>} Générer avec l’IA
        </button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-forest">{message}</p>}
    </div>
  );
}
