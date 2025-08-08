
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Snack } from '@/app/actions';
import Image from 'next/image';
import { Crown } from 'lucide-react';
import { Button } from './ui/button';

interface WinnerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    snack: Snack;
}

export default function WinnerDialog({ isOpen, onOpenChange, snack }: WinnerDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 via-background to-amber-50">
                <DialogHeader className="text-center items-center pt-4">
                    <div className="relative">
                        <Crown className="w-24 h-24 text-primary animate-in fade-in zoom-in-50 duration-500" />
                        <span className="absolute text-5xl font-extrabold text-white" style={{ top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>#1</span>
                    </div>
                    <DialogTitle className="text-4xl font-headline text-primary mt-2">New Champion!</DialogTitle>
                    <DialogDescription className="text-lg text-muted-foreground">
                        Mone, ee {snack.type} theerchaayi vishesham!
                    </DialogDescription>
                </DialogHeader>
                <div className="my-6 flex flex-col items-center space-y-4">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                        <Image 
                            src={snack.imageData} 
                            alt={`Winning ${snack.type}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">New Record Area</p>
                        <p className="text-5xl font-bold font-mono text-primary drop-shadow-sm">{snack.area.toFixed(1)} cm²</p>
                    </div>
                </div>
                <div className="flex justify-center pb-4">
                     <Button onClick={() => onOpenChange(false)} className="w-1/2">Adipoli!</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
