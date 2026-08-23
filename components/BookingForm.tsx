"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Loader2, Users } from "lucide-react";

const inputClass = "w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35";

export function BookingForm({ propertyId, nightlyPrice, cleaningFee = 0, minNights = 1, maxGuests = 1 }: { propertyId: string; nightlyPrice: number; cleaningFee?: number; minNights?: number; maxGuests?: number }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const total = nights > 0 ? nights * nightlyPrice + cleaningFee : 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          guests,
          guestName: form.get("guestName"),
          guestPhone: form.get("guestPhone"),
          notes: form.get("notes"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Réservation impossible.");
      setSuccess(true);
      setMessage(`Demande de réservation créée. Total estimé : ${Number(result.totalAmount).toLocaleString("fr-FR")} FCFA.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label><span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-white/65"><CalendarDays size={14}/> Arrivée</span><input required type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass}/></label>
        <label><span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-white/65"><CalendarDays size={14}/> Départ</span><input required type="date" value={checkOut} min={checkIn || undefined} onChange={(e) => setCheckOut(e.target.value)} className={inputClass}/></label>
      </div>
      <label><span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-white/65"><Users size={14}/> Voyageurs</span><input required type="number" min={1} max={maxGuests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={inputClass}/></label>
      <input name="guestName" className={inputClass} placeholder="Nom du voyageur"/>
      <input name="guestPhone" className={inputClass} placeholder="Téléphone"/>
      <textarea name="notes" rows={3} className={inputClass} placeholder="Message ou demande particulière"/>
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
        <div className="flex justify-between"><span>{nightlyPrice.toLocaleString("fr-FR")} FCFA × {nights || 0} nuit(s)</span><span>{(nightlyPrice * nights).toLocaleString("fr-FR")} FCFA</span></div>
        {cleaningFee > 0 && <div className="mt-2 flex justify-between"><span>Frais de ménage</span><span>{cleaningFee.toLocaleString("fr-FR")} FCFA</span></div>}
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-bold text-white"><span>Total estimé</span><span>{total.toLocaleString("fr-FR")} FCFA</span></div>
        <p className="mt-2 text-xs text-white/45">Minimum {minNights} nuit(s) · Maximum {maxGuests} voyageur(s)</p>
      </div>
      {message && <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${success ? "bg-lime/20 text-lime" : "bg-red-500/15 text-red-200"}`}>{message}</div>}
      <button disabled={loading || nights < minNights} className="flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3.5 font-bold text-ink disabled:opacity-50">{loading && <Loader2 size={17} className="animate-spin"/>} Demander la réservation</button>
    </form>
  );
}
