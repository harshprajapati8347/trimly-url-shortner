export const CONSENT_STORAGE_KEY = "trimly-consent";
export const CONSENT_VERSION = 1;

const GTM_ID_PATTERN = /^(?:GTM-)?[A-Z0-9]+$/;

export type ConsentSignal = "granted" | "denied";

export type ConsentChoice = {
  version: number;
  analytics: boolean;
  updatedAt: string;
};

type ConsentCommand = {
  ad_storage: ConsentSignal;
  ad_user_data: ConsentSignal;
  ad_personalization: ConsentSignal;
  analytics_storage: ConsentSignal;
  functionality_storage: ConsentSignal;
  personalization_storage: ConsentSignal;
  security_storage: ConsentSignal;
  wait_for_update?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function sanitizeGtmId(value: string | undefined): string | null {
  const id = value?.trim().toUpperCase() ?? "";
  if (!GTM_ID_PATTERN.test(id)) {
    return null;
  }
  return id.startsWith("GTM-") ? id : `GTM-${id}`;
}

export function readConsentChoice(): ConsentChoice | null {
  return parseConsentRaw(readConsentRaw());
}

const consentListeners = new Set<() => void>();

export function subscribeConsent(onStoreChange: () => void) {
  consentListeners.add(onStoreChange);
  return () => {
    consentListeners.delete(onStoreChange);
  };
}

export function readConsentRaw(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(CONSENT_STORAGE_KEY);
}

export function parseConsentRaw(raw: string | null): ConsentChoice | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isConsentChoice(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsentChoice(analytics: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    version: CONSENT_VERSION,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  consentListeners.forEach((listener) => listener());
  return choice;
}

/**
 * Applies a visitor choice. Google Tag Manager is inserted only after
 * Analytics is granted, and only when a container id is configured.
 */
export function applyConsentChoice(analytics: boolean, gtmId: string | null) {
  const analyticsStorage: ConsentSignal = analytics ? "granted" : "denied";
  ensureGtag();
  window.gtag!("consent", "update", consentUpdate(analyticsStorage));
  pushConsentEvent("consent_update", analyticsStorage);
  pushConsentEvent("cookie_consent_choice", analyticsStorage);

  if (analytics && gtmId) {
    loadGoogleTagManager(gtmId);
  }
}

export function loadGoogleTagManager(gtmId: string) {
  if (
    typeof document === "undefined" ||
    document.getElementById("gtm-script")
  ) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  //   <!-- Google Tag Manager -->
  // <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://www.iamharsh.in/som/78bvqnwojha.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','2p0=CAxXKCMjXEM2OT4%2FRSVEUBdVWEFGSBUYXB8dGFkHEBsJCRgcH0AYGEcbBR9KQQIZDA%3D%3D');</script>
  // <!-- End Google Tag Manager -->

  const script = document.createElement("script");

  // script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.innerHTML = `(function (w: any, d: any, s: any, l: any, i: any) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s);
    j.async = true;
    j.src = "https://trimly.iamharsh.in/som/78bvqnwojha.js?" + i;
    f.parentNode.insertBefore(j, f);
  })(
    window,
    document,
    "script",
    "dataLayer",
    "2p0=CAxXKCMjXEM2OT4%2FRSVEUBdVWEFGSBUYXB8dGFkHEBsJCRgcH0AYGEcbBR9KQQIZDA%3D%3D",
  );`;

  document.head.appendChild(script);
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    return;
  }

  window.gtag = function gtag() {
    // Consent Mode reads an Arguments object. A rest array is not the same value.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
}

function consentUpdate(analyticsStorage: ConsentSignal): ConsentCommand {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: analyticsStorage,
    functionality_storage: "granted",
    personalization_storage: "denied",
    security_storage: "granted",
  };
}

function pushConsentEvent(event: string, analyticsStorage: ConsentSignal) {
  window.dataLayer!.push({
    event,
    consent_analytics: analyticsStorage,
    consent_marketing: "denied",
    consent_necessary: "granted",
  });
}

function isConsentChoice(value: unknown): value is ConsentChoice {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const choice = value as Partial<ConsentChoice>;
  return (
    choice.version === CONSENT_VERSION &&
    typeof choice.analytics === "boolean" &&
    typeof choice.updatedAt === "string"
  );
}
