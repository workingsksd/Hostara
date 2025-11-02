
"use client";

import { useState, useContext, useMemo } from "react";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, ShoppingCart, Truck, Check, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookingContext, InventoryItem, Vendor, PurchaseOrderItem, PurchaseOrder } from "@/context/BookingContext";
import { format } from "date-fns";
import { PredictiveInventory } from "@/components/inventory/predictive-inventory";
import { Badge } from "@/components/ui/badge";

function InventoryPage() {
  const { 
    inventory, vendors, purchaseOrders, 
    addVendor, updateVendor, addPurchaseOrder, updatePurchaseOrderStatus, receiveStock 
  } = useContext(BookingContext);
  const { toast } = useToast();

  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedVendorForPO, setSelectedVendorForPO] = useState<string>('');

  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [selectedPOForReceiving, setSelectedPOForReceiving] = useState<PurchaseOrder | null>(null);
  
  const totalStockValue = useMemo(() => {
    // This is a simplified calculation. A real app would have unit costs.
    return inventory.reduce((acc, item) => acc + item.quantity * 100, 0); 
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity < 20).length;
  }, [inventory]);

  const handleSaveVendor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVendorData = {
      id: editingVendor?.id || `v${Date.now()}`,
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      category: formData.get('category') as 'Linen' | 'Toiletries' | 'Maintenance' | 'F&B',
    };

    if (editingVendor) {
      updateVendor(newVendorData);
      toast({ title: "Vendor Updated" });
    } else {
      addVendor(newVendorData);
      toast({ title: "Vendor Created" });
    }
    setEditingVendor(null);
    setIsVendorDialogOpen(false);
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsVendorDialogOpen(true);
  };

  const handleCreatePO = () => {
    if (!selectedVendorForPO || poItems.length === 0) {
        toast({ variant: 'destructive', title: "Missing Information", description: "Please select a vendor and add at least one item." });
        return;
    }
    const totalAmount = poItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newPO: Omit<PurchaseOrder, 'id'> = {
        vendorId: selectedVendorForPO,
        date: format(new Date(), 'yyyy-MM-dd'),
        items: poItems,
        status: 'Draft',
        totalAmount
    };
    addPurchaseOrder(newPO);
    toast({ title: 'Purchase Order Created', description: `PO for vendor ${vendors.find(v => v.id === selectedVendorForPO)?.name} created.` });
    setIsPODialogOpen(false);
    setPoItems([]);
    setSelectedVendorForPO('');
  };

  const handleAddItemToPO = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get('itemId') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const price = parseFloat(formData.get('price') as string);
    const item = inventory.find(i => i.id === itemId);

    if (item && quantity > 0 && price > 0) {
        setPoItems(prev => [...prev, { itemId, name: item.name, quantity, price }]);
        (e.target as HTMLFormElement).reset();
    } else {
        toast({ variant: 'destructive', title: "Invalid Item", description: "Please select a valid item and enter quantity/price." });
    }
  };

  const handleReceiveStock = () => {
    if (!selectedPOForReceiving) return;
    
    // For this demo, we assume all items are received as ordered.
    const receivedItems = selectedPOForReceiving.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity
    }));

    receiveStock(selectedPOForReceiving.id, receivedItems);
    toast({ title: "Stock Received", description: `Inventory has been updated for PO ${selectedPOForReceiving.id}.`});
    setIsReceiveStockOpen(false);
    setSelectedPOForReceiving(null);
  }

  const poStatusVariant = {
    'Draft': 'secondary',
    'Ordered': 'outline',
    'Partially Received': 'outline',
    'Completed': 'default',
    'Cancelled': 'destructive'
  } as const;


  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">Procurement & Inventory</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">(Estimated value)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items with quantity &lt; 20</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchaseOrders.filter(p => p.status === 'Ordered').length}</div>
               <p className="text-xs text-muted-foreground">Awaiting delivery</p>
            </CardContent>
          </Card>
        </div>


        <Tabs defaultValue="stock">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stock">Current Stock</TabsTrigger>
            <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="predictor">AI Predictor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stock">
             <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle>Inventory Stock Levels</CardTitle>
                  <CardDescription>A real-time overview of all items in your inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Quantity</TableHead><TableHead>Unit</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {inventory.map(item => (
                                <TableRow key={item.id} className={item.quantity < 20 ? 'bg-destructive/10' : ''}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="font-bold">{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="pos">
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <CardDescription>Manage orders placed with your vendors.</CardDescription>
                </div>
                <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
                  <DialogTrigger asChild><Button><PlusCircle className="mr-2"/> New PO</Button></DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create Purchase Order</DialogTitle>
                      <DialogDescription>Build a new order to send to a vendor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-8">
                        {/* PO Details Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">PO Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="po-vendor">Vendor</Label>
                                <Select onValueChange={setSelectedVendorForPO} value={selectedVendorForPO}>
                                    <SelectTrigger id="po-vendor"><SelectValue placeholder="Select a vendor" /></SelectTrigger>
                                    <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <form onSubmit={handleAddItemToPO} className="space-y-4 p-4 border rounded-lg">
                                <h4 className="font-medium">Add Item</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="po-item">Item</Label>
                                    <Select name="itemId">
                                        <SelectTrigger id="po-item"><SelectValue placeholder="Select an item" /></SelectTrigger>
                                        <SelectContent>{inventory.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="quantity" type="number" placeholder="Quantity" required/>
                                    <Input name="price" type="number" step="0.01" placeholder="Price per unit" required/>
                                </div>
                                <Button type="submit" className="w-full">Add to PO</Button>
                            </form>
                        </div>
                        {/* PO Items Section */}
                        <div className="space-y-4">
                             <h3 className="font-semibold">Order Items</h3>
                             <div className="space-y-2 rounded-lg border p-4 max-h-80 overflow-y-auto">
                                {poItems.length > 0 ? poItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.quantity} x ₹{item.price} = ₹{item.quantity * item.price}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setPoItems(poItems.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground text-center">No items added yet.</p>}
                             </div>
                             <div className="text-right font-bold text-lg">
                                Total: ₹{poItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toLocaleString()}
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPODialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreatePO}>Save Purchase Order</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>PO ID</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {purchaseOrders.map(po => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs">{po.id}</TableCell>
                        <TableCell>{vendors.find(v => v.id === po.vendorId)?.name}</TableCell>
                        <TableCell>{format(new Date(po.date), 'PP')}</TableCell>
                        <TableCell>₹{po.totalAmount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={poStatusVariant[po.status]}>{po.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                           {po.status === 'Draft' && <Button size="sm" onClick={() => updatePurchaseOrderStatus(po.id, 'Ordered')}>Mark as Ordered</Button>}
                           {po.status === 'Ordered' && <Button size="sm" variant="secondary" onClick={() => { setSelectedPOForReceiving(po); setIsReceiveStockOpen(true); }}><Check className="mr-2"/>Receive Stock</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
             <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Vendor Management</CardTitle>
                        <CardDescription>Add, view, and manage your suppliers.</CardDescription>
                    </div>
                    <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
                        <DialogTrigger asChild><Button onClick={() => setEditingVendor(null)}><PlusCircle className="mr-2"/> New Vendor</Button></DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSaveVendor}>
                                <DialogHeader><DialogTitle>{editingVendor ? 'Edit' : 'Create'} Vendor</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input name="name" placeholder="Vendor Name" defaultValue={editingVendor?.name} required />
                                    <Input name="contactPerson" placeholder="Contact Person" defaultValue={editingVendor?.contactPerson} required />
                                    <Input name="phone" placeholder="Phone Number" defaultValue={editingVendor?.phone} required />
                                    <Select name="category" defaultValue={editingVendor?.category}>
                                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="F&B">Food & Beverage</SelectItem>
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
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Phone</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {vendors.map(vendor => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">{vendor.name}</TableCell>
                                    <TableCell>{vendor.contactPerson}</TableCell>
                                    <TableCell>{vendor.phone}</TableCell>
                                    <TableCell><Badge variant="outline">{vendor.category}</Badge></TableCell>
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
          <TabsContent value="predictor">
             <Card className="bg-card/60 backdrop-blur-sm border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot className="text-accent"/> AI Predictive Inventory</CardTitle>
                  <CardDescription>
                    AI-powered forecasts to predict stock-outs and suggest re-order quantities based on historical data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictiveInventory inventoryItems={inventory} />
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Receive Stock Dialog */}
      <Dialog open={isReceiveStockOpen} onOpenChange={setIsReceiveStockOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Receive Stock for PO {selectedPOForReceiving?.id}</DialogTitle>
              <DialogDescription>Confirm the items and quantities received from {vendors.find(v => v.id === selectedPOForReceiving?.vendorId)?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <p className="font-medium">Items in this Order:</p>
                {selectedPOForReceiving?.items.map(item => (
                    <div key={item.itemId} className="flex justify-between p-2 bg-muted/50 rounded-md">
                        <span>{item.name}</span>
                        <span className="font-bold">Qty: {item.quantity}</span>
                    </div>
                ))}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReceiveStockOpen(false)}>Cancel</Button>
                <Button onClick={handleReceiveStock}>Confirm & Add to Inventory</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default withAuth(InventoryPage);
