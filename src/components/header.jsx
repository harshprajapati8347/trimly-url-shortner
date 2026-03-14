import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/db/apiAuth";
import useFetch from "@/hooks/use-fetch";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { LinkIcon, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { Button } from "./ui/button";
import { UrlState } from "@/context";
import { ThemeToggle } from "./theme-toggle";
import { PageContainer } from "./layout/page-container";

const Header = () => {
  const navigate = useNavigate();
  const { user, fetchUser, setGuestSession, isGuest } = UrlState();
  const { loading, fn: fnLogout } = useFetch(logout);

  const handleLogout = async () => {
    if (isGuest) {
      setGuestSession(false);
      navigate("/");
    } else {
      await fnLogout();
      fetchUser();
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <PageContainer>
        <nav className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <img
              src="/logo.png"
              className="h-8 md:h-12 dark:invert"
              alt="Trimly Logo"
            />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />

            {!user && !isGuest ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Login
                </Button>
                <Button onClick={() => setGuestSession(true)}>
                  Try as Guest
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    {isGuest ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10 border rounded-full overflow-hidden">
                        <AvatarImage src={user?.user_metadata?.profile_pic} />
                        <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted">
                          {user?.user_metadata?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {isGuest ? "Guest User" : user?.user_metadata?.name}
                      </p>
                      {!isGuest && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex cursor-pointer">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      <span>My Links</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isGuest ? "End Session" : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </PageContainer>
      {loading && <BarLoader width="100%" color="#36d7b7" />}
    </header>
  );
};

export default Header;
