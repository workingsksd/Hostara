
'use server';
/**
 * @fileOverview A Genkit flow for extracting information from ID cards using OCR and performing face verification.
 *
 * - extractIdInfo - A function that takes an image of an ID card and returns structured data.
 * - OcrInput - The input type for the extractIdInfo function.
 * - OcrOutput - The return type for the extractIdInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const OcrInputSchema = z.object({
  idCardImageDataUri: z
    .string()
    .describe(
      "A photo of an ID card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    livePhotoImageDataUri: z.string().optional().describe(
      "A live photo of the person, as a data URI. This is used for face verification against the ID card photo."
    ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

export const OcrOutputSchema = z.object({
    name: z.string().describe("The full name of the person on the ID card."),
    idNumber: z.string().describe("The ID number from the card."),
    dateOfBirth: z.string().describe("The date of birth from the card in YYYY-MM-DD format."),
    address: z.string().describe("The full address from the card."),
    faceMatch: z.object({
        match: z.enum(['true', 'false', 'not_applicable']).describe("Whether the face in the live photo matches the face on the ID card. Returns 'not_applicable' if no live photo was provided."),
        reason: z.string().describe("The reasoning behind the face match decision."),
    }).optional(),
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;

export async function extractIdInfo(input: OcrInput): Promise<OcrOutput> {
  return kycOcrFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'kycOcrPrompt',
  input: {schema: OcrInputSchema},
  output: {schema: OcrOutputSchema},
  prompt: `You are an expert system for identity verification.

  Analyze the provided image of an ID card and extract the following information:
  - Full Name
  - ID Number
  - Date of Birth (in YYYY-MM-DD format)
  - Full Address
  
  {{#if livePhotoImageDataUri}}
  You have also been provided with a live photo of the person. Compare the face in the live photo with the face on the ID card.
  - Determine if they are the same person.
  - Set the 'faceMatch.match' field to 'true' if they match, 'false' if they don't.
  - Provide a brief 'faceMatch.reason' for your decision, noting similarities or differences in key facial features.
  
  Live Photo: {{media url=livePhotoImageDataUri}}
  {{else}}
  No live photo was provided for face verification. Set 'faceMatch.match' to 'not_applicable' and 'faceMatch.reason' to "No live photo provided for comparison."
  {{/if}}

  Return the extracted information and verification results as a JSON object that strictly follows the output schema. If a field cannot be found on the ID card, return an empty string for it.

  ID Card Image: {{media url=idCardImageDataUri}}`,
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
