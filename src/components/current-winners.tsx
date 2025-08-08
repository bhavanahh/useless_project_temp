
'use client';

import type { Snack } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ParippuvadaIcon, VazhaikkapamIcon } from "./snack-icons";
import { Crown } from "lucide-react";
import Image from "next/image";

interface CurrentWinnersProps {
    parippuvada: Snack | null;
    vazhaikkapam: Snack | null;
}

function WinnerDisplay({ snack, type }: { snack: Snack | null, type: 'parippuvada' | 'vazhaikkapam' }) {
    if (!snack) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center bg-muted/50 rounded-lg min-h-[180px]">
                {type === 'parippuvada' ? <ParippuvadaIcon className="h-12 w-12 text-muted-foreground/30" /> : <VazhaikkapamIcon className="h-12 w-12 text-muted-foreground/30" />}
                <p className="mt-2 text-sm text-muted-foreground">No {type.replace('_', ' ')} winner yet!</p>
            </div>
        );
    }
    
    const isParippuvada = snack.type === 'parippuvada';

    return (
        <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-md">
                <Image
                    src={snack.imageData}
                    alt={`Winning ${snack.type}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                />
            </div>
            <div className="mt-3">
                 <p className="font-bold capitalize text-lg flex items-center gap-2">
                    {isParippuvada ? 
                        <ParippuvadaIcon className="h-5 w-5 text-primary" />:
                        <VazhaikkapamIcon className="h-5 w-5 text-accent" />
                    }
                    {snack.type}
                </p>
                <p className="text-2xl font-bold font-mono text-primary drop-shadow-sm">{snack.area.toFixed(1)} cm²</p>
            </div>
        </div>
    )
}

export default function CurrentWinners({ parippuvada, vazhaikkapam }: CurrentWinnersProps) {
    if (!parippuvada && !vazhaikkapam) {
        return null;
    }

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in-0">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-500" />
                    Current Champions
                </CardTitle>
                <CardDescription>The biggest snacks of this session.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WinnerDisplay snack={parippuvada} type="parippuvada" />
                    <WinnerDisplay snack={vazhaikkapam} type="vazhaikkapam" />
                </div>
            </CardContent>
        </Card>
    )
}
