
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
  snackType: z.enum(['parippuvada', 'vazhaikkapam', 'samoosa', 'unknown']).describe('The type of snack identified in the image.'),
  diameter: z.number().nullable().describe('The diameter of the parippuvada in cm. Null if not a parippuvada.'),
  length: z.number().nullable().describe('The length of the vazhaikkapam in cm. Null if not a vazhaikkapam.'),
  width: z.number().nullable().describe('The width of the vazhaikkapam in cm. Null if not a vazhaikkapam.'),
  inclination: z.number().nullable().describe('The inclination angle of the vazhaikkapam in degrees, from -90 to 90. Null if not a vazhaikkapam.'),
  sideA: z.number().nullable().describe('Length of side A of the samoosa in cm. Null if not a samoosa.'),
  sideB: z.number().nullable().describe('Length of side B of the samoosa in cm. Null if not a samoosa.'),
  sideC: z.number().nullable().describe('Length of side C of the samoosa in cm. Null if not a samoosa.'),
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
  prompt: `You are a snack geometry expert. Your primary goal is to analyze the provided image to identify a snack and measure its dimensions.

**Important First Step:** Before any analysis, check if the image contains a human face. 
- If you detect a human face, you MUST stop all other analysis. Set the 'snackType' to 'unknown' and the 'error' field to the exact Manglish string: "Aalalla, snack alla! Mone, ithu snack alla, oru manushyananu! LOL". Do not proceed to measure anything.

If there is no human face, proceed with the snack analysis:
The snack can only be one of three types: 'parippuvada' (a circular lentil fritter), 'vazhaikkapam' (an elliptical banana fritter), or 'samoosa' (a triangular pastry).

Based on the image, determine the snack type.
- If it's a 'parippuvada', measure its diameter in centimeters. The length, width, inclination, and side fields must be null.
- If it's a 'vazhaikkapam':
  - 'length' is the longest straight-line distance from one end to the other.
  - 'width' is the widest point measured perpendicular to the length.
  - 'inclination' is the angle of its longest axis (the length) relative to the horizontal, in degrees (from -90 to 90).
  - The diameter and side fields must be null.
- If it's a 'samoosa', measure the length of its three sides (sideA, sideB, sideC) in centimeters. The diameter, length, width, and inclination fields must be null.
- If the image does not contain any of these snacks, set the snackType to 'unknown' and all dimension fields to null.

Assume a standard-sized plate or background to estimate real-world dimensions. A typical parippuvada is about 8-13 cm in diameter. A typical vazhaikkapam is 10-16 cm long. A typical samoosa has sides between 6-8 cm.

Image of the snack: {{media url=imageData}}`,
});


const snackDimensionsFlow = ai.defineFlow(
  {
    name: 'snackDimensionsFlow',
    inputSchema: SnackDimensionsInputSchema,
    outputSchema: SnackDimensionsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await snackDimensionsPrompt(input);
      
      if (!output) {
        return {
          snackType: 'unknown',
          diameter: null,
          length: null,
          width: null,
          inclination: null,
          sideA: null,
          sideB: null,
          sideC: null,
          error: 'Could not analyze image. The model returned no output.',
        };
      }
      
      if (output.error) {
         return {
          snackType: 'unknown',
          diameter: null,
          length: null,
          width: null,
          inclination: null,
          sideA: null,
          sideB: null,
          sideC: null,
          error: output.error
        };
      }

      // Clean up the output to ensure consistency
      if (output.snackType === 'parippuvada') {
        output.length = null;
        output.width = null;
        output.inclination = null;
        output.sideA = null;
        output.sideB = null;
        output.sideC = null;
        if (!output.diameter || output.diameter <= 0) {
            return { snackType: 'unknown', diameter: null, length: null, width: null, inclination: null, sideA: null, sideB: null, sideC: null, error: 'The model could not determine a valid diameter for the parippuvada.' };
        }
      } else if (output.snackType === 'vazhaikkapam') {
        output.diameter = null;
        output.sideA = null;
        output.sideB = null;
        output.sideC = null;
        if (!output.length || output.length <= 0 || !output.width || output.width <= 0) {
            return { snackType: 'unknown', diameter: null, length: null, width: null, inclination: null, sideA: null, sideB: null, sideC: null, error: 'The model could not determine valid dimensions for the vazhaikkapam.' };
        }
        if (output.inclination === null || output.inclination < -90 || output.inclination > 90) {
            output.inclination = 0; // Default to 0 if invalid
        }
      } else if (output.snackType === 'samoosa') {
        output.diameter = null;
        output.length = null;
        output.width = null;
        output.inclination = null;
        if (!output.sideA || output.sideA <= 0 || !output.sideB || output.sideB <= 0 || !output.sideC || output.sideC <= 0) {
          return { snackType: 'unknown', diameter: null, length: null, width: null, inclination: null, sideA: null, sideB: null, sideC: null, error: 'The model could not determine valid dimensions for the samoosa.' };
        }
      } else {
        return {
            snackType: 'unknown',
            diameter: null,
            length: null,
            width: null,
            inclination: null,
            sideA: null,
            sideB: null,
            sideC: null,
            error: output.error || 'The model could not identify the snack.',
        }
      }
      
      output.error = null;

      return output;

    } catch(e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      return {
          snackType: 'unknown',
          diameter: null,
          length: null,
          width: null,
          inclination: null,
          sideA: null,
          sideB: null,
          sideC: null,
          error: `Could not analyze image: ${errorMessage}`,
      };
    }
  }
);
