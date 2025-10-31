
"use client";

import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
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
import { PlusCircle, Edit, Trash2, TrendingUp, Search, SlidersHorizontal, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

type RatePlan = {
  id: string;
  name: string;
  basePrice: number;
  description: string;
};

type PricingRule = {
  id: string;
  type: "occupancy";
  ratePlanId: string;
  threshold: number; // e.g., 80% occupancy
  adjustment: number; // e.g., 15% increase
};

const initialRatePlans: RatePlan[] = [
  { id: "rp1", name: "Standard Rate", basePrice: 8000, description: "Flexible, cancellable rate." },
  { id: "rp2", name: "Weekend Special", basePrice: 9500, description: "Includes breakfast for 2." },
  { id: "rp3", name: "Non-Refundable", basePrice: 6500, description: "Best price, no cancellations." },
];

const initialPricingRules: PricingRule[] = [
  { id: "rule1", type: "occupancy", ratePlanId: "rp1", threshold: 80, adjustment: 15 },
  { id: "rule2", type: "occupancy", ratePlanId: "rp2", threshold: 80, adjustment: 20 },
];

function RevenuePage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>(initialRatePlans);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);
  const { toast } = useToast();

  const [simulatedDate, setSimulatedDate] = useState<Date | undefined>(new Date());
  const [simulatedOccupancy, setSimulatedOccupancy] = useState(75);

  const handleSaveRatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlanData = {
      id: editingPlan?.id || `rp${Date.now()}`,
      name: formData.get("name") as string,
      basePrice: parseFloat(formData.get("basePrice") as string),
      description: formData.get("description") as string,
    };

    if (editingPlan) {
      setRatePlans(ratePlans.map((p) => (p.id === editingPlan.id ? newPlanData : p)));
      toast({ title: "Rate Plan Updated" });
    } else {
      setRatePlans([...ratePlans, newPlanData]);
      toast({ title: "Rate Plan Created" });
    }
    setEditingPlan(null);
    setIsPlanDialogOpen(false);
  };
  
  const handleEditPlan = (plan: RatePlan) => {
    setEditingPlan(plan);
    setIsPlanDialogOpen(true);
  }

  const handleDeletePlan = (planId: string) => {
    setRatePlans(ratePlans.filter(p => p.id !== planId));
    toast({ title: "Rate Plan Deleted", variant: 'destructive' });
  }

  const handleSaveRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRule: PricingRule = {
        id: `rule${Date.now()}`,
        type: 'occupancy',
        ratePlanId: formData.get('ratePlanId') as string,
        threshold: parseFloat(formData.get('threshold') as string),
        adjustment: parseFloat(formData.get('adjustment') as string),
    }
    setPricingRules([...pricingRules, newRule]);
    toast({ title: "Pricing Rule Created" });
    setIsRuleDialogOpen(false);
  };
  
  const calculateFinalPrice = (plan: RatePlan) => {
    let finalPrice = plan.basePrice;
    const applicableRule = pricingRules.find(
      (rule) => rule.ratePlanId === plan.id && simulatedOccupancy >= rule.threshold
    );
    if (applicableRule) {
      finalPrice *= (1 + applicableRule.adjustment / 100);
    }
    return finalPrice;
  };


  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">Revenue Management</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Rate Plans Card */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><DollarSign />Rate Plans</span>
                  <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingPlan(null)}><PlusCircle className="mr-2"/> New Rate Plan</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleSaveRatePlan}>
                        <DialogHeader>
                          <DialogTitle>{editingPlan ? "Edit" : "Create"} Rate Plan</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input name="name" placeholder="Plan Name" defaultValue={editingPlan?.name} required />
                          <Input name="basePrice" type="number" placeholder="Base Price (₹)" defaultValue={editingPlan?.basePrice} required />
                          <Input name="description" placeholder="Description" defaultValue={editingPlan?.description} required />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Plan</Button>
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
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratePlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>₹{plan.basePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{plan.description}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Dynamic Pricing Rules Card */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/20">
              <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><SlidersHorizontal />Dynamic Pricing Rules</span>
                    <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                        <DialogTrigger asChild><Button><PlusCircle className="mr-2"/> New Rule</Button></DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSaveRule}>
                                <DialogHeader><DialogTitle>Create New Pricing Rule</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Select name="ratePlanId" required>
                                        <SelectTrigger><SelectValue placeholder="Select Rate Plan" /></SelectTrigger>
                                        <SelectContent>{ratePlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input name="threshold" type="number" placeholder="Occupancy Threshold (%)" required />
                                    <Input name="adjustment" type="number" placeholder="Price Adjustment (%)" required />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsRuleDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Rule</Button>
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
                            <TableHead>Rate Plan</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Adjustment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pricingRules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell>{ratePlans.find(p => p.id === rule.ratePlanId)?.name}</TableCell>
                                <TableCell>If Occupancy >= {rule.threshold}%</TableCell>
                                <TableCell className="text-green-500 font-medium">+{rule.adjustment}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Simulator */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/20 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search/> Pricing Preview</CardTitle>
              <CardDescription>Simulate final room prices based on current rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Simulation Date</Label>
                <DatePicker name="simDate" initialDate={simulatedDate} />
              </div>
              <div className="space-y-2">
                <Label>Simulated Occupancy: {simulatedOccupancy}%</Label>
                <Slider defaultValue={[75]} max={100} step={1} onValueChange={(value) => setSimulatedOccupancy(value[0])}/>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-stretch">
                <h4 className="text-lg font-semibold">Preview Prices</h4>
                {ratePlans.map(plan => {
                    const finalPrice = calculateFinalPrice(plan);
                    const basePrice = plan.basePrice;
                    return (
                        <div key={plan.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{plan.name}</span>
                                <span className="font-bold text-lg text-primary">₹{finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Base: ₹{basePrice.toLocaleString()}
                                {finalPrice !== basePrice && <span className="text-green-400 ml-2">(+{(finalPrice / basePrice * 100 - 100).toFixed(1)}%)</span>}
                            </p>
                        </div>
                    )
                })}
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(RevenuePage);
