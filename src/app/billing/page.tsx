
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
import { useContext } from "react";
import { BookingContext } from "@/context/BookingContext";


const statusVariant: { [key: string]: 'default' | 'secondary' } = {
  'Paid': 'default',
  'Pending': 'secondary'
}

const typeIcon: { [key: string]: React.ReactNode } = {
    'Room': <Bed className="h-4 w-4 text-muted-foreground" />,
    'Lodge': <Bed className="h-4 w-4 text-muted-foreground" />,
    'Restaurant': <Utensils className="h-4 w-4 text-muted-foreground" />,
    'Room Service': <Utensils className="h-4 w-4 text-muted-foreground" />,
}


function BillingPage() {
  const { transactions } = useContext(BookingContext);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  }

  const todayRevenue = transactions
    .filter(t => new Date(t.date).toDateString() === new Date().toDateString() && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

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
             <StatCard title="Today's Revenue" value={formatCurrency(todayRevenue)} icon={<CreditCard />} />
             <StatCard title="Pending Payments" value={formatCurrency(pendingPayments)} icon={<CreditCard />} variant="destructive" />
             <StatCard title="Total Transactions" value={transactions.length.toString()} icon={<CreditCard />} />
        </div>

        <Card className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-[0_8px_32px_0_hsl(var(--primary)/0.1)]">
          <CardHeader>
            <CardTitle>Unified Billing System</CardTitle>
            <CardDescription>
              A centralized log of all financial transactions across rooms, restaurants, and other services.
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
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(t => (
                        <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">{t.id}</TableCell>
                            <TableCell>{t.guest}</TableCell>
                            <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                            <TableCell className="flex items-center gap-2">
                                {typeIcon[t.type]}
                                {t.type}
                            </TableCell>
                            <TableCell className="font-medium text-right">{formatCurrency(t.amount)}</TableCell>
                            <TableCell className="text-center">
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
