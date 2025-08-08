
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParippuvadaIcon, VazhaikkapamIcon } from '@/components/snack-icons';
import { checkSnackExpert } from '@/app/actions';
import type { SnackExpertBadgeOutput } from '@/ai/flows/snack-expert-badge';
import SnackExpertBadge from './snack-expert-badge';
import { useToast } from '@/hooks/use-toast';
import { ChartConfig, ChartContainer } from './ui/chart';
import CameraUpload from './camera-upload';
import type { SnackDimensionsOutput } from '@/ai/flows/snack-dimensions';
import Leaderboard, { type SnackData } from './leaderboard';
import { UtensilsCrossed } from 'lucide-react';

const chartConfig = {
  area: {
    label: "Area (cm²)",
  },
  parippuvada: {
    label: "Parippuvada",
    color: "hsl(var(--primary))",
  },
  vazhaikkapam: {
    label: "Vazhaikkapam",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const initialLeaderboard: SnackData[] = [
  { name: 'Amma\'s Special Parippuvada', area: 153.9, type: 'parippuvada' },
  { name: 'The Colossal Vazhaikkapam', area: 125.6, type: 'vazhaikkapam' },
  { name: 'Chettan\'s Crispy Parippuvada', area: 95.0, type: 'parippuvada' },
  { name: 'Standard Tea-Stall Vada', area: 78.5, type: 'parippuvada' },
  { name: 'Afternoon Delight Vazhaikkapam', area: 65.3, type: 'vazhaikkapam' },
];

interface SnackResult {
    type: 'parippuvada' | 'vazhaikkapam';
    area: number;
    diameter?: number | null;
    length?: number | null;
    width?: number | null;
}

export default function SnackAnalyzer() {
  const [snackResult, setSnackResult] = useState<SnackResult | null>(null);
  const [expertBadge, setExpertBadge] = useState<SnackExpertBadgeOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<SnackData[]>(initialLeaderboard);
  const [chartData, setChartData] = useState<{ snack: string; area: number; fill: string; }[]>([]);

  const updateLeaderboard = (snackName: string, area: number, type: 'parippuvada' | 'vazhaikkapam') => {
    const newSnack: SnackData = { name: snackName, area, type };
    const updatedLeaderboard = [...leaderboard, newSnack]
      .sort((a, b) => b.area - a.area)
      .slice(0, 5);
    setLeaderboard(updatedLeaderboard);
  };
  
  const handleAreaCheck = (area: number, type: 'parippuvada' | 'vazhaikkapam') => {
    if (area <= 0) return;

    startTransition(async () => {
      setExpertBadge(null);
      const result = await checkSnackExpert({ snackArea: area });
      if (result.reason.includes('Could not determine')) {
        toast({
          variant: "destructive",
          title: "Ayyo! AI pani tharanu.",
          description: "Snack expert aano ennu nokkaan pattiyilla. Kurachu kazhinju try cheyyu.",
        });
      }
      setExpertBadge(result);
    });

    updateLeaderboard(`Your ${type}`, area, type);
  };

  const handleDimensionsUpdate = (dimensions: SnackDimensionsOutput) => {
    let area = 0;
    let snackType: 'parippuvada' | 'vazhaikkapam' | null = null;
    let result: SnackResult | null = null;

    if (dimensions.snackType === 'parippuvada' && dimensions.diameter && dimensions.diameter > 0) {
        area = Math.PI * (dimensions.diameter / 2) * (dimensions.diameter / 2);
        snackType = 'parippuvada';
        result = { type: snackType, area, diameter: dimensions.diameter };
    } else if (dimensions.snackType === 'vazhaikkapam' && dimensions.length && dimensions.width && dimensions.length > 0 && dimensions.width > 0) {
        area = Math.PI * (dimensions.length / 2) * (dimensions.width / 2);
        snackType = 'vazhaikkapam';
        result = { type: snackType, area, length: dimensions.length, width: dimensions.width };
    }

    setSnackResult(result);
    if (snackType && area > 0) {
        handleAreaCheck(area, snackType);
    }
  };
  
  useEffect(() => {
    const latestParippuvada = leaderboard.find(s => s.type === 'parippuvada');
    const latestVazhaikkapam = leaderboard.find(s => s.type === 'vazhaikkapam');

    const data = [];
    if (latestParippuvada) {
        data.push({ snack: 'Parippuvada', area: latestParippuvada.area, fill: 'var(--color-parippuvada)' });
    }
    if (latestVazhaikkapam) {
        data.push({ snack: 'Vazhaikkapam', area: latestVazhaikkapam.area, fill: 'var(--color-vazhaikkapam)' });
    }
    setChartData(data);
  }, [leaderboard]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="font-headline">Snack Analyzer</CardTitle>
                    <CardDescription>Upload or snap a picture of your snack to see how it measures up!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <CameraUpload onDimensionsCalculated={handleDimensionsUpdate} />
                        
                        {snackResult ? (
                            <div className="bg-muted rounded-lg p-6 text-center space-y-3 animate-in fade-in-0 zoom-in-95 duration-500">
                                {snackResult.type === 'parippuvada' ? 
                                    <ParippuvadaIcon className="h-16 w-16 mx-auto text-primary" /> :
                                    <VazhaikkapamIcon className="h-16 w-16 mx-auto text-accent" />
                                }
                                <p className="text-lg">Ithu oru <span className="font-bold capitalize text-primary">{snackResult.type}</span> aanu!</p>
                                
                                <div>
                                    <p className="text-sm text-muted-foreground">Surface Area</p>
                                    <p className="text-4xl font-bold font-mono text-primary">{snackResult.area.toFixed(1)} cm²</p>
                                </div>
                                
                                <div className="text-sm text-muted-foreground border-t border-border pt-3">
                                    {snackResult.type === 'parippuvada' && snackResult.diameter && (
                                        <div>
                                            <p>Perimeter: <span className="font-mono font-medium text-foreground">{(Math.PI * snackResult.diameter).toFixed(1)} cm</span></p>
                                        </div>
                                    )}
                                    {snackResult.type === 'vazhaikkapam' && snackResult.length && snackResult.width && (
                                        <div className="flex justify-center gap-4">
                                            <p>Length: <span className="font-mono font-medium text-foreground">{snackResult.length.toFixed(1)} cm</span></p>
                                            <p>Width: <span className="font-mono font-medium text-foreground">{snackResult.width.toFixed(1)} cm</span></p>
                                        </div>
                                    )}
                                </div>

                                <SnackExpertBadge isLoading={isPending} badgeData={expertBadge} className="justify-center pt-2" />
                            </div>
                        ) : (
                            <div className="bg-muted rounded-lg p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[250px]">
                                <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground/50" />
                                <p className="text-muted-foreground">Waiting for a snack...</p>
                                <p className="text-sm text-muted-foreground/80">Your snack analysis will appear here.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <UtensilsCrossed className="w-6 h-6 text-primary" />
                        <div>
                        <CardTitle className="font-headline">Snack Porattam</CardTitle>
                        <CardDescription>Ningade snackukal thammil oru cheriya malsaram.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="snack" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <ChartTooltip
                        content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Snack
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.snack}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Area
                                    </span>
                                    <span className="font-bold">
                                    {payload[0].value ? Number(payload[0].value).toFixed(1) : 0} cm²
                                    </span>
                                </div>
                                </div>
                            </div>
                            )
                        }

                        return null
                        }}
                    />
                    <Bar dataKey="area" radius={8} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Leaderboard snacks={leaderboard} />
        </div>
    </div>
  );
}
