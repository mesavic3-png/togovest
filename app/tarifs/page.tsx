import Link from "next/link";
import { Check } from "lucide-react";
import { plans, oneOffProducts } from "@/lib/plans";
import { CheckoutButton } from "@/components/CheckoutButton";

const features = {
  FREE: ["2 annonces actives", "Photos et demandes de contact", "Tableau de bord"],
  PRO: ["25 annonces actives", "2 crédits Premium", "Statistiques et leads", "Support prioritaire"],
  AGENCY: ["150 annonces actives", "10 crédits Premium", "Jusqu’à 10 membres", "Espace agence et leads"],
};

export default function PricingPage() {
  return <main className="min-h-screen bg-sand px-5 py-14 text-ink"><div className="mx-auto max-w-6xl"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow">TOGOVEST Pro</p><h1 className="mt-3 text-4xl font-extrabold sm:text-6xl">Des offres pour vendre et louer plus vite</h1><p className="mt-5 text-ink/60">Commencez gratuitement, puis augmentez votre visibilité lorsque votre activité grandit.</p></div><section className="mt-12 grid gap-5 lg:grid-cols-3">{Object.entries(plans).map(([code, plan])=><article key={code} className={`rounded-[2rem] bg-white p-7 shadow-soft ${code === "PRO" ? "ring-2 ring-forest" : ""}`}><p className="text-sm font-bold uppercase tracking-widest text-forest">{plan.name}</p><p className="mt-5 text-4xl font-extrabold">{plan.priceXof.toLocaleString("fr-FR")} <span className="text-base font-semibold text-ink/50">FCFA/mois</span></p><div className="mt-7 space-y-3">{features[code as keyof typeof features].map(f=><p key={f} className="flex gap-2 text-sm"><Check size={18} className="text-forest"/>{f}</p>)}</div>{code === "FREE" ? <Link href="/inscription" className="mt-8 block rounded-full bg-forest px-5 py-3 text-center font-bold text-white">Commencer gratuitement</Link> : <CheckoutButton plan={code as "PRO" | "AGENCY"}/>}</article>)}</section><section className="mt-12 rounded-[2rem] bg-ink p-8 text-white"><h2 className="text-2xl font-extrabold">Besoin de visibilité sans abonnement ?</h2><p className="mt-3 text-white/60">Achetez un boost ou une mise en avant Premium pour une annonce spécifique.</p><div className="mt-6 flex flex-wrap gap-3"><span className="rounded-full bg-white/10 px-5 py-3 font-bold">{oneOffProducts.BOOST_7_DAYS.name} · {oneOffProducts.BOOST_7_DAYS.priceXof.toLocaleString("fr-FR")} FCFA</span><span className="rounded-full bg-white/10 px-5 py-3 font-bold">{oneOffProducts.FEATURED_30_DAYS.name} · {oneOffProducts.FEATURED_30_DAYS.priceXof.toLocaleString("fr-FR")} FCFA</span></div></section></div></main>;
}
