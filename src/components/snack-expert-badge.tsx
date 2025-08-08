'use client';

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SnackExpertBadgeOutput } from "@/ai/flows/snack-expert-badge";
import { Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnackExpertBadgeProps {
  badgeData: SnackExpertBadgeOutput | null;
  isLoading: boolean;
  className?: string;
}

export default function SnackExpertBadge({ badgeData, isLoading, className }: SnackExpertBadgeProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground animate-pulse", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking your snackpertise...
      </div>
    );
  }

  if (!badgeData?.isExpert) {
     if (badgeData?.reason) {
        return (
          <div className={cn("text-sm text-muted-foreground", className)}>
            <p>{badgeData.reason}</p>
          </div>
        )
    }
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className={cn("bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer animate-in fade-in-0 zoom-in-95 duration-500", className)}>
            <Award className="mr-2 h-4 w-4" />
            Snack Expert!
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badgeData.reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
