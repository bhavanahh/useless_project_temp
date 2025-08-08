import Header from '@/components/header';
import SnackAnalyzer from '@/components/snack-analyzer';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 font-body bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        <SnackAnalyzer />
      </div>
    </main>
  );
}
