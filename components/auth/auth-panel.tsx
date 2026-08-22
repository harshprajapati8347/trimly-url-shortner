"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { useGuest } from "@/hooks/use-guest";

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setGuest } = useGuest();
  const longLink = searchParams.get("createNew");

  const handleGuest = () => {
    setGuest(true);
    router.push(`/dashboard${longLink ? `?createNew=${longLink}` : ""}`);
    router.refresh();
  };

  return (
    <PageContainer className="mt-16 sm:mt-24 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center tracking-tight">
        {longLink ? "Hold up! Let's login first..." : "Login / Signup"}
      </h1>

      <div className="w-full max-w-[400px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue without saving
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGuest}>
          Continue as Guest
        </Button>
      </div>
    </PageContainer>
  );
}
