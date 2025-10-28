
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";

function GuestsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Guest & Booking Management</h1>
      <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
        <CardHeader>
          <CardTitle>Guest and Booking Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction. It will manage all guest bookings, KYC, and preferences.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(GuestsPage);
