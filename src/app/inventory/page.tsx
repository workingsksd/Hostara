"use client";

import { useState, useContext } from 'react';
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { PredictiveInventory } from "./predictive-inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Truck, PackageCheck, FileText, ShoppingCart, Users, Bot } from "lucide-react";
import { BookingContext, PurchaseOrder, Vendor, InventoryItem, PurchaseOrderItem } from "@/context/BookingContext";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const poStatusVariant: { [key in PurchaseOrder['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Draft': 'outline',
  'Ordered': 'secondary',
  'Partially Received': 'secondary',
  'Completed': 'default',
  'Cancelled': 'destructive',
}

const categoryVariant: { [key in Vendor['category']]: 'default' | 'secondary' } = {
    'Food': 'default',
    'Linen': 'secondary',
    'Toiletries': 'secondary',
    'Maintenance': 'secondary',
}

function InventoryPage() {
  const { vendors, addVendor, updateVendor, purchaseOrders, addPurchaseOrder, inventory, updatePurchaseOrderStatus, receiveStock } = useContext(BookingContext);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isGRNDialogOpen, setIsGRNDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  const handleSaveVendor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorData = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      category: formData.get('category') as Vendor['category'],
    };

    if (editingVendor) {
      updateVendor({ ...editingVendor, ...vendorData });
      toast({ title: "Vendor Updated" });
    } else {
      addVendor(vendorData);
      toast({ title: "Vendor Added" });
    }
    setIsVendorDialogOpen(false);
    setEditingVendor(null);
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsVendorDialogOpen(true);
  }

  const handleAddItemToPO = () => {
    setPoItems([...poItems, { itemId: '', name: '', quantity: 0, price: 0 }]);
  };

  const handlePOItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...poItems];
    const item = newItems[index];
    
    if (field === 'itemId') {
        const selectedInventoryItem = inventory.find(i => i.id === value);
        item.itemId = value;
        item.name = selectedInventoryItem?.name || '';
    } else {
        (item[field] as any) = value;
    }

    newItems[index] = item;
    setPoItems(newItems);
  };
  
  const handleSavePO = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorId = formData.get('vendorId') as string;

    if (!vendorId || poItems.length === 0 || poItems.some(item => !item.itemId || item.quantity <= 0)) {
        toast({ variant: 'destructive', title: "Invalid PO", description: "Please select a vendor and add at least one valid item." });
        return;
    }
    
    const totalAmount = poItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newPO = {
        vendorId,
        date: new Date().toISOString(),
        items: poItems,
        status: 'Draft' as const,
        totalAmount,
    };
    addPurchaseOrder(newPO);
    toast({ title: 'Purchase Order Created', description: 'The new PO has been saved as a draft.' });
    setIsPODialogOpen(false);
    setPoItems([]);
  };

  const handleOpenGRN = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsGRNDialogOpen(true);
  };

  const handleReceiveStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPO) return;

    const receivedItems = selectedPO.items.map(item => ({
        itemId: item.itemId,
        quantity: parseInt((e.target as HTMLFormElement)[`quantity-${item.itemId}`].value) || 0,
    }));
    
    receiveStock(selectedPO.id, receivedItems);
    toast({ title: 'Stock Received', description: `Inventory has been updated for PO #${selectedPO.id.slice(-6)}`});
    setIsGRNDialogOpen(false);
    setSelectedPO(null);
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Inventory &amp; Procurement</h1>
        
        <Tabs defaultValue="inventory">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory"><PackageCheck className="mr-2"/>Current Stock</TabsTrigger>
            <TabsTrigger value="pos"><FileText className="mr-2"/>Purchase Orders</TabsTrigger>
            <TabsTrigger value="vendors"><Users className="mr-2"/>Vendors</TabsTrigger>
            <TabsTrigger value="predictive"><Bot className="mr-2"/>AI Predictor</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>A real-time overview of all items in your inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell><Badge variant={categoryVariant[item.category]}>{item.category}</Badge></TableCell>
                                <TableCell className="text-right font-mono">{item.quantity} {item.unit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pos">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Purchase Orders
                    <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2"/> New Purchase Order</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <form onSubmit={handleSavePO}>
                                <DialogHeader>
                                    <DialogTitle>Create Purchase Order</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendorId">Vendor</Label>
                                        <Select name="vendorId">
                                            <SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <h3 className="font-semibold">Items</h3>
                                    <div className="space-y-2">
                                        {poItems.map((item, index) => (
                                            <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                                <Select value={item.itemId} onValueChange={(val) => handlePOItemChange(index, 'itemId', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                                                    <SelectContent>
                                                        {inventory.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handlePOItemChange(index, 'quantity', parseInt(e.target.value))} />
                                                <Input type="number" placeholder="Unit Price (₹)" value={item.price} onChange={(e) => handlePOItemChange(index, 'price', parseFloat(e.target.value))} />
                                                <p className="font-mono text-right">₹{(item.quantity * item.price).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleAddItemToPO}>Add Item</Button>

                                </div>
                                <DialogFooter>
                                    <p className="mr-auto font-bold text-lg">Total: ₹{poItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</p>
                                    <Button variant="outline" type="button" onClick={() => setIsPODialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Draft</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders.map(po => {
                                const vendor = vendors.find(v => v.id === po.vendorId);
                                return (
                                <TableRow key={po.id}>
                                    <TableCell className="font-mono text-xs">#{po.id.slice(-6)}</TableCell>
                                    <TableCell>{vendor?.name}</TableCell>
                                    <TableCell>{format(new Date(po.date), 'PP')}</TableCell>
                                    <TableCell>₹{po.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant={poStatusVariant[po.status]}>{po.status}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {po.status === 'Draft' && <Button size="sm" onClick={() => updatePurchaseOrderStatus(po.id, 'Ordered')}>Mark as Ordered</Button>}
                                        {po.status === 'Ordered' && <Button size="sm" variant="secondary" onClick={() => handleOpenGRN(po)}><Truck className="mr-2"/>Receive Stock</Button>}
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Vendor Management
                    <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
                        <DialogTrigger asChild><Button onClick={() => setEditingVendor(null)}><PlusCircle className="mr-2"/> Add Vendor</Button></DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSaveVendor}>
                                <DialogHeader>
                                    <DialogTitle>{editingVendor ? 'Edit' : 'Add'} Vendor</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input name="name" placeholder="Vendor Name" defaultValue={editingVendor?.name} required/>
                                    <Input name="contactPerson" placeholder="Contact Person" defaultValue={editingVendor?.contactPerson} required/>
                                    <Input name="phone" type="tel" placeholder="Phone Number" defaultValue={editingVendor?.phone} required/>
                                    <Select name="category" defaultValue={editingVendor?.category} required>
                                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Food">Food</SelectItem>
                                            <SelectItem value="Linen">Linen</SelectItem>
                                            <SelectItem value="Toiletries">Toiletries</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsVendorDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Vendor</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map(vendor => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell><Badge variant={categoryVariant[vendor.category]}>{vendor.category}</Badge></TableCell>
                          <TableCell>{vendor.contactPerson}</TableCell>
                          <TableCell>{vendor.phone}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditVendor(vendor)}><Edit className="h-4 w-4"/></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictive">
            <PredictiveInventory />
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isGRNDialogOpen} onOpenChange={setIsGRNDialogOpen}>
          <DialogContent>
            <form onSubmit={handleReceiveStock}>
              <DialogHeader>
                <DialogTitle>Receive Stock for PO #{selectedPO?.id.slice(-6)}</DialogTitle>
                <DialogDescription>
                  Confirm the quantities received. Inventory will be updated automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {selectedPO?.items.map(item => (
                  <div key={item.itemId} className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor={`quantity-${item.itemId}`} className="col-span-2">
                        {item.name} <span className="text-muted-foreground">(Ordered: {item.quantity})</span>
                    </Label>
                    <Input id={`quantity-${item.itemId}`} name={`quantity-${item.itemId}`} type="number" defaultValue={item.quantity} required />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsGRNDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Confirm &amp; Add to Stock</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

    </AppLayout>
  );
}

export default withAuth(InventoryPage);
