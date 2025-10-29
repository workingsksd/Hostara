
"use client";

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
import { ShieldCheck, UserPlus } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { placeholderImages } from "@/lib/placeholder-images";

const visitorLog = [
    { id: 'v-001', name: 'Alice Johnson', date: '2024-08-20', timeIn: '14:30', timeOut: '16:00', visiting: 'Eleanor Vance (Room 301)', status: 'Logged Out', avatar: 'https://picsum.photos/seed/visitor1/40/40'},
    { id: 'v-002', name: 'Bob Williams', date: '2024-08-20', timeIn: '15:00', timeOut: '---', visiting: 'Marcus Thorne (Lodge 5)', status: 'Inside', avatar: 'https://picsum.photos/seed/visitor2/40/40'},
]

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Inside': 'default',
  'Logged Out': 'secondary',
}

function SecurityPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Security & Visitor Tracking</h1>
            <Button>
                <UserPlus className="mr-2" /> Register New Visitor
            </Button>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-accent"/> Visitor Management</CardTitle>
            <CardDescription>
              Manage guest visitors with KYC and permission logging. This is a placeholder and will be fully implemented soon.
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
                            <TableCell>{v.date}</TableCell>
                            <TableCell>{v.timeIn}</TableCell>
                            <TableCell>{v.timeOut}</TableCell>
                            <TableCell>{v.visiting}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[v.status]}>{v.status}</Badge>
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
