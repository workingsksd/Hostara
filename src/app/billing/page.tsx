
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";

function BillingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Billing & Accounting</h1>
      <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
        <CardHeader>
          <CardTitle>Unified Billing System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is under construction. It will provide a unified billing system for rooms, restaurants, and extras.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(BillingPage);
