"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none transition focus:border-forest";

export function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const imageUrls = String(form.get("imageUrls") || "")
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      type: form.get("type"),
      transactionType: form.get("transactionType"),
      price: Number(form.get("price")),
      city: form.get("city"),
      district: form.get("district"),
      address: form.get("address"),
      bedrooms: form.get("bedrooms") ? Number(form.get("bedrooms")) : undefined,
      bathrooms: form.get("bathrooms") ? Number(form.get("bathrooms")) : undefined,
      areaSqm: form.get("areaSqm") ? Number(form.get("areaSqm")) : undefined,
      landAreaSqm: form.get("landAreaSqm") ? Number(form.get("landAreaSqm")) : undefined,
      parkingSpaces: form.get("parkingSpaces") ? Number(form.get("parkingSpaces")) : undefined,
      furnished: form.get("furnished") === "on",
      imageUrls,
    };

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de la publication.");
      setSuccess(true);
      setMessage("Annonce enregistrée. Elle est maintenant en attente de validation.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Titre de l’annonce</span><input name="title" required minLength={5} className={inputClass} placeholder="Villa moderne avec piscine à Agoè" /></label>
        <label><span className="mb-2 block text-sm font-bold">Transaction</span><select name="transactionType" className={inputClass}><option value="SALE">À vendre</option><option value="RENT">À louer</option></select></label>
        <label><span className="mb-2 block text-sm font-bold">Type de bien</span><select name="type" className={inputClass}><option value="HOUSE">Maison</option><option value="VILLA">Villa</option><option value="APARTMENT">Appartement</option><option value="LAND">Terrain</option><option value="OFFICE">Bureau</option><option value="SHOP">Commerce</option><option value="WAREHOUSE">Entrepôt</option><option value="OTHER">Autre</option></select></label>
        <label><span className="mb-2 block text-sm font-bold">Prix (FCFA)</span><input name="price" type="number" min="1" required className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Ville</span><input name="city" required className={inputClass} placeholder="Lomé" /></label>
        <label><span className="mb-2 block text-sm font-bold">Quartier</span><input name="district" className={inputClass} placeholder="Agoè-Nyivé" /></label>
        <label><span className="mb-2 block text-sm font-bold">Adresse</span><input name="address" className={inputClass} placeholder="Adresse ou repère" /></label>
        <label><span className="mb-2 block text-sm font-bold">Chambres</span><input name="bedrooms" type="number" min="0" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Salles de bain</span><input name="bathrooms" type="number" min="0" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Surface habitable (m²)</span><input name="areaSqm" type="number" min="1" step="0.1" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Surface terrain (m²)</span><input name="landAreaSqm" type="number" min="1" step="0.1" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Places de parking</span><input name="parkingSpaces" type="number" min="0" className={inputClass} /></label>
        <label className="flex items-center gap-3 self-end rounded-2xl border border-ink/10 px-4 py-3.5"><input name="furnished" type="checkbox" className="h-4 w-4"/><span className="text-sm font-bold">Bien meublé</span></label>
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Description</span><textarea name="description" required minLength={20} rows={6} className={inputClass} placeholder="Décrivez le bien, ses atouts et son environnement..." /></label>
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">URLs des photos</span><textarea name="imageUrls" rows={4} className={inputClass} placeholder={'https://.../photo-1.jpg\nhttps://.../photo-2.jpg'} /><small className="mt-2 block text-ink/50">Une URL par ligne, jusqu’à 12 photos. L’upload direct sera ajouté dans une prochaine étape.</small></label>
      </div>

      {message && <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${success ? "bg-lime/25 text-forest" : "bg-red-50 text-red-700"}`}>{success && <CheckCircle2 className="mr-2 inline" size={18}/>} {message}</div>}

      <button disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-4 font-bold text-white disabled:opacity-60">{loading && <Loader2 className="animate-spin" size={18}/>} Enregistrer l’annonce</button>
    </form>
  );
}
