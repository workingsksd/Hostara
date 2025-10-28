import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RestaurantPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Restaurant & Room Service</h1>
      <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
        <CardHeader>
          <CardTitle>Order and Table Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction. It will connect waiters, the kitchen, and billing for seamless service.</p>
        </CardContent>
      </Card>
    </div>
  );
}
