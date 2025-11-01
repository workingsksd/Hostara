
import {z} from 'genkit';

export const GuestProfileAnalysisInputSchema = z.object({
  guestName: z.string().describe("The name of the guest."),
  stayHistory: z.string().describe("A JSON string representing the guest's stay history, including dates, room types, and other relevant details."),
  transactionHistory: z.string().describe("A JSON string representing the guest's spending history across all services (room, F&B, spa, etc.)."),
});
export type GuestProfileAnalysisInput = z.infer<typeof GuestProfileAnalysisInputSchema>;

export const GuestProfileAnalysisOutputSchema = z.object({
  spendingHabits: z.string().describe("A brief, insightful summary of the guest's spending habits, preferences, and behavior (e.g., 'Prefers deluxe rooms, high spender on F&B, books weekend getaways')."),
  nextBestOffer: z.string().describe("A specific, actionable, and personalized marketing offer tailored to the guest (e.g., 'A complimentary upgrade to a Deluxe Suite and 15% off on all restaurant bills for your next weekend stay.')."),
  predictedNextBooking: z.string().describe("A data-driven prediction of when and what the guest is likely to book next (e.g., 'Most likely to book a 3-night weekend trip in the next 2-4 months.')."),
});
export type GuestProfileAnalysisOutput = z.infer<typeof GuestProfileAnalysisOutputSchema>;
