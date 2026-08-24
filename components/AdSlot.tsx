import Link from "next/link";
import { Megaphone } from "lucide-react";

export function AdSlot({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "rounded-[1.5rem] border border-forest/10 bg-white p-5 shadow-soft" : "bg-sand py-7"}>
      <div className={compact ? "" : "shell"}>
        <div className="flex flex-col gap-5 rounded-[1.75rem] border border-forest/10 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime text-ink"><Megaphone size={20}/></div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-forest">Espace publicitaire</p>
              <h2 className="mt-1 text-xl font-extrabold">Votre entreprise peut être visible ici</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">Banques, assurances, construction, ameublement, déménagement et services immobiliers : touchez directement les visiteurs de TOGOVEST.</p>
            </div>
          </div>
          <Link href="/publicite" className="shrink-0 rounded-full bg-forest px-5 py-3 text-center text-sm font-bold text-white">Faire de la publicité</Link>
        </div>
      </div>
    </section>
  );
}
