import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { AppFooter } from "@/components/layout/app-footer";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Trimly — Smart URL Shortening with Analytics",
    template: "%s · Trimly",
  },
  description:
    "Trimly replaces long, bulky links with short, trackable URLs. View location data and scale your brand effortlessly.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // User is resolved once on the server and threaded into the header, replacing
  // the old client-side UrlProvider context fetch-on-mount.
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-primary selection:text-primary-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="trimly-theme"
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <SiteHeader user={user} />
            <main className="flex-1 w-full flex flex-col items-center">
              {children}
            </main>
            <AppFooter />
          </div>
          <CookieConsent />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
