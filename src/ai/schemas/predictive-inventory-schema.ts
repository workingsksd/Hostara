
import {z} from 'genkit';

export const PredictiveInventoryInputSchema = z.object({
  historicalStockData: z.string().describe('Historical data of stock levels and usage for each ingredient.'),
  leadTimeDays: z.number().describe('The number of days in advance to predict stock outs.'),
  safetyStockDays: z.number().describe('The number of days of stock to keep as safety stock.'),
});
export type PredictiveInventoryInput = z.infer<typeof PredictiveInventoryInputSchema>;

export const PredictiveInventoryOutputSchema = z.object({
  ingredient: z.string().describe('The name of the ingredient.'),
  predictedStockOutDate: z.string().describe('The predicted date when the ingredient will run out of stock (ISO format).'),
  purchaseSuggestion: z.string().describe('Suggested purchase quantity to avoid stock out.'),
});
export type PredictiveInventoryOutput = z.infer<typeof PredictiveInventoryOutputSchema>;
