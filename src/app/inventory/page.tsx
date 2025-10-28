import { PredictiveInventory } from "./predictive-inventory";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Inventory & Stock Management</h1>
      <p className="text-muted-foreground">
        Use the AI-powered tool below to predict stock outs and get purchase suggestions based on historical data.
      </p>
      <PredictiveInventory />
    </div>
  );
}
