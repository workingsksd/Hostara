
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
import { createUserProfile } from "@/services/user-service";
import type { UserProfile } from "@/context/BookingContext";


type OrganisationType = UserProfile['organisationType'];
type Role = UserProfile['role'];

const allRoles: { value: Role, label: string }[] = [
    { value: 'Admin', label: 'Admin (Full Access)' },
    // Hotel & Lodge
    { value: 'Front Office Staff', label: 'Front Office Staff' },
    { value: 'Housekeeping', label: 'Housekeeping' },
    { value: 'Maintenance Team', label: 'Maintenance Team' },
    { value: 'Inventory Manager', label: 'Inventory Manager' },
    { value: 'HR Manager', label: 'HR Manager' },
    { value: 'Finance Manager', label: 'Finance Manager' },
    { value: 'Security Staff', label: 'Security Staff' },
    { value: 'Guest', label: 'Guest' },
    // Lodge specific mapping - reusing for simplicity
    { value: 'Receptionist', label: 'Receptionist' }, // Mapped from Front Office Staff
    { value: 'Finance', label: 'Finance Officer' }, // Mapped from Finance Manager
    // Restaurant specific
    { value: 'Restaurant Manager', label: 'Restaurant Manager' },
    { value: 'Waiter', label: 'Waiter' },
    { value: 'Chef', label: 'Chef' },
];

function RegisterPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [organisationType, setOrganisationType] = useState<OrganisationType>("Hotel");
  const [loading, setLoading] = useState(false);

  const availableRoles = useMemo(() => {
    switch (organisationType) {
        case 'Hotel':
            return allRoles.filter(r => !['Receptionist', 'Finance', 'Waiter', 'Chef', 'Restaurant Manager'].includes(r.value));
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
                { value: 'Admin', label: 'Owner (Admin)' },
                { value: 'Restaurant Manager', label: 'Restaurant Manager' },
                { value: 'Chef', label: 'Chef' },
                { value: 'Waiter', label: 'Waiter' },
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
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Firebase not initialized." });
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userProfileData: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: name,
        role: role,
        organisationType: organisationType,
        photoURL: userCredential.user.photoURL || '',
      };
      
      await createUserProfile(firestore, userCredential.user.uid, userProfileData);

      toast({ title: "Registration Successful", description: "Please log in with your new account." });
      
      router.push("/login");
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
                    type="button"
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
                <Select onValueChange={(value) => setRole(value as Role)} value={role} required>
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
