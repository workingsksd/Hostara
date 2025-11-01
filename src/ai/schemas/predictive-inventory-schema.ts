
import { z } from 'genkit';

export const PredictedStockInputSchema = z.object({
  currentInventoryJson: z.string().describe("A JSON string representing the current stock levels of all inventory items."),
  salesHistoryJson: z.string().describe("A JSON string of recent sales data, including item names and quantities sold."),
  seasonality: z.string().describe("A description of the current business season (e.g., 'Peak tourist season', 'Off-season', 'Holiday weekend')."),
});

export type PredictedStockInput = z.infer<typeof PredictedStockInputSchema>;

export const PredictedStockOutputSchema = z.object({
  immediateReorder: z.array(z.object({
    itemName: z.string().describe("The name of the item that needs immediate re-ordering."),
    suggestedQuantity: z.number().describe("The suggested quantity to re-order."),
    reason: z.string().describe("A brief reason for the re-order suggestion (e.g., 'Critically low stock', 'High consumption rate')."),
  })).describe("A list of items that need to be re-ordered immediately."),
  
  futureWatchlist: z.array(z.object({
    itemName: z.string().describe("The name of the item to watch."),
    currentStock: z.number().describe("The current stock level of the item."),
    prediction: z.string().describe("A brief prediction about future needs for this item (e.g., 'Demand expected to increase', 'Re-order likely in 2 weeks')."),
  })).describe("A list of items to monitor for future re-ordering."),
});

export type PredictedStockOutput = z.infer<typeof PredictedStockOutputSchema>;
