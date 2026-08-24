"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone, PauseCircle, PlayCircle } from "lucide-react";

type Ad = {
  id: string;
  advertiserName: string;
  title: string;
  placement: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  impressions: number;
  clicks: number;
};

type AdRequest = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  placement: string;
  durationWeeks: number;
  message: string | null;
  status: string;
  createdAt: string;
};

const inputClass = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-forest";

export function AdminAdvertisingManager({ advertisements, requests }: { advertisements: Ad[]; requests: AdRequest[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(id: string, status: string, kind: "advertisement" | "request" = "advertisement") {
    setLoading(`${kind}-${id}`);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/advertising", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, kind }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Modification impossible.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(null);
    }
  }

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("create");
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/admin/advertising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Création impossible.");
      event.currentTarget.reset();
      setMessage("Campagne créée avec succès.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3"><Megaphone className="text-forest"/><div><h2 className="text-2xl font-extrabold">Créer une campagne</h2><p className="text-sm text-ink/55">Configurez l’annonceur, le visuel, la destination, l’emplacement et la période.</p></div></div>
        <form onSubmit={createCampaign} className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="advertiserName" required className={inputClass} placeholder="Nom de l’annonceur"/>
          <input name="title" required className={inputClass} placeholder="Titre de la publicité"/>
          <input name="destinationUrl" required type="url" className={inputClass} placeholder="https://exemple.com"/>
          <input name="imageUrl" type="url" className={inputClass} placeholder="URL du visuel publicitaire"/>
          <select name="placement" className={inputClass} defaultValue="HOME_BANNER"><option value="HOME_BANNER">Bannière accueil</option><option value="SEARCH_INLINE">Résultats immobiliers</option><option value="PREMIUM">Premium multi-emplacements</option></select>
          <select name="status" className={inputClass} defaultValue="DRAFT"><option value="DRAFT">Brouillon</option><option value="SCHEDULED">Programmée</option><option value="ACTIVE">Active</option><option value="PAUSED">En pause</option></select>
          <label className="text-sm font-bold">Début<input name="startsAt" type="datetime-local" className={`${inputClass} mt-2`}/></label>
          <label className="text-sm font-bold">Fin<input name="endsAt" type="datetime-local" className={`${inputClass} mt-2`}/></label>
          <textarea name="description" rows={4} className={`${inputClass} md:col-span-2`} placeholder="Description optionnelle"/>
          <button disabled={loading === "create"} className="flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 font-bold text-white md:col-span-2 disabled:opacity-60">{loading === "create" && <Loader2 size={17} className="animate-spin"/>}Créer la campagne</button>
        </form>
        {message && <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm font-semibold">{message}</p>}
      </section>

      <section>
        <h2 className="text-2xl font-extrabold">Demandes des annonceurs</h2>
        <div className="mt-4 space-y-4">
          {requests.length === 0 ? <div className="rounded-2xl bg-white p-6">Aucune demande publicitaire.</div> : requests.map((request) => (
            <article key={request.id} className="rounded-2xl bg-white p-6 shadow-soft">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-extrabold">{request.companyName}</h3><span className="rounded-full bg-sand px-3 py-1 text-xs font-bold">{request.status}</span></div><p className="mt-2 text-sm text-ink/60">{request.contactName} · {request.email}{request.phone ? ` · ${request.phone}` : ""}</p><p className="mt-1 text-sm text-ink/60">{request.placement} · {request.durationWeeks} semaine(s)</p>{request.message && <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">{request.message}</p>}</div>
                <div className="flex flex-wrap gap-2"><button disabled={loading === `request-${request.id}`} onClick={() => updateStatus(request.id, "CONTACTED", "request")} className="rounded-full border border-forest/20 px-4 py-2 text-sm font-bold text-forest">Contactée</button><button disabled={loading === `request-${request.id}`} onClick={() => updateStatus(request.id, "APPROVED", "request")} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Approuver</button><button disabled={loading === `request-${request.id}`} onClick={() => updateStatus(request.id, "REJECTED", "request")} className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Refuser</button></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold">Campagnes publicitaires</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {advertisements.length === 0 ? <div className="rounded-2xl bg-white p-6 lg:col-span-2">Aucune campagne créée.</div> : advertisements.map((ad) => (
            <article key={ad.id} className="rounded-2xl bg-white p-6 shadow-soft"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-forest/60">{ad.placement}</p><h3 className="mt-2 text-xl font-extrabold">{ad.title}</h3><p className="mt-1 text-sm text-ink/55">{ad.advertiserName}</p></div><span className="rounded-full bg-sand px-3 py-1 text-xs font-bold">{ad.status}</span></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-sand p-4 text-sm"><div><b>{ad.impressions}</b><span className="block text-ink/50">vues</span></div><div><b>{ad.clicks}</b><span className="block text-ink/50">clics</span></div></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={loading === `advertisement-${ad.id}`} onClick={() => updateStatus(ad.id, "ACTIVE")} className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white"><PlayCircle size={16}/>Activer</button><button disabled={loading === `advertisement-${ad.id}`} onClick={() => updateStatus(ad.id, "PAUSED")} className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-bold"><PauseCircle size={16}/>Pause</button><button disabled={loading === `advertisement-${ad.id}`} onClick={() => updateStatus(ad.id, "ENDED")} className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold">Terminer</button></div></article>
          ))}
        </div>
      </section>
    </div>
  );
}
