
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing guest profiles to determine preferences and suggest offers.
 *
 * The flow analyzes a guest's history to generate insights into their behavior and create a targeted marketing offer.
 * - analyzeGuestProfile - A function that triggers the analysis.
 */

import {ai} from '@/ai/genkit';
import { GuestProfileAnalysisInputSchema, GuestProfileAnalysisOutputSchema, type GuestProfileAnalysisInput, type GuestProfileAnalysisOutput } from '@/ai/schemas/guest-preference-schema';


export async function analyzeGuestProfile(input: GuestProfileAnalysisInput): Promise<GuestProfileAnalysisOutput> {
  return guestAnalysisFlow(input);
}

const guestAnalysisPrompt = ai.definePrompt({
  name: 'guestAnalysisPrompt',
  input: {schema: GuestProfileAnalysisInputSchema},
  output: {schema: GuestProfileAnalysisOutputSchema},
  prompt: `You are a CRM expert for a luxury hospitality brand. Analyze the provided guest data to understand their preferences and create a personalized marketing offer.

  Guest Name: {{{guestName}}}
  Stay History (JSON): {{{stayHistory}}}
  Transaction History (JSON): {{{transactionHistory}}}

  Based on this data:
  1.  Summarize the guest's spending habits and preferences concisely (e.g., "Prefers suites, high spender on in-room dining, frequently books weekend trips").
  2.  Create a "Next Best Offer" that is highly specific, time-bound, and likely to entice them to book again (e.g., "Enjoy 20% off a Deluxe Suite and a complimentary bottle of wine for your next weekend stay booked within 30 days.").
  3.  Predict their most likely next booking pattern, including trip type and potential timing (e.g., "Likely to book a short weekend getaway in the next 2-3 months.").

  Return the analysis as a JSON object that strictly follows the output schema.
  `,
});

const guestAnalysisFlow = ai.defineFlow(
  {
    name: 'guestAnalysisFlow',
    inputSchema: GuestProfileAnalysisInputSchema,
    outputSchema: GuestProfileAnalysisOutputSchema,
  },
  async input => {
    const {output} = await guestAnalysisPrompt(input);
    return output!;
  }
);
