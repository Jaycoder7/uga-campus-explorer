import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatsBar } from '@/components/home/StatsBar';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { ChallengeImage } from '@/components/home/ChallengeImage';
import { ResultScreen } from '@/components/home/ResultScreen';
import { useGame } from '@/context/GameContext';
import MapPicker from '@/components/ui/MapPicker';
import { UGA_LOCATIONS } from '@/data/locations';

type GamePhase = 'ready' | 'playing' | 'result';

export default function Index() {
  const { gameState, submitGuess, startChallenge, canPlay, todayChallenge } = useGame();
  const [phase, setPhase] = useState<GamePhase>(
    gameState.todayCompleted ? 'result' : 'ready'
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: boolean; points: number; error?: string } | null>(
    gameState.todayCompleted
      ? { correct: gameState.todayCorrect, points: 0 }
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    if (!canPlay) {
      setLastResult({ correct: false, points: 0, error: 'You have already played today. Come back tomorrow!' });
      setPhase('result');
      return;
    }
    startChallenge();
    setPhase('playing');
  };

  const handleMapGuessClick = () => {
    if (!canPlay) {
      setLastResult({ correct: false, points: 0, error: 'You have already played today. Come back tomorrow!' });
      setPhase('result');
      return;
    }
    setShowMapPicker(true);
  };

  const haversine = (a: { lng: number; lat: number }, b: { lng: number; lat: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    
    const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c; // distance in meters
  };

  const handleMapSelect = async (coordinates: { lng: number; lat: number }) => {
    if (!todayChallenge) {
      console.error('❌ No challenge available');
      return;
    }
    
    console.log('🗺️ MAP SELECTION DEBUG:');
    console.log('Selected coordinates:', coordinates);
    console.log('Challenge location ID:', todayChallenge.location);
    console.log('Challenge location name:', todayChallenge.locationName);
    console.log('Challenge coordinates from context:', todayChallenge.coordinates);
    
    setShowMapPicker(false);
    setIsSubmitting(true);
    
    try {
      // Use the coordinates directly from the challenge since the backend/context already provides them
      const targetCoords = { 
        lng: todayChallenge.coordinates.lng, 
        lat: todayChallenge.coordinates.lat 
      };
      
      console.log('🎯 Target coordinates (from challenge):', targetCoords);
      
      // Check if coordinates are close enough to the correct location (within 500ft / 152.4m)
      const radiusMeters = 152.4;
      const distToAnswer = haversine(coordinates, targetCoords);
      
      console.log('📏 Distance to answer:', distToAnswer, 'meters');
      console.log('✅ Within radius?', distToAnswer <= radiusMeters);
      
      let result;
      if (distToAnswer <= radiusMeters) {
        // Close enough - submit the correct location name
        console.log('✅ CORRECT! Submitting:', todayChallenge.locationName);
        result = await submitGuess(todayChallenge.locationName);
      } else {
        // Too far - submit an empty/wrong guess to mark as incorrect
        console.log('❌ INCORRECT! Too far from target');
        result = await submitGuess('wrong answer');
      }
      
      console.log('📊 Result:', result);
      setLastResult(result);
      setPhase('result');
    } catch (error) {
      console.error('🚨 Error in handleMapSelect:', error);
      setLastResult({ correct: false, points: 0, error: 'Failed to submit guess. Please try again.' });
      setPhase('result');
    } finally {
      setIsSubmitting(false);
    }
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
          BullDawg Boundaries
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
         Like a good neighbor, BDB is there!
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
          <ChallengeImage onMapGuess={handleMapGuessClick} />
        )}

        {phase === 'result' && lastResult && (
          <ResultScreen
            correct={lastResult.correct}
            pointsEarned={lastResult.points}
            error={lastResult.error}
          />
        )}
      </div>

      {/* Map Picker */}
      <MapPicker
        isOpen={showMapPicker}
        initial={undefined}
        onClose={() => setShowMapPicker(false)}
        onSelect={handleMapSelect}
      />
    </PageLayout>
  );
}
