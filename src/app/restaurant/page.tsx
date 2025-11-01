
'use client';

import { useContext, useState } from 'react';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { BookingContext, MenuItem, OrderItem, RestaurantTable } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Utensils, Beer, Pizza, Plus, Minus, X, Square, CheckSquare, CookingPot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';


const tableStatusVariant = {
  Available: 'default',
  Occupied: 'secondary',
  Billing: 'destructive',
} as const;

const tableStatusIcon = {
    Available: <Square className="h-4 w-4" />,
    Occupied: <CheckSquare className="h-4 w-4" />,
    Billing: <CookingPot className="h-4 w-4" />,
};

const categoryIcons: { [key in MenuItem['category']]: React.ReactNode } = {
  Appetizer: <Pizza className="h-5 w-5" />,
  'Main Course': <Utensils className="h-5 w-5" />,
  Dessert: <Beer className="h-5 w-5" />,
  Beverage: <Beer className="h-5 w-5" />,
};


function RestaurantPOSPage() {
  const { menu, tables, orders, addOrder, updateOrderStatus } = useContext(BookingContext);
  const { toast } = useToast();

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);

  const handleTableClick = (table: RestaurantTable) => {
    setSelectedTable(table);
    
    if (table.orderId) {
        const existingOrder = orders.find(o => o.id === table.orderId);
        if(existingOrder) {
            setCurrentOrderItems(existingOrder.items);
        }
    } else {
        setCurrentOrderItems([]);
    }
    setIsOrderDialogOpen(true);
  };
  
  const addToOrder = (menuItem: MenuItem) => {
    setCurrentOrderItems(prev => {
        const existingItem = prev.find(item => item.menuItemId === menuItem.id);
        if (existingItem) {
            return prev.map(item => item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1} : item);
        }
        return [...prev, { menuItemId: menuItem.id, name: menuItem.name, quantity: 1}];
    });
  }

  const removeFromOrder = (menuItemId: string) => {
    setCurrentOrderItems(prev => {
        const existingItem = prev.find(item => item.menuItemId === menuItemId);
        if (existingItem && existingItem.quantity > 1) {
            return prev.map(item => item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1} : item);
        }
        return prev.filter(item => item.menuItemId !== menuItemId);
    });
  }

  const handlePlaceOrder = () => {
    if (!selectedTable || currentOrderItems.length === 0) {
        toast({ variant: 'destructive', title: 'Cannot place order', description: 'Please select a table and add items.'});
        return;
    }

    addOrder({
        tableId: selectedTable.id,
        items: currentOrderItems
    });
    
    toast({ title: 'Order Sent to Kitchen', description: `Order for ${selectedTable.name} has been placed.`});
    setIsOrderDialogOpen(false);
    setCurrentOrderItems([]);
    setSelectedTable(null);
  }

  const handleFinalizeBill = () => {
      if (!selectedTable || !selectedTable.orderId) return;
      updateOrderStatus(selectedTable.orderId, 'Paid');
      toast({ title: "Bill Finalized", description: `${selectedTable.name} is now available.`});
      setIsOrderDialogOpen(false);
  }

  const totalOrderAmount = currentOrderItems.reduce((acc, orderItem) => {
    const menuItem = menu.find(m => m.id === orderItem.menuItemId);
    return acc + (menuItem?.price || 0) * orderItem.quantity;
  }, 0);


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Point of Sale (POS) & Table Management</h1>
            <Button asChild variant="outline">
                <Link href="/restaurant/orders">
                    <CookingPot className="mr-2"/> View Kitchen Display
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Section */}
            <div className="lg:col-span-2">
                 <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                    <CardHeader>
                        <CardTitle>Restaurant Menu</CardTitle>
                        <CardDescription>Click on an item to add it to an order for a selected table.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(['Main Course', 'Appetizer', 'Dessert', 'Beverage'] as const).map(category => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">{categoryIcons[category]} {category}</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {menu.filter(item => item.category === category).map(item => (
                                        <Card key={item.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => selectedTable && addToOrder(item)}>
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold">{item.name}</h4>
                                                <p className="text-primary font-bold">₹{item.price}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
            </div>

            {/* Table Management Section */}
            <div>
                 <Card className="bg-card/60 backdrop-blur-sm border-border/20 sticky top-24">
                     <CardHeader>
                        <CardTitle>Table Layout</CardTitle>
                        <CardDescription>Select a table to start or view an order.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        {tables.map(table => (
                            <Button 
                                key={table.id}
                                variant={tableStatusVariant[table.status]}
                                className="h-20 flex flex-col gap-1"
                                onClick={() => handleTableClick(table)}
                            >
                                {tableStatusIcon[table.status]}
                                <span className="font-bold">{table.name}</span>
                            </Button>
                        ))}
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>

        {/* Order Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order for {selectedTable?.name}</DialogTitle>
                    <DialogDescription>Add or remove items from the order. Click "Place Order" to send to the kitchen.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {currentOrderItems.length > 0 ? (
                        currentOrderItems.map(item => {
                            const menuItem = menu.find(m => m.id === item.menuItemId);
                            return (
                                <div key={item.menuItemId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">₹{menuItem?.price || 0}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => removeFromOrder(item.menuItemId)}><Minus className="h-4 w-4"/></Button>
                                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                                        <Button size="icon" variant="ghost" onClick={() => menuItem && addToOrder(menuItem)}><Plus className="h-4 w-4"/></Button>
                                         <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setCurrentOrderItems(prev => prev.filter(i => i.menuItemId !== item.menuItemId))}><X className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No items in this order yet. Select items from the menu.</p>
                    )}
                </div>
                 <Separator />
                 <div className="flex justify-between items-center font-bold text-xl p-4">
                    <span>Total</span>
                    <span>₹{totalOrderAmount.toLocaleString()}</span>
                 </div>
                <DialogFooter className="justify-between">
                    {selectedTable?.status === 'Billing' ? (
                        <Button variant="default" onClick={handleFinalizeBill}>Finalize Bill</Button>
                    ) : (
                        <Button onClick={handlePlaceOrder} disabled={currentOrderItems.length === 0}>
                            {selectedTable?.orderId ? 'Update Order' : 'Place Order'}
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </AppLayout>
  );
}

export default withAuth(RestaurantPOSPage);
