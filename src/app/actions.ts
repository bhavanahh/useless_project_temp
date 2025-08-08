
'use server';

import { getSnackExpertBadge, type SnackExpertBadgeInput, type SnackExpertBadgeOutput } from '@/ai/flows/snack-expert-badge';
import { z } from 'zod';
import { getSnackDimensions, type SnackDimensionsInput, type SnackDimensionsOutput } from '@/ai/flows/snack-dimensions';

const SnackAreaSchema = z.object({
  snackArea: z.number(),
});

export async function checkSnackExpert(data: SnackExpertBadgeInput): Promise<SnackExpertBadgeOutput> {
  const parsedData = SnackAreaSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      isExpert: false,
      reason: 'Invalid input provided.',
    };
  }
  
  try {
    const result = await getSnackExpertBadge(parsedData.data);
    return result;
  } catch (error) {
    console.error('Error in GenAI flow:', error);
    return {
      isExpert: false,
      reason: 'Could not determine snack expertise at this time. Please try again later.',
    };
  }
}


const SnackImageSchema = z.object({
  imageData: z.string(),
});

export async function getDimensionsFromImage(data: SnackDimensionsInput): Promise<SnackDimensionsOutput> {
  const parsedData = SnackImageSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      snackType: 'unknown',
      diameter: null,
      length: null,
      width: null,
      error: 'Invalid input provided.',
    };
  }

  try {
    const result = await getSnackDimensions(parsedData.data);
    return result;
  } catch (error) {
    console.error('Error in GenAI flow for image analysis:', error);
    return {
      snackType: 'unknown',
      diameter: null,
      length: null,
      width: null,
      error: 'Could not analyze snack image at this time. Please try again later.',
    };
  }
}
