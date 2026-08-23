"use client";

import { Menu, Plus, X } from "lucide-react";
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
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 text-white">
      <nav className="shell flex h-20 items-center justify-between" aria-label="Navigation principale">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-lime font-extrabold text-ink">T</span>
          <b className="font-display text-lg">TOGOVEST<span className="text-lime">.</span></b>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-white/80 hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/connexion" className="px-4 text-sm font-semibold">Connexion</Link>
          <Link href="/publier" className="flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-ink">
            <Plus size={17}/> Publier une annonce
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 lg:hidden" aria-label="Menu">
          {open ? <X/> : <Menu/>}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/15 bg-ink/95 px-5 py-6 lg:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link onClick={() => setOpen(false)} key={link.label} href={link.href} className="rounded-xl px-4 py-3 font-semibold">
                {link.label}
              </Link>
            ))}
            <Link href="/publier" className="mt-3 rounded-full bg-lime px-5 py-3 text-center font-bold text-ink">Publier une annonce</Link>
            <Link href="/connexion" className="py-3 text-center font-semibold">Connexion</Link>
          </div>
        </div>
      )}
    </header>
  );
}
