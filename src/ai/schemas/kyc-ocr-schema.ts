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
