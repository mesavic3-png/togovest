"use client";

import { Bell, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  criteria: Record<string, string | undefined>;
};

const STORAGE_KEY = "togovest-search-alerts";

export function SavedSearchButton({ criteria }: Props) {
  const [saved, setSaved] = useState(false);
  const normalized = useMemo(() => Object.fromEntries(Object.entries(criteria).filter(([, value]) => value && value.trim())), [criteria]);
  const signature = useMemo(() => JSON.stringify(normalized), [normalized]);

  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Array<{ criteria: Record<string, string>; signature: string }>;
      setSaved(current.some((item) => item.signature === signature));
    } catch {
      setSaved(false);
    }
  }, [signature]);

  function saveAlert() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Array<any>;
      if (!current.some((item) => item.signature === signature)) {
        current.unshift({ id: crypto.randomUUID(), criteria: normalized, signature, createdAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 20)));
      }
      setSaved(true);
    } catch {
      // localStorage may be unavailable in private/locked-down browsers.
    }
  }

  return (
    <button type="button" onClick={saveAlert} disabled={saved || Object.keys(normalized).length === 0} className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-bold text-forest disabled:cursor-not-allowed disabled:opacity-50">
      {saved ? <Check size={17}/> : <Bell size={17}/>}
      {saved ? "Alerte enregistrée" : "Créer une alerte"}
    </button>
  );
}
