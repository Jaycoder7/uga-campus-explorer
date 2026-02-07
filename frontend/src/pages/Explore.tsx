import { PageLayout } from '@/components/layout/PageLayout';
import { Map as MapIcon } from 'lucide-react';

export default function Explore() {
  return (
    <PageLayout title="Campus Locations">
      <div className="rounded-xl bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <MapIcon className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Explore Map</h2>
        <p className="mt-2 text-muted-foreground">
          Interactive campus map with all 50 UGA locations coming soon!
        </p>
      </div>
    </PageLayout>
  );
}
