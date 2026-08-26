import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions d’utilisation | TOGOVEST",
  description: "Conditions d’utilisation de la plateforme immobilière TOGOVEST.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <article className="mx-auto max-w-3xl rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <Link href="/" className="font-display text-xl font-extrabold">TOGOVEST.</Link>
        <h1 className="mt-8 text-3xl font-extrabold">Conditions d’utilisation</h1>
        <p className="mt-2 text-sm text-ink/55">Dernière mise à jour : 26 août 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-ink/75">
          <section>
            <h2 className="text-lg font-bold text-ink">1. Objet de la plateforme</h2>
            <p className="mt-2">TOGOVEST met en relation des personnes recherchant un bien immobilier avec des propriétaires, agents et agences qui publient des annonces de vente, location ou location courte durée au Togo.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">2. Comptes utilisateurs</h2>
            <p className="mt-2">Vous êtes responsable des informations fournies lors de votre inscription, de la confidentialité de vos identifiants et des actions réalisées depuis votre compte. Les informations publiées doivent être exactes, licites et à jour.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">3. Publication d’annonces</h2>
            <p className="mt-2">Les annonceurs doivent disposer du droit de proposer le bien concerné. Il est interdit de publier des annonces trompeuses, frauduleuses, dupliquées, illégales ou portant atteinte aux droits de tiers. TOGOVEST peut suspendre, masquer ou supprimer une annonce qui ne respecte pas ces règles.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">4. Transactions entre utilisateurs</h2>
            <p className="mt-2">TOGOVEST est une plateforme de mise en relation. Sauf indication contraire, TOGOVEST n’est pas partie aux contrats conclus entre utilisateurs et ne garantit pas la solvabilité, l’identité, la disponibilité ou l’état réel d’un bien. Chaque utilisateur doit effectuer ses propres vérifications avant tout paiement ou engagement.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">5. Comportements interdits</h2>
            <p className="mt-2">Sont notamment interdits : l’usurpation d’identité, le démarchage abusif, l’envoi de contenus malveillants, la tentative d’accès non autorisé au service, l’utilisation automatisée excessive et toute activité destinée à tromper ou nuire à d’autres utilisateurs.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">6. Disponibilité du service</h2>
            <p className="mt-2">Nous faisons notre possible pour maintenir le service accessible, mais nous ne garantissons pas une disponibilité sans interruption. Des opérations de maintenance, incidents techniques ou événements externes peuvent temporairement affecter le fonctionnement du site.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">7. Contact</h2>
            <p className="mt-2">Pour toute question relative à ces conditions, contactez-nous à <a className="font-semibold text-forest" href="mailto:togovest@gmail.com">togovest@gmail.com</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
