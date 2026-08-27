"use client";

import { Building2, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Accueil", href: "/#accueil" },
  { label: "Acheter", href: "/biens?transactionType=SALE" },
  { label: "Louer", href: "/biens?transactionType=RENT" },
  { label: "Terrains", href: "/biens?propertyType=LAND" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-3 pt-3 text-white sm:px-5 sm:pt-5">
      <nav className="shell flex h-[72px] items-center justify-between rounded-2xl border border-white/15 bg-ink/55 shadow-[0_10px_40px_rgba(0,0,0,.12)] backdrop-blur-xl" aria-label="Navigation principale">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink shadow-sm"><Building2 size={20}/></span>
          <span><b className="block font-display text-lg leading-none">TOGOVEST<span className="text-lime">.</span></b><small className="mt-1 hidden text-[9px] font-bold uppercase tracking-[.18em] text-white/45 sm:block">Immobilier au Togo</small></span>
        </Link>
        <div className="hidden items-center gap-7 lg:flex">{links.map((link)=><Link key={link.label} href={link.href} className="text-sm font-semibold text-white/75 hover:text-lime">{link.label}</Link>)}</div>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/connexion" className="rounded-full px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">Connexion</Link>
          <Link href="/publier" className="flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-extrabold text-ink shadow-lg shadow-black/10 hover:-translate-y-0.5"><Plus size={17}/> Publier une annonce</Link>
        </div>
        <button onClick={()=>setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/5 lg:hidden" aria-label="Menu">{open?<X/>:<Menu/>}</button>
      </nav>
      {open&&<div className="shell mt-2"><div className="rounded-2xl border border-white/10 bg-ink/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden"><div className="flex flex-col">{links.map((link)=><Link onClick={()=>setOpen(false)} key={link.label} href={link.href} className="rounded-xl px-4 py-3 font-semibold text-white/80 hover:bg-white/5">{link.label}</Link>)}<Link href="/publier" className="mt-2 rounded-xl bg-lime px-5 py-3 text-center font-bold text-ink">Publier une annonce</Link><Link href="/connexion" className="py-3 text-center font-semibold">Connexion</Link></div></div></div>}
    </header>
  );
}
