
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
import { Button } from "@/components/ui/button";
import { FileDown, CreditCard, Utensils, Bed } from "lucide-react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";

const transactions = [
    { id: 'txn-001', guest: 'Eleanor Vance', date: '2024-08-20', type: 'Room', amount: '₹12,500', status: 'Paid'},
    { id: 'txn-002', guest: 'Marcus Thorne', date: '2024-08-19', type: 'Restaurant', amount: '₹3,200', status: 'Paid'},
    { id: 'txn-003', guest: 'John Doe', date: '2024-08-18', type: 'Room Service', amount: '₹1,500', status: 'Pending'},
    { id: 'txn-004', guest: 'Sophia Loren', date: '2024-08-17', type: 'Lodge', amount: '₹9,800', status: 'Paid'},
]

const statusVariant: { [key: string]: 'default' | 'secondary' } = {
  'Paid': 'default',
  'Pending': 'secondary'
}

const typeIcon: { [key: string]: React.ReactNode } = {
    'Room': <Bed className="h-4 w-4" />,
    'Lodge': <Bed className="h-4 w-4" />,
    'Restaurant': <Utensils className="h-4 w-4" />,
    'Room Service': <Utensils className="h-4 w-4" />,
}


function BillingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">
            Finance, Billing & Accounting
            </h1>
            <Button>
                <FileDown className="mr-2" /> Export Report
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
             <StatCard title="Today's Revenue" value="₹45,750" icon={<CreditCard />} />
             <StatCard title="Pending Payments" value="₹1,500" icon={<CreditCard />} variant="destructive" />
             <StatCard title="Total Transactions" value="23" icon={<CreditCard />} />
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Unified Billing System</CardTitle>
            <CardDescription>
              This is a placeholder for the unified billing system for rooms, restaurants, and extras. Full implementation is coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(t => (
                        <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">{t.id}</TableCell>
                            <TableCell>{t.guest}</TableCell>
                            <TableCell>{t.date}</TableCell>
                            <TableCell className="flex items-center gap-2">
                                {typeIcon[t.type]}
                                {t.type}
                            </TableCell>
                            <TableCell className="font-medium">{t.amount}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
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

function StatCard({ title, value, icon, variant }: { title: string, value: string, icon: React.ReactNode, variant?: "default" | "destructive" }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={variant === 'destructive' ? 'text-destructive' : 'text-accent'}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold font-headline ${variant === 'destructive' ? 'text-destructive' : ''}`}>{value}</div>
      </CardContent>
    </Card>
  );
}


export default withAuth(BillingPage);
