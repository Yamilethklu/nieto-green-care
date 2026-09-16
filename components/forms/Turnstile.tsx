"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window { onNietoTurnstile?: (token: string) => void }
}

export function Turnstile({ onToken, locale }: { onToken: (token: string) => void; locale: "en" | "es" }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    window.onNietoTurnstile = onToken;
    return () => { delete window.onNietoTurnstile; };
  }, [onToken]);
  if (!siteKey) return <p className="notice">{locale === "es" ? "La verificación anti-spam se activará en producción." : "Anti-spam verification will be enabled in production."}</p>;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer /><div className="cf-turnstile" data-sitekey={siteKey} data-callback="onNietoTurnstile" data-theme="light" /></>;
}
