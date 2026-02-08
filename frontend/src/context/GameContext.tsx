import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, DailyChallenge } from '@/types/game';
import { MOCK_CHALLENGES, UGA_LOCATIONS, LOCATION_MODELS } from '@/data/locations';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

interface GameContextType {
  gameState: GameState;
  todayChallenge: DailyChallenge | null;
  startChallenge: () => void;
  submitGuess: (guess: string) => Promise<{ correct: boolean; points: number; error?: string }>;
  exploreLocation: () => Promise<{ success: boolean; points: number; streakPreserved: boolean; error?: string }>;
  resetGame: () => void;
  refreshChallenge: () => void;
  refreshStats: () => Promise<void>;
  isLoading: boolean;
  canPlay: boolean;
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

function getLocationHint(location: Location): string {
  switch (location.id) {
    case 'loc-021': // Georgia Museum of Art
      return 'This cultural landmark houses thousands of works and is the official art museum of Georgia.';
    case 'loc-022': // Turtle Pond
      return 'A peaceful spot on campus where nature lovers gather to watch the local wildlife basking on logs.';
    case 'loc-023': // Hardman Hall
      return 'This historic academic building features a beautiful green lawn and classical architecture.';
    default:
      return `This ${location.category} location is a popular campus spot.`;
  }
}

function getChallengeForDate(date: Date): DailyChallenge {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  console.log('🎯 CHALLENGE GENERATION DEBUG:');
  console.log('Date:', dateStr);
  
  // Check if there's a mock challenge for this date
  const mockChallenge = MOCK_CHALLENGES.find(c => c.date === dateStr);
  if (mockChallenge) {
    console.log('📋 Using MOCK challenge:', mockChallenge.locationName);
    console.log('📍 Mock challenge location ID:', mockChallenge.location);
    console.log('🗂️ Mock challenge coordinates:', mockChallenge.coordinates);
    return mockChallenge;
  }
  
  // Filter locations that have 3D models
  const locationsWithModels = UGA_LOCATIONS.filter(loc => 
    loc.id && LOCATION_MODELS[loc.id]
  );
  
  console.log('🏢 Available locations with models:', locationsWithModels.map(l => ({
    id: l.id,
    name: l.name,
    model: LOCATION_MODELS[l.id!]
  })));
  
  if (locationsWithModels.length === 0) {
    throw new Error('No locations with 3D models available');
  }
  
  // For testing, use current time in milliseconds to get different locations more often
  const now = new Date();
  // TEST MODE: Change location every 30 seconds for rapid testing
  const seed = parseInt(format(date, 'yyyyMMdd')) + Math.floor(now.getTime() / (1000 * 30)); // Change every 30 seconds
  const locationIndex = Math.abs(seed) % locationsWithModels.length;
  const location = locationsWithModels[locationIndex];
  
  console.log('🎲 Seed value:', seed);
  console.log('📍 Selected location index:', locationIndex);
  console.log('🏛️ SELECTED LOCATION:', {
    id: location.id,
    name: location.name,
    category: location.category,
    coordinates: location.coordinates,
    model: LOCATION_MODELS[location.id!]
  });
  
  const generatedChallenge = {
    id: `generated-${dateStr}`,
    date: dateStr,
    location: location.id!,
    locationName: location.name,
    buildingCode: location.buildingCode || '',
    imageUrl: location.imageUrl || '/placeholder.svg',
    hint: getLocationHint(location),
    funFact: location.funFact || '',
    coordinates: location.coordinates,
    directions: [
      'Start at Tate Student Center',
      `Head towards ${location.category === 'athletic' ? 'South Campus' : 'North Campus'}`,
      `Look for the ${location.name} building`,
      'You\'ll recognize it by its distinctive architecture',
    ],
    category: location.category,
  };
  
  console.log('✅ GENERATED CHALLENGE:', generatedChallenge);
  return generatedChallenge;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [canPlay, setCanPlay] = useState<boolean>(true);
  const [lastMapDistance, setLastMapDistance] = useState<number | null>(null);
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number } | null>(null);

  // Test mode detection
  const isTestMode = process.env.NODE_ENV === 'development' || window.location.search.includes('test=true');
  
