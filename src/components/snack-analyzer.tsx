
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParippuvadaIcon, VazhaikkapamIcon } from '@/components/snack-icons';
import { type SnackAnalysisResult, type Snack } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import CameraUpload from './camera-upload';
import { UtensilsCrossed, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';
import WinnerDialog from './winner-dialog';
import CurrentWinners from './current-winners';

export default function SnackAnalyzer() {
  const [snackResult, setSnackResult] = useState<SnackAnalysisResult | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [winners, setWinners] = useState<{parippuvada: Snack | null, vazhaikkapam: Snack | null}>({parippuvada: null, vazhaikkapam: null});

  const { toast } = useToast();
  
  const handleAnalysisComplete = (result: SnackAnalysisResult) => {
    if (result.error || !result.latestSnack) {
      toast({
        variant: "destructive",
        title: "Ayyo! Oru pani kitti.",
        description: result.error || 'Could not analyze snack.',
      });
      setSnackResult(null);
    } else {
      setSnackResult(result);
      if (result.isNewRecord) {
          setShowWinner(true);
      }
    }

    setWinners({
        parippuvada: result.parippuvadaWinner,
        vazhaikkapam: result.vazhaikkapamWinner,
    });
  };
  
  return (
    <>
    {snackResult?.latestSnack && (
        <WinnerDialog 
            isOpen={showWinner} 
            onOpenChange={setShowWinner}
            snack={snackResult.latestSnack}
        />
    )}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="font-headline">Snack Analyzer</CardTitle>
                    <CardDescription>Upload or snap a picture of your snack to see how it measures up!</CardDescription>
                </CardHeader>
                <CardContent>
                   <CameraUpload onAnalysisComplete={handleAnalysisComplete} />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {snackResult && !snackResult.error && snackResult.area ? (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in-0 zoom-in-95 duration-500">
                  <CardHeader>
                      <CardTitle className="font-headline">Analysis Results</CardTitle>
                      <CardDescription>Here's the lowdown on your snack.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                          {snackResult.latestSnack?.imageData && (
                              <Image
                                  src={snackResult.latestSnack.imageData}
                                  alt="Analyzed snack"
                                  width={400}
                                  height={400}
                                  className="rounded-lg object-contain border bg-muted"
                                  data-ai-hint="snack"
                              />
                          )}
                          <div className="bg-muted rounded-lg p-6 text-center space-y-3">
                              {snackResult.snackType === 'parippuvada' ? 
                                  <ParippuvadaIcon className="h-16 w-16 mx-auto text-primary" /> :
                                  <VazhaikkapamIcon className="h-16 w-16 mx-auto text-accent" />
                              }
                              <p className="text-lg">Ithu oru <span className="font-bold capitalize text-primary">{snackResult.snackType}</span> aanu!</p>
                              
                              <div>
                                  <p className="text-sm text-muted-foreground">Surface Area</p>
                                  <p className="text-4xl font-bold font-mono text-primary">{snackResult.area?.toFixed(1)} cm²</p>
                              </div>
                              
                              <div className="text-sm text-muted-foreground border-t border-border pt-3">
                                  {snackResult.snackType === 'parippuvada' && snackResult.diameter && snackResult.diameter > 0 && (
                                      <div>
                                          <p>Perimeter: <span className="font-mono font-medium text-foreground">{(Math.PI * snackResult.diameter).toFixed(1)} cm</span></p>
                                      </div>
                                  )}
                                  {snackResult.snackType === 'vazhaikkapam' && snackResult.length && snackResult.length > 0 && snackResult.width && snackResult.width > 0 && (
                                      <div className="flex justify-center gap-4">
                                          <p>Length: <span className="font-mono font-medium text-foreground">{snackResult.length.toFixed(1)} cm</span></p>
                                          <p>Width: <span className="font-mono font-medium text-foreground">{snackResult.width.toFixed(1)} cm</span></p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                      {snackResult.commentary && (
                          <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                              <div className="flex">
                                  <div className="flex-shrink-0">
                                      <MessageSquareQuote className="h-5 w-5 text-amber-500" aria-hidden="true" />
                                  </div>
                                  <div className="ml-3">
                                      <p className="text-sm text-amber-800">
                                          {snackResult.commentary}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}
                  </CardContent>
              </Card>
            ) : (
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="font-headline">Awaiting Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted rounded-lg p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[250px]">
                            <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground/50" />
                            <p className="text-muted-foreground">Waiting for a snack...</p>
                            <p className="text-sm text-muted-foreground/80">Your snack analysis will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <CurrentWinners parippuvada={winners.parippuvada} vazhaikkapam={winners.vazhaikkapam} />
        </div>
    </div>
    </>
  );
}
