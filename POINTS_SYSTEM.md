# UGA Campus Explorer - Points System Architecture

## Overview

The points system tracks player progress and persists it to a Supabase database. Each user has a unique account with stats that survive browser storage clearing.

## Architecture Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                              │
│  1. User logs in via Supabase Auth                          │
│  2. Supabase returns session with JWT access_token          │
│  3. JWT stored in Supabase session (not localStorage!)       │
│  4. fetchWithAuth() helper adds JWT to all API requests     │
└──────────────────┬───────────────────────────────────────────┘
                   │ Authorization: Bearer <JWT_TOKEN>
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                          │
│                                                              │
│  1. Receives request with JWT in Authorization header       │
│  2. protect middleware verifies JWT with Supabase          │
│  3. Loads user profile from users table                     │
│  4. Calculates points and updates user stats                │
│  5. Returns updated stats to frontend                       │
└──────────────────┬───────────────────────────────────────────┘
                   │ JSON response with updated stats
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE                               │
│                                                              │
│  users table:                                               │
│  ├─ id (UUID, from auth.users)                             │
│  ├─ username                                                │
│  ├─ current_streak (INTEGER)                                │
│  ├─ best_streak (INTEGER)                                   │
│  ├─ total_points (INTEGER)  ◄── UPDATED HERE              │
│  └─ last_played_date                                        │
│                                                              │
│  challenge_attempts table:                                  │
│  ├─ user_id                                                 │
│  ├─ challenge_id                                            │
│  ├─ guess                                                   │
│  ├─ correct (BOOLEAN)                                       │
│  └─ points_earned  ◄── TRACKED HERE                        │
└──────────────────────────────────────────────────────────────┘
```

## Step-by-Step: How Points Get Saved

### 1. **User Submits Guess**
```
Frontend: user clicks "Submit" in GuessModal
         └─> GameContext.submitGuess(guess)
```

### 2. **Frontend Gets JWT Token**
```tsx
// In GameContext.tsx
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // Proceed with authenticated request
}
```

### 3. **Frontend Makes API Request with JWT**
```tsx
// Using fetchWithAuth helper
const response = await fetchWithAuth('http://localhost:3001/api/challenges/submit', {
  method: 'POST',
  body: JSON.stringify({ guess })
});
// fetchWithAuth automatically adds:
// Authorization: Bearer <JWT_TOKEN>
```

### 4. **Backend Verifies JWT**
```javascript
// In auth.js protect middleware
const { data: authData, error } = await supabaseAdmin.auth.getUser(token);
// If valid: req.authUser = Supabase user
//          req.user = user profile from database
```

### 5. **Backend Validates Guess and Calculates Points**
```javascript
// In challengeController.js submitGuess()
const isCorrect = checkGuess(guess, correctLocation);

if (isCorrect) {
  pointsEarned = 100; // Base points
  newStreak = calculateNewStreak();
}

// Update user stats in database
await supabaseAdmin
  .from('users')
  .update({
    current_streak: newStreak,
    best_streak: newBestStreak,
    total_points: newTotalPoints,  // <-- SAVED HERE
    last_played_date: now
  })
  .eq('id', req.user.id);
```

### 6. **Backend Returns Updated Stats**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "points_earned": 100,
    "user_stats": {
      "total_points": 1250,
      "current_streak": 5,
      "best_streak": 10
    }
  }
}
```

### 7. **Frontend Updates Local State**
```tsx
// In GameContext.tsx
setGameState(prev => ({
  ...prev,
  totalPoints: user_stats.total_points,      // 1250
  currentStreak: user_stats.current_streak,  // 5
  bestStreak: user_stats.best_streak,        // 10
  todayCompleted: true,
  todayCorrect: true
}));

// Also saved to localStorage as backup
localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
```

## Key Points

### ✅ Why This Works

1. **Database is Source of Truth**
   - Points ALWAYS saved to Supabase `users.total_points`
   - Backend validates and calculates all points
   - Frontend never directly updates database

2. **JWT Token Enables Authentication**
   - Supabase provides session with JWT token
   - `fetchWithAuth()` adds token to all requests
   - Backend verifies token before accepting changes

3. **Stats Survive Cache Clear**
   - Even if browser cache/localStorage is cleared
   - Stats remain in Supabase database
   - Next login will restore them from database

4. **Fallback to Database Sync**
   - If backend calculation fails but user is authenticated
   - Frontend can call `/api/users/sync-stats` to manually sync
   - Ensures no points are lost

### Environment Variables Required

**Frontend (.env.local)**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env.local)**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:8085
NODE_ENV=development
```

## API Endpoints

### POST /api/challenges/submit
- **Auth**: Required (JWT token)
- **Body**: `{ guess: string }`
- **Returns**: 
  ```json
  {
    "success": true,
    "data": {
      "correct": boolean,
      "points_earned": number,
      "user_stats": {
        "current_streak": number,
        "best_streak": number,
        "total_points": number
      }
    }
  }
  ```

### POST /api/users/sync-stats
- **Auth**: Required (JWT token)
- **Body**: 
  ```json
  {
    "currentStreak": number,
    "bestStreak": number,
    "totalPoints": number,
    "lastPlayedDate": string
  }
  ```
- **Returns**: Updated user stats

### GET /api/challenges/today
- **Auth**: Required (JWT token)
- **Returns**: Today's challenge with can_play status

## Testing the Flow

1. **Register a new user**
   ```bash
   POST http://localhost:3001/api/auth/register
   {
     "email": "test@example.com",
     "password": "password123",
     "username": "testuser"
   }
   ```

2. **Login**
   - Frontend: Navigate to /login, enter credentials
   - Supabase returns session with JWT

3. **Submit a Guess**
   - Frontend: View challenge, guess location, click "I know this place"
   - Backend validates, awards points
   - Database updated with new total_points

4. **Check Stats**
   - Verify `users.total_points` in Supabase
   - Clear browser cache
   - Login again - points should still be there!

## Common Issues & Solutions

### Issue: Points not saving to database
**Cause**: JWT token not being sent
**Solution**: Ensure frontend uses `fetchWithAuth()` helper

### Issue: "Access denied. No token provided"
**Cause**: Authorization header missing
**Solution**: Check that `fetchWithAuth()` is being used in GameContext

### Issue: "Invalid or expired token"
**Cause**: JWT token expired or invalid
**Solution**: Logout and login again to get fresh token

### Issue: Backend receives request but user profile not found
**Cause**: User exists in auth but not in users table
**Solution**: Implement auto-sync on first login (already done in register)

## Future Enhancements

1. **Offline Support**: Queue guesses when offline, sync when back online
2. **Leaderboard**: Query top players by total_points
3. **Achievements**: Award badges for streaks, location discoveries
4. **History**: Track challenge_attempts over time
5. **Points Multipliers**: Different point values for difficulty levels
