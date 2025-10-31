
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import withAuth from "@/components/withAuth";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

type OrganisationType = "Hotel" | "Lodge" | "Restaurant";
type Role = 'Admin' | 'Front Office Staff' | 'Housekeeping' | 'Maintenance Team' | 'Restaurant Staff' | 'Chef/Kitchen' | 'Inventory Manager' | 'HR Manager' | 'Finance Manager' | 'Security Staff' | 'Guest' | 'Receptionist' | 'Finance' | 'Chef' | 'Staff';

const allRoles: { value: Role, label: string }[] = [
    { value: 'Admin', label: 'Admin (Full Access)' },
    { value: 'Front Office Staff', label: 'Front Office Staff' },
    { value: 'Housekeeping', label: 'Housekeeping' },
    { value: 'Maintenance Team', label: 'Maintenance Team' },
    { value: 'Restaurant Staff', label: 'Restaurant Staff' },
    { value: 'Chef/Kitchen', label: 'Chef/Kitchen' },
    { value: 'Inventory Manager', label: 'Inventory Manager' },
    { value: 'HR Manager', label: 'HR Manager' },
    { value: 'Finance Manager', label: 'Finance Manager' },
    { value: 'Security Staff', label: 'Security Staff' },
    { value: 'Guest', label: 'Guest' },
    // Lodge specific roles can be mapped from these
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Finance', label: 'Finance Officer' },
    // Restaurant specific roles
    { value: 'Chef', label: 'Chef' },
    { value: 'Staff', label: 'General Staff' },
];


function RegisterPage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState("");
  const [organisationType, setOrganisationType] = useState<OrganisationType>("Hotel");
  const [loading, setLoading] = useState(false);

  const availableRoles = useMemo(() => {
    switch (organisationType) {
        case 'Hotel':
            return allRoles.filter(r => !['Receptionist', 'Finance', 'Chef', 'Staff'].includes(r.value));
        case 'Lodge':
            return [
                { value: 'Admin', label: 'Manager (Admin)' },
                { value: 'Receptionist', label: 'Receptionist' },
                { value: 'Housekeeping', label: 'Housekeeping' },
                { value: 'Finance', label: 'Finance Officer' },
                { value: 'Guest', label: 'Guest' },
            ];
        case 'Restaurant':
            return [
                { value: 'Admin', label: 'Manager (Admin)' },
                { value: 'Chef', label: 'Chef' },
                { value: 'Staff', label: 'General Staff' },
            ];
        default:
            return [];
    }
  }, [organisationType]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "Please select a role.",
      });
      return;
    }
    setLoading(true);
    if (!auth) {
      toast({ variant: "destructive", title: "Firebase not initialized." });
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // In a real app, you'd likely save the role and organisationType to Firestore
      // For this example, we'll use localStorage
      localStorage.setItem("userRole", role);
      localStorage.setItem("organisationType", organisationType);
      
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const organisationTypes: OrganisationType[] = ["Hotel", "Lodge", "Restaurant"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-lg border-border/20 shadow-2xl shadow-primary/10">
        <div className="p-6 pb-4">
            <div className="flex w-full rounded-md bg-muted/50 p-1">
                {organisationTypes.map((type) => (
                <Button
                    key={type}
                    variant="ghost"
                    onClick={() => {
                        setOrganisationType(type);
                        setRole(''); // Reset role when entity type changes
                    }}
                    className={cn(
                    "w-full transition-all duration-200",
                    organisationType === type
                        ? "bg-background shadow-sm text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-background/50"
                    )}
                >
                    {type}
                </Button>
                ))}
            </div>
        </div>
        <form onSubmit={handleRegister}>
          <CardHeader className="text-center pt-0">
            <CardTitle className="text-2xl font-headline">
              Register for {organisationType}
            </CardTitle>
            <CardDescription>Fill in the details below to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required className="bg-background/50" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="manager@example.com" required className="bg-background/50" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required className="bg-background/50" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
                <Select onValueChange={setRole} value={role} required>
                  <SelectTrigger id="role" className="bg-background/50">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account? <Link href="/login" className="underline text-foreground hover:text-primary">Login here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(RegisterPage);
