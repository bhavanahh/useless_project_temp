
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParippuvadaIcon, VazhaikkapamIcon } from '@/components/snack-icons';
import { checkSnackExpert } from '@/app/actions';
import type { SnackExpertBadgeOutput } from '@/ai/flows/snack-expert-badge';
import SnackExpertBadge from './snack-expert-badge';
import { useToast } from '@/hooks/use-toast';
import { ChartConfig, ChartContainer } from './ui/chart';
import CameraUpload from './camera-upload';
import type { SnackDimensionsOutput } from '@/ai/flows/snack-dimensions';

const parippuvadaSchema = z.object({
  diameter: z.coerce.number().min(1, 'Must be > 0').max(100, 'Must be < 100'),
});
type ParippuvadaFormValues = z.infer<typeof parippuvadaSchema>;

const vazhaikkapamSchema = z.object({
  length: z.coerce.number().min(1, 'Must be > 0').max(100, 'Must be < 100'),
  width: z.coerce.number().min(1, 'Must be > 0').max(100, 'Must be < 100'),
});
type VazhaikkapamFormValues = z.infer<typeof vazhaikkapamSchema>;

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


export default function SnackCalculator() {
  const [parippuvadaArea, setParippuvadaArea] = useState(0);
  const [vazhaikkapamArea, setVazhaikkapamArea] = useState(0);
  const [activeTab, setActiveTab] = useState('parippuvada');
  const [expertBadge, setExpertBadge] = useState<SnackExpertBadgeOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const parippuvadaForm = useForm<ParippuvadaFormValues>({
    resolver: zodResolver(parippuvadaSchema),
    defaultValues: { diameter: 10 },
    mode: 'onChange',
  });

  const vazhaikkapamForm = useForm<VazhaikkapamFormValues>({
    resolver: zodResolver(vazhaikkapamSchema),
    defaultValues: { length: 12, width: 7 },
    mode: 'onChange',
  });

  const diameter = parippuvadaForm.watch('diameter');
  const { length, width } = vazhaikkapamForm.watch();

  const handleAreaCheck = (area: number) => {
    startTransition(async () => {
      setExpertBadge(null);
      const result = await checkSnackExpert({ snackArea: area });
      if (result.reason.includes('Could not determine')) {
        toast({
          variant: "destructive",
          title: "Uh oh! AI is taking a break.",
          description: "Couldn't check your snack-pertise. Please try again.",
        });
      }
      setExpertBadge(result);
    });
  };
  
  const activeSnackType = activeTab;


  const handleDimensionsUpdate = (dimensions: SnackDimensionsOutput) => {
    if (dimensions.snackType === 'parippuvada' && dimensions.diameter) {
      parippuvadaForm.setValue('diameter', dimensions.diameter, { shouldValidate: true });
      setActiveTab('parippuvada');
    }
    if (dimensions.snackType === 'vazhaikkapam' && dimensions.length && dimensions.width) {
      vazhaikkapamForm.setValue('length', dimensions.length, { shouldValidate: true });
      vazhaikkapamForm.setValue('width', dimensions.width, { shouldValidate: true });
      setActiveTab('vazhaikkapam');
    }
  };


  useEffect(() => {
    parippuvadaForm.trigger('diameter');
    const { success } = parippuvadaSchema.safeParse({ diameter });
    if (success) {
      const radius = diameter / 2;
      const area = Math.PI * radius * radius;
      setParippuvadaArea(area);
      if (activeSnackType === 'parippuvada') handleAreaCheck(area);
    }
  }, [diameter, parippuvadaForm.formState.isValid, activeSnackType]);

  useEffect(() => {
    vazhaikkapamForm.trigger(['length', 'width']);
    const { success } = vazhaikkapamSchema.safeParse({ length, width });
    if (success) {
      const area = Math.PI * (length / 2) * (width / 2);
      setVazhaikkapamArea(area);
      if (activeSnackType === 'vazhaikkapam') handleAreaCheck(area);
    }
  }, [length, width, vazhaikkapamForm.formState.isValid, activeSnackType]);
  
  const chartData = [
    { snack: 'Parippuvada', area: parippuvadaArea, fill: 'var(--color-parippuvada)' },
    { snack: 'Vazhaikkapam', area: vazhaikkapamArea, fill: 'var(--color-vazhaikkapam)' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Snack-o-Mator</CardTitle>
          <CardDescription>Enter your snack's dimensions to calculate its surface area.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parippuvada">Parippuvada</TabsTrigger>
              <TabsTrigger value="vazhaikkapam">Vazhaikkapam</TabsTrigger>
              <TabsTrigger value="camera-upload">Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="parippuvada" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <Form {...parippuvadaForm}>
                  <form className="space-y-4">
                    <FormField
                      control={parippuvadaForm.control}
                      name="diameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diameter (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="bg-muted rounded-lg p-6 text-center space-y-3">
                  <ParippuvadaIcon className="h-16 w-16 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Surface Area</p>
                  <p className="text-4xl font-bold font-mono text-primary">{parippuvadaArea.toFixed(1)} cm²</p>
                  {activeSnackType === 'parippuvada' && <SnackExpertBadge isLoading={isPending} badgeData={expertBadge} className="justify-center" />}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="vazhaikkapam" className="mt-6">
               <div className="grid md:grid-cols-2 gap-6 items-center">
                <Form {...vazhaikkapamForm}>
                  <form className="space-y-4">
                    <FormField
                      control={vazhaikkapamForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                             <Input type="number" placeholder="e.g., 12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={vazhaikkapamForm.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                             <Input type="number" placeholder="e.g., 7" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="bg-muted rounded-lg p-6 text-center space-y-3">
                  <VazhaikkapamIcon className="h-16 w-16 mx-auto text-accent" />
                   <p className="text-sm text-muted-foreground">Surface Area</p>
                  <p className="text-4xl font-bold font-mono text-accent">{vazhaikkapamArea.toFixed(1)} cm²</p>
                  {activeSnackType === 'vazhaikkapam' && <SnackExpertBadge isLoading={isPending} badgeData={expertBadge} className="justify-center" />}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="camera-upload" className="mt-6">
              <CameraUpload onDimensionsCalculated={handleDimensionsUpdate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Snack Showdown</CardTitle>
          <CardDescription>A visual comparison of your snacks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
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
                              {payload[0].value?.toFixed(1)} cm²
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
  );
}
