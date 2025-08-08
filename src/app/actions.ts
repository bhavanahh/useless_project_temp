
'use server';

import { getSnackCommentary, type SnackCommentaryInput } from '@/ai/flows/snack-commentary';
import { getSnackDimensions, type SnackDimensionsInput, type SnackDimensionsOutput } from '@/ai/flows/snack-dimensions';
import { z } from 'zod';

const SnackImageSchema = z.object({
  imageData: z.string(),
});

// This will act as our in-memory database for the session.
// NOTE: This data will be lost when the server restarts.
const sessionSnacks: Snack[] = [];

export interface Snack {
  id: string;
  type: 'parippuvada' | 'vazhaikkapam' | 'samoosa';
  area: number;
  imageData: string;
}

export type SnackAnalysisResult = (SnackDimensionsOutput & { 
    area: number | null; 
    commentary: string | null; 
    isNewRecord: boolean; 
    latestSnack: Snack | null; 
    error: string | null;
    parippuvadaWinner: Snack | null;
    vazhaikkapamWinner: Snack | null;
    samoosaWinner: Snack | null;
});

function getLargestSnack(type: 'parippuvada' | 'vazhaikkapam' | 'samoosa'): Snack | null {
    const snacksOfType = sessionSnacks.filter(s => s.type === type);
    if (snacksOfType.length === 0) {
        return null;
    }
    return snacksOfType.reduce((prev, current) => (prev.area > current.area) ? prev : current);
}

export async function analyzeAndCompareSnack(data: SnackDimensionsInput): Promise<SnackAnalysisResult> {
  const parsedData = SnackImageSchema.safeParse(data);

  const getWinners = () => ({
      parippuvadaWinner: getLargestSnack('parippuvada'),
      vazhaikkapamWinner: getLargestSnack('vazhaikkapam'),
      samoosaWinner: getLargestSnack('samoosa'),
  });

  const errorResult: SnackAnalysisResult = {
      snackType: 'unknown' as const,
      diameter: null,
      length: null,
      width: null,
      inclination: null,
      sideA: null,
      sideB: null,
      sideC: null,
      area: null,
      commentary: null,
      isNewRecord: false,
      latestSnack: null,
      error: 'Invalid input provided.',
      ...getWinners(),
  };

  if (!parsedData.success) {
    return errorResult;
  }
  
  try {
    const dimensionsResult = await getSnackDimensions(parsedData.data);

    if (dimensionsResult.error || !dimensionsResult.snackType || dimensionsResult.snackType === 'unknown') {
      return {
        ...errorResult,
        error: dimensionsResult.error || 'Aalae patttikunno? he?',
        ...getWinners(),
      };
    }
    
    let area: number | null = null;
    if (dimensionsResult.snackType === 'parippuvada' && dimensionsResult.diameter && dimensionsResult.diameter > 0) {
        area = Math.PI * (dimensionsResult.diameter / 2) ** 2;
    } else if (dimensionsResult.snackType === 'vazhaikkapam' && dimensionsResult.length && dimensionsResult.length > 0 && dimensionsResult.width && dimensionsResult.width > 0) {
        // Approximate area of an ellipse
        area = Math.PI * (dimensionsResult.length / 2) * (dimensionsResult.width / 2);
    } else if (dimensionsResult.snackType === 'samoosa' && dimensionsResult.sideA && dimensionsResult.sideB && dimensionsResult.sideC) {
        // Area of a triangle using Heron's formula
        const { sideA, sideB, sideC } = dimensionsResult;
        const s = (sideA + sideB + sideC) / 2;
        // Check if sides form a valid triangle
        if (s > sideA && s > sideB && s > sideC) {
            area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
        } else {
            return {
                ...errorResult,
                ...dimensionsResult,
                error: "Invalid samoosa dimensions. The sides do not form a valid triangle.",
                ...getWinners(),
            };
        }
    }
    
    if (area === null || area <= 0) {
        return {
            ...errorResult,
            ...dimensionsResult,
            error: "Could not calculate area due to missing or invalid dimensions.",
            ...getWinners(),
        }
    }

    const largestSnackBefore = getLargestSnack(dimensionsResult.snackType);
    const isNewRecord = !largestSnackBefore || area > largestSnackBefore.area;

    const commentaryInput: SnackCommentaryInput = {
      snackType: dimensionsResult.snackType,
      newSnackArea: area,
      largestSnackArea: largestSnackBefore?.area ?? 0,
    };

    const commentaryResult = await getSnackCommentary(commentaryInput);
    
    const newSnack: Snack = {
        id: new Date().toISOString(),
        type: dimensionsResult.snackType,
        area,
        imageData: parsedData.data.imageData,
    }
    sessionSnacks.push(newSnack);

    return {
      ...dimensionsResult,
      area,
      commentary: commentaryResult.comment,
      isNewRecord,
      latestSnack: newSnack,
      error: null,
      ...getWinners(),
    };

  } catch (error) {
    console.error('Error in GenAI flow for image analysis:', error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
        if (error.message.includes("429")) {
            errorMessage = "Nammade quota theernnu! We've hit our daily analysis limit. Please try again tomorrow.";
        } else {
            errorMessage = error.message;
        }
    }
    
    return {
      ...errorResult,
      error: `Could not analyze snack image at this time: ${errorMessage}`,
      ...getWinners(),
    };
  }
}
