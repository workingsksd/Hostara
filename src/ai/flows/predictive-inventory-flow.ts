
'use server';
/**
 * @fileOverview A Genkit flow for predicting inventory needs.
 *
 * - predictStockNeeds - A function that analyzes inventory and sales data to forecast re-ordering needs.
 */

import { ai } from '@/ai/genkit';
import { PredictedStockInputSchema, PredictedStockOutputSchema, type PredictedStockInput, type PredictedStockOutput } from '@/ai/schemas/predictive-inventory-schema';

export async function predictStockNeeds(input: PredictedStockInput): Promise<PredictedStockOutput> {
  return predictiveInventoryFlow(input);
}

const predictiveInventoryPrompt = ai.definePrompt({
  name: 'predictiveInventoryPrompt',
  input: { schema: PredictedStockInputSchema },
  output: { schema: PredictedStockOutputSchema },
  prompt: `You are an expert inventory management AI for the hospitality industry. Your task is to analyze current inventory levels, historical sales data, and seasonality to predict stock needs.

Current Inventory Levels (JSON):
{{{currentInventoryJson}}}

Historical Sales Data (JSON):
{{{salesHistoryJson}}}

Seasonality Factor: {{{seasonality}}}

Based on this data, provide the following analysis:
1.  **Immediate Re-orders**: Identify items that are critically low or will run out in the next 3 days based on consumption velocity. For each, provide a suggested order quantity.
2.  **Future Watchlist**: Identify items that are not yet critical but are trending towards high consumption. For each, provide a prediction (e.g., "Likely to need re-ordering in 2 weeks").

Return the results as a JSON object that strictly follows the output schema. Be concise and actionable.
`,
});

const predictiveInventoryFlow = ai.defineFlow(
  {
    name: 'predictiveInventoryFlow',
    inputSchema: PredictedStockInputSchema,
    outputSchema: PredictedStockOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveInventoryPrompt(input);
    return output!;
  }
);
