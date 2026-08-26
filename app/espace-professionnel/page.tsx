import Link from "next/link";
import { getServerSession } from "next-auth";
import { Building2, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function ProfessionalEntryPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean((session?.user as any)?.id);

  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] bg-ink p-7 text-white shadow-soft sm:p-10">
          <div className="flex items-center gap-3 text-lime">
            <Building2 size={28} />
            <span className="text-xs font-bold uppercase tracking-[.2em]">TOGOVEST Pro</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Espace professionnel</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">
            Propriétaires, agents et agences : connectez-vous ou créez votre compte professionnel pour gérer vos biens et vos demandes.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/connexion?mode=login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-4 font-bold text-ink">
              <LogIn size={19} /> Se connecter
            </Link>
            <Link href="/connexion?mode=register" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-4 font-bold text-white hover:bg-white/5">
              <UserPlus size={19} /> Créer un compte professionnel
            </Link>
          </div>

          {isLoggedIn && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm text-white/60">Vous avez déjà une session ouverte.</p>
              <Link href="/dashboard" className="mt-3 inline-flex items-center gap-2 font-bold text-lime">
                Accéder à mon espace <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
