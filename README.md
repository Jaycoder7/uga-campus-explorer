# UGA Campus Explorer
## Project info about hackathon

A complete location-based campus discovery game for the University of Georgia. Players explore campus by solving daily location challenges, discovering landmarks, and unlocking achievements.

## 📁 Project Structure

```
uga-campus-explorer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── jobs/           # Scheduled tasks
│   │   └── scripts/        # Database scripts
│   ├── supabase-schema.sql # Database schema
│   └── package.json        # Backend dependencies
├── package.json            # Root package.json for monorepo
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uga-campus-explorer
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**

   **Backend (.env file in `/backend` directory):**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Fill in your Supabase credentials and JWT secrets.

   **Frontend (.env.local file in `/frontend` directory):**
   ```bash
   cd frontend
   touch .env.local
   ```
   Add your frontend environment variables if needed.

4. **Set up the database**
   - Run the SQL schema in your Supabase project
   - Seed the database with initial data:
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 5173) and backend (port 3001) simultaneously.

## 📜 Available Scripts

### Root Commands (run from project root)

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both projects
- `npm run lint` - Lint both projects
- `npm run seed` - Seed the backend database
- `npm run setup` - Install dependencies for both projects
- `npm run clean` - Remove all node_modules
- `npm run reset` - Clean and reinstall all dependencies

### Individual Project Commands

**Frontend (run from `/frontend`):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run linting

**Backend (run from `/backend`):**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run build` - Prepare for production (currently echo command)

## 🎮 Game Features

### Frontend Features
- **Daily Challenge** - New location each day
- **Stat** - Shows your streaks, best streak, points, locations
- **Leaderboards** - Compete with other players based on streaks
- **How to** - How to use the app guide

### Backend Features
- **Authentication** - Secure user registration and login with JWT
- **RESTful API** - Comprehensive endpoints for all game functionality
- **Real-time Statistics** - Live leaderboards and user progress tracking
- **Scheduled Tasks** - Automated new locations for each day
- **Security** - Rate limiting, input validation, and secure practices

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Supabase Client** - Database and authentication

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database with real-time features
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled task execution
- **Express Validator** - Input validation
- **Helmet** - Security middleware

### Database
- **PostgreSQL** (via Supabase) - Primary database
- **Row Level Security (RLS)** - Database-level access control
- **Real-time subscriptions** - Live data updates
- **Automated backups** - Data protection

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Row Level Security in database
- Environment variable protection

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to:
- Vercel (recommended for React apps)
- Netlify
- GitHub Pages
- Any static hosting service

### Backend Deployment
The backend can be deployed to:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS EC2
- Any Node.js hosting service

### Environment Setup
1. Set up production environment variables
2. Configure Supabase for production
3. Set up proper CORS origins
4. Configure rate limiting for production load
5. Set up monitoring and logging

## 🧪 Testing

Run tests for the entire project:
```bash
npm test
```

Or run tests individually:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests (when implemented)
cd backend && npm test
```

## 📖 API Documentation

The backend provides a comprehensive REST API. Key endpoints include:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/challenges/today` - Get today's challenge
- `POST /api/challenges/submit` - Submit challenge answer
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/achievements` - Get all achievements
- `GET /api/locations` - Get all locations

Full API documentation is available in `/backend/README.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include error logs and environment details

## 🙏 Acknowledgments

- University of Georgia for inspiration
- Supabase for excellent backend-as-a-service
- React and Node.js communities
- All contributors and testers

---

Built with ❤️ for the UGA community 🐕
