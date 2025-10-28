
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building, BedDouble, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

type EntityType = "Hotel" | "Lodge" | "Restaurant";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Hotel");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have registration logic here.
    // For this mock, we'll just simulate a registration and log the user in.
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("entityType", entityType);
    router.push("/");
  };

  const entityTypes: { name: EntityType; icon: React.ReactNode }[] = [
    { name: "Hotel", icon: <Building className="mr-2" /> },
    { name: "Lodge", icon: <BedDouble className="mr-2" /> },
    { name: "Restaurant", icon: <UtensilsCrossed className="mr-2" /> },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-4 bg-card/80 backdrop-blur-sm border-border/30">
        <div className="p-6 pb-0">
          <div className="grid grid-cols-3 gap-2 mb-6">
            {entityTypes.map((type) => (
              <Button
                key={type.name}
                variant="outline"
                onClick={() => setEntityType(type.name)}
                className={cn(
                  "py-6 flex-col h-auto bg-transparent transition-all duration-200 border-2",
                  entityType === type.name
                    ? "bg-primary/20 border-primary text-primary-foreground"
                    : "hover:bg-primary/10 border-border/50 text-muted-foreground"
                )}
              >
                {type.icon}
                <span>{type.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <form onSubmit={handleRegister}>
          <CardHeader className="text-center pt-0">
            <CardTitle className="text-2xl font-headline">
              Register a new {entityType}
            </CardTitle>
            <CardDescription>Fill in the details below to create an account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
                <Select onValueChange={setRole} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">Register</Button>
            <div className="text-sm text-center">
              Already have an account? <Link href="/login" className="underline">Login here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
