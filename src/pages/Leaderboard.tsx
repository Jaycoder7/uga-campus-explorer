import { PageLayout } from '@/components/layout/PageLayout';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  return (
    <PageLayout title="Top Explorers">
      <div className="rounded-xl bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warning/20">
          <Trophy className="h-10 w-10 text-warning" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
        <p className="mt-2 text-muted-foreground">
          Compete with other Dawgs to become the top campus explorer!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Coming soon...</p>
      </div>
    </PageLayout>
  );
}
