
'use client';

import { useRef, useState, useEffect, useTransition } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, FileUp, Copy } from 'lucide-react';
import { analyzeAndCompareSnack } from '@/app/actions';
import type { SnackAnalysisResult } from '@/app/actions';
import Image from 'next/image';

interface CameraUploadProps {
    onAnalysisComplete: (result: SnackAnalysisResult) => void;
}

export default function CameraUpload({ onAnalysisComplete }: CameraUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, startProcessing] = useTransition();
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
          title: 'Camera Kondu Varane!',
          description: 'Mone, camera on aakiye... Appo alle photo edukkaan pattu.',
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
        setAnalysisError(null);
        setImagePreview(dataUrl);
        handleAnalyze(dataUrl);
      }
    }
  };

  const handleAnalyze = (imageData: string) => {
    if (!imageData) return;

    startProcessing(async () => {
      setAnalysisError(null);
      
      const result = await analyzeAndCompareSnack({ imageData });
      
      if (result.error) {
        const errorMessage = result.error ?? "Ee snack manassilayilla. Vere onnu tharumo?";
        setAnalysisError(errorMessage);
        setImagePreview(null);
      } else {
        onAnalysisComplete(result);
        setImagePreview(null);
        toast({
          title: `Kandupiche! Ithu ${result.snackType} aanu!`,
          description: "Alavukal update cheythittundu.",
        });
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setAnalysisError(null);
        setImagePreview(imageData);
        handleAnalyze(imageData);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadClick = () => {
    setImagePreview(null);
    setAnalysisError(null);
    fileInputRef.current?.click();
  }

  const copyToClipboard = () => {
    if (analysisError) {
        navigator.clipboard.writeText(analysisError).then(() => {
            toast({
                title: "Copy cheythu!",
                description: "Thettu copy cheythittundu, mone.",
            });
        });
    }
  }

  return (
    <div className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg border bg-muted flex justify-center items-center aspect-video">
            {isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="text-center p-4 bg-background/80 rounded-lg shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="mt-2 text-muted-foreground">Kadi alakkunnu...</p>
                    </div>
                </div>
            )}
            
            {imagePreview && !isProcessing && (
                 <Image
                    src={imagePreview}
                    alt="Snack preview"
                    fill
                    objectFit="contain"
                    className="z-10"
                />
            )}

            <video ref={videoRef} className="w-full h-auto object-cover rounded-lg" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>

        {hasCameraPermission === false && (
            <Alert variant="default">
                <AlertTitle>Camera Illa!</AlertTitle>
                <AlertDescription>
                    Camera illel entha, file upload cheythu snack alakkamallo.
                </AlertDescription>
            </Alert>
        )}

        {analysisError && (
             <Alert variant="destructive">
                <div className="flex justify-between items-start">
                    <div>
                        <AlertTitle>Ayyo, Pani Kitti!</AlertTitle>
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
                <Camera className="mr-2" /> Oru Photo Pidi
            </Button>
            <Button onClick={handleUploadClick} variant="outline" disabled={isProcessing}>
                <FileUp className="mr-2" /> File Thappu
            </Button>
            <input type="file" ref={fileInputRef} id="file-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
    </div>
  );
}
