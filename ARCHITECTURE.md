# System Architecture Diagram

## Complete System Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 1. USER AUTHENTICATION (Login.tsx, Signup.tsx)                      │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  Input: email, password                                             │ │
│  │  └─→ supabase.auth.signInWithPassword()                            │ │
│  │      └─→ Returns: session with JWT access_token                    │ │
│  │          (stored in Supabase session memory, NOT localStorage)      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 2. GAME CONTEXT (GameContext.tsx)                                   │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  Local State:                                                       │ │
│  │  ├─ gameState (totalPoints, currentStreak, etc)                    │ │
│  │  ├─ todayChallenge (location, coordinates, funFact)               │ │
│  │  └─ canPlay (boolean - already played today?)                      │ │
│  │                                                                     │ │
│  │  Functions:                                                         │ │
│  │  ├─ submitGuess(guess) - Main game action                          │ │
│  │  ├─ exploreLocation() - View without guessing                      │ │
│  │  └─ refreshChallenge() - Test mode                                 │ │
│  │                                                                     │ │
│  │  Key: Uses fetchWithAuth() for all API calls                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 3. API CLIENT HELPER (lib/apiClient.ts)                            │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  fetchWithAuth(url, options)                                        │ │
│  │  ├─ Gets JWT from Supabase session                                 │ │
│  │  ├─ Adds Authorization header: Bearer <JWT>                        │ │
│  │  └─ Returns: fetch(url, { ...options, headers })                   │ │
│  │                                                                     │ │
│  │  Result: Every API call includes JWT token ✅                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                    HTTP with JWT in Authorization header
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + Node.js)                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 4. REQUEST RECEIVED                                                 │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  POST /api/challenges/submit                                        │ │
│  │  Headers: { Authorization: "Bearer eyJhbGc..." }                   │ │
│  │  Body: { guess: "Turtle Pond" }                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 5. AUTH MIDDLEWARE (middleware/auth.js) - protect                  │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  Step 1: Extract JWT from Authorization header                     │ │
│  │  Step 2: Verify JWT with Supabase.auth.getUser(token)             │ │
│  │  Step 3: Load full user profile from 'users' table                │ │
│  │                                                                     │ │
│  │  Sets on req object:                                               │ │
│  │  ├─ req.authUser = Supabase auth user                             │ │
│  │  ├─ req.user = { id, username, total_points, ... }               │ │
│  │  └─ req.userId = user.id                                          │ │
│  │                                                                     │ │
│  │  If fails: Return 401 Unauthorized                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 6. CHALLENGE CONTROLLER (controllers/challengeController.js)       │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  submitGuess(req, res):                                            │ │
│  │                                                                     │ │
│  │  Step 1: Extract guess from request                               │ │
│  │  Step 2: Get today's challenge from locations.js                  │ │
│  │  Step 3: Find correct location from data                          │ │
│  │  Step 4: Normalize and compare guess against:                     │ │
│  │          ├─ location.name                                          │ │
│  │          ├─ location.buildingCode                                  │ │
│  │          └─ location.aliases                                       │ │
│  │                                                                     │ │
│  │  Step 5: Calculate points                                         │ │
│  │          if (isCorrect) { pointsEarned = 100 }                    │ │
│  │          else { pointsEarned = 0 }                                │ │
│  │                                                                     │ │
│  │  Step 6: Calculate new streak                                     │ │
│  │          if (isCorrect && lastPlayedYesterday) {                  │ │
│  │            newStreak = oldStreak + 1;                             │ │
│  │          } else if (isCorrect) {                                  │ │
│  │            newStreak = 1;                                         │ │
│  │          } else {                                                 │ │
│  │            newStreak = 0;                                         │ │
│  │          }                                                         │ │
│  │                                                                     │ │
│  │  Step 7: Update total points                                      │ │
│  │          newTotalPoints = req.user.total_points + pointsEarned   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 7. DATABASE UPDATE (Supabase)                                       │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  await supabaseAdmin                                               │ │
│  │    .from('users')                                                  │ │
│  │    .update({                                                       │ │
│  │      total_points: newTotalPoints,        ⭐ MAIN UPDATE            │ │
│  │      current_streak: newStreak,                                    │ │
│  │      best_streak: max(oldBest, newStreak),                        │ │
│  │      last_played_date: now                                        │ │
│  │    })                                                              │ │
│  │    .eq('id', req.user.id);                                        │ │
│  │                                                                     │ │
│  │  ALSO: Record in challenge_attempts table                         │ │
│  │    ├─ user_id                                                      │ │
│  │    ├─ challenge_id                                                 │ │
│  │    ├─ guess                                                        │ │
│  │    ├─ correct                                                      │ │
│  │    └─ points_earned                                               │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 8. RESPONSE SENT BACK                                               │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  res.json({                                                         │ │
│  │    success: true,                                                  │ │
│  │    data: {                                                         │ │
│  │      correct: true,                                               │ │
│  │      points_earned: 100,                                          │ │
│  │      user_stats: {                                                │ │
│  │        total_points: 1250,      ← Updated value                  │ │
│  │        current_streak: 5,       ← Updated value                  │ │
│  │        best_streak: 10          ← Updated value                  │ │
│  │      }                                                            │ │
│  │    }                                                              │ │
│  │  })                                                               │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                         JSON response with stats
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND - UPDATE STATE                              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 9. RESPONSE RECEIVED                                                │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  GameContext.submitGuess() continued:                              │ │
│  │                                                                     │ │
│  │  const { correct, points_earned, user_stats } = response.data;    │ │
│  │                                                                     │ │
│  │  setGameState(prev => ({                                          │ │
│  │    ...prev,                                                       │ │
│  │    totalPoints: user_stats.total_points,        ← FROM BACKEND    │ │
│  │    currentStreak: user_stats.current_streak,    ← FROM BACKEND    │ │
│  │    bestStreak: user_stats.best_streak,          ← FROM BACKEND    │ │
│  │    todayCompleted: true,                                          │ │
│  │    todayCorrect: correct                                          │ │
│  │  }));                                                              │ │
│  │                                                                     │ │
│  │  // Also save to localStorage as backup                          │ │
│  │  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────────┐ │
│  │ 10. UI UPDATES                                                      │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │  Components re-render with new state:                              │ │
│  │  ├─ StatsBar: Shows "1250 pts" (updated)                          │ │
│  │  ├─ ResultScreen: Shows points earned & new total                 │ │
│  │  └─ Game phase changes to "result"                                │ │
│  │                                                                     │ │
│  │  ✅ USER SEES INSTANT FEEDBACK                                     │ │
│  │  ✅ POINTS SAVED TO DATABASE                                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Persistence Layer

