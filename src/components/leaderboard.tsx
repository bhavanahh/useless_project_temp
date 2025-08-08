import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'Amma\'s Special Parippuvada', area: 153.9 },
  { rank: 2, name: 'The Colossal Vazhaikkapam', area: 125.6 },
  { rank: 3, name: 'Chettan\'s Crispy Parippuvada', area: 95.0 },
  { rank: 4, name: 'Standard Tea-Stall Vada', area: 78.5 },
  { rank: 5, name: 'Afternoon Delight Vazhaikkapam', area: 65.3 },
];

export default function Leaderboard() {
  return (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <CardTitle className="font-headline">Snack Hall of Fame</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Snack</TableHead>
              <TableHead className="text-right">Area (cm²)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((snack) => (
              <TableRow key={snack.rank}>
                <TableCell className="font-medium">{snack.rank}</TableCell>
                <TableCell>{snack.name}</TableCell>
                <TableCell className="text-right font-mono">{snack.area.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
