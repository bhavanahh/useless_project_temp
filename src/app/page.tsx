import Header from '@/components/header';
import SnackCalculator from '@/components/snack-calculator';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-12 font-body">
      <div className="max-w-4xl mx-auto space-y-12">
        <Header />
        <div className="grid grid-cols-1 gap-12 items-start">
          <div>
            <SnackCalculator />
          </div>
        </div>
      </div>
    </main>
  );
}
