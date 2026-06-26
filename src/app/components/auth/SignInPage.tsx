import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthService } from "../../../lib/AuthService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { Separator } from "../ui/separator";

export const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthService.login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await AuthService.oauthGoogle();
      // Usually OAuth redirects to a URL, but if it doesn't, navigate
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    try {
      await AuthService.oauthApple();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Apple");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs" 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="text-sm text-destructive font-medium">{error}</div>}
            
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Separator className="flex-1" />
            <span>Or continue with</span>
            <Separator className="flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleGoogleSignIn}>
              Google
            </Button>
            <Button variant="outline" onClick={handleAppleSignIn}>
              Apple
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm">
          <div className="text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>

      <ForgotPasswordModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};
