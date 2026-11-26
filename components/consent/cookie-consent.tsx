"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  applyConsentChoice,
  parseConsentRaw,
  readConsentRaw,
  sanitizeGtmId,
  subscribeConsent,
  writeConsentChoice,
} from "@/lib/consent";

type CookieConsentContextValue = {
  openPreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

function subscribeMounted() {
  return () => {};
}

export function useCookieConsent() {
  const value = useContext(CookieConsentContext);
  if (!value) {
    throw new Error("Cookie consent is not mounted");
  }
  return value;
}

export function CookieConsent({ children }: { children: ReactNode }) {
  const gtmId = sanitizeGtmId(process.env.NEXT_PUBLIC_GTM_ID);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(
    subscribeConsent,
    readConsentRaw,
    () => null,
  );
  const choice = mounted ? parseConsentRaw(raw) : null;
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(false);

  function openPreferences() {
    setAnalyticsDraft(choice?.analytics ?? false);
    setPreferencesOpen(true);
  }

  function save(analytics: boolean) {
    writeConsentChoice(analytics);
    setAnalyticsDraft(analytics);
    applyConsentChoice(analytics, gtmId);
    setPreferencesOpen(false);
  }

  function closePreferences(open: boolean) {
    setPreferencesOpen(open);
  }

  return (
    <CookieConsentContext.Provider value={{ openPreferences }}>
      {children}
      {mounted && choice === null && !preferencesOpen ? (
        <CookieBanner
          onAccept={() => save(true)}
          onReject={() => save(false)}
          onCustomize={openPreferences}
        />
      ) : null}
      <CookiePreferencesDialog
        open={preferencesOpen}
        onOpenChange={closePreferences}
        analytics={analyticsDraft}
        onAnalyticsChange={setAnalyticsDraft}
        onSave={() => save(analyticsDraft)}
      />
    </CookieConsentContext.Provider>
  );
}

function CookieBanner({
  onAccept,
  onReject,
  onCustomize,
}: {
  onAccept: () => void;
  onReject: () => void;
  onCustomize: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:bottom-5 sm:px-6 sm:pb-0">
      <div
        role="region"
        aria-labelledby="cookie-banner-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl"
      >
        <div className="h-0.5 w-full bg-primary/50" aria-hidden="true" />
        <div className="p-5">
          <div className="space-y-1.5">
            <h2
              id="cookie-banner-title"
              className="text-sm font-semibold tracking-tight"
            >
              Cookies on Trimly
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Necessary cookies keep you signed in and remember interface
              choices. Analytics stays off unless you allow it. Read our{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="ghost"
              size="sm"
              onClick={onCustomize}
            >
              Customize
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              onClick={onReject}
            >
              Reject non-essential
            </Button>
            <Button className="w-full sm:w-auto" size="sm" onClick={onAccept}>
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookiePreferencesDialog({
  open,
  onOpenChange,
  analytics,
  onAnalyticsChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics: boolean;
  onAnalyticsChange: (enabled: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Your choice is stored in this browser until you change it. Necessary
            cookies stay on so sign-in and the interface keep working.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-3">
          <legend className="sr-only">Cookie categories</legend>
          <PreferenceRow
            id="consent-necessary"
            checked
            disabled
            title="Necessary"
            description="Sign-in session, theme, and guest links stored in this browser."
          />
          <PreferenceRow
            id="consent-analytics"
            checked={analytics}
            onCheckedChange={onAnalyticsChange}
            title="Analytics"
            description="Google Tag Manager measurement, only when a container is configured. Advertising storage stays off."
          />
        </fieldset>
        <DialogFooter>
          <Button onClick={onSave}>Save preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceRow({
  id,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border p-3",
        disabled ? "bg-muted/40" : "cursor-pointer hover:border-primary/40",
      )}
    >
      <span className="grid gap-1">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
      <Switch
        id={id}
        className="mt-0.5"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-readonly={disabled || undefined}
      />
    </label>
  );
}
