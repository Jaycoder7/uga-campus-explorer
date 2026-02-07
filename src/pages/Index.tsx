import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatsBar } from '@/components/home/StatsBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { ChallengeImage } from '@/components/home/ChallengeImage';
import { GuessModal } from '@/components/home/GuessModal';
import { ResultScreen } from '@/components/home/ResultScreen';
import { useGame } from '@/context/GameContext';

type GamePhase = 'ready' | 'playing' | 'guessing' | 'result';

export default function Index() {
  const { gameState, submitGuess, startChallenge } = useGame();
  const [phase, setPhase] = useState<GamePhase>(
    gameState.todayCompleted ? 'result' : 'ready'
  );
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: boolean; points: number } | null>(
    gameState.todayCompleted
      ? { correct: gameState.todayCorrect, points: 0 }
      : null
  );

  const handleStart = () => {
    startChallenge();
    setPhase('playing');
  };

  const handleGuessClick = () => {
    setShowGuessModal(true);
  };

  const handleGuessSubmit = (guess: string) => {
    setShowGuessModal(false);
    const result = submitGuess(guess);
    setLastResult(result);
    setPhase('result');
  };

  const handleViewResults = () => {
    setLastResult({ correct: gameState.todayCorrect, points: 0 });
    setPhase('result');
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          UGA Campus Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover campus one location at a time
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Main Content */}
      <div className="space-y-6">
        {phase === 'ready' && (
          <ChallengeCard
            onStart={handleStart}
            onViewResults={handleViewResults}
          />
        )}

        {phase === 'playing' && (
          <ChallengeImage onGuess={handleGuessClick} />
        )}

        {phase === 'result' && lastResult && (
          <ResultScreen
            correct={lastResult.correct}
            pointsEarned={lastResult.points}
          />
        )}
      </div>

      {/* Guess Modal */}
      <GuessModal
        open={showGuessModal}
        onClose={() => setShowGuessModal(false)}
        onSubmit={handleGuessSubmit}
      />
    </PageLayout>
  );
}
