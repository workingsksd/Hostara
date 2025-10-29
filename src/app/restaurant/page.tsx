
'use client';

import { useState } from 'react';
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
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';

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

function RestaurantPage() {
  const [menuItems, setMenuItems] = useState(initialMenu);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Restaurant & Room Service</h1>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map(item => (
            <Card key={item.id} className="bg-card/60 backdrop-blur-sm border-border/20 overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                 <div className="p-4">
                    <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                    <p className="text-lg font-semibold text-primary mt-1">₹{item.price}</p>
                 </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">{item.category}</p>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(RestaurantPage);
