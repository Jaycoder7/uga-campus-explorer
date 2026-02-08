# Quick Reference - Points System

## The Fix in One Sentence
**The frontend wasn't sending the JWT authentication token with API requests, so the backend couldn't identify which user to save points for. Now it does.**

## Before ❌
```
Frontend request:
  fetch('http://localhost:3001/api/challenges/submit', {
    method: 'POST',
    body: JSON.stringify({ guess })
    // ❌ Missing Authorization header!
  })

Backend receives:
  {
    success: false,
    error: "Access denied. No token provided."
  }

Result: ❌ Points only saved to localStorage, lost on cache clear
```

## After ✅
```
Frontend request:
  fetchWithAuth('http://localhost:3001/api/challenges/submit', {
    method: 'POST',
    body: JSON.stringify({ guess })
    // ✅ fetchWithAuth automatically adds JWT!
  })

Frontend adds header:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Backend receives:
  {
    success: true,
    data: {
      correct: true,
      points_earned: 100,
      user_stats: { total_points: 1250 }
    }
  }

Result: ✅ Points saved to Supabase database, persistent forever
```

## Key Changes

### 1. Frontend (GameContext.tsx)
```diff
+ import { fetchWithAuth } from '@/lib/apiClient';

- fetch('http://localhost:3001/api/challenges/submit', {
+ fetchWithAuth('http://localhost:3001/api/challenges/submit', {
    method: 'POST',
-   headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ guess })
  })
```

### 2. Backend (auth.js middleware)
```javascript
// OLD: Only set req.authUser
// NEW: Also set req.user with full profile
const { data: userProfile } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', authData.user.id)
  .single();

req.user = userProfile; // ← Full stats now available
```

### 3. CORS (server.js)
```javascript
// OLD: Only allowed :5173 and :8080
// NEW: Allows multiple ports since frontend finds next available port
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  // ... up to :8086
];
```

## How It Works Now

```
┌─────────────────────────────────────────────────────────────┐
│ USER SUBMITS GUESS                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ fetchWithAuth() ADDS JWT TO REQUEST                         │
│ Headers: { Authorization: Bearer <JWT> }                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND RECEIVES REQUEST WITH JWT                           │
│ protect middleware validates JWT                            │
│ Loads user profile from database                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND CALCULATES POINTS                                   │
│ - Check if guess is correct                                 │
│ - Award 100 points if correct                               │
│ - Calculate new streak                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND UPDATES DATABASE                                    │
│ UPDATE users SET total_points = total_points + 100          │
│ WHERE id = req.user.id                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ POINTS SAVED TO SUPABASE!                                │
│ Survives browser cache clear, device change, etc.           │
└─────────────────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Register new user → verify user created in Supabase
- [ ] Login → verify JWT token in session
- [ ] Submit correct guess → verify backend receives JWT
- [ ] Check Supabase users table → verify total_points updated
- [ ] Clear browser cache → login again, points still there
- [ ] Submit another guess → total_points increments
- [ ] Check backend logs → should see "✅ BACKEND SUBMISSION SUCCESS"

## Troubleshooting

### ❌ "Access denied. No token provided"
**Solution**: Ensure `fetchWithAuth()` is used, not `fetch()`

### ❌ "Invalid or expired token"
**Solution**: Token expired → User needs to login again

### ❌ "User profile not found"
**Solution**: User exists in auth but not in users table
- Backend should auto-create on registration
- Check Supabase users table for user

### ❌ Points not updating in database
**Solution**: 
1. Check backend logs for errors
2. Verify JWT is being sent
3. Verify user.id is correct in database
4. Check Supabase RLS policies

## Files Modified

| File | Change | Reason |
|------|--------|--------|
| `frontend/src/context/GameContext.tsx` | Use `fetchWithAuth()` | Add JWT to requests |
| `backend/src/middleware/auth.js` | Load full user profile | Access user stats |
| `backend/src/server.js` | Improve CORS | Allow multiple ports |
| `backend/src/controllers/userController.js` | Add `syncStats()` | Backup sync endpoint |
| `backend/src/routes/users.js` | Add `/sync-stats` route | Enable stats sync |

## Environment Setup

### Required in Backend `.env.local`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:8085
```

### Required in Frontend `.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Points System Formula

```javascript
// Base calculation
if (isCorrect) {
  pointsEarned = 100;
} else {
  pointsEarned = 0;
}

// Update database
newTotalPoints = currentTotalPoints + pointsEarned;

UPDATE users SET total_points = newTotalPoints
WHERE id = userId;
```

## API Reference

### GET /api/challenges/today
- **Headers**: `Authorization: Bearer <JWT>`
- **Returns**: Today's challenge + can_play status

### POST /api/challenges/submit
- **Headers**: `Authorization: Bearer <JWT>`
- **Body**: `{ guess: string }`
- **Returns**: `{ correct, points_earned, user_stats }`

### POST /api/users/sync-stats
- **Headers**: `Authorization: Bearer <JWT>`
- **Body**: `{ currentStreak, bestStreak, totalPoints, lastPlayedDate }`
- **Returns**: Confirmed user stats

## Points History in Database

```sql
-- View all attempts by user
SELECT * FROM challenge_attempts 
WHERE user_id = 'user-uuid'
ORDER BY attempted_at DESC;

-- View all points earned
SELECT attempted_at, correct, points_earned 
FROM challenge_attempts 
WHERE user_id = 'user-uuid'
ORDER BY attempted_at DESC;

-- Total points earned
SELECT SUM(points_earned) FROM challenge_attempts 
WHERE user_id = 'user-uuid';

-- Top 10 users by points
SELECT username, total_points, current_streak 
FROM users 
ORDER BY total_points DESC 
LIMIT 10;
```

## Summary

✅ **Points are now:**
- Saved to Supabase database automatically
- Persistent across cache clears
- Calculated securely on backend
- Synced with proper authentication
- Traceable in database history

🎮 **User Experience:**
- See points update immediately
- Points survive browser closing
- Points sync across devices
- Never lose progress
