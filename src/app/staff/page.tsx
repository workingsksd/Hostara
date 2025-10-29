
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, SlidersHorizontal } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { placeholderImages } from "@/lib/placeholder-images";

const staff = [
  {
    name: "Maria Garcia",
    role: "Head Housekeeper",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-2")?.imageUrl,
    shift: "7am - 3pm",
  },
  {
    name: "Liam Gallagher",
    role: "Maintenance Lead",
    status: "On Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-3")?.imageUrl,
    shift: "9am - 5pm",
  },
  {
    name: "Chloe Nguyen",
    role: "Front Desk",
    status: "Off Duty",
    avatar: placeholderImages.find((p) => p.id === "user-avatar-1")?.imageUrl,
    shift: "3pm - 11pm",
  },
  {
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
            </Button>
          </div>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Team and Role Administration</CardTitle>
            <CardDescription>
              Manage employees, roles, attendance, and tasks. This is a placeholder and will be fully implemented soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <Card key={member.name} className="transform transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
                    <p className="text-sm text-muted-foreground">{member.shift}</p>
                  </CardContent>
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
