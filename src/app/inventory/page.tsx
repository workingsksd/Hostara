
"use client";

import { PredictiveInventory } from "./predictive-inventory";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";

function InventoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Inventory & Stock Management</h1>
        <p className="text-muted-foreground">
          Use the AI-powered tool below to predict stock outs and get purchase suggestions based on historical data.
        </p>
        <PredictiveInventory />
      </div>
    </AppLayout>
  );
}

export default withAuth(InventoryPage);
