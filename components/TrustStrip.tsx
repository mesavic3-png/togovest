import { BadgeCheck, Building2, ShieldCheck, Smartphone } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Plus de confiance", text: "Une plateforme pensée pour rendre la recherche immobilière plus claire." },
  { icon: BadgeCheck, title: "Professionnels identifiables", text: "Propriétaires, agents et agences disposent d’un espace dédié." },
  { icon: Smartphone, title: "Pensé pour le mobile", text: "Une expérience fluide pour rechercher et contacter depuis votre téléphone." },
  { icon: Building2, title: "100 % immobilier Togo", text: "Un service spécialisé dans les besoins du marché immobilier togolais." },
];

export function TrustStrip(){
  return <section className="border-y border-ink/[.06] bg-white"><div className="shell grid gap-px py-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(({icon:Icon,title,text})=><div key={title} className="flex gap-4 px-3 py-6 sm:px-5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest/[.07] text-forest"><Icon size={21}/></div><div><h3 className="text-sm font-extrabold tracking-normal">{title}</h3><p className="mt-1 text-xs leading-5 text-ink/50">{text}</p></div></div>)}</div></section>;
}
