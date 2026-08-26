"use client";

import { usePathname, useRouter } from "next/navigation";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Retour à la page précédente"
      title="Retour"
      className="fixed left-3 top-3 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-xl font-semibold text-slate-800 shadow-md backdrop-blur transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:left-5 sm:top-5"
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
