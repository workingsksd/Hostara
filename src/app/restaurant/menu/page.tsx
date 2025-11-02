
'use client';

import { useState, useContext } from 'react';
import withAuth from '@/components/withAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { BookingContext, MenuItem, RecipeIngredient, InventoryItem } from '@/context/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type MenuFormData = Omit<MenuItem, 'id' | 'recipe'> & { recipe: Omit<RecipeIngredient, 'name'>[] };


function MenuManagementPage() {
  const { menu, inventory, addMenuItem, updateMenuItem, deleteMenuItem } = useContext(BookingContext);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
      name: '',
      price: 0,
      category: 'Main Course',
      recipe: []
  });

  const handleOpenDialog = (item: MenuItem | null) => {
    setEditingItem(item);
    if (item) {
        setFormData({
            ...item,
            recipe: item.recipe.map(({ itemId, quantity }) => ({ itemId, quantity }))
        });
    } else {
        setFormData({ name: '', price: 0, category: 'Main Course', recipe: [] });
    }
    setIsDialogOpen(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };
  
  const handleSelectChange = (name: 'category', value: MenuItem['category']) => {
      setFormData(prev => ({...prev, [name]: value}));
  }

  const addIngredientToRecipe = (ingredient: { itemId: string, quantity: number }) => {
      if (formData.recipe.some(i => i.itemId === ingredient.itemId)) return; // Avoid duplicates
      setFormData(prev => ({...prev, recipe: [...prev.recipe, ingredient]}));
  };

  const removeIngredientFromRecipe = (itemId: string) => {
      setFormData(prev => ({...prev, recipe: prev.recipe.filter(i => i.itemId !== itemId)}));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Data', description: 'Please provide a name and a valid price.'});
        return;
    }

    const fullRecipe: RecipeIngredient[] = formData.recipe.map(r => {
        const invItem = inventory.find(i => i.id === r.itemId);
        return { ...r, name: invItem?.name || 'Unknown' };
    });

    const menuItemData: Omit<MenuItem, 'id'> = {
        ...formData,
        recipe: fullRecipe
    };

    if (editingItem) {
        updateMenuItem({ ...menuItemData, id: editingItem.id });
        toast({ title: 'Menu Item Updated' });
    } else {
        addMenuItem(menuItemData);
        toast({ title: 'Menu Item Added' });
    }
    setIsDialogOpen(false);
  };
  
  const handleDelete = (itemId: string) => {
    deleteMenuItem(itemId);
    toast({ title: 'Menu Item Deleted', variant: 'destructive' });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Menu Management</h1>
            <Button onClick={() => handleOpenDialog(null)}>
                <PlusCircle className="mr-2"/> Add New Menu Item
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your restaurant's dishes, prices, and recipes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Ingredients</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {menu.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                <TableCell>₹{item.price.toLocaleString()}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {item.recipe.map(ing => ing.name).join(', ') || 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your menu item. Link ingredients from your inventory to track stock automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleFormChange} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v as MenuItem['category'])}>
                                        <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Appetizer">Appetizer</SelectItem>
                                            <SelectItem value="Main Course">Main Course</SelectItem>
                                            <SelectItem value="Dessert">Dessert</SelectItem>
                                            <SelectItem value="Beverage">Beverage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <IngredientSelector allIngredients={inventory} onAddIngredient={addIngredientToRecipe} />
                        </div>
                        <div className="space-y-2">
                            <Label>Recipe Ingredients</Label>
                             <div className="space-y-2 rounded-lg border p-4 min-h-[200px]">
                                {formData.recipe.length > 0 ? formData.recipe.map(ing => {
                                    const invItem = inventory.find(i => i.id === ing.itemId);
                                    return (
                                        <div key={ing.itemId} className="flex justify-between items-center bg-muted/50 p-2 rounded-md text-sm">
                                            <div>
                                                <p className="font-medium">{invItem?.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {ing.quantity} {invItem?.unit}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeIngredientFromRecipe(ing.itemId)}><X className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-sm text-muted-foreground text-center pt-8">No ingredients added yet. Add items to track stock consumption.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Menu Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AppLayout>
  );
}

function IngredientSelector({ allIngredients, onAddIngredient }: { allIngredients: InventoryItem[], onAddIngredient: (ing: { itemId: string, quantity: number }) => void }) {
    const [selectedId, setSelectedId] = useState('');
    const [quantity, setQuantity] = useState(0.1);

    const handleAdd = () => {
        if (!selectedId || quantity <= 0) return;
        onAddIngredient({ itemId: selectedId, quantity });
        setSelectedId('');
        setQuantity(0.1);
    };

    return (
        <div className="p-4 border rounded-lg space-y-2">
            <Label>Add Ingredient</Label>
            <div className="flex gap-2">
                <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger><SelectValue placeholder="Select ingredient..."/></SelectTrigger>
                    <SelectContent>
                        {allIngredients.filter(i => i.category === 'F&B').map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value))} step="0.01" className="w-24"/>
                <Button type="button" onClick={handleAdd}>Add</Button>
            </div>
        </div>
    )
}


export default withAuth(MenuManagementPage);

    