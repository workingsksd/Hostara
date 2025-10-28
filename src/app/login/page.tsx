
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

type EntityType = "Hotel" | "Lodge" | "Restaurant";

function LoginPage() {
  const router = useRouter();
  const [entityType, setEntityType] = useState<EntityType>("Hotel");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have authentication logic here.
    // For this mock, we'll just simulate a login.
    localStorage.setItem("authenticated", "true");
    router.push("/");
    router.refresh(); // Force a refresh to ensure withAuth re-evaluates
  };
  
  const entityTypes: EntityType[] = ["Hotel", "Lodge", "Restaurant"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-lg border-border/20 shadow-2xl shadow-primary/10">
        <div className="p-6 pb-4">
            <div className="flex w-full rounded-md bg-muted/50 p-1">
                {entityTypes.map((type) => (
                <Button
                    key={type}
                    variant="ghost"
                    onClick={() => setEntityType(type)}
                    className={cn(
                    "w-full transition-all duration-200",
                    entityType === type
                        ? "bg-background shadow-sm text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-background/50"
                    )}
                >
                    {type}
                </Button>
                ))}
            </div>
        </div>
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center pt-0">
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>Login to your {entityType} dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required className="bg-background/50"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required className="bg-background/50"/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">Login</Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link href="/register" className="underline text-foreground hover:text-primary-foreground">Register here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(LoginPage);
