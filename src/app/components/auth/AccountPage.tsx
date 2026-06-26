import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../../lib/AuthService";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogOut, User } from "lucide-react";

export const AccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
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
          <div>
            <CardTitle>{user?.user_metadata?.username || "User"}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
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
    </div>
  );
};
