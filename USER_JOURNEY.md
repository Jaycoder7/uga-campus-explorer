# Complete User Journey - Points & Account System

## 🔐 Authentication & Account

### Registration Flow
```
User fills signup form
  ↓ email, password, username
Backend: POST /api/auth/register
  ├─ Create user in Supabase Auth
  ├─ Create user profile in 'users' table
  │   ├─ id: UUID (from auth)
  │   ├─ username: unique identifier
  │   ├─ total_points: 0
  │   ├─ current_streak: 0
  │   └─ best_streak: 0
  └─ Return JWT token + user data
  
Frontend receives JWT
  └─ Stored in Supabase session (not localStorage)
     (survives page refresh, cleared on logout)
```

### Login Flow
```
User enters email & password
  ↓
Frontend: supabase.auth.signInWithPassword()
  ├─ Validates credentials with Supabase Auth
  └─ Returns session with JWT access_token
  
Frontend: fetchWithAuth("POST /api/users/sync")
  └─ Backend confirms user profile exists
  
Frontend: redirects to /
  └─ GameContext loads user's current challenge
```

## 🎮 Playing & Earning Points

### Daily Challenge Flow

```
1. LOAD CHALLENGE
   Frontend: GameContext useEffect
   └─ fetchWithAuth("GET /api/challenges/today")
      └─ Backend receives request with JWT
         ├─ Verifies JWT token
         ├─ Loads user profile from 'users' table
         ├─ Generates today's challenge from locations.js
         ├─ Checks if user already played today
         └─ Returns: { challenge, can_play: boolean }

2. VIEW 3D MODEL
   Frontend: ChallengeImage component
   └─ Displays 3D model of location
   └─ User tries to identify the location

3. SUBMIT GUESS
   Frontend: GuessModal
   └─ User enters location name
   └─ GameContext.submitGuess(guess)
      └─ fetchWithAuth("POST /api/challenges/submit", { guess })
         └─ Backend:
            ├─ Validates JWT → Gets user profile
            ├─ Gets today's challenge
            ├─ Checks guess against:
            │  ├─ Location name
            │  ├─ Building code
            │  └─ Aliases
            │
            ├─ IF CORRECT:
            │  ├─ pointsEarned = 100
            │  ├─ Calculate new streak
            │  └─ Update best_streak if needed
            │
            ├─ UPDATE DATABASE:
            │  Update users table:
            │  ├─ total_points += pointsEarned  ⭐ SAVED HERE
            │  ├─ current_streak = newStreak
            │  ├─ best_streak = max(best_streak, newStreak)
            │  └─ last_played_date = now
            │
            └─ RETURN { correct, points_earned, user_stats }

4. SHOW RESULT
   Frontend receives response
   └─ Updates local state with backend stats
      ├─ gameState.totalPoints = 1250 (from backend)
      ├─ gameState.currentStreak = 5
      └─ gameState.bestStreak = 10
   
   └─ ResultScreen shows:
      ├─ Correct/Incorrect
      ├─ Location revealed
      ├─ Fun fact
      └─ Points earned

5. STATS PERSIST
   ✅ Points saved in Supabase 'users' table
   ✅ Challenge recorded in 'challenge_attempts' table
   └─ Even if user closes browser, stats persist!
```

## 💾 Data Storage (Supabase)

### Users Table
```sql
users {
  id: UUID (from auth.users)
  username: TEXT
  total_points: INTEGER        ⭐ Main points counter
  current_streak: INTEGER       ⭐ Days in a row played
  best_streak: INTEGER          ⭐ Highest streak achieved
  last_played_date: TIMESTAMP   ⭐ For daily restriction
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Challenge Attempts Table
```sql
challenge_attempts {
  id: UUID
  user_id: UUID (FK to users)
  challenge_id: UUID (FK to daily_challenges)
  guess: TEXT                   ← What user guessed
  correct: BOOLEAN              ← Was it right?
  points_earned: INTEGER        ⭐ Points for this attempt
  attempted_at: TIMESTAMP
}
```

## 🔄 State Management

### Frontend State (GameContext)
```typescript
gameState {
  currentStreak: 5          ← Today's streak status
  bestStreak: 10            ← All-time best
  totalPoints: 1250         ← All-time points
  completedChallenges: []   ← Guessed locations
  todayCompleted: true      ← Already played today?
  todayCorrect: true        ← Did user guess correctly?
  lastPlayedDate: "2026-02-07"
  discoveredLocations: []   ← Locations user found
  achievements: []          ← Earned badges
}

