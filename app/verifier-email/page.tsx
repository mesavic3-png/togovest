"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerificationStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Vérification en cours…" : "Lien de vérification invalide.");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Vérification impossible.");
        setStatus("success");
        setMessage("Votre adresse email est vérifiée. Votre compte est prêt.");
      })
      .catch((error: Error) => {
        setStatus("error");
        setMessage(error.message);
      });
  }, [token]);

  return (
    <div className="mt-8">
      <p className={status === "error" ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest"}>{message}</p>
      {status === "success" && <a href="/connexion" className="mt-6 block text-center font-bold text-forest">Se connecter</a>}
      {status === "error" && <a href="/connexion" className="mt-6 block text-center text-sm font-semibold text-forest">Retour à la connexion</a>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="font-display text-xl font-extrabold">TOGOVEST.</a>
        <h1 className="mt-8 text-3xl font-extrabold">Vérification de l’email</h1>
        <Suspense fallback={<p className="mt-8 text-sm text-ink/60">Chargement…</p>}><VerificationStatus /></Suspense>
      </div>
    </main>
  );
}
