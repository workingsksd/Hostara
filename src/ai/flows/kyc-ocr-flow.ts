
'use server';
/**
 * @fileOverview A Genkit flow for extracting information from ID cards using OCR and performing face verification.
 *
 * - extractIdInfo - A function that takes an image of an ID card and returns structured data.
 */

import {ai} from '@/ai/genkit';
import { OcrInputSchema, OcrOutputSchema, type OcrInput, type OcrOutput } from '@/ai/schemas/kyc-ocr-schema';


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
