'use client';

import { useState, useContext } from 'react';
import { BookingContext, OrderItem, RestaurantTable } from '@/context/BookingContext';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Trash2, Edit, ShoppingCart, X, ChefHat, User, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';


type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

const initialMenu: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Paneer Butter Masala',
    description: 'Creamy and rich curry made with paneer in a tomato-based gravy.',
    price: 350,
    category: 'Main Course',
    imageUrl: 'https://picsum.photos/seed/dish1/400/300',
  },
  {
    id: 'item-2',
    name: 'Dal Makhani',
    description: 'Classic North Indian dish made with black lentils, kidney beans, butter, and cream.',
    price: 280,
    category: 'Main Course',
    imageUrl: 'https://picsum.photos/seed/dish2/400/300',
  },
  {
    id: 'item-3',
    name: 'Garlic Naan',
    description: 'Soft and fluffy Indian bread topped with garlic and butter.',
    price: 70,
    category: 'Breads',
    imageUrl: 'https://picsum.photos/seed/dish3/400/300',
  },
  {
    id: 'item-4',
    name: 'Tandoori Chicken',
    description: 'Chicken marinated in yogurt and spices, cooked in a tandoor.',
    price: 450,
    category: 'Appetizer',
    imageUrl: 'https://picsum.photos/seed/dish4/400/300',
  },
];

const tableStatusConfig: { [key in RestaurantTable['status']]: { variant: 'default' | 'secondary' | 'outline', icon: React.ReactNode, actionLabel: string, actionIcon: React.ReactNode } } = {
  Available: { variant: 'default', icon: <CheckCircle className="text-green-500" />, actionLabel: 'Seat Guests', actionIcon: <User /> },
  Occupied: { variant: 'secondary', icon: <User />, actionLabel: 'Free Table', actionIcon: <CheckCircle /> },
  Reserved: { variant: 'outline', icon: <Clock />, actionLabel: 'Seat Guests', actionIcon: <User /> },
};


function RestaurantPage() {
  const [menuItems, setMenuItems] = useState(initialMenu);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const { toast } = useToast();
  const { addOrder, tables, updateTableStatus } = useContext(BookingContext);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      imageUrl: editingItem?.imageUrl || `https://picsum.photos/seed/new${Date.now()}/400/300`,
    };

    if (editingItem) {
      setMenuItems(menuItems.map(item => item.id === editingItem.id ? newItem : item));
      toast({ title: 'Item Updated', description: `${newItem.name} has been updated.` });
    } else {
      setMenuItems([newItem, ...menuItems]);
      toast({ title: 'Item Added', description: `${newItem.name} has been added to the menu.` });
    }

    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (itemId: string) => {
    setMenuItems(menuItems.filter(item => item.id !== itemId));
    toast({ title: 'Item Deleted', variant: 'destructive', description: 'The menu item has been removed.' });
  };
  
  const openAddDialog = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your order.`,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };
  
  const handlePlaceOrder = () => {
    if (!selectedTableId) {
      toast({ variant: 'destructive', title: 'Please select a table.' });
      return;
    }
    const selectedTable = tables.find(t => t.id === selectedTableId);
    if (!selectedTable) {
      toast({ variant: 'destructive', title: 'Table not found.' });
      return;
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      guestId: selectedTableId, // Using table ID as guest identifier for now
      guestName: selectedTable.name, // Using table name
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'New' as const,
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    toast({ title: 'Order Placed!', description: `Order for ${selectedTable.name} has been sent to the kitchen.`});
    setCart([]);
    setIsCartOpen(false);
    setSelectedTableId('');
  };

  const handleTableStatusChange = (table: RestaurantTable) => {
    const newStatus = table.status === 'Occupied' ? 'Available' : 'Occupied';
    updateTableStatus(table.id, newStatus);
    toast({
      title: `Table ${table.name} is now ${newStatus}`,
    })
  }
  
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const occupiedTables = tables.filter(t => t.status === 'Occupied');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Restaurant & Room Service</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/restaurant/orders">
                <ChefHat className="mr-2"/> View Kitchen Orders
              </Link>
            </Button>
            
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="relative">
                  <ShoppingCart className="mr-2" />
                  View Order
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {cart.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Current Order</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground">Your order is empty.</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ₹{item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">₹{item.quantity * item.price}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromCart(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <SheetFooter className="flex flex-col gap-4">
                     <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{cartTotal}</span>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="guest-select">Assign to Table</Label>
                        <Select onValueChange={setSelectedTableId} value={selectedTableId}>
                          <SelectTrigger id="guest-select">
                            <SelectValue placeholder="Select a table..." />
                          </SelectTrigger>
                          <SelectContent>
                            {occupiedTables.map(table => (
                              <SelectItem key={table.id} value={table.id}>
                                {table.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                     </div>
                     <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                        Place Order
                     </Button>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2" /> Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleFormSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                    <DialogDescription>
                      Fill out the details for the menu item below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" defaultValue={editingItem?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingItem?.description} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input id="price" name="price" type="number" defaultValue={editingItem?.price} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input id="category" name="category" defaultValue={editingItem?.category} required />
                        </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        <Tabs defaultValue="tables">
            <TabsList>
                <TabsTrigger value="tables">Table Layout</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
            <TabsContent value="tables">
                <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                    <CardHeader>
                        <CardTitle>Digital Table Layout</CardTitle>
                        <CardDescription>Visual map of table availability and status.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {tables.map(table => {
                            const config = tableStatusConfig[table.status];
                            return (
                                <Card key={table.id} className="flex flex-col text-center">
                                    <CardHeader>
                                        <CardTitle className="flex flex-col items-center gap-2">
                                            {config.icon}
                                            {table.name}
                                        </CardTitle>
                                        <CardDescription>Seats: {table.capacity}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <Badge variant={config.variant}>{table.status}</Badge>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            variant={table.status === 'Occupied' ? 'destructive' : 'default'}
                                            className="w-full"
                                            onClick={() => handleTableStatusChange(table)}
                                        >
                                            {config.actionIcon}
                                            {config.actionLabel}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="menu">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {menuItems.map(item => (
                    <Card key={item.id} className="bg-card/60 backdrop-blur-sm border-border/20 overflow-hidden flex flex-col">
                    <CardHeader className="p-0 relative">
                        <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(item.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="relative aspect-video">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="food dish" />
                        </div>
                        <div className="p-4">
                            <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                            <p className="text-lg font-semibold text-primary mt-1">₹{item.price}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 pt-0">
                        <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Button className="w-full" onClick={() => handleAddToCart(item)}>
                        <PlusCircle className="mr-2" /> Add to Order
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(RestaurantPage);
