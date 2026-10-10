"use client";

import { useEffect } from "react";

/** Compte une vue de page publique (1 appel différé, ignoré si erreur). */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, [slug]);
  return null;
}