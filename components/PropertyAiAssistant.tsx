"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Bot, Loader2, MapPin, Send, Sparkles } from "lucide-react";

type ResultProperty = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  price: string;
  currency: string;
  transactionType: string;
  bedrooms: number | null;
  type: string;
};

type AssistantResponse = {
  reply: string;
  filters: Record<string, string | number | null>;
  properties: ResultProperty[];
};

const examples = [
  "Je cherche une maison de 3 chambres à Lomé pour moins de 40 millions FCFA",
  "Appartement à louer à Agoè, budget 250 000 FCFA par mois",
  "Villa pour un court séjour à Lomé pour 4 personnes",
];

export function PropertyAiAssistant({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant-immobilier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’effectuer la recherche.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={compact ? "py-8" : "min-h-screen bg-sand px-5 py-12 sm:py-16"}>
      <div className={compact ? "shell" : "mx-auto max-w-5xl"}>
        <div className="overflow-hidden rounded-[2rem] bg-ink text-white shadow-soft">
          <div className="p-6 sm:p-9">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-ink"><Bot size={24}/></div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-lime">Assistant immobilier IA</p>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Décrivez simplement le bien que vous cherchez.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">TOGOVEST comprend votre demande en français et recherche les annonces publiées qui correspondent le mieux.</p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ex. Maison 3 chambres à Lomé, moins de 40 millions FCFA" className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white px-5 py-4 text-ink outline-none placeholder:text-ink/40"/>
              <button disabled={loading || !message.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-6 py-4 font-extrabold text-ink disabled:opacity-50">{loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}Rechercher</button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">{examples.map((example) => <button type="button" key={example} onClick={() => setMessage(example)} className="rounded-full border border-white/15 px-3 py-2 text-left text-xs font-semibold text-white/70 transition hover:bg-white/10">{example}</button>)}</div>
          </div>

          {(result || error) && <div className="border-t border-white/10 bg-white p-6 text-ink sm:p-9">
            {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
            {result && <>
              <div className="flex items-start gap-3"><Sparkles className="mt-0.5 text-forest" size={20}/><p className="leading-7 text-ink/75">{result.reply}</p></div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.properties.map((property) => <Link key={property.id} href={`/biens/${property.id}`} className="rounded-2xl border border-ink/10 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-forest/60">{property.type} · {property.transactionType === "SALE" ? "Vente" : property.transactionType === "RENT" ? "Location" : "Court séjour"}</p>
                  <h3 className="mt-2 text-lg font-extrabold">{property.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/55"><MapPin size={14}/>{property.district ? `${property.district}, ` : ""}{property.city}</p>
                  <p className="mt-4 font-extrabold text-forest">{Number(property.price).toLocaleString("fr-FR")} {property.currency}{property.transactionType === "RENT" ? " / mois" : property.transactionType === "SHORT_TERM" ? " / nuit" : ""}</p>
                  {property.bedrooms ? <p className="mt-1 text-sm text-ink/50">{property.bedrooms} chambre(s)</p> : null}
                </Link>)}
              </div>
              {result.properties.length === 0 && <div className="mt-6 rounded-2xl bg-sand p-6"><p className="font-bold">Aucune annonce exacte pour le moment.</p><p className="mt-2 text-sm text-ink/60">Essayez d’élargir le budget, la zone ou le type de bien.</p></div>}
            </>}
          </div>}
        </div>
      </div>
    </section>
  );
}
