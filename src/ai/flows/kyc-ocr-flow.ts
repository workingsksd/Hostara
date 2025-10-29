'use server';
/**
 * @fileOverview A Genkit flow for extracting information from ID cards using OCR.
 *
 * - extractIdInfo - A function that takes an image of an ID card and returns structured data.
 * - OcrInput - The input type for the extractIdInfo function.
 * - OcrOutput - The return type for the extractIdInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const OcrInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

export const OcrOutputSchema = z.object({
    name: z.string().describe("The full name of the person on the ID card."),
    idNumber: z.string().describe("The ID number from the card."),
    dateOfBirth: z.string().describe("The date of birth from the card in YYYY-MM-DD format."),
    address: z.string().describe("The full address from the card."),
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;

export async function extractIdInfo(input: OcrInput): Promise<OcrOutput> {
  return kycOcrFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'kycOcrPrompt',
  input: {schema: OcrInputSchema},
  output: {schema: OcrOutputSchema},
  prompt: `You are an expert OCR system for identity verification.
  
  Analyze the provided image of an ID card and extract the following information:
  - Full Name
  - ID Number
  - Date of Birth (in YYYY-MM-DD format)
  - Full Address
  
  Return the extracted information as a JSON object that strictly follows the output schema. If a field cannot be found, return an empty string for it.

  Image: {{media url=imageDataUri}}`,
});

const kycOcrFlow = ai.defineFlow(
  {
    name: 'kycOcrFlow',
    inputSchema: OcrInputSchema,
    outputSchema: OcrOutputSchema,
  },
  async input => {
    const {output} = await ocrPrompt(input);
    return output!;
  }
);
