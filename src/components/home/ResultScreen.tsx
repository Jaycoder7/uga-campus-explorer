import { useState } from 'react';
import { Check, X, Flame, MapPin, Navigation, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';

interface ResultScreenProps {
  correct: boolean;
  pointsEarned: number;
}

export function ResultScreen({ correct, pointsEarned }: ResultScreenProps) {
  const { gameState, todayChallenge } = useGame();
  const [showDirections, setShowDirections] = useState(false);

  if (!todayChallenge) return null;

  return (
    <div className="animate-scale-in space-y-6">
      {/* Result Header */}
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        {correct ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Correct! 🎉</h2>
            <p className="mt-2 text-lg text-success">+{pointsEarned} points</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-warning">
              <Flame className="h-5 w-5" />
              <span className="font-medium">{gameState.currentStreak} day streak!</span>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Not quite right 😕</h2>
            <p className="mt-2 text-muted-foreground">
              Streak reset. Start a new one tomorrow!
            </p>
          </>
        )}
      </div>

      {/* Location Reveal */}
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            The Answer
          </span>
        </div>
        <h3 className="mt-2 text-xl font-bold text-foreground">
          {todayChallenge.locationName}
        </h3>
        {todayChallenge.buildingCode && (
          <span className="mt-1 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {todayChallenge.buildingCode}
          </span>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {todayChallenge.funFact}
        </p>
      </div>

      {/* Directions (for incorrect answers) */}
      {!correct && (
        <div className="rounded-2xl bg-card shadow-card">
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Get Directions</p>
                <p className="text-sm text-muted-foreground">
                  ~8 minute walk • 0.4 miles
                </p>
              </div>
            </div>
            <span className="text-2xl text-muted-foreground">
              {showDirections ? '−' : '+'}
            </span>
          </button>

          {showDirections && (
            <div className="border-t border-border px-6 pb-6">
              <div className="space-y-3 py-4">
                {todayChallenge.directions.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  // Placeholder - would open native maps
                  alert('This would open your maps app with directions!');
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Maps
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                🎓 Visit this spot to learn more about UGA's history!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Share Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // Placeholder share functionality
          alert('Share feature coming soon!');
        }}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Result
      </Button>
    </div>
  );
}
