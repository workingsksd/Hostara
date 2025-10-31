
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
import { format, differenceInDays } from "date-fns";
import { Slider } from "@/components/ui/slider";

type RatePlan = {
  id: string;
  name: string;
  basePrice: number;
  description: string;
};

type PricingRuleType = 'occupancy' | 'los' | 'booking_window';

type OccupancyRule = { id: string; type: "occupancy"; ratePlanId: string; threshold: number; adjustment: number; };
type LosRule = { id: string; type: "los"; ratePlanId: string; minDays: number; adjustment: number; };
type BookingWindowRule = { id: string; type: "booking_window"; ratePlanId: string; minDays: number; adjustment: number; };
type PricingRule = OccupancyRule | LosRule | BookingWindowRule;


const initialRatePlans: RatePlan[] = [
  { id: "rp1", name: "Standard Rate", basePrice: 8000, description: "Flexible, cancellable rate." },
  { id: "rp2", name: "Weekend Special", basePrice: 9500, description: "Includes breakfast for 2." },
  { id: "rp3", name: "Non-Refundable", basePrice: 6500, description: "Best price, no cancellations." },
];

const initialPricingRules: PricingRule[] = [
  { id: "rule1", type: "occupancy", ratePlanId: "rp1", threshold: 80, adjustment: 15 },
  { id: "rule2", type: "occupancy", ratePlanId: "rp2", threshold: 80, adjustment: 20 },
  { id: "rule3", type: "los", ratePlanId: "rp1", minDays: 7, adjustment: -10 },
  { id: "rule4", type: "booking_window", ratePlanId: "rp3", minDays: 30, adjustment: -15 },
];

function RevenuePage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>(initialRatePlans);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);
  const { toast } = useToast();

  const [simulatedCheckIn, setSimulatedCheckIn] = useState<Date | undefined>(new Date());
  const [simulatedCheckOut, setSimulatedCheckOut] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 2)));
  const [simulatedOccupancy, setSimulatedOccupancy] = useState(75);
  const [ruleType, setRuleType] = useState<PricingRuleType>('occupancy');

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
    let newRule: PricingRule;

    const ratePlanId = formData.get('ratePlanId') as string;
    const adjustment = parseFloat(formData.get('adjustment') as string);
    const minDays = parseFloat(formData.get('minDays') as string);
    const threshold = parseFloat(formData.get('threshold') as string);

    switch (ruleType) {
        case 'los':
            newRule = { id: `rule${Date.now()}`, type: 'los', ratePlanId, minDays, adjustment };
            break;
        case 'booking_window':
            newRule = { id: `rule${Date.now()}`, type: 'booking_window', ratePlanId, minDays, adjustment };
            break;
        case 'occupancy':
        default:
            newRule = { id: `rule${Date.now()}`, type: 'occupancy', ratePlanId, threshold, adjustment };
            break;
    }
    
    setPricingRules([...pricingRules, newRule]);
    toast({ title: "Pricing Rule Created" });
    setIsRuleDialogOpen(false);
  };
  
  const calculateFinalPrice = (plan: RatePlan) => {
    let finalPrice = plan.basePrice;
    
    // Occupancy Rule
    const occupancyRule = pricingRules.find(
      (rule) => rule.type === 'occupancy' && rule.ratePlanId === plan.id && simulatedOccupancy >= rule.threshold
    ) as OccupancyRule | undefined;
    if (occupancyRule) {
      finalPrice *= (1 + occupancyRule.adjustment / 100);
    }
    
    // Length of Stay Rule
    if (simulatedCheckIn && simulatedCheckOut) {
        const los = differenceInDays(simulatedCheckOut, simulatedCheckIn);
        const losRule = pricingRules.find(
            (rule) => rule.type === 'los' && rule.ratePlanId === plan.id && los >= rule.minDays
        ) as LosRule | undefined;
        if (losRule) {
            finalPrice *= (1 + losRule.adjustment / 100);
        }

        // Booking Window Rule
        const bookingWindow = differenceInDays(simulatedCheckIn, new Date());
        const bookingWindowRule = pricingRules.find(
             (rule) => rule.type === 'booking_window' && rule.ratePlanId === plan.id && bookingWindow >= rule.minDays
        ) as BookingWindowRule | undefined;
        if (bookingWindowRule) {
             finalPrice *= (1 + bookingWindowRule.adjustment / 100);
        }
    }
    
    return finalPrice;
  };

  const getRuleDescription = (rule: PricingRule) => {
    switch (rule.type) {
        case 'occupancy':
            return `If Occupancy >= ${rule.threshold}%`;
        case 'los':
            return `If stay is >= ${rule.minDays} days`;
        case 'booking_window':
            return `If booked >= ${rule.minDays} days in advance`;
        default:
            return 'Unknown Rule';
    }
  }


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
                                    <Select name="ruleType" defaultValue="occupancy" onValueChange={(v: PricingRuleType) => setRuleType(v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Rule Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="occupancy">Occupancy Based</SelectItem>
                                            <SelectItem value="los">Length of Stay</SelectItem>
                                            <SelectItem value="booking_window">Booking Window</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select name="ratePlanId" required>
                                        <SelectTrigger><SelectValue placeholder="Select Rate Plan" /></SelectTrigger>
                                        <SelectContent>{ratePlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>

                                    {ruleType === 'occupancy' && <Input name="threshold" type="number" placeholder="Occupancy Threshold (%)" required />}
                                    {ruleType === 'los' && <Input name="minDays" type="number" placeholder="Minimum Stay (Days)" required />}
                                    {ruleType === 'booking_window' && <Input name="minDays" type="number" placeholder="Minimum Days in Advance" required />}
                                    
                                    <Input name="adjustment" type="number" placeholder="Price Adjustment (%) e.g. 15 or -10" required />
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
                                <TableCell>{getRuleDescription(rule)}</TableCell>
                                <TableCell className={rule.adjustment > 0 ? 'text-green-500 font-medium' : 'text-destructive font-medium'}>
                                    {rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%
                                </TableCell>
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
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Check-in Date</Label>
                   <DatePicker name="simCheckIn" initialDate={simulatedCheckIn} onSelect={setSimulatedCheckIn} />
                 </div>
                 <div className="space-y-2">
                   <Label>Check-out Date</Label>
                   <DatePicker name="simCheckOut" initialDate={simulatedCheckOut} onSelect={setSimulatedCheckOut} />
                 </div>
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
                                {finalPrice !== basePrice && <span className={finalPrice > basePrice ? "text-green-400 ml-2" : "text-red-400 ml-2"}>({(finalPrice / basePrice * 100 - 100).toFixed(1)}%)</span>}
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

    