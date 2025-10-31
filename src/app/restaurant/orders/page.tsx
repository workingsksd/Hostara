
'use client';

import { useContext } from 'react';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingContext, Order } from '@/context/BookingContext';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, CheckCircle, CookingPot, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusConfig: { [key in Order['status']]: { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode, label: string } } = {
  'New': { variant: 'default', icon: <CookingPot />, label: 'New' },
  'In Progress': { variant: 'secondary', icon: <CookingPot className="animate-pulse" />, label: 'In Progress' },
  'Completed': { variant: 'outline', icon: <CheckCircle className="text-green-500"/>, label: 'Completed' },
  'Cancelled': { variant: 'destructive', icon: <History />, label: 'Cancelled' },
};

const nextStatus: { [key in Order['status']]?: Order['status'] } = {
    'New': 'In Progress',
    'In Progress': 'Completed',
};

function KitchenDisplayPage() {
  const { orders, updateOrderStatus } = useContext(BookingContext);
  const { toast } = useToast();

  const handleUpdateStatus = (order: Order) => {
    const next = nextStatus[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
       toast({
        title: 'Order Status Updated',
        description: `Order #${order.id.slice(-6)} is now ${next}.`
      });
      if (next === 'Completed') {
         toast({
            title: 'Billing Alert',
            description: `A new charge for ${order.guestName} has been added to the main folio.`,
            className: 'bg-blue-500 text-white'
        });
      }
    }
  };

  const renderOrderColumn = (status: Order['status']) => {
    const filteredOrders = orders.filter(o => o.status === status);
    return (
      <div key={status} className="flex-1 space-y-4">
        <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
            {statusConfig[status].icon}
            {statusConfig[status].label}
            <Badge variant="secondary" className="rounded-full">{filteredOrders.length}</Badge>
        </h2>
        <div className="space-y-4 h-[75vh] overflow-y-auto rounded-lg p-1 no-scrollbar">
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <Card key={order.id} className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{order.guestName}</span>
                    <span className="text-sm font-normal text-muted-foreground">#{order.id.slice(-6)}</span>
                </CardTitle>
                <CardDescription>
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <ul className="space-y-2 text-sm">
                    {order.items.map(item => (
                    <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                    </li>
                    ))}
                </ul>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-2">
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{order.total}</span>
                    </div>
                    {nextStatus[order.status] && (
                        <Button onClick={() => handleUpdateStatus(order)}>
                            {nextStatus[order.status]} <ArrowRight className="ml-2"/>
                        </Button>
                    )}
                </CardFooter>
            </Card>
            )) : <p className="text-muted-foreground text-center pt-10">No orders here.</p>}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold font-headline mb-6">Kitchen Display System (KDS)</h1>
      <div className="flex gap-6">
        {renderOrderColumn('New')}
        {renderOrderColumn('In Progress')}
        {renderOrderColumn('Completed')}
      </div>
    </AppLayout>
  );
}

export default withAuth(KitchenDisplayPage);