// Synced from backend response:
⭐ Always set from backend response to stay in sync
```

### localStorage (Backup)
```javascript
{
  "uga-explorer-state": {
    // Same as gameState
    // Used if backend is down
    // Synced back to database when backend recovers
  }
}
```

## 🔗 API Requests Flow

### Request Structure
```javascript
// Frontend
const response = await fetchWithAuth(
  'http://localhost:3001/api/challenges/submit',
  {
    method: 'POST',
    body: JSON.stringify({ guess: 'Turtle Pond' })
  }
);

// fetchWithAuth does this:
// 1. Gets JWT token from Supabase session
// 2. Adds to headers: Authorization: Bearer <JWT>
// 3. Sends fetch request
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "correct": true,
    "points_earned": 100,
    "first_discovery": true,
    "location": {
      "name": "Turtle Pond",
      "fun_fact": "Home to native Georgia turtles..."
    },
    "user_stats": {
      "current_streak": 5,
      "best_streak": 10,
      "total_points": 1250
    }
  }
}
```

## 📊 Complete Points Flow Example

```
SCENARIO: User plays game for 5 days

DAY 1:
  Guess: "Turtle Pond" (correct)
  Backend: total_points = 0 + 100 = 100, streak = 1
  Database: users.total_points = 100
  
DAY 2:
  Guess: "Art Museum" (correct)
  Backend: total_points = 100 + 100 = 200, streak = 2
  Database: users.total_points = 200
  
DAY 3:
  Guess: "Random Place" (incorrect)
  Backend: points = 200 + 0 = 200, streak = 0 (reset)
  Database: users.total_points = 200
  
DAY 4:
  Miss the challenge (can't play twice per day)
  Database: still 200 (no change)
  
DAY 5:
  Guess: "Hardman Hall" (correct)
  Backend: total_points = 200 + 100 = 300, streak = 1 (restarted)
  Database: users.total_points = 300

✅ Final Score: 300 points, 1 day streak
✅ All saved to Supabase - survives browser clear!
```

## 🛡️ Security & Validation

### Backend Validation
```javascript
// Every guess submission:
1. Verify JWT token valid
2. Load user from database
3. Check user can still play today
4. Load correct location
5. Validate guess against location data
6. Calculate points safely
7. Update database atomically
8. Return response
```

### Frontend Validation
```typescript
// Client-side checks (for UX):
1. User is authenticated
2. User can play today
3. Guess is not empty
4. Challenge is loaded

// But:
⚠️ Backend always rechecks everything
⚠️ Never trust client validation for points
```

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Set FRONTEND_URL correctly in backend
- [ ] Use HTTPS for all requests
- [ ] Set NODE_ENV=production
- [ ] Use service role key securely (only in backend)
- [ ] Enable RLS on Supabase tables
- [ ] Set up environment variables
- [ ] Test offline behavior
- [ ] Monitor points calculations
- [ ] Set up logging/monitoring

### Database Backups
```sql
-- Query total points distributed
SELECT SUM(total_points) FROM users;

-- Query today's attempts
SELECT user_id, COUNT(*), SUM(points_earned) 
FROM challenge_attempts 
WHERE DATE(attempted_at) = TODAY()
GROUP BY user_id;

-- Find top players
SELECT username, total_points, current_streak, best_streak
FROM users
ORDER BY total_points DESC
LIMIT 10;
```

## 🎯 Next Features

1. **Leaderboard**
   - Query `users` table sorted by total_points DESC
   - Show username, points, streak

2. **Achievements**
   - 7-day streak badge
   - 30-day streak badge
   - All locations discovered
   - Perfect week (7/7 correct)

3. **Offline Support**
   - Queue guesses when offline
   - Sync when back online
   - Service worker

4. **Statistics Dashboard**
   - Points over time graph
   - Accuracy percentage
   - Category breakdown
   - Daily activity chart

5. **Multiplayer**
   - Friend challenges
   - Daily leaderboard resets
   - Seasonal competitions
