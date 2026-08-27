"use client";

import { CalendarDays, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const modes = {
  Acheter: { transactionType: "SALE" },
  Louer: { transactionType: "RENT" },
  "Court séjour": { transactionType: "SHORT_TERM" },
  Terrain: { propertyType: "LAND" },
} as const;

export function SearchBox() {
  const router = useRouter();
  const [active, setActive] = useState<keyof typeof modes>("Acheter");
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const isShortTerm = active === "Court séjour";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(modes[active]);
    if (city.trim()) params.set("city", city.trim());
    if (isShortTerm) {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      params.set("guests", String(guests));
    }
    router.push(`/biens?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-6xl rounded-[1.75rem] border border-white/15 bg-white p-3 shadow-[0_26px_80px_rgba(0,0,0,.22)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(modes) as Array<keyof typeof modes>).map((mode) => (
            <button key={mode} type="button" onClick={() => setActive(mode)} className={`rounded-full px-4 py-2 text-xs font-extrabold sm:px-5 sm:text-sm ${active === mode ? "bg-forest text-white shadow-sm" : "bg-[#f2f1eb] text-ink/55 hover:text-ink"}`}>
              {mode}
            </button>
          ))}
        </div>
        <Link href="/biens" className="hidden items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs font-bold text-ink/55 hover:border-forest/20 hover:text-forest sm:flex"><SlidersHorizontal size={15}/> Bien plus</Link>
      </div>

      <form onSubmit={submit} className={`mt-3 grid overflow-hidden rounded-2xl border border-ink/10 bg-[#fbfaf6] ${isShortTerm ? "lg:grid-cols-[1.25fr_.9fr_.9fr_.65fr_auto]" : "sm:grid-cols-[1.55fr_1fr_auto]"}`}>
        <label className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest/[.07] text-forest"><MapPin size={19}/></div>
          <span className="min-w-0 flex-1"><small className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink/35">Localisation</small><input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/30" placeholder="Lomé, Kpalimé, Tsévié..."/></span>
        </label>

        {isShortTerm ? <>
          <label className="flex items-center gap-2 border-t border-ink/10 px-4 py-4 lg:border-l lg:border-t-0"><CalendarDays className="text-forest" size={18}/><span><small className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink/35">Arrivée</small><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 bg-transparent text-sm font-bold text-ink outline-none"/></span></label>
          <label className="flex items-center gap-2 border-t border-ink/10 px-4 py-4 lg:border-l lg:border-t-0"><CalendarDays className="text-forest" size={18}/><span><small className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink/35">Départ</small><input type="date" min={checkIn || undefined} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 bg-transparent text-sm font-bold text-ink outline-none"/></span></label>
          <label className="flex items-center gap-2 border-t border-ink/10 px-4 py-4 lg:border-l lg:border-t-0"><Users className="text-forest" size={18}/><span><small className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink/35">Voyageurs</small><input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 w-16 bg-transparent text-sm font-bold text-ink outline-none"/></span></label>
        </> : <div className="flex items-center gap-3 border-t border-ink/10 px-4 py-4 sm:border-l sm:border-t-0 sm:px-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-forest/[.07] text-forest"><Search size={19}/></div><span><small className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink/35">Type de recherche</small><b className="mt-1 block text-sm text-ink">{active}</b></span></div>}

        <button className="m-2 flex items-center justify-center gap-2 rounded-xl bg-lime px-7 py-4 text-sm font-extrabold text-ink shadow-sm hover:-translate-y-0.5"><Search size={19}/> Rechercher</button>
      </form>
    </div>
  );
}
