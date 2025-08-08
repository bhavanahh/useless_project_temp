// snack-commentary.ts
'use server';

/**
 * @fileOverview Generates a commentary comparing a new snack to the largest snack found so far.
 *
 * - `getSnackCommentary` - A function that handles the snack commentary generation.
 * - `SnackCommentaryInput` - The input type for the getSnackCommentary function.
 * - `SnackCommentaryOutput` - The return type for the getSnackCommentary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnackCommentaryInputSchema = z.object({
  snackType: z.string().describe('The type of snack (e.g., "parippuvada").'),
  newSnackArea: z.number().describe('The area of the newly analyzed snack in cm².'),
  largestSnackArea: z.number().describe('The area of the largest snack of this type previously recorded in cm².'),
});

export type SnackCommentaryInput = z.infer<typeof SnackCommentaryInputSchema>;

const SnackCommentaryOutputSchema = z.object({
  comment: z.string().describe('The generated comment in a friendly, witty, Manglish style.'),
});

export type SnackCommentaryOutput = z.infer<typeof SnackCommentaryOutputSchema>;


export async function getSnackCommentary(input: SnackCommentaryInput): Promise<SnackCommentaryOutput> {
  return snackCommentaryFlow(input);
}

const snackCommentaryPrompt = ai.definePrompt({
  name: 'snackCommentaryPrompt',
  input: {schema: SnackCommentaryInputSchema},
  output: {schema: SnackCommentaryOutputSchema},
  prompt: `You are a friendly Keralite snack enthusiast with a great sense of humor. Your goal is to generate a short, witty, and encouraging comment in Manglish comparing a new snack to the previous record holder.

Context:
- Snack Type: {{{snackType}}}
- New Snack's Area: {{{newSnackArea}}} cm²
- Previous Largest Snack's Area: {{{largestSnackArea}}} cm²

Your Task:
- If the new snack's area is greater than the previous largest snack's area, write a celebratory and slightly exaggerated comment. Praise the size of the new snack.
- If the new snack's area is smaller than the previous largest snack, write a playful and teasing comment.
- If there was no previous largest snack (largestSnackArea is 0), just comment on the snack itself, welcoming it to the competition.

Examples of tone:
- Celebratory: "My goodness! Look at the size of this {{{snackType}}}! You've beaten the record! Kollam!"
- Teasing: "Aalae pattikunno? Ithu cheriya oru kadi aayipoyi. Next time valuthu nokkam!" (Are you trying to fool me? This is a small bite. Let's try for a bigger one next time!)
- First Entry: "Aha! Oru puthiya {{{snackType}}}! The competition begins!"

Generate a single comment based on the provided data.`,
});


const snackCommentaryFlow = ai.defineFlow(
  {
    name: 'snackCommentaryFlow',
    inputSchema: SnackCommentaryInputSchema,
    outputSchema: SnackCommentaryOutputSchema,
  },
  async input => {
    const {output} = await snackCommentaryPrompt(input);
    return output!;
  }
);
