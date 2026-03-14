import Login from "@/components/login";
import Signup from "@/components/signup";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {UrlState} from "@/context";
import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

function Auth() {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {isAuthenticated, loading, setGuestSession} = UrlState();
  const longLink = searchParams.get("createNew");

  useEffect(() => {
    if (isAuthenticated && !loading)
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
  }, [isAuthenticated, loading, navigate]);

  const handleGuestSession = () => {
    setGuestSession(true);
    navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
  };

  return (
    <PageContainer className="mt-16 sm:mt-24 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center tracking-tight">
        {searchParams.get("createNew")
          ? "Hold up! Let's login first..."
          : "Login / Signup"}
      </h1>
      
      <div className="w-full max-w-[400px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Login />
          </TabsContent>
          <TabsContent value="signup">
            <Signup />
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

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGuestSession}
        >
          Continue as Guest
        </Button>
      </div>
    </PageContainer>
  );
}

export default Auth;
