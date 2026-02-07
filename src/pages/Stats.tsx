import { PageLayout } from '@/components/layout/PageLayout';
import { Star, Flame, Trophy, MapPin } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export default function Stats() {
  const { gameState } = useGame();

  const stats = [
    {
      icon: Star,
      label: 'Total Points',
      value: gameState.totalPoints.toLocaleString(),
      color: 'text-primary',
      bg: 'bg-primary/20',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: gameState.currentStreak,
      color: 'text-warning',
      bg: 'bg-warning/20',
    },
    {
      icon: Trophy,
      label: 'Best Streak',
      value: gameState.bestStreak,
      color: 'text-success',
      bg: 'bg-success/20',
    },
    {
      icon: MapPin,
      label: 'Locations',
      value: `${gameState.discoveredLocations.length}/50`,
      color: 'text-accent-foreground',
      bg: 'bg-accent',
    },
  ];

  return (
    <PageLayout title="Your Progress">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-xl bg-card p-4 text-center shadow-card"
          >
            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for more content */}
      <div className="mt-8 rounded-xl bg-card p-6 text-center shadow-card">
        <p className="text-muted-foreground">
          Full stats page with calendar view, history, and achievements coming soon!
        </p>
      </div>
    </PageLayout>
  );
}
