"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    if (mode === "register") {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email,
          password,
          role: String(form.get("role") || "USER"),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Inscription impossible.");
        return;
      }
    }

    const { signIn } = await import("next-auth/react");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return <main className="min-h-screen bg-sand px-5 py-16 text-ink"><div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-soft sm:p-10"><a href="/" className="font-display text-xl font-extrabold">TOGOVEST.</a><h1 className="mt-8 text-3xl font-extrabold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1><p className="mt-2 text-sm text-ink/60">Accédez à votre espace pour gérer vos annonces immobilières.</p><form onSubmit={submit} className="mt-8 space-y-4">{mode === "register" && <><input name="name" required placeholder="Nom complet" className="w-full rounded-xl border border-ink/15 px-4 py-3"/><select name="role" className="w-full rounded-xl border border-ink/15 px-4 py-3"><option value="USER">Acheteur / locataire</option><option value="OWNER">Propriétaire</option><option value="AGENT">Agent immobilier</option></select></>}<input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-ink/15 px-4 py-3"/><input name="password" type="password" minLength={8} required placeholder="Mot de passe (8 caractères minimum)" className="w-full rounded-xl border border-ink/15 px-4 py-3"/>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button className="w-full rounded-full bg-forest px-5 py-3.5 font-bold text-white">{mode === "login" ? "Se connecter" : "Créer mon compte"}</button></form><button onClick={()=>setMode(mode === "login" ? "register" : "login")} className="mt-5 w-full text-sm font-semibold text-forest">{mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà inscrit ? Se connecter"}</button></div></main>;
}
