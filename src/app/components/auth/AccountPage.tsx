import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../../lib/AuthService";
import { haptics } from "../../lib/haptics";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Switch } from "../ui/switch";
import { LogOut, User } from "lucide-react";

export const AccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hapticsOn, setHapticsOn] = useState(() => {
    try {
      return localStorage.getItem("hapticsEnabled") !== "false";
    } catch {
      return true;
    }
  });

  const toggleHaptics = (next: boolean) => {
    try {
      localStorage.setItem("hapticsEnabled", next ? "true" : "false");
    } catch {
    }
    setHapticsOn(next);
    if (next) haptics.tap();
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium leading-none">Haptics</p>
              <p className="text-sm text-muted-foreground mt-1">Haptic feedback</p>
            </div>
            <Switch checked={hapticsOn} onCheckedChange={toggleHaptics} aria-label="Haptics" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
