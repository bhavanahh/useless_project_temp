
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
  perimeter: number;
  imageData: string;
}

export type SnackAnalysisResult = (SnackDimensionsOutput & { 
    perimeter: number | null; 
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
    return snacksOfType.reduce((prev, current) => (prev.perimeter > current.perimeter) ? prev : current);
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
      perimeter: null,
      commentary: null,
      isNewRecord: false,
      latestSnack: null,
      error: 'Invalid input provided.',
      ...getWinners(),
  };

  if (!parsedData.success) {
    console.error("Invalid input provided:", parsedData.error);
    return errorResult;
  }
  
  try {
    const dimensionsResult = await getSnackDimensions(parsedData.data);

    if (dimensionsResult.error || !dimensionsResult.snackType || dimensionsResult.snackType === 'unknown') {
        console.error("Error from getSnackDimensions:", dimensionsResult.error);
        return {
            ...errorResult,
            error: dimensionsResult.error || 'Aalae pattikunno? he?',
            ...getWinners(),
        };
    }
    
    let perimeter: number | null = null;
    if (dimensionsResult.snackType === 'parippuvada' && dimensionsResult.diameter && dimensionsResult.diameter > 0) {
        perimeter = Math.PI * dimensionsResult.diameter;
    } else if (dimensionsResult.snackType === 'vazhaikkapam' && dimensionsResult.length && dimensionsResult.length > 0 && dimensionsResult.width && dimensionsResult.width > 0) {
        // Ramanujan's approximation for ellipse perimeter
        const a = dimensionsResult.length / 2;
        const b = dimensionsResult.width / 2;
        perimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    } else if (dimensionsResult.snackType === 'samoosa' && dimensionsResult.sideA && dimensionsResult.sideB && dimensionsResult.sideC) {
        const { sideA, sideB, sideC } = dimensionsResult;
        console.log(`Samoosa sides received: A=${sideA}, B=${sideB}, C=${sideC}`);
        // Check if sides form a valid triangle
        if (sideA + sideB > sideC && sideA + sideC > sideB && sideB + sideC > sideA) {
            perimeter = sideA + sideB + sideC;
        } else {
             console.error("Invalid samoosa dimensions. The sides do not form a valid triangle.");
             return {
                ...errorResult,
                ...dimensionsResult,
                error: "Invalid samoosa dimensions. The sides do not form a valid triangle.",
                ...getWinners(),
            };
        }
    }
    
    if (perimeter === null || perimeter <= 0) {
        console.error("Could not calculate perimeter due to missing or invalid dimensions.");
        return {
            ...errorResult,
            ...dimensionsResult,
            error: "Could not calculate perimeter due to missing or invalid dimensions.",
            ...getWinners(),
        }
    }

    const largestSnackBefore = getLargestSnack(dimensionsResult.snackType);
    const isNewRecord = !largestSnackBefore || perimeter > largestSnackBefore.perimeter;

    const commentaryInput: SnackCommentaryInput = {
      snackType: dimensionsResult.snackType,
      newSnackPerimeter: perimeter,
      largestSnackPerimeter: largestSnackBefore?.perimeter ?? 0,
    };

    const commentaryResult = await getSnackCommentary(commentaryInput);
    
    const newSnack: Snack = {
        id: new Date().toISOString(),
        type: dimensionsResult.snackType,
        perimeter,
        imageData: parsedData.data.imageData,
    }
    sessionSnacks.push(newSnack);

    return {
      ...dimensionsResult,
      perimeter,
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
