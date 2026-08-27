"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
  Building2,
  Car,
  Check,
  CheckCircle2,
  Droplets,
  ImagePlus,
  Loader2,
  ParkingCircle,
  PlugZap,
  ShieldCheck,
  Snowflake,
  Sofa,
  Trees,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import { ListingAiWriter } from "@/components/ListingAiWriter";

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none transition focus:border-forest";

type TransactionType = "SALE" | "RENT" | "SHORT_TERM";
type Amenity = "POOL" | "AIR_CONDITIONING" | "GARAGE" | "GARDEN" | "BALCONY" | "ELEVATOR" | "SECURITY" | "WIFI" | "FURNISHED" | "RUNNING_WATER" | "GENERATOR" | "PARKING";

const amenityOptions: { value: Amenity; label: string; icon: React.ReactNode }[] = [
  { value: "POOL", label: "Piscine", icon: <Waves size={21} /> },
  { value: "AIR_CONDITIONING", label: "Climatisation", icon: <Snowflake size={21} /> },
  { value: "GARAGE", label: "Garage", icon: <Car size={21} /> },
  { value: "GARDEN", label: "Jardin", icon: <Trees size={21} /> },
  { value: "BALCONY", label: "Balcon", icon: <Building2 size={21} /> },
  { value: "ELEVATOR", label: "Ascenseur", icon: <Building2 size={21} /> },
  { value: "SECURITY", label: "Sécurité", icon: <ShieldCheck size={21} /> },
  { value: "WIFI", label: "WiFi", icon: <Wifi size={21} /> },
  { value: "FURNISHED", label: "Meublé", icon: <Sofa size={21} /> },
  { value: "RUNNING_WATER", label: "Eau courante", icon: <Droplets size={21} /> },
  { value: "GENERATOR", label: "Électricité / groupe", icon: <PlugZap size={21} /> },
  { value: "PARKING", label: "Parking", icon: <ParkingCircle size={21} /> },
];

export function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>("SALE");
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  function toggleAmenity(value: Amenity) {
    setAmenities((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

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
      furnished: amenities.includes("FURNISHED"),
      amenities,
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
      setAmenities([]);
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

        <section className="md:col-span-2 mt-2 rounded-[1.75rem] border border-ink/10 bg-sand/45 p-5 sm:p-6">
          <h2 className="text-2xl font-extrabold text-ink">Équipements</h2>
          <p className="mt-2 text-sm leading-6 text-ink/55">Sélectionnez les équipements réellement disponibles dans le bien.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((option) => {
              const selected = amenities.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAmenity(option.value)}
                  className={`flex min-h-16 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-forest bg-forest text-white shadow-sm" : "border-ink/10 bg-white text-ink/70 hover:border-forest/35"}`}
                >
                  <span className="flex items-center gap-3 font-semibold"><span className={selected ? "text-lime" : "text-forest"}>{option.icon}</span>{option.label}</span>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${selected ? "border-lime bg-lime text-ink" : "border-ink/15 bg-white"}`}>{selected && <Check size={15} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        </section>

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
