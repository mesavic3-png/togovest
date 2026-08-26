import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales | TOGOVEST",
  description: "Informations légales et contact de TOGOVEST.",
};

export default function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <article className="mx-auto max-w-3xl rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <Link href="/" className="font-display text-xl font-extrabold">TOGOVEST.</Link>
        <h1 className="mt-8 text-3xl font-extrabold">Mentions légales</h1>
        <p className="mt-2 text-sm text-ink/55">Dernière mise à jour : 26 août 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-ink/75">
          <section>
            <h2 className="text-lg font-bold text-ink">Éditeur du service</h2>
            <p className="mt-2">TOGOVEST est une plateforme immobilière en ligne destinée à la publication et à la consultation d’annonces immobilières au Togo.</p>
            <p className="mt-2">Contact : <a className="font-semibold text-forest" href="mailto:togovest@gmail.com">togovest@gmail.com</a></p>
            <p>Localisation : Lomé, Togo</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Hébergement</h2>
            <p className="mt-2">Le service est actuellement déployé sur une infrastructure d’hébergement cloud. Les informations relatives au prestataire d’hébergement pourront être précisées ou mises à jour si nécessaire.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Propriété intellectuelle</h2>
            <p className="mt-2">La marque, l’identité visuelle, les éléments graphiques et les contenus propres à TOGOVEST sont protégés par les droits applicables. Les utilisateurs restent responsables des contenus, photographies et informations qu’ils publient et déclarent disposer des droits nécessaires pour leur diffusion.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">Responsabilité</h2>
            <p className="mt-2">TOGOVEST facilite la mise en relation entre utilisateurs. Les informations d’une annonce sont fournies par son auteur. Les visiteurs sont invités à vérifier l’identité de leur interlocuteur, la réalité du bien, les documents et les conditions de toute transaction avant de verser de l’argent ou de s’engager.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
