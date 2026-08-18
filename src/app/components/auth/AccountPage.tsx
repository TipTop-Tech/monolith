import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../../lib/AuthService";
import { haptics } from "../../lib/haptics";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogOut, User, Crown, RefreshCcw, Settings, ChevronRight } from "lucide-react";
// import { usePremium } from "../../context/PremiumContext";

export const AccountPage = () => {
  const { user } = useAuth();
  // const { isPro, isLoading, presentPaywall, presentCustomerCenter, restorePurchases } = usePremium();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    haptics.thud();
    try {
      await AuthService.logout();
      navigate("/signin");
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Truncate when email is too long
  // Truncate only the local part of the email so the @domain stays visible
  const email = user?.email ?? "";
  const atIndex = email.lastIndexOf("@");
  const emailLocal = atIndex >= 0 ? email.slice(0, atIndex) : email;
  const emailDomain = atIndex >= 0 ? email.slice(atIndex) : "";

  return (
    <div className="flex h-full w-full flex-col p-4 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Account</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10">
              {user?.email ? getInitials(user.email) : <User />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate user-text">{user?.user_metadata?.username || "User"}</CardTitle>
            <CardDescription title={email} className="flex text-sm user-text">
              <span className="min-w-0 truncate">{emailLocal}</span>
              <span className="shrink-0 max-w-[65%] truncate">{emailDomain}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="pt-4 flex flex-col space-y-4">
            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${isPro ? "text-yellow-500" : "text-muted-foreground"}`} />
            <CardTitle className="text-base">Subscription</CardTitle>
          </div>
          {isPro && (
            <span className="bg-yellow-500/10 text-yellow-600 text-[10px] px-2 py-1 rounded-full font-bold">
              PRO
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {isPro ? (
              <>
                <p className="text-sm text-muted-foreground">You are currently subscribed to Premium.</p>
                <Button variant="outline" className="w-full" onClick={presentCustomerCenter} disabled={isLoading}>
                  Manage Subscription
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Upgrade to Premium to unlock all features.</p>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={presentPaywall} disabled={isLoading}>
                  Upgrade to Pro
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={restorePurchases} disabled={isLoading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restore Purchases
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Crown className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-base">Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Premium coming soon.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center justify-between gap-4 p-4"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
