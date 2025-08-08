// snack-expert-badge.ts
'use server';

/**
 * @fileOverview Determines if a user earns a 'Snack Expert' badge based on the snack area.
 *
 * - `getSnackExpertBadge` -  Determines if a user earns a 'Snack Expert' badge based on the snack area.
 * - `SnackExpertBadgeInput` - The input type for the getSnackExpertBadge function.
 * - `SnackExpertBadgeOutput` - The return type for the getSnackExpertBadge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnackExpertBadgeInputSchema = z.object({
  snackArea: z
    .number()
    .describe('The calculated area of the snack.'),
});

export type SnackExpertBadgeInput = z.infer<typeof SnackExpertBadgeInputSchema>;

const SnackExpertBadgeOutputSchema = z.object({
  isExpert: z
    .boolean()
    .describe('Whether the snack area qualifies for the expert badge.'),
  reason: z
    .string()
    .describe('The reason why the snack does or does not qualify for the expert badge.'),
});

export type SnackExpertBadgeOutput = z.infer<typeof SnackExpertBadgeOutputSchema>;

export async function getSnackExpertBadge(input: SnackExpertBadgeInput): Promise<SnackExpertBadgeOutput> {
  return snackExpertBadgeFlow(input);
}

const snackExpertBadgePrompt = ai.definePrompt({
  name: 'snackExpertBadgePrompt',
  input: {schema: SnackExpertBadgeInputSchema},
  output: {schema: SnackExpertBadgeOutputSchema},
  prompt: `You are an expert snack badge awarder.

You will evaluate the snack area and determine if it qualifies for a "Snack Expert" badge.

If the snackArea is greater than 100 square units, then the user qualifies for the badge.  Otherwise, they do not qualify.

Snack Area: {{{snackArea}}}
`,
});

const snackExpertBadgeFlow = ai.defineFlow(
  {
    name: 'snackExpertBadgeFlow',
    inputSchema: SnackExpertBadgeInputSchema,
    outputSchema: SnackExpertBadgeOutputSchema,
  },
  async input => {
    const {output} = await snackExpertBadgePrompt(input);
    return output!;
  }
);