  // Debug test mode
  console.log('🔧 TEST MODE DEBUG:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('URL search:', window.location.search);
  console.log('Is Test Mode:', isTestMode);

  // Load today's challenge from backend (which now uses locations.ts)
  useEffect(() => {
    const loadTodayChallenge = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Try to fetch from backend first (backend now uses locations.js)
          try {
            const response = await fetch('http://localhost:3001/api/challenges/today', {
              headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              }
            });
            
            if (response.ok) {
              const challengeData = await response.json();
              if (challengeData.success) {
                const challenge = challengeData.data;
                setCanPlay(challenge.can_play);
                
                // Convert backend challenge to frontend format
                const frontendChallenge: DailyChallenge = {
                  id: challenge.id,
                  date: challenge.challenge_date,
                  location: challenge.location.id,
                  locationName: challenge.location.name || '',
                  buildingCode: challenge.location.building_code || '',
                  imageUrl: challenge.location.image_url || '',
                  hint: challenge.hint,
                  funFact: challenge.location.fun_fact || '',
                  coordinates: { lat: challenge.location.latitude, lng: challenge.location.longitude },
                  directions: challenge.directions || [],
                  category: challenge.location.category
                };
                
                setTodayChallenge(frontendChallenge);
                
                // Update game state based on attempt status
                setGameState(prev => ({
                  ...prev,
                  todayCompleted: challenge.attempted,
                  todayCorrect: challenge.user_attempt?.correct || false
                }));
              }
            } else {
              throw new Error('Backend not available');
            }
          } catch (backendError) {
            console.log('💻 Backend not available, using local challenge generation');
            // Fallback to local challenge generation from locations.ts
            setTodayChallenge(getChallengeForDate(new Date()));
            
            if (!isTestMode) {
              // Check localStorage for daily restriction in production only
              const today = format(new Date(), 'yyyy-MM-dd');
              const lastPlayedDate = localStorage.getItem('lastPlayedDate');
              setCanPlay(lastPlayedDate !== today);
            } else {
              console.log('🧪 TEST MODE: Multiple plays allowed');
              setCanPlay(true);
            }
          }
        } else {
          // Not authenticated, use local challenge generation
          console.log('👤 Not authenticated, using local challenge generation');
          setTodayChallenge(getChallengeForDate(new Date()));
        }
        
        // Load game state from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: GameState = JSON.parse(stored);
          const today = format(new Date(), 'yyyy-MM-dd');
          
          // Check if today's challenge is completed
          if (parsed.lastPlayedDate !== today) {
            parsed.todayCompleted = false;
            parsed.todayCorrect = false;
          }
          
          setGameState(parsed);
        }
        
      } catch (error) {
        console.error('Failed to load today\'s challenge:', error);
        // Fallback to local challenge generation
        setTodayChallenge(getChallengeForDate(new Date()));
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayChallenge();
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

  const submitGuess = async (guess: string): Promise<{ correct: boolean; points: number; error?: string }> => {
    if (!todayChallenge) return { correct: false, points: 0, error: 'No challenge available' };
    
    if (!canPlay) {
      return { correct: false, points: 0, error: 'You have already played today. Come back tomorrow!' };
    }

    try {
      console.log('🎯 GUESS SUBMISSION DEBUG:');
      console.log('Guess:', guess);
      console.log('Challenge location:', todayChallenge.locationName);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try backend first if user is authenticated
      if (user) {
        try {
          const session = await supabase.auth.getSession();
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`
          };
          
          if (isTestMode) {
            headers['x-test-mode'] = 'true';
            console.log('🧪 Sending test mode header');
          }
          
          const response = await fetch('http://localhost:3001/api/challenges/submit', {
            method: 'POST',
            headers,
            body: JSON.stringify({ guess })
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
              const { correct, points_earned, user_stats } = result.data;
              
              console.log('✅ BACKEND SUBMISSION SUCCESS:', { correct, points_earned, user_stats });
              
              // Update local state with actual backend data for consistency
              setGameState(prev => ({
                ...prev,
                todayCompleted: true,
                todayCorrect: correct,
                // Use backend stats for consistency across all pages
                totalPoints: user_stats.total_points,
                currentStreak: user_stats.current_streak,
                bestStreak: user_stats.best_streak,
              }));
              
              // In test mode, reset canPlay immediately to allow another attempt
              if (isTestMode) {
                console.log('🧪 TEST MODE: Resetting canPlay immediately for next attempt');
                setCanPlay(true);
                // Force refresh challenge for new location
                setTimeout(() => {
                  setTodayChallenge(getChallengeForDate(new Date()));
                }, 100);
              } else {
                // Mark that user can't play again today
                setCanPlay(false);
              }
              
              return { correct, points: points_earned };
            }
          } else {
            const errorData = await response.json();
            if (response.status === 400) {
              return { correct: false, points: 0, error: errorData.error || 'Already played today' };
            }
            throw new Error('Backend submission failed');
          }
        } catch (backendError) {
          console.log('💻 Backend submission failed, using local validation');
        }
      }
      
      // Fallback to local validation
      console.log('🏠 LOCAL VALIDATION FALLBACK');
      
      // Find the correct location from locations.ts
      const correctLocation = UGA_LOCATIONS.find(loc => loc.id === todayChallenge.location);
      
      if (!correctLocation) {
        return { correct: false, points: 0, error: 'Location data not found' };
      }
      
      // Check if guess is correct (either by name, building code, or aliases)
      const normalizedGuess = guess.toLowerCase().trim();
      const correctAnswer = correctLocation.name.toLowerCase();
      
      const isCorrect = 
        normalizedGuess === correctAnswer ||
        (correctLocation.buildingCode && normalizedGuess === correctLocation.buildingCode.toLowerCase()) ||
        correctLocation.aliases.some(alias => alias.toLowerCase() === normalizedGuess);
      
      console.log('✅ LOCAL: Is correct?', isCorrect);
      
      let pointsEarned = 0;
      if (isCorrect) {
        pointsEarned = 100; // Base points for correct guess
      }
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Update local state
      setGameState(prev => {
        const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
        return {
          ...prev,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          totalPoints: prev.totalPoints + pointsEarned,
          todayCompleted: true,
          todayCorrect: isCorrect,
          lastPlayedDate: today,
          completedChallenges: [...prev.completedChallenges, todayChallenge.id],
          discoveredLocations: isCorrect && !prev.discoveredLocations.includes(correctLocation.id!) 
            ? [...prev.discoveredLocations, correctLocation.id!]
            : prev.discoveredLocations
        };
      });
      
      // Mark as played today in localStorage
      localStorage.setItem('lastPlayedDate', today);
      
      // Mark that user can't play again today
      setCanPlay(false);
      
      console.log('📊 LOCAL: Points earned:', pointsEarned);
      
      return { correct: isCorrect, points: pointsEarned };
    } catch (error) {
      console.error('Error submitting guess:', error);
      return { correct: false, points: 0, error: 'Failed to process guess. Please try again.' };
    }
  };

  const resetGame = () => {
    setGameState(defaultGameState);
    localStorage.removeItem(STORAGE_KEY);
    setTodayChallenge(getChallengeForDate(new Date()));
  };

  const exploreLocation = async (): Promise<{ success: boolean; points: number; streakPreserved: boolean; error?: string }> => {
    if (!canPlay) {
      return { success: false, points: 0, streakPreserved: false, error: 'You have already played today. Come back tomorrow!' };
    }

    try {
      console.log('🧭 FRONTEND: Calling explore endpoint');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, points: 0, streakPreserved: false, error: 'Please log in to explore locations' };
      }

      // Try backend first
      try {
        const session = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        };
        
        if (isTestMode) {
          headers['x-test-mode'] = 'true';
        }
        
        const response = await fetch('http://localhost:3001/api/challenges/explore', {
          method: 'POST',
          headers
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            const { points_earned, streak_preserved, new_streak, user_stats } = result.data;
            
            console.log('✅ BACKEND EXPLORE SUCCESS:', { points_earned, streak_preserved, new_streak, user_stats });
            
            // Update local state with backend stats for consistency
            setGameState(prev => ({
              ...prev,
              todayCompleted: true,
              todayCorrect: false, // They explored, didn't guess correctly
              totalPoints: user_stats.total_points,
              currentStreak: user_stats.current_streak,
              bestStreak: user_stats.best_streak,
            }));
            
            // In test mode, reset canPlay immediately
            if (isTestMode) {
              console.log('🧪 TEST MODE: Resetting canPlay immediately after explore');
              setCanPlay(true);
              setTimeout(() => {
                setTodayChallenge(getChallengeForDate(new Date()));
              }, 100);
            } else {
              // Mark that user can't play again today
              setCanPlay(false);
            }
            
            return { success: true, points: points_earned, streakPreserved: streak_preserved };
          }
        } else {
          const errorData = await response.json();
          if (response.status === 400) {
            return { success: false, points: 0, streakPreserved: false, error: errorData.error || 'Already played today' };
          }
          throw new Error('Backend explore failed');
        }
      } catch (backendError) {
        console.log('💻 Backend explore failed, using local fallback');
      }
      
      // Fallback to local handling
      console.log('🏠 LOCAL EXPLORE FALLBACK');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const explorePoints = 25;
      
      // Update local state
      setGameState(prev => {
        // When exploring locally, preserve the streak (user gets benefit of the doubt)
        const newStreak = Math.max(prev.currentStreak, 1); // At least maintain current streak
        return {
          ...prev,
          todayCompleted: true,
          todayCorrect: false,
          totalPoints: prev.totalPoints + explorePoints,
          currentStreak: newStreak,
          lastPlayedDate: today,
        };
      });
      
      // Mark as played today in localStorage
      localStorage.setItem('lastPlayedDate', today);
      
      // Mark that user can't play again today
      setCanPlay(false);
      
      console.log('🧭 LOCAL EXPLORE: Points earned:', explorePoints);
      
      return { success: true, points: explorePoints, streakPreserved: true };
    } catch (error) {
      console.error('Error exploring location:', error);
      return { success: false, points: 0, streakPreserved: false, error: 'Failed to explore location. Please try again.' };
    }
  };

  const refreshChallenge = () => {
    // Force regenerate today's challenge - useful for testing
    console.log('🔄 REFRESHING CHALLENGE - This will generate a new challenge!');
    const newChallenge = getChallengeForDate(new Date());
    setTodayChallenge(newChallenge);
    console.log('🎯 NEW CHALLENGE GENERATED:', newChallenge);
  };

  const refreshStats = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`http://localhost:3001/api/users/${user.id}/stats`);
      if (response.ok) {
        const stats = await response.json();
        console.log('📊 Refreshed stats from backend:', stats);
        
        setGameState(prev => ({
          ...prev,
          totalPoints: stats.total_points || 0,
          currentStreak: stats.current_streak || 0,
          bestStreak: stats.best_streak || 0
        }));
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        todayChallenge,
        startChallenge,
        submitGuess,
        exploreLocation,
        resetGame,
        refreshChallenge,
        refreshStats,
        isLoading,
        canPlay,
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
