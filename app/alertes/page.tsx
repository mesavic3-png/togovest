"use client";

import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "togovest-search-alerts";

type AlertItem = {
  id: string;
  criteria: Record<string, string>;
  signature: string;
  createdAt: string;
};

const labels: Record<string, string> = {
  transactionType: "Transaction",
  propertyType: "Type",
  city: "Localisation",
  checkIn: "Arrivée",
  checkOut: "Départ",
  guests: "Voyageurs",
};

const values: Record<string, string> = {
  SALE: "À vendre",
  RENT: "À louer",
  SHORT_TERM: "Courte durée",
  HOUSE: "Maison",
  APARTMENT: "Appartement",
  LAND: "Terrain",
  VILLA: "Villa",
  OFFICE: "Bureau",
  SHOP: "Boutique",
  WAREHOUSE: "Entrepôt",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    try {
      setAlerts(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      setAlerts([]);
    }
  }, []);

  function removeAlert(id: string) {
    const next = alerts.filter((item) => item.id !== id);
    setAlerts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function urlFor(criteria: Record<string, string>) {
    const params = new URLSearchParams(criteria);
    return `/biens?${params.toString()}`;
  }

  return <main className="min-h-screen bg-sand py-10 sm:py-16"><div className="shell">
    <p className="eyebrow">Recherche personnalisée</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-extrabold sm:text-5xl">Mes alertes immobilières</h1><p className="mt-3 max-w-2xl text-ink/60">Enregistrez vos recherches préférées et relancez-les en un clic pour voir les nouvelles annonces correspondantes.</p></div><Link href="/biens" className="rounded-full bg-forest px-6 py-3 font-bold text-white">Créer une recherche</Link></div>

    {alerts.length === 0 ? <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-soft"><Bell className="text-forest"/><h2 className="mt-4 text-2xl font-extrabold">Aucune alerte enregistrée</h2><p className="mt-2 text-ink/60">Faites une recherche sur la page des biens, puis cliquez sur « Créer une alerte ».</p><Link href="/biens" className="mt-5 inline-block rounded-full bg-forest px-5 py-3 font-bold text-white">Rechercher un bien</Link></div> :
    <div className="mt-10 grid gap-5 md:grid-cols-2">{alerts.map((alert) => <div key={alert.id} className="rounded-[1.75rem] bg-white p-6 shadow-soft"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-forest">Alerte active</p><h2 className="mt-2 text-xl font-extrabold">{alert.criteria.city || "Recherche immobilière"}</h2></div><button onClick={() => removeAlert(alert.id)} className="rounded-full border border-ink/10 p-2 text-ink/45" aria-label="Supprimer l’alerte"><Trash2 size={18}/></button></div><div className="mt-5 flex flex-wrap gap-2">{Object.entries(alert.criteria).map(([key, value]) => <span key={key} className="rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink/65">{labels[key] || key} : {values[value] || value}</span>)}</div><div className="mt-6 flex items-center justify-between gap-3"><span className="text-xs text-ink/40">Créée le {new Date(alert.createdAt).toLocaleDateString("fr-FR")}</span><Link href={urlFor(alert.criteria)} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Voir les résultats</Link></div></div>)}</div>}
  </div></main>;
}
