import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleConsent = (accepted) => {
    localStorage.setItem("cookie-consent", String(accepted));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 w-full">
      <div className="mx-auto max-w-4xl rounded-lg border bg-background p-6 shadow-lg sm:flex sm:items-center sm:justify-between">
        <div className="pr-4 mb-4 sm:mb-0">
          <h3 className="text-lg font-semibold">Cookie Preferences</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trimly collects{" "}
            <strong>
              device and approximate location data for link analytics
            </strong>
            . We use cookies and local storage to manage your experience. Read
            our{" "}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>{" "}
            to learn more.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="outline" onClick={() => handleConsent(false)}>
            Decline
          </Button>
          <Button onClick={() => handleConsent(true)}>Accept All</Button>
        </div>
        <button
          onClick={() => handleConsent(false)}
          className="absolute right-6 top-6 sm:top-auto sm:right-6 text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
