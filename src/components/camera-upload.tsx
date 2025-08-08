'use client';

import { useRef, useState, useEffect, useTransition } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, FileUp, Copy } from 'lucide-react';
import { getDimensionsFromImage } from '@/app/actions';
import { Card, CardContent } from './ui/card';
import type { SnackDimensionsOutput } from '@/ai/flows/snack-dimensions';


interface CameraUploadProps {
    onDimensionsCalculated: (dimensions: SnackDimensionsOutput) => void;
}

export default function CameraUpload({ onDimensionsCalculated }: CameraUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, startProcessing] = useTransition();
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setAnalysisError(null);
        handleAnalyze(dataUrl);
      }
    }
  };

  const handleAnalyze = (imageData: string) => {
    if (!imageData) return;

    startProcessing(async () => {
      setAnalysisError(null);
      console.log("Received image for analysis, length:", imageData.length);

      const result = await getDimensionsFromImage({ imageData });
      console.log("Analysis result:", result);
      
      if (result.error || result.snackType === 'unknown') {
        const errorMessage = result.error || "Ee snack manassilayilla. Vere onnu tharumo?";
        setAnalysisError(errorMessage);
      } else {
        onDimensionsCalculated(result);
        toast({
          title: `Ithu ${result.snackType} aanu!`,
          description: "Alavukal update cheythittundu.",
        });
        setCapturedImage(null);
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        setAnalysisError(null);
        handleAnalyze(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    if (analysisError) {
        navigator.clipboard.writeText(analysisError).then(() => {
            toast({
                title: "Copied!",
                description: "Error message copied to clipboard.",
            });
        });
    }
  }

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg border bg-muted flex justify-center items-center">
            {isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
                    <div className="text-center p-4 bg-background/80 rounded-lg shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="mt-2 text-muted-foreground">Analyzing snack...</p>
                    </div>
                </div>
            )}
            
            {capturedImage && !isProcessing ? (
                <img src={capturedImage} alt="Captured snack" className="w-auto h-auto max-h-[400px] max-w-full rounded-lg object-contain" />
            ) : (
                <video ref={videoRef} className="w-full h-auto object-cover rounded-lg" autoPlay muted playsInline />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>

        {hasCameraPermission === false && (
            <Alert variant="default">
                <AlertTitle>Camera Not Available</AlertTitle>
                <AlertDescription>
                    You can still upload a file to analyze a snack.
                </AlertDescription>
            </Alert>
        )}

        {analysisError && (
             <Alert variant="destructive">
                <div className="flex justify-between items-start">
                    <div>
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>
                            {analysisError}
                        </AlertDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
            <Button onClick={captureImage} className="w-full" disabled={hasCameraPermission !== true || isProcessing}>
                <Camera className="mr-2" /> Capture
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isProcessing}>
                <FileUp className="mr-2" /> Upload File
            </Button>
            <input type="file" ref={fileInputRef} id="file-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
    </div>
  );
}
