"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email") || "") }),
    });
    const data = await response.json();
    setMessage(data.message);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="font-display text-xl font-extrabold">TOGOVEST.</a>
        <h1 className="mt-8 text-3xl font-extrabold">Mot de passe oublié</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">Entrez votre email pour recevoir un lien sécurisé valable pendant une heure.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-ink/15 px-4 py-3" />
          {message && <p className="rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">{message}</p>}
          <button disabled={loading} className="w-full rounded-full bg-forest px-5 py-3.5 font-bold text-white disabled:opacity-60">
            {loading ? "Envoi en cours…" : "Recevoir le lien"}
          </button>
        </form>
        <a href="/connexion" className="mt-6 block text-center text-sm font-semibold text-forest">Retour à la connexion</a>
      </div>
    </main>
  );
}
