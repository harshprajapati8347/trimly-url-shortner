import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UrlProvider from "./context";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";

import AppLayout from "./layouts/app-layout";
import RequireAuth from "./components/require-auth";

import RedirectLink from "./pages/redirect-link";
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import LinkPage from "./pages/link";
import Auth from "./pages/auth";
import PrivacyPage from "./pages/privacy";
import TermsPage from "./pages/terms";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/privacy",
        element: <PrivacyPage />,
      },
      {
        path: "/terms",
        element: <TermsPage />,
      },
      {
        path: "/dashboard",
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
      },
      {
        path: "/link/:id",
        element: (
          <RequireAuth>
            <LinkPage />
          </RequireAuth>
        ),
      },
      {
        path: "/:id",
        element: <RedirectLink />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="trimly-theme">
      <UrlProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </UrlProvider>
    </ThemeProvider>
  );
}

export default App;
