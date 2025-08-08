import { cn } from "@/lib/utils";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="text-center space-y-2 animate-in fade-in-0 slide-in-from-top-5 duration-500 relative">
       <div className="absolute top-0 right-0">
        <ThemeToggle />
      </div>
      <h1 className={cn("text-4xl sm:text-5xl md:text-6xl font-bold text-primary", "font-headline")}>
        Oru Kadi Tharatto!
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Ede, aa palaharathinte valippam onn arinjalo? Oru photo pidippiche! 😋
      </p>
    </header>
  );
}
