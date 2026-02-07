import { format } from 'date-fns';
import { MapPin, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { CountdownTimer } from './CountdownTimer';

interface ChallengeCardProps {
  onStart: () => void;
  onViewResults: () => void;
}

export function ChallengeCard({ onStart, onViewResults }: ChallengeCardProps) {
  const { gameState, todayChallenge } = useGame();

  if (!todayChallenge) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        <p className="text-muted-foreground">Loading challenge...</p>
      </div>
    );
  }

  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="animate-slide-up overflow-hidden rounded-2xl bg-card shadow-card">
      {/* Header badge */}
      <div className="bg-primary px-6 py-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/80">
          Today's Challenge
        </p>
        <p className="text-lg font-bold text-primary-foreground">{today}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium text-foreground">
            {gameState.todayCompleted
              ? gameState.todayCorrect
                ? '✓ Challenge Complete!'
                : '✗ Better luck next time!'
              : 'Ready to explore!'}
          </span>
        </div>

        {/* Action Button */}
        {gameState.todayCompleted ? (
          <Button
            onClick={onViewResults}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            size="lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            View Results
          </Button>
        ) : (
          <Button
            onClick={onStart}
            className="w-full animate-pulse-glow bg-primary text-primary-foreground shadow-button hover:bg-primary/90"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Challenge
          </Button>
        )}

        {/* Countdown */}
        <div className="mt-6">
          <CountdownTimer />
        </div>
      </div>
    </div>
  );
}
