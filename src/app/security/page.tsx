
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, LogOut } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
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
import { format } from 'date-fns';

type Visitor = {
  id: string;
  name: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  visiting: string;
  status: 'Inside' | 'Logged Out';
  avatar: string;
}

const initialVisitorLog: Visitor[] = [
    { id: 'v-001', name: 'Alice Johnson', date: '2024-08-20', timeIn: '14:30', timeOut: '16:00', visiting: 'Eleanor Vance (Room 301)', status: 'Logged Out', avatar: 'https://picsum.photos/seed/visitor1/40/40'},
    { id: 'v-002', name: 'Bob Williams', date: '2024-08-20', timeIn: '15:00', timeOut: null, visiting: 'Marcus Thorne (Lodge 5)', status: 'Inside', avatar: 'https://picsum.photos/seed/visitor2/40/40'},
];

const statusVariant: { [key: string]: 'default' | 'secondary' } = {
  'Inside': 'default',
  'Logged Out': 'secondary',
}

function SecurityPage() {
  const [visitorLog, setVisitorLog] = useState<Visitor[]>(initialVisitorLog);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { toast } = useToast();

  const handleRegisterVisitor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      name: formData.get('name') as string,
      date: format(new Date(), 'yyyy-MM-dd'),
      timeIn: format(new Date(), 'HH:mm'),
      timeOut: null,
      visiting: formData.get('visiting') as string,
      status: 'Inside',
      avatar: `https://picsum.photos/seed/visitor${Date.now()}/40/40`
    };

    setVisitorLog(prev => [newVisitor, ...prev]);
    setIsRegisterOpen(false);
    toast({
      title: 'Visitor Registered',
      description: `${newVisitor.name} has been logged in.`
    });
  };

  const handleLogOut = (visitorId: string) => {
    setVisitorLog(prev => prev.map(v => {
      if (v.id === visitorId) {
        toast({
          title: 'Visitor Logged Out',
          description: `${v.name} has been logged out.`
        });
        return {
          ...v,
          status: 'Logged Out',
          timeOut: format(new Date(), 'HH:mm')
        };
      }
      return v;
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Security & Visitor Tracking</h1>
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2" /> Register New Visitor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleRegisterVisitor}>
                  <DialogHeader>
                    <DialogTitle>Register New Visitor</DialogTitle>
                    <DialogDescription>
                      Enter the visitor's details to log their entry.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Visitor Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visiting">Visiting Guest/Room</Label>
                      <Input id="visiting" name="visiting" placeholder="e.g., John Doe (Room 101)" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                    <Button type="submit">Register Visitor</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-accent"/> Visitor Management</CardTitle>
            <CardDescription>
              A real-time log of all visitors entering and leaving the premises.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Time Out</TableHead>
                        <TableHead>Visiting</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visitorLog.map(v => (
                        <TableRow key={v.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={v.avatar} />
                                    <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {v.name}
                            </TableCell>
                            <TableCell>{format(new Date(v.date), 'PP')}</TableCell>
                            <TableCell>{v.timeIn}</TableCell>
                            <TableCell>{v.timeOut || '---'}</TableCell>
                            <TableCell>{v.visiting}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {v.status === 'Inside' && (
                                <Button variant="outline" size="sm" onClick={() => handleLogOut(v.id)}>
                                  <LogOut className="mr-2 h-3 w-3" /> Log Out
                                </Button>
                              )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(SecurityPage);
