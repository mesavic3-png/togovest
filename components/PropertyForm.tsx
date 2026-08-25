"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { ListingAiWriter } from "@/components/ListingAiWriter";

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none transition focus:border-forest";

type TransactionType = "SALE" | "RENT" | "SHORT_TERM";

export function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>("SALE");

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 12 - imageUrls.length));
    if (!files.length) return;
    setUploading(true);
    setMessage(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const presign = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
        });
        const data = await presign.json();
        if (!presign.ok) throw new Error(data.error || "Impossible de préparer l’upload.");
        const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!put.ok) throw new Error("Échec de l’upload d’une photo.");
        uploaded.push(data.publicUrl);
      }
      setImageUrls((current) => [...current, ...uploaded].slice(0, 12));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur pendant l’upload.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const isShortTerm = transactionType === "SHORT_TERM";
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      type: form.get("type"),
      transactionType,
      price: !isShortTerm && form.get("price") ? Number(form.get("price")) : undefined,
      nightlyPrice: isShortTerm && form.get("nightlyPrice") ? Number(form.get("nightlyPrice")) : undefined,
      weeklyPrice: isShortTerm && form.get("weeklyPrice") ? Number(form.get("weeklyPrice")) : undefined,
      monthlyPrice: isShortTerm && form.get("monthlyPrice") ? Number(form.get("monthlyPrice")) : undefined,
      cleaningFee: isShortTerm && form.get("cleaningFee") ? Number(form.get("cleaningFee")) : undefined,
      securityDeposit: isShortTerm && form.get("securityDeposit") ? Number(form.get("securityDeposit")) : undefined,
      minNights: isShortTerm && form.get("minNights") ? Number(form.get("minNights")) : undefined,
      maxGuests: isShortTerm && form.get("maxGuests") ? Number(form.get("maxGuests")) : undefined,
      checkInTime: isShortTerm ? form.get("checkInTime") : undefined,
      checkOutTime: isShortTerm ? form.get("checkOutTime") : undefined,
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
      setTransactionType("SALE");
      setImageUrls([]);
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
        <label><span className="mb-2 block text-sm font-bold">Transaction</span><select name="transactionType" value={transactionType} onChange={(event) => setTransactionType(event.target.value as TransactionType)} className={inputClass}><option value="SALE">À vendre</option><option value="RENT">Location longue durée</option><option value="SHORT_TERM">Location courte durée</option></select></label>
        <label><span className="mb-2 block text-sm font-bold">Type de bien</span><select name="type" className={inputClass}><option value="HOUSE">Maison</option><option value="VILLA">Villa</option><option value="APARTMENT">Appartement</option><option value="LAND">Terrain</option><option value="OFFICE">Bureau</option><option value="SHOP">Commerce</option><option value="WAREHOUSE">Entrepôt</option><option value="OTHER">Autre</option></select></label>

        {transactionType !== "SHORT_TERM" ? (
          <label><span className="mb-2 block text-sm font-bold">Prix (FCFA)</span><input name="price" type="number" min="1" required className={inputClass} /></label>
        ) : (
          <>
            <div className="md:col-span-2 rounded-2xl border border-lime/40 bg-lime/10 p-4"><p className="font-bold text-forest">Informations de location courte durée</p><p className="mt-1 text-sm text-ink/60">Ajoutez les tarifs par séjour, la capacité et les horaires d’arrivée/départ.</p></div>
            <label><span className="mb-2 block text-sm font-bold">Prix par nuit (FCFA)</span><input name="nightlyPrice" type="number" min="1" required className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Prix par semaine (optionnel)</span><input name="weeklyPrice" type="number" min="1" className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Prix par mois (optionnel)</span><input name="monthlyPrice" type="number" min="1" className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Frais de ménage (FCFA)</span><input name="cleaningFee" type="number" min="0" className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Caution (FCFA)</span><input name="securityDeposit" type="number" min="0" className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Minimum de nuits</span><input name="minNights" type="number" min="1" defaultValue="1" required className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Nombre max. de voyageurs</span><input name="maxGuests" type="number" min="1" required className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Heure d’arrivée</span><input name="checkInTime" type="time" className={inputClass} /></label>
            <label><span className="mb-2 block text-sm font-bold">Heure de départ</span><input name="checkOutTime" type="time" className={inputClass} /></label>
          </>
        )}

        <label><span className="mb-2 block text-sm font-bold">Ville</span><input name="city" required className={inputClass} placeholder="Lomé" /></label>
        <label><span className="mb-2 block text-sm font-bold">Quartier</span><input name="district" className={inputClass} placeholder="Agoè-Nyivé" /></label>
        <label><span className="mb-2 block text-sm font-bold">Adresse</span><input name="address" className={inputClass} placeholder="Adresse ou repère" /></label>
        <label><span className="mb-2 block text-sm font-bold">Chambres</span><input name="bedrooms" type="number" min="0" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Salles de bain</span><input name="bathrooms" type="number" min="0" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Surface habitable (m²)</span><input name="areaSqm" type="number" min="1" step="0.1" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Surface terrain (m²)</span><input name="landAreaSqm" type="number" min="1" step="0.1" className={inputClass} /></label>
        <label><span className="mb-2 block text-sm font-bold">Places de parking</span><input name="parkingSpaces" type="number" min="0" className={inputClass} /></label>
        <label className="flex items-center gap-3 self-end rounded-2xl border border-ink/10 px-4 py-3.5"><input name="furnished" type="checkbox" className="h-4 w-4"/><span className="text-sm font-bold">Bien meublé</span></label>
        <ListingAiWriter />
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Description</span><textarea name="description" required minLength={20} rows={6} className={inputClass} placeholder="Décrivez le bien, ses atouts et son environnement..." /></label>
        <div className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">Photos du bien</span>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-forest/35 bg-sand px-4 py-6 font-bold text-forest"><ImagePlus size={20}/>{uploading ? "Upload en cours..." : "Ajouter des photos"}<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadFiles} disabled={uploading || imageUrls.length >= 12}/></label>
          <small className="mt-2 block text-ink/50">Jusqu’à 12 images JPG, PNG ou WebP, 10 Mo maximum par image.</small>
          {imageUrls.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{imageUrls.map((url, index) => <div key={url} className="flex items-center justify-between gap-3 rounded-xl bg-sand px-3 py-2 text-xs"><span className="truncate">Photo {index + 1}</span><button type="button" onClick={() => setImageUrls((items) => items.filter((item) => item !== url))} aria-label="Supprimer la photo"><X size={16}/></button></div>)}</div>}
        </div>
      </div>

      {message && <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${success ? "bg-lime/25 text-forest" : "bg-red-50 text-red-700"}`}>{success && <CheckCircle2 className="mr-2 inline" size={18}/>} {message}</div>}
      <button disabled={loading || uploading} className="flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-4 font-bold text-white disabled:opacity-60">{(loading || uploading) && <Loader2 className="animate-spin" size={18}/>} Enregistrer l’annonce</button>
    </form>
  );
}
