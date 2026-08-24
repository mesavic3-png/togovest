import Link from "next/link";
import { BarChart3, CheckCircle2, Megaphone, MousePointerClick } from "lucide-react";

const offers = [
  { name: "Bannière Accueil", description: "Une grande visibilité sous la zone de recherche sur la page d’accueil.", ideal: "Idéal pour les banques, assurances, promoteurs et grandes marques." },
  { name: "Résultats immobiliers", description: "Votre publicité apparaît au cœur de la recherche des biens.", ideal: "Idéal pour le bâtiment, l’ameublement, le déménagement et les services locaux." },
  { name: "Premium", description: "Présence renforcée sur plusieurs emplacements de TOGOVEST pendant la campagne.", ideal: "Idéal pour les campagnes commerciales à forte visibilité." },
];

export default function AdvertisingPage() {
  return (
    <main className="min-h-screen bg-sand py-12 sm:py-16">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">PUBLICITÉ SUR TOGOVEST</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">Présentez votre entreprise aux personnes qui cherchent un bien immobilier.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink/60">TOGOVEST propose des emplacements publicitaires pensés pour les entreprises qui veulent toucher propriétaires, locataires, acheteurs, investisseurs et professionnels de l’immobilier.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.name} className="rounded-[2rem] bg-white p-7 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-lime"><Megaphone size={20}/></div>
              <h2 className="mt-5 text-2xl font-extrabold">{offer.name}</h2>
              <p className="mt-3 leading-7 text-ink/60">{offer.description}</p>
              <p className="mt-5 text-sm font-semibold text-forest">{offer.ideal}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 grid gap-5 rounded-[2rem] bg-ink p-7 text-white sm:p-10 md:grid-cols-3">
          <div><BarChart3 className="text-lime"/><h3 className="mt-3 font-extrabold">Visibilité ciblée</h3><p className="mt-2 text-sm leading-6 text-white/60">Votre marque est présentée à une audience déjà intéressée par l’immobilier.</p></div>
          <div><MousePointerClick className="text-lime"/><h3 className="mt-3 font-extrabold">Lien vers votre activité</h3><p className="mt-2 text-sm leading-6 text-white/60">La campagne peut envoyer directement les visiteurs vers votre site, WhatsApp ou page commerciale.</p></div>
          <div><CheckCircle2 className="text-lime"/><h3 className="mt-3 font-extrabold">Campagnes contrôlées</h3><p className="mt-2 text-sm leading-6 text-white/60">Les annonces peuvent être activées pour une période définie puis retirées automatiquement dans une prochaine version.</p></div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 text-center shadow-soft sm:p-10">
          <h2 className="text-3xl font-extrabold">Vous souhaitez réserver un emplacement ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Contactez l’équipe TOGOVEST pour préparer votre campagne. Les tarifs seront définis selon l’emplacement, la durée et le niveau de visibilité.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="mailto:contact@togovest.com?subject=Publicité sur TOGOVEST" className="rounded-full bg-forest px-6 py-3 font-bold text-white">Demander un emplacement</a>
            <Link href="/" className="rounded-full border border-forest/20 px-6 py-3 font-bold text-forest">Retour à l’accueil</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
