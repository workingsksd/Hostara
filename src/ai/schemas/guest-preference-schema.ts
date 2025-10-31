
import {z} from 'genkit';

export const GuestProfileAnalysisInputSchema = z.object({
  guestName: z.string().describe("The name of the guest."),
  stayHistory: z.string().describe("A JSON string representing the guest's stay history, including dates, room types, and booking types."),
  transactionHistory: z.string().describe("A JSON string representing the guest's spending history across different services like room, restaurant, etc."),
});
export type GuestProfileAnalysisInput = z.infer<typeof GuestProfileAnalysisInputSchema>;

export const GuestProfileAnalysisOutputSchema = z.object({
  spendingHabits: z.string().describe("A brief summary of the guest's spending habits and preferences (e.g., 'Prefers deluxe rooms, high spender on F&B')."),
  nextBestOffer: z.string().describe("A specific, actionable marketing offer tailored to the guest (e.g., '15% off a weekend stay in a Deluxe Suite.')."),
  predictedNextBooking: z.string().describe("A prediction of when and what the guest is likely to book next (e.g., 'Weekend trip in 3-4 months.')."),
});
export type GuestProfileAnalysisOutput = z.infer<typeof GuestProfileAnalysisOutputSchema>;
