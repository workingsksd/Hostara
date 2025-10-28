import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HousekeepingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Housekeeping & Maintenance</h1>
      <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
        <CardHeader>
          <CardTitle>Room and Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction. It will be used to track cleanliness, maintenance, and staff assignments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
