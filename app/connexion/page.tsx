"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastIdentifier, setLastIdentifier] = useState("");

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "register") setMode("register");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") || "").trim();
    const password = String(form.get("password") || "");
    setLastIdentifier(identifier);

    if (mode === "register") {
      const isEmail = identifier.includes("@");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email: isEmail ? identifier : "",
          phone: isEmail ? "" : identifier,
          password,
          role: String(form.get("role") || "OWNER"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Inscription impossible.");
        return;
      }
      setMode("login");
      if (data.requiresVerification) {
        setNotice(data.emailSent
          ? "Compte créé. Consultez votre email pour confirmer votre adresse avant de vous connecter."
          : "Compte créé, mais l’email n’a pas pu être envoyé. Utilisez le bouton de renvoi ci-dessous.");
      } else {
        setNotice("Compte créé avec votre numéro de téléphone. Vous pouvez maintenant vous connecter.");
      }
      return;
    }

    const { signIn } = await import("next-auth/react");
    const result = await signIn("credentials", { identifier, password, redirect: false });
    if (result?.error) {
      setError("Connexion impossible. Vérifiez votre email ou numéro de téléphone et votre mot de passe.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function resendVerification() {
    if (!lastIdentifier.includes("@")) {
      setError("Entrez votre adresse email pour renvoyer l’email de vérification.");
      return;
    }
    setError("");
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lastIdentifier }),
    });
    const data = await response.json();
    setNotice(data.message);
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="font-display text-xl font-extrabold">TOGOVEST.</a>
        <h1 className="mt-8 text-3xl font-extrabold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {mode === "login" ? "Connectez-vous avec votre email ou votre numéro de téléphone." : "Inscrivez-vous avec votre email ou votre numéro de téléphone."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "register" && (
            <>
              <input name="name" required placeholder="Nom complet" className="w-full rounded-xl border border-ink/15 px-4 py-3" />
              <select name="role" defaultValue="OWNER" className="w-full rounded-xl border border-ink/15 px-4 py-3">
                <option value="OWNER">Propriétaire</option>
                <option value="AGENT">Agent immobilier</option>
                <option value="USER">Acheteur / locataire</option>
              </select>
            </>
          )}
          <input
            name="identifier"
            required
            placeholder="Email ou téléphone (ex. +22890123456)"
            defaultValue={lastIdentifier}
            autoComplete="username"
            className="w-full rounded-xl border border-ink/15 px-4 py-3"
          />
          <input name="password" type="password" minLength={8} required placeholder="Mot de passe (8 caractères minimum)" autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full rounded-xl border border-ink/15 px-4 py-3" />
          {notice && <p className="rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">{notice}</p>}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-full bg-forest px-5 py-3.5 font-bold text-white">{mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
        </form>
        {mode === "login" && (
          <div className="mt-5 flex flex-col gap-3 text-center text-sm font-semibold text-forest">
            <a href="/mot-de-passe-oublie">Mot de passe oublié ?</a>
            <button onClick={resendVerification}>Renvoyer l’email de vérification</button>
          </div>
        )}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setNotice(""); }} className="mt-5 w-full text-sm font-semibold text-forest">
          {mode === "login" ? "Pas encore de compte ? S’inscrire" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
    </main>
  );
}
