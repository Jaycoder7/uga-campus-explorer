import { Flame, Star } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export function StatsBar() {
  const { gameState } = useGame();

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
          <Flame className="h-5 w-5 text-warning" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="text-lg font-bold text-foreground">
            {gameState.currentStreak} day{gameState.currentStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Points</p>
          <p className="text-lg font-bold text-foreground">
            {gameState.totalPoints.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
