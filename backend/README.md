# UGA Campus Explorer Backend

A complete Node.js + Express backend API for the UGA Campus Explorer game using Supabase as the database. This backend handles authentication, daily challenges, leaderboards, achievements, and user progress tracking.

## 🚀 Features

- **User Authentication** - JWT-based auth with Supabase integration
- **Daily Challenges** - Automatically generated location-based challenges
- **Leaderboards** - Global rankings and user statistics
- **Achievement System** - Unlock achievements based on progress
- **Location Discovery** - Track user exploration progress
- **Real-time Updates** - Live data with Supabase real-time capabilities
- **Scheduled Tasks** - Automated daily challenge generation
- **Security** - Rate limiting, validation, and secure practices

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Supabase account and project
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd uga-campus-explorer/uga-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_different
   ```

4. **Set up Supabase database**
   - Copy the contents of `supabase-schema.sql`
   - Run it in your Supabase SQL Editor
   - Ensure Row Level Security is enabled

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📊 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh JWT token

### Challenges (`/api/challenges`)
- `GET /today` - Get today's challenge
- `POST /submit` - Submit challenge guess
- `GET /history` - Get user's challenge history
- `GET /:id` - Get specific challenge

### Users (`/api/users`)
- `GET /profile` - Get user profile with stats
- `PUT /profile` - Update username or avatar
- `GET /stats` - Get comprehensive user statistics
- `GET /discoveries` - Get all discovered locations

### Leaderboard (`/api/leaderboard`)
- `GET /` - Get leaderboard (supports pagination)
- `GET /user/:username` - Get user's rank and stats

### Achievements (`/api/achievements`)
- `GET /` - Get all available achievements
- `GET /user` - Get user's achievements with progress

### Locations (`/api/locations`)
- `GET /` - Get all locations
- `GET /category/:category` - Get locations by category
- `GET /:id` - Get specific location details

### Health Check
- `GET /health` - Server and database health check

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User profiles and stats
- **locations** - UGA campus locations
- **daily_challenges** - Generated daily challenges
- **challenge_attempts** - User challenge submissions
- **user_locations** - Discovery tracking
- **achievements** - Achievement definitions
- **user_achievements** - Unlocked achievements

## 🎮 Game Logic

### Points System
- Correct guess: 50 base points
- First discovery bonus: +25 points
- Streak multipliers: 1.5x (5+ days), 2x (10+ days)

### Streak Logic
- Increments on correct consecutive daily plays
- Resets on missed days or incorrect guesses
- Tracks both current and best streaks

### Achievement Types
- **First** - Complete first challenge
- **Streak** - Maintain daily streaks
- **Total Locations** - Discover multiple locations
- **Category Specific** - Find locations by category

## ⏰ Scheduled Jobs

The application runs automated tasks:

- **Daily Challenge Generation** - Midnight EST
- **Backup Challenge Generation** - 6 PM EST
- **Database Health Checks** - Hourly
- **Weekly Cleanup** - Sunday 2 AM EST
- **Daily Statistics** - 1 AM EST

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/15 minutes)
- JWT token authentication
- Input validation and sanitization
- bcrypt password hashing
- Row Level Security (RLS) in Supabase

## 📚 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with initial data
npm run seed --clear  # Clear and reseed database
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🧪 Testing

The application includes:
- Input validation
- Error handling
- Database health checks
- API endpoint testing

## 📦 Deployment

### Production Setup

1. Set environment variables for production
2. Ensure Supabase is properly configured
3. Run database migrations if needed
4. Start with `npm start`

### Environment-specific configurations
- Production: Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure proper CORS origins
- Set up proper logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
1. Check existing issues
2. Create a new issue with details
3. Include error logs and environment info

## 🔄 Updates

The application automatically:
- Generates daily challenges
- Updates user streaks
- Calculates achievement progress
- Maintains leaderboards

Regular maintenance includes:
- Database optimization
- Security updates
- Feature enhancements
- Bug fixes

---

Built with ❤️ for the UGA community