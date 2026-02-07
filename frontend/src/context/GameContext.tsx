import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, DailyChallenge } from '@/types/game';
import { MOCK_CHALLENGES, UGA_LOCATIONS } from '@/data/locations';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';

interface GameContextType {
  gameState: GameState;
  todayChallenge: DailyChallenge | null;
  startChallenge: () => void;
  submitGuess: (guess: string) => { correct: boolean; points: number };
  resetGame: () => void;
  isLoading: boolean;
  lastMapDistance?: number | null;
  setLastMapDistance?: (d: number | null) => void;
  mapView?: { center: [number, number]; zoom: number } | null;
  setMapView?: (v: { center: [number, number]; zoom: number } | null) => void;
}

const STORAGE_KEY = 'uga-explorer-state';

const defaultGameState: GameState = {
  currentStreak: 0,
  bestStreak: 0,
  totalPoints: 0,
  completedChallenges: [],
  todayCompleted: false,
  todayCorrect: false,
  lastPlayedDate: '',
  discoveredLocations: [],
  achievements: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

function getChallengeForDate(date: Date): DailyChallenge {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Check if there's a mock challenge for this date
  const mockChallenge = MOCK_CHALLENGES.find(c => c.date === dateStr);
  if (mockChallenge) {
    return mockChallenge;
  }
  
  // Generate a deterministic challenge based on date
  const dateNumber = parseInt(format(date, 'yyyyMMdd'));
  const locationIndex = Math.abs(Math.floor(Math.sin(dateNumber) * 10000)) % UGA_LOCATIONS.length;
  const location = UGA_LOCATIONS[locationIndex];
  
  return {
    id: `generated-${dateStr}`,
    date: dateStr,
    locationName: location.name,
    buildingCode: location.buildingCode,
    imageUrl: location.imageUrl,
    hint: `This ${location.category} location is a popular campus spot.`,
    funFact: location.funFact,
    coordinates: location.coordinates,
    directions: [
      'Start at Tate Student Center',
      `Head towards ${location.category === 'athletic' ? 'South Campus' : 'North Campus'}`,
      `Look for the ${location.name} building`,
      'You\'ll recognize it by its distinctive architecture',
    ],
    category: location.category,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [lastMapDistance, setLastMapDistance] = useState<number | null>(null);
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number } | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: GameState = JSON.parse(stored);
          const today = format(new Date(), 'yyyy-MM-dd');
          
          // Check if we need to reset streak due to missed day
          if (parsed.lastPlayedDate) {
            const lastPlayed = parseISO(parsed.lastPlayedDate);
            const daysDiff = differenceInDays(new Date(), lastPlayed);
            
            if (daysDiff > 1) {
              // Streak broken - missed a day
              parsed.currentStreak = 0;
            }
            
            // Check if today's challenge is completed
            if (parsed.lastPlayedDate !== today) {
              parsed.todayCompleted = false;
              parsed.todayCorrect = false;
            }
          }
          
          setGameState(parsed);
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
    setTodayChallenge(getChallengeForDate(new Date()));
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoading]);

  const startChallenge = () => {
    // Challenge has started, no state change needed
  };

  const submitGuess = (guess: string): { correct: boolean; points: number } => {
    if (!todayChallenge) return { correct: false, points: 0 };

    const normalizedGuess = guess.toLowerCase().trim();
    const correctAnswer = todayChallenge.locationName.toLowerCase();
    const location = UGA_LOCATIONS.find(
      l => l.name.toLowerCase() === correctAnswer
    );
    
    // Check if guess matches location name or any alias
    const isCorrect = 
      normalizedGuess === correctAnswer ||
      location?.aliases.some(alias => alias.toLowerCase() === normalizedGuess) ||
      (location?.buildingCode && normalizedGuess === location.buildingCode.toLowerCase());

    let pointsEarned = 0;
    const today = format(new Date(), 'yyyy-MM-dd');

    if (isCorrect) {
      // Base points
      pointsEarned = 50;
      
      // First discovery bonus
      if (location && !gameState.discoveredLocations.includes(location.id)) {
        pointsEarned += 25;
      }
      
      // Streak multiplier
      const newStreak = gameState.currentStreak + 1;
      if (newStreak >= 10) {
        pointsEarned = Math.floor(pointsEarned * 2);
      } else if (newStreak >= 5) {
        pointsEarned = Math.floor(pointsEarned * 1.5);
      }
    }

    setGameState(prev => {
      const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const newDiscovered = location && isCorrect && !prev.discoveredLocations.includes(location.id)
        ? [...prev.discoveredLocations, location.id]
        : prev.discoveredLocations;
      
      // Check for new achievements
      const newAchievements = [...prev.achievements];
      
      // First Steps
      if (!newAchievements.includes('ach-001') && prev.completedChallenges.length === 0) {
        newAchievements.push('ach-001');
      }
      
      // Week Warrior
      if (!newAchievements.includes('ach-002') && newStreak >= 7) {
        newAchievements.push('ach-002');
      }
      
      // Explorer
      if (!newAchievements.includes('ach-003') && newDiscovered.length >= 10) {
        newAchievements.push('ach-003');
      }

      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalPoints: prev.totalPoints + pointsEarned,
        completedChallenges: [...prev.completedChallenges, todayChallenge.id],
        todayCompleted: true,
        todayCorrect: isCorrect,
        lastPlayedDate: today,
        discoveredLocations: newDiscovered,
        achievements: newAchievements,
      };
    });

    return { correct: isCorrect, points: pointsEarned };
  };

  const resetGame = () => {
    setGameState(defaultGameState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        todayChallenge,
        startChallenge,
        submitGuess,
        resetGame,
        isLoading,
        lastMapDistance,
        setLastMapDistance,
        mapView,
        setMapView,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
