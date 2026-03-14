import Header from "@/components/header";
import { AppFooter } from "@/components/layout/app-footer";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <Outlet />
      </main>
      <AppFooter />
      <CookieConsent />
    </div>
  );
};

export default AppLayout;
