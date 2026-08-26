"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Réinitialisation impossible.");
      return;
    }
    setSuccess(true);
  }

  if (!token) return <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Lien de réinitialisation invalide.</p>;
  if (success) return <div className="mt-8"><p className="rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">Votre mot de passe a été modifié.</p><a href="/connexion" className="mt-6 block text-center font-bold text-forest">Se connecter</a></div>;

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input name="password" type="password" minLength={8} required placeholder="Nouveau mot de passe" className="w-full rounded-xl border border-ink/15 px-4 py-3" />
      <input name="confirmation" type="password" minLength={8} required placeholder="Confirmer le mot de passe" className="w-full rounded-xl border border-ink/15 px-4 py-3" />
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="w-full rounded-full bg-forest px-5 py-3.5 font-bold text-white disabled:opacity-60">
        {loading ? "Modification…" : "Modifier mon mot de passe"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="font-display text-xl font-extrabold">TOGOVEST.</a>
        <h1 className="mt-8 text-3xl font-extrabold">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-ink/60">Choisissez un mot de passe d’au moins 8 caractères.</p>
        <Suspense fallback={<p className="mt-8 text-sm text-ink/60">Chargement…</p>}><ResetPasswordForm /></Suspense>
      </div>
    </main>
  );
}
