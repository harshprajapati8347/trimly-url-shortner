"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { LinkIcon, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/theme-toggle";
import { useGuest } from "@/hooks/use-guest";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/types";

/**
 * Header is a client component (needs theme, guest state, dropdown interaction).
 * The authenticated user is resolved on the server and passed down as a prop,
 * replacing the old client-side UrlProvider fetch.
 */
export function SiteHeader({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { isGuest, setGuest } = useGuest();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isGuest && !user) {
      setGuest(false);
      router.push("/");
      router.refresh();
      return;
    }
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setGuest(false);
    router.push("/");
    router.refresh();
  };

  const logoSrc = resolvedTheme === "dark" ? "/trimly_dark.png" : "/trimly_light.png";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <PageContainer>
        <nav className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 hover:text-primary text-foreground"
          >
            <Image
              src={logoSrc}
              alt="Trimly logo"
              width={56}
              height={56}
              className="h-12 w-12 md:h-14 md:w-14"
              priority
            />
            <span className="text-xl md:text-2xl font-bold">Trimly</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />

            {!user && !isGuest ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/auth")}>
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setGuest(true);
                    router.push("/dashboard");
                  }}
                >
                  Try as Guest
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full"
                  >
                    {!user ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={user.avatarUrl ?? undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-muted">
                          {user.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user ? user.name : "Guest User"}
                      </p>
                      {user?.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex cursor-pointer">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      <span>My Links</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{user ? "Logout" : "End Session"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </PageContainer>
    </header>
  );
}