```
                    SUPABASE DATABASE
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐        ┌──────────┐      ┌─────────────┐
    │  auth  │        │  users   │      │ challenges  │
    │ .users │        │  table   │      │    table    │
    ├────────┤        ├──────────┤      └─────────────┘
    │ id     │        │ id ────┐ │
    │ email  │        │ username
    │ pass   │        │ avatar │ │
    │        │        │ stripe │ │
    │ (managed        │ points │◄├─── UPDATED ON GUESS
    │  by              │ streak│ │
    │ Supabase)        │ date  │ │
    └────────┘        └──────────┘
        │                  │
        └──────────────────┘
             │
             │ Foreign Key: auth.users.id
             │ References: users.id
```

## Detailed Data Model

```
┌─────────────────────────────────────────────────────────────┐
│  USERS TABLE (where points are stored)                      │
├─────────────────────────────────────────────────────────────┤
│ Column              │ Type       │ Notes                     │
├─────────────────────────────────────────────────────────────┤
│ id                  │ UUID       │ PK, from auth.users      │
│ username            │ VARCHAR    │ Unique, display name     │
│ avatar              │ VARCHAR    │ Profile picture URL      │
│ total_points        │ INTEGER    │ ⭐ ALL-TIME POINTS       │
│ current_streak      │ INTEGER    │ Days in a row            │
│ best_streak         │ INTEGER    │ Personal best            │
│ last_played_date    │ TIMESTAMP  │ For daily restriction    │
│ created_at          │ TIMESTAMP  │ Account creation         │
│ updated_at          │ TIMESTAMP  │ Last update time         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  CHALLENGE_ATTEMPTS TABLE (history)                         │
├─────────────────────────────────────────────────────────────┤
│ Column              │ Type       │ Notes                     │
├─────────────────────────────────────────────────────────────┤
│ id                  │ UUID       │ PK                       │
│ user_id             │ UUID       │ FK to users.id           │
│ challenge_id        │ UUID       │ FK to daily_challenges   │
│ guess               │ VARCHAR    │ What user guessed        │
│ correct             │ BOOLEAN    │ Was it right?            │
│ points_earned       │ INTEGER    │ 0 or 100                 │
│ attempted_at        │ TIMESTAMP  │ When attempt was made    │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

```
REQUEST:
  POST /api/challenges/submit
  Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: application/json
  Body:
    {
      "guess": "Turtle Pond"
    }

RESPONSE (if correct):
  200 OK
  {
    "success": true,
    "data": {
      "correct": true,
      "points_earned": 100,
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

RESPONSE (if incorrect):
  200 OK
  {
    "success": true,
    "data": {
      "correct": false,
      "points_earned": 0,
      "user_stats": {
        "current_streak": 0,
        "best_streak": 10,
        "total_points": 1250
      }
    }
  }

RESPONSE (if already played):
  400 Bad Request
  {
    "success": false,
    "error": "You have already played today. Come back tomorrow!"
  }

RESPONSE (if no token):
  401 Unauthorized
  {
    "success": false,
    "error": "Access denied. No token provided."
  }
```

## Security Flow

```
┌─────────────────────┐
│ Suspicious Request  │
│ (no JWT token)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Backend Receives Request            │
│ No Authorization header             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ auth.js protect middleware          │
│ Checks: Authorization header present?
└──────────┬──────────────────────────┘
           │ ❌ NO
           ▼
┌─────────────────────────────────────┐
│ Return 401 Unauthorized             │
│ Reject request                      │
│ No points awarded                   │
└─────────────────────────────────────┘

---

┌─────────────────────┐
│ Legitimate Request  │
│ (with JWT token)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Backend Receives Request            │
│ Authorization: Bearer eyJ...        │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ auth.js protect middleware          │
│ Step 1: Extract JWT from header     │
│ Step 2: Verify with Supabase        │
│ Step 3: Load user profile           │
└──────────┬──────────────────────────┘
           │ ✅ Valid
           ▼
┌─────────────────────────────────────┐
│ req.user is now set                 │
│ Request continues to handler        │
│ Can safely update database          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Challenge Controller                │
│ Award points to req.user.id         │
│ Update database safely              │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Return 200 OK with points info      │
│ Points saved to database ✅         │
└─────────────────────────────────────┘
```

## Summary

✅ **Secure**: Every request must have valid JWT
✅ **Persistent**: Points always saved to database
✅ **Scalable**: Database is source of truth
✅ **Fast**: Response sent immediately, database updated atomically
✅ **Reliable**: Falls back to manual sync if needed
