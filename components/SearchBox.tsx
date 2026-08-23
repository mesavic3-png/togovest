"use client";

import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const modes = {
  Acheter: { transactionType: "SALE" },
  Louer: { transactionType: "RENT" },
  Terrain: { propertyType: "LAND" },
} as const;

export function SearchBox() {
  const router = useRouter();
  const [active, setActive] = useState<keyof typeof modes>("Acheter");
  const [city, setCity] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(modes[active]);
    if (city.trim()) params.set("city", city.trim());
    router.push(`/biens?${params.toString()}`);
  }

  return (
    <div className="mt-8 w-full max-w-4xl">
      <div className="mb-3 flex gap-2">
        {(Object.keys(modes) as Array<keyof typeof modes>).map((mode) => (
          <button key={mode} type="button" onClick={() => setActive(mode)} className={`rounded-full px-5 py-2.5 text-sm font-bold ${active === mode ? "bg-lime text-ink" : "bg-white/10 text-white backdrop-blur"}`}>
            {mode}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-2 rounded-2xl bg-white p-2.5 shadow-soft sm:grid-cols-[1.4fr_1fr_auto] sm:rounded-full">
        <label className="flex items-center gap-3 px-4 py-3">
          <MapPin className="text-forest" size={20}/>
          <span className="min-w-0 flex-1">
            <small className="block text-[10px] font-bold uppercase tracking-widest text-ink/45">Localisation</small>
            <input value={city} onChange={(event) => setCity(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Lomé, Kpalimé, Tsévié..."/>
          </span>
        </label>

        <div className="flex items-center gap-3 border-y border-ink/10 px-4 py-3 text-left sm:border-x sm:border-y-0">
          <SlidersHorizontal className="text-forest" size={20}/>
          <span>
            <small className="block text-[10px] font-bold uppercase tracking-widest text-ink/45">Recherche</small>
            <b className="text-sm">{active}</b>
          </span>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-forest px-7 py-4 text-sm font-bold text-white sm:rounded-full">
          <Search size={19}/> Rechercher
        </button>
      </form>
    </div>
  );
}
