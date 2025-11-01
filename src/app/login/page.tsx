
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import withAuth from "@/components/withAuth";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

type EntityType = "Hotel" | "Lodge" | "Restaurant";

function LoginPage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!auth) {
      toast({ variant: "destructive", title: "Firebase not initialized." });
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The withAuth component will handle redirection after user state is updated
      // No need to set localStorage or push route here
      toast({ title: "Login Successful", description: "Redirecting to your dashboard..."});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    if (!auth) {
      toast({ variant: "destructive", title: "Firebase not initialized." });
      setLoading(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      // For Google Sign-In, we can't select organization type beforehand.
      // This is a limitation. A real app might have a post-login step.
      // For now, we'll let `withAuth` redirect to a default page.
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Redirecting to your dashboard..."});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-lg border-border/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>Login to your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required className="bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required className="bg-background/50" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="relative w-full">
                <Separator className="absolute top-1/2 -translate-y-1/2"/>
                <span className="relative bg-card text-card-foreground px-2 text-xs uppercase mx-auto flex w-fit">Or continue with</span>
            </div>

            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-63.1 61.9C338.4 99.8 300.9 88 248 88c-86.5 0-155.2 67.4-161.5 156.4h9.1c21.4 0 41.5 7.8 56.6 22.1l69.1-68.1C292.8 59.3 225.4 8 150.3 8 67.2 8 0 75.2 0 158.3s67.2 150.3 150.3 150.3c60.3 0 109.3-25.2 141.5-64.8l78.7 77.4C345.5 453.4 299.8 472 248 472c-132.3 0-240-107.7-240-240S115.7 16 248 16c69.1 0 132.8 28.5 178.4 74.9l8.6-8.6C405.2 43.6 333.1 8 248 8z"></path></svg>
                Google
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link href="/register" className="underline text-foreground hover:text-primary">Register here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(LoginPage);
