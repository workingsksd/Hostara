
'use server';
/**
 * @fileOverview This file defines a Genkit flow for predictive inventory management.
 *
 * The flow predicts when a restaurant will run out of ingredients and suggests purchases.
 * It includes the following:
 * - predictStockOut - A function that triggers the stock out prediction and purchase suggestions.
 */

import {ai} from '@/ai/genkit';
import { PredictiveInventoryInputSchema, PredictiveInventoryOutputSchema, type PredictiveInventoryInput, type PredictiveInventoryOutput } from '@/ai/schemas/predictive-inventory-schema';


export async function predictStockOut(input: PredictiveInventoryInput): Promise<PredictiveInventoryOutput[]> {
  return predictiveInventoryFlow(input);
}

const predictiveInventoryPrompt = ai.definePrompt({
  name: 'predictiveInventoryPrompt',
  input: {schema: PredictiveInventoryInputSchema},
  output: {schema: z.array(PredictiveInventoryOutputSchema)},
  prompt: `You are an AI assistant helping restaurant managers predict stock outs and make purchase suggestions.

  Analyze the historical stock data to predict when each ingredient will run out of stock, taking into account lead times and safety stock levels.

  Historical Stock Data: {{{historicalStockData}}}
  Lead Time (Days): {{{leadTimeDays}}}
  Safety Stock (Days): {{{safetyStockDays}}}

  Based on this data, predict the stock out date for each ingredient and suggest a purchase quantity to avoid running out of stock. Only return the suggested quantity and reason why it will run out in the field purchaseSuggestion. Return today's date in ISO format in predictedStockOutDate if item is already out of stock.

  Return a JSON array of objects, where each object contains the ingredient, predictedStockOutDate, and purchaseSuggestion. Follow the schema description strictly when producing the output.
  `,
});

const predictiveInventoryFlow = ai.defineFlow(
  {
    name: 'predictiveInventoryFlow',
    inputSchema: PredictiveInventoryInputSchema,
    outputSchema: z.array(PredictiveInventoryOutputSchema),
  },
  async input => {
    const {output} = await predictiveInventoryPrompt(input);
    return output!;
  }
);
