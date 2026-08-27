import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchBox } from "./SearchBox";

export async function Hero() {
  const [propertyCount, agencyCount] = await Promise.all([
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.agency.count({ where: { verified: true } }),
  ]);

  return (
    <section id="accueil" className="relative flex min-h-[820px] items-center overflow-hidden bg-ink pb-16 pt-32 text-white sm:pt-36">
      <Image src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=90" alt="Villa moderne" fill priority className="object-cover opacity-50"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b2119] via-[#10281f]/90 to-[#10281f]/25"/>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"/>
      <div className="shell relative z-10">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-lime backdrop-blur"><BadgeCheck size={15}/> La référence immobilière au Togo</div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[4.8rem]">Trouvez un bien qui correspond vraiment à votre projet.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">Maisons, appartements, terrains et locations courte durée. Une expérience immobilière plus claire pour acheter, louer et investir au Togo.</p>
          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm font-semibold text-white/70"><span className="flex items-center gap-2"><ShieldCheck size={18} className="text-lime"/> Annonces mieux structurées</span><Link href="/biens" className="flex items-center gap-2 text-white hover:text-lime">Explorer les biens <ArrowRight size={17}/></Link></div>
        </div>
        <SearchBox/>
        <div className="mt-10 grid max-w-2xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.07] backdrop-blur-md">
          <div className="p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">{propertyCount}</b><span className="text-xs text-white/50 sm:text-sm">biens publiés</span></div>
          <div className="border-x border-white/10 p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">{agencyCount}</b><span className="text-xs text-white/50 sm:text-sm">agences vérifiées</span></div>
          <div className="p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">Togo</b><span className="text-xs text-white/50 sm:text-sm">couverture nationale</span></div>
        </div>
      </div>
    </section>
  );
}
