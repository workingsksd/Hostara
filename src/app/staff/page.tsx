"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, SlidersHorizontal, Clock } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { placeholderImages } from "@/lib/placeholder-images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  status: "On Duty" | "Off Duty";
  avatar: string | undefined;
  shift: string;
};

const initialStaff: StaffMember[] = [
  {
    id: 'staff-1',
    name: "Maria Garcia",
    role: "Head Housekeeper",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-2")?.imageUrl,
    shift: "7am - 3pm",
  },
  {
    id: 'staff-2',
    name: "Liam Gallagher",
    role: "Maintenance Lead",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-3")?.imageUrl,
    shift: "9am - 5pm",
  },
  {
    id: 'staff-3',
    name: "Chloe Nguyen",
    role: "Front Desk",
    status: "Off Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-1")?.imageUrl,
    shift: "3pm - 11pm",
  },
  {
    id: 'staff-4',
    name: "John Doe",
    role: "Chef",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-4")?.imageUrl,
    shift: "12pm - 8pm",
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  "On Duty": "default",
  "Off Duty": "secondary",
};


function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      shift: formData.get('shift') as string,
      status: "Off Duty", // Default status for new staff
      avatar: `https://picsum.photos/seed/staff${Date.now()}/40/40`,
    };

    setStaff(prev => [newStaffMember, ...prev]);
    setIsAddDialogOpen(false);
    toast({
      title: 'Staff Member Added',
      description: `${newStaffMember.name} has been added to the team.`,
    });
  };
  
  const handleToggleStatus = (staffId: string) => {
    setStaff(prevStaff => {
        const updatedStaff = prevStaff.map(member => {
            if (member.id === staffId) {
                const newStatus = member.status === "On Duty" ? "Off Duty" : "On Duty";
                toast({
                    title: `${member.name}'s status updated`,
                    description: `They are now ${newStatus}.`,
                });
                return { ...member, status: newStatus };
            }
            return member;
        });
        return updatedStaff;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">
            Staff & Role Management
          </h1>
          <div className="flex items-center gap-4">
             <Button variant="outline">
                <SlidersHorizontal className="mr-2" />
                Filter Roles
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddStaff}>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new staff member.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" name="role" placeholder="e.g., Front Desk" required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="shift">Shift</Label>
                      <Input id="shift" name="shift" placeholder="e.g., 9am - 5pm" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Staff Member</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Team and Role Administration</CardTitle>
            <CardDescription>
              Manage employees, roles, attendance, and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <Card key={member.id} className="flex flex-col transform transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-grow justify-between items-center">
                    <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
                    <p className="text-sm text-muted-foreground">{member.shift}</p>
                  </CardContent>
                   <CardFooter>
                     <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleToggleStatus(member.id)}
                    >
                      <Clock className="mr-2" />
                      Toggle Status
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(StaffPage);
