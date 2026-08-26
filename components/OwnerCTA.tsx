import { ArrowUpRight, Building2, Home } from "lucide-react";
import Link from "next/link";

export function OwnerCTA() {
  return (
    <section id="professionnels" className="shell pb-20 sm:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[55px] border-lime/10" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-lime">Vous êtes propriétaire ou agence ?</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-5xl">Découvrez l’espace professionnel TOGOVEST.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/65">TOGOVEST accompagne les propriétaires, agents et agences dans la gestion et la mise en valeur de leurs biens.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/espace-professionnel" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-center font-bold transition hover:border-lime/50 hover:bg-white/5">
                Espace professionnel <ArrowUpRight size={18} />
              </Link>
              <Link href="/connexion?mode=login" className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-center font-bold text-white/75 transition hover:text-white">
                Se connecter
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Home className="text-lime" />
              <h3 className="mt-4 font-bold">Pour les propriétaires</h3>
              <p className="mt-2 text-sm text-white/55">Un espace dédié pour gérer vos biens simplement depuis votre tableau de bord.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Building2 className="text-lime" />
              <h3 className="mt-4 font-bold">Pour les agences</h3>
              <p className="mt-2 text-sm text-white/55">Des outils professionnels pour organiser et valoriser votre portefeuille immobilier.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
