
'use server';
/**
 * @fileOverview Determines snack dimensions from an image.
 *
 * - `getSnackDimensions` - A function that handles the snack dimension analysis.
 * - `SnackDimensionsInput` - The input type for the getSnackDimensions function.
 * - `SnackDimensionsOutput` - The return type for the getSnackDimensions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnackDimensionsInputSchema = z.object({
  imageData: z
    .string()
    .describe(
      "An image of a snack, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SnackDimensionsInput = z.infer<typeof SnackDimensionsInputSchema>;

const SnackDimensionsOutputSchema = z.object({
  snackType: z.enum(['parippuvada', 'vazhaikkapam', 'unknown']).describe('The type of snack identified in the image.'),
  diameter: z.number().nullable().describe('The diameter of the parippuvada in cm. Null if not a parippuvada.'),
  length: z.number().nullable().describe('The length of the vazhaikkapam in cm. Null if not a vazhaikkapam.'),
  width: z.number().nullable().describe('The width of the vazhaikkapam in cm. Null if not a vazhaikkapam.'),
  error: z.string().nullable().describe('Any error message if processing failed.'),
});

export type SnackDimensionsOutput = z.infer<typeof SnackDimensionsOutputSchema>;


export async function getSnackDimensions(input: SnackDimensionsInput): Promise<SnackDimensionsOutput> {
  return snackDimensionsFlow(input);
}

const snackDimensionsPrompt = ai.definePrompt({
  name: 'snackDimensionsPrompt',
  input: {schema: SnackDimensionsInputSchema},
  output: {schema: SnackDimensionsOutputSchema},
  prompt: `You are a snack geometry expert. Analyze the provided image to identify the snack and measure its dimensions.

  The snack can only be one of two types: 'parippuvada' (a circular lentil fritter) or 'vazhaikkapam' (an elliptical banana fritter).

  Based on the image, determine the snack type.
  - If it's a 'parippuvada', measure its diameter in centimeters. The other dimension fields should be null.
  - If it's a 'vazhaikkapam', measure its length and width in centimeters. The diameter field should be null.
  - If the image does not contain either of these snacks, set the snackType to 'unknown' and all dimension fields to null.

  Assume a standard-sized plate or background to estimate real-world dimensions. A typical parippuvada is about 8-13 cm in diameter. A typical vazhaikkapam is 10-16 cm long and 5-9 cm wide.

  Image of the snack: {{media url=imageData}}`,
});


const snackDimensionsFlow = ai.defineFlow(
  {
    name: 'snackDimensionsFlow',
    inputSchema: SnackDimensionsInputSchema,
    outputSchema: SnackDimensionsOutputSchema,
  },
  async (input) => {
    const { output } = await snackDimensionsPrompt(input);
    if (output === null || output === undefined) {
      return {
        snackType: 'unknown',
        diameter: null,
        length: null,
        width: null,
        error: 'Could not analyze image.',
      };
    }
    return output;
  }
);
