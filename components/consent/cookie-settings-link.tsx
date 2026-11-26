"use client";

import { useCookieConsent } from "@/components/consent/cookie-consent";

export function CookieSettingsLink() {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="hover:text-primary transition-colors underline underline-offset-4"
    >
      Cookies
    </button>
  );
}
