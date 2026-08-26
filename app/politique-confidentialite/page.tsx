import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité | TOGOVEST",
  description: "Politique de confidentialité et protection des données sur TOGOVEST.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <article className="mx-auto max-w-3xl rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <Link href="/" className="font-display text-xl font-extrabold">TOGOVEST.</Link>
        <h1 className="mt-8 text-3xl font-extrabold">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-ink/55">Dernière mise à jour : 26 août 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-ink/75">
          <section>
            <h2 className="text-lg font-bold text-ink">1. Données que nous collectons</h2>
            <p className="mt-2">Nous pouvons collecter les informations que vous fournissez directement, notamment votre nom, adresse e-mail, numéro de téléphone, informations de compte, contenu des annonces, demandes de contact et informations nécessaires au fonctionnement des services TOGOVEST.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">2. Utilisation des données</h2>
            <p className="mt-2">Ces données servent notamment à créer et sécuriser votre compte, publier et gérer les annonces, faciliter les échanges entre utilisateurs, traiter les demandes, prévenir les abus, améliorer le service et vous envoyer les communications nécessaires au fonctionnement de votre compte.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">3. Partage des données</h2>
            <p className="mt-2">Nous ne vendons pas vos données personnelles. Certaines informations peuvent être transmises à des prestataires techniques lorsque cela est nécessaire pour héberger le site, envoyer des e-mails, traiter des paiements ou fournir une fonctionnalité demandée. Les informations publiées volontairement dans une annonce peuvent être visibles publiquement.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">4. Conservation et sécurité</h2>
            <p className="mt-2">Nous conservons les données pendant la durée nécessaire à la fourniture du service, au respect de nos obligations et à la prévention des fraudes. Nous mettons en place des mesures techniques et organisationnelles raisonnables pour réduire les risques d’accès, de modification ou de divulgation non autorisés.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">5. Vos choix</h2>
            <p className="mt-2">Vous pouvez demander l’accès, la correction ou la suppression de certaines données associées à votre compte, sous réserve des obligations légales ou de sécurité applicables. Vous pouvez également nous contacter pour toute question concernant vos informations personnelles.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">6. Cookies et données techniques</h2>
            <p className="mt-2">TOGOVEST peut utiliser des cookies ou technologies similaires nécessaires à l’authentification, à la sécurité, aux préférences et à la mesure du fonctionnement du service. Si des outils publicitaires ou analytiques non essentiels sont ajoutés, cette politique pourra être mise à jour.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-ink">7. Contact</h2>
            <p className="mt-2">Pour toute demande relative à vos données personnelles, écrivez à <a className="font-semibold text-forest" href="mailto:togovest@gmail.com">togovest@gmail.com</a>.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
