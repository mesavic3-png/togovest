import { ArrowUpRight, Building2, Home } from "lucide-react";
import Link from "next/link";

export function OwnerCTA() {
  const cards = [
    {
      href: "/publier",
      Icon: Home,
      title: "Pour les propriétaires",
      text: "Une publication simple, guidée et professionnelle.",
    },
    {
      href: "/agence",
      Icon: Building2,
      title: "Pour les agences",
      text: "Des outils pensés pour valoriser votre portefeuille.",
    },
  ];

  return (
    <section id="professionnels" className="shell pb-20 sm:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[55px] border-lime/10"/>
        <div className="relative grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-lime">Vous êtes propriétaire ou agence ?</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-5xl">Accédez à votre espace professionnel TOGOVEST.</h2>
            <p className="mt-5 max-w-xl leading-7 text-white/65">Choisissez votre espace pour publier, gérer et valoriser vos biens immobiliers.</p>
            <div className="mt-8">
              <Link href="/agence" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-center font-bold">Espace agences <ArrowUpRight size={18}/></Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map(({ href, Icon, title, text }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-lime/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="text-lime"/>
                  <ArrowUpRight size={18} className="text-white/45 transition group-hover:text-lime"/>
                </div>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-white/55">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
