import { Mail, MapPin } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Explorer",
    links: [
      ["Acheter", "/biens?transactionType=SALE"],
      ["Louer", "/biens?transactionType=RENT"],
      ["Terrains", "/biens?propertyType=LAND"],
    ],
  },
  {
    title: "TOGOVEST",
    links: [
      ["Publier une annonce", "/publier"],
      ["Espace agences", "/agence"],
      ["Tarifs", "/tarifs"],
    ],
  },
  {
    title: "Compte",
    links: [
      ["Connexion", "/connexion"],
      ["Dashboard", "/dashboard"],
      ["Favoris", "/favoris"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-sand pt-16">
      <div className="shell grid gap-12 pb-14 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-extrabold text-lime">T</span>
            <b className="font-display text-lg">TOGOVEST.</b>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink/60">La plateforme immobilière qui rapproche les Togolais de leur prochain chez-eux.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-ink/55 hover:text-forest">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-ink/50 sm:flex-row sm:justify-between">
          <p>© 2026 TOGOVEST. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-5">
            <span className="flex gap-1.5"><MapPin size={13}/>Lomé, Togo</span>
            <a href="mailto:contact@togovest.com" className="flex gap-1.5 hover:text-forest"><Mail size={13}/>contact@togovest.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
