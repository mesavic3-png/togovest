"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none transition focus:border-forest";
type TransactionType = "SALE" | "RENT" | "SHORT_TERM";

type PropertyValues = {
  id: string;
  title: string;
  description: string;
  type: string;
  transactionType: TransactionType;
  price: number;
  nightlyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  cleaningFee: number | null;
  securityDeposit: number | null;
  minNights: number | null;
  maxGuests: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  city: string;
  district: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  landAreaSqm: number | null;
  parkingSpaces: number | null;
  furnished: boolean;
};

export function EditPropertyForm({ property }: { property: PropertyValues }) {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<TransactionType>(property.transactionType);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    const shortTerm = transactionType === "SHORT_TERM";
    const number = (name: string) => form.get(name) ? Number(form.get(name)) : undefined;
    const payload = {
      title: form.get("title"), description: form.get("description"), type: form.get("type"), transactionType,
      price: shortTerm ? undefined : number("price"), nightlyPrice: shortTerm ? number("nightlyPrice") : undefined,
      weeklyPrice: shortTerm ? number("weeklyPrice") : undefined, monthlyPrice: shortTerm ? number("monthlyPrice") : undefined,
      cleaningFee: shortTerm ? number("cleaningFee") : undefined, securityDeposit: shortTerm ? number("securityDeposit") : undefined,
      minNights: shortTerm ? number("minNights") : undefined, maxGuests: shortTerm ? number("maxGuests") : undefined,
      checkInTime: shortTerm ? form.get("checkInTime") : undefined, checkOutTime: shortTerm ? form.get("checkOutTime") : undefined,
      city: form.get("city"), district: form.get("district") || undefined, address: form.get("address") || undefined,
      bedrooms: number("bedrooms"), bathrooms: number("bathrooms"), areaSqm: number("areaSqm"), landAreaSqm: number("landAreaSqm"), parkingSpaces: number("parkingSpaces"),
      furnished: form.get("furnished") === "on",
    };
    try {
      const response = await fetch(`/api/properties/${property.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d’enregistrer les modifications.");
      setSuccess(true);
      setMessage("Modifications enregistrées. L’annonce repasse en attente de validation.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
    <div className="grid gap-5 md:grid-cols-2">
      <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Titre</span><input name="title" required minLength={5} defaultValue={property.title} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Transaction</span><select name="transactionType" value={transactionType} onChange={(e)=>setTransactionType(e.target.value as TransactionType)} className={inputClass}><option value="SALE">À vendre</option><option value="RENT">Location longue durée</option><option value="SHORT_TERM">Location courte durée</option></select></label>
      <label><span className="mb-2 block text-sm font-bold">Type de bien</span><select name="type" defaultValue={property.type} className={inputClass}><option value="HOUSE">Maison</option><option value="VILLA">Villa</option><option value="APARTMENT">Appartement</option><option value="LAND">Terrain</option><option value="OFFICE">Bureau</option><option value="SHOP">Commerce</option><option value="WAREHOUSE">Entrepôt</option><option value="OTHER">Autre</option></select></label>
      {transactionType === "SHORT_TERM" ? <>
        <label><span className="mb-2 block text-sm font-bold">Prix par nuit (FCFA)</span><input name="nightlyPrice" type="number" min="1" required defaultValue={property.nightlyPrice ?? property.price} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Prix par semaine</span><input name="weeklyPrice" type="number" min="1" defaultValue={property.weeklyPrice ?? ""} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Prix par mois</span><input name="monthlyPrice" type="number" min="1" defaultValue={property.monthlyPrice ?? ""} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Frais de ménage</span><input name="cleaningFee" type="number" min="0" defaultValue={property.cleaningFee ?? ""} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Caution</span><input name="securityDeposit" type="number" min="0" defaultValue={property.securityDeposit ?? ""} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Minimum de nuits</span><input name="minNights" type="number" min="1" required defaultValue={property.minNights ?? 1} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Voyageurs maximum</span><input name="maxGuests" type="number" min="1" required defaultValue={property.maxGuests ?? 1} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Heure d’arrivée</span><input name="checkInTime" type="time" defaultValue={property.checkInTime ?? ""} className={inputClass}/></label>
        <label><span className="mb-2 block text-sm font-bold">Heure de départ</span><input name="checkOutTime" type="time" defaultValue={property.checkOutTime ?? ""} className={inputClass}/></label>
      </> : <label><span className="mb-2 block text-sm font-bold">Prix (FCFA)</span><input name="price" type="number" min="1" required defaultValue={property.price} className={inputClass}/></label>}
      <label><span className="mb-2 block text-sm font-bold">Ville</span><input name="city" required defaultValue={property.city} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Quartier</span><input name="district" defaultValue={property.district ?? ""} className={inputClass}/></label>
      <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Adresse / repère</span><input name="address" defaultValue={property.address ?? ""} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Chambres</span><input name="bedrooms" type="number" min="0" defaultValue={property.bedrooms ?? ""} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Salles de bain</span><input name="bathrooms" type="number" min="0" defaultValue={property.bathrooms ?? ""} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Surface habitable (m²)</span><input name="areaSqm" type="number" min="1" step="0.1" defaultValue={property.areaSqm ?? ""} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Surface terrain (m²)</span><input name="landAreaSqm" type="number" min="1" step="0.1" defaultValue={property.landAreaSqm ?? ""} className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold">Places de parking</span><input name="parkingSpaces" type="number" min="0" defaultValue={property.parkingSpaces ?? ""} className={inputClass}/></label>
      <label className="flex items-center gap-3 self-end rounded-2xl border border-ink/10 px-4 py-3.5"><input name="furnished" type="checkbox" defaultChecked={property.furnished}/><span className="text-sm font-bold">Bien meublé</span></label>
      <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Description</span><textarea name="description" required minLength={20} rows={7} defaultValue={property.description} className={inputClass}/></label>
    </div>
    <p className="rounded-2xl bg-sand p-4 text-sm text-ink/60">Les photos actuelles sont conservées. Une annonce modifiée par son propriétaire repasse en attente de validation afin de protéger les visiteurs.</p>
    {message && <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${success ? "bg-lime/25 text-forest" : "bg-red-50 text-red-700"}`}>{success && <CheckCircle2 className="mr-2 inline" size={18}/>} {message}</div>}
    <button disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-4 font-bold text-white disabled:opacity-60">{loading && <Loader2 className="animate-spin" size={18}/>} Enregistrer les modifications</button>
  </form>;
}
