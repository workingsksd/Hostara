
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { type InventoryItem } from '@/context/BookingContext';
import { predictStockNeeds } from '@/ai/flows/predictive-inventory-flow';
import { type PredictedStockOutput } from '@/ai/schemas/predictive-inventory-schema';

export function PredictiveInventory({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictedStockOutput | null>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    try {
      // For the demo, we'll use a simplified history. A real app would pull this from a database.
      const simplifiedHistory = inventoryItems.map(item => ({
        name: item.name,
        currentStock: item.quantity,
        category: item.category,
      }));

      const result = await predictStockNeeds({
        currentInventoryJson: JSON.stringify(simplifiedHistory),
        salesHistoryJson: JSON.stringify([
            { itemName: 'Paneer Butter Masala', quantitySold: 50, date: '2024-07-15' },
            { itemName: 'Chicken Tikka', quantitySold: 80, date: '2024-07-16' },
            { itemName: 'Tomatoes', quantitySold: 10, date: '2024-07-17' }, // Raw item sale
        ]),
        seasonality: 'Peak tourist season',
      });
      
      setPrediction(result);
      toast({
        title: 'Prediction Complete',
        description: 'AI has analyzed your inventory and sales data.',
      });
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'Could not generate AI stock predictions.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button onClick={handlePredict} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Analyzing Data...
            </>
          ) : (
            <>
              <Wand2 className="mr-2" /> Generate Stock Prediction
            </>
          )}
        </Button>
      </div>

      {prediction && (
        <div className="grid md:grid-cols-2 gap-6 pt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Items to Re-order Immediately</CardTitle>
                    <CardDescription>These items are at critical levels or predicted to run out soon.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {prediction.immediateReorder.length > 0 ? prediction.immediateReorder.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="font-bold">{item.itemName}</p>
                            <p className="text-sm">Suggestion: <span className="font-medium">Order {item.suggestedQuantity} units.</span></p>
                            <p className="text-xs text-destructive/80">Reason: {item.reason}</p>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center">No items need immediate re-ordering.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Future Stock Watchlist</CardTitle>
                    <CardDescription>Monitor these items as their demand is predicted to increase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {prediction.futureWatchlist.length > 0 ? prediction.futureWatchlist.map((item, i) => (
                         <div key={i} className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                            <p className="font-bold">{item.itemName}</p>
                            <p className="text-sm">Current Stock: <span className="font-medium">{item.currentStock} units.</span></p>
                            <p className="text-xs text-secondary-foreground/80">Prediction: {item.prediction}</p>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center">No items on the future watchlist.</p>}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
