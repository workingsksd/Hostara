
'use client';

import { useContext } from 'react';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { BookingContext, Order } from '@/context/BookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

function KitchenDisplayPage() {
  const { orders, updateOrderStatus } = useContext(BookingContext);

  const orderColumns: { status: Order['status']; title: string }[] = [
    { status: 'New', title: 'New Orders' },
    { status: 'In Progress', title: 'In Progress' },
    { status: 'Ready', title: 'Ready for Pickup' },
  ];
  
  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
        case 'New': return 'In Progress';
        case 'In Progress': return 'Ready';
        case 'Ready': return 'Served';
        default: return null;
    }
  }

  const handleUpdateStatus = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
        updateOrderStatus(order.id, nextStatus);
    }
  }


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Kitchen Display System (KDS)</h1>
            <Button asChild variant="outline">
                <Link href="/restaurant">
                     Back to POS
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {orderColumns.map(col => (
                <div key={col.status} className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-center">{col.title}</h2>
                    {orders.filter(o => o.status === col.status).map(order => (
                        <Card key={order.id} className="bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{order.tableId.startsWith('ext-') ? `Online: ${order.tableId.split('-')[1]}` : `Table: ${order.tableId.split('-')[1]}`}</span>
                                    <span className="text-sm font-mono text-muted-foreground">#{order.id.slice(-4)}</span>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}</p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {order.items.map(item => (
                                    <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                                        <span>{item.name}</span>
                                        <span className="font-bold">x{item.quantity}</span>
                                    </div>
                                ))}
                            </CardContent>
                             {getNextStatus(order.status) && (
                                <div className="p-4 pt-0">
                                    <Button className="w-full" onClick={() => handleUpdateStatus(order)}>
                                        {order.status === 'In Progress' ? <Check className="mr-2"/> : <ArrowRight className="mr-2" />}
                                        {order.status === 'New' ? 'Start Cooking' : 'Mark as Ready'}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                    {orders.filter(o => o.status === col.status).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">No orders here.</p>
                    )}
                </div>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(KitchenDisplayPage);
