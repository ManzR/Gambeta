"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Vuelve a pedir la página al servidor cada cierto tiempo mientras haya partidos en vivo.
// El servidor responde desde su caché, así que no gasta pedidos extra de la API.
export default function AutoRefresh({ active, seconds = 60 }: { active: boolean; seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [active, seconds, router]);
  return null;
}
