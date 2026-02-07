export interface Location {
  id: string;
  name: string;
  buildingCode?: string;
  category: 'academic' | 'historic' | 'athletic' | 'residence' | 'dining';
  coordinates: { lat: number; lng: number };
  imageUrl: string;
  funFact: string;
  yearBuilt?: number;
  aliases: string[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  locationName: string;
  buildingCode?: string;
  imageUrl: string;
  hint: string;
  funFact: string;
  coordinates: { lat: number; lng: number };
  directions: string[];
  category: 'academic' | 'historic' | 'athletic' | 'residence' | 'dining';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'total_locations' | 'category_specific' | 'first';
  category?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  currentStreak: number;
  locationsDiscovered: number;
  avatar: string;
}

export interface GameState {
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  completedChallenges: string[];
  todayCompleted: boolean;
  todayCorrect: boolean;
  lastPlayedDate: string;
  discoveredLocations: string[];
  achievements: string[];
}

export interface ChallengeResult {
  challengeId: string;
  date: string;
  locationId: string;
  correct: boolean;
  pointsEarned: number;
}
