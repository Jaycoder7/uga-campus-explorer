# UGA Campus Explorer

## Team Members
Jyotil Agrawal
Dhaval Reddy Pucha
Ricky Correia

## Project info about hackathon



A complete location-based campus discovery game for the University of Georgia. Players explore campus by solving daily location challenges to discover landmarks.
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


## 💡 Purpose of Project
UGA Campus Explorer is a gamified tool built for the UGA community. While thousands of students walk through the Arch every day, many remain "strangers" to the rich history and essential resources of our campus.

Our app provides a **Daily 360° Challenge** where students must identify their location on campus. By turning geography into a shared daily ritual, we build a community of Bulldawgs who experienced campus, more connected, and better neighbors.

## 🧗 Challenges We Faced

### 360° Image Rendering
One of our main challenges was getting the 360° image rendering to work properly. Initially, we tried to get the entire 3D model using a LiDAR scan to create a VR 3D render, which took way too long to render and had a lot of white space that looked bad. We realized it would be better to take an image like Google Maps Street View, which led us to the 360° image solution that saved us time and was easier to integrate.

### Map Integration Issues
MapLibre was one of the tools we considered for a popup map where users could mark locations. However, the main challenge was that the image was just all green because the map was rendering only the countries and their respective color codes. When we zoomed in, it only showcased green. We shifted to the MapTiler API which has a locked zoom function showing only Athens with buildings and streets, making it easier to provide latitude and longitude for distance calculations.

### AI Code Integration Problems
When we started, we used agentic AI models to write code quickly, but once we began testing we ran into many problems, including integration issues between the frontend and backend. The biggest issue was that AI would make small changes that went unnoticed but caused big problems we didn't want. For example, our authentication integration was failing because the frontend and backend weren't connected at all. We learned a valuable lesson about the importance of carefully checking AI-generated code details.

## 🛠️ Tools Utilized

We built this using React.js and Vite.js for the frontend. The project involved multiple components: one team focused on rendering 360° images using Polycam and Three.js for the challenge homepage, another worked on the popup map using MapLibre Native and MapTiler for interactive mapping and pin dropping. We connected everything to Supabase for our database and built the backend using Node.js. Key features include the daily challenge, stats page, leaderboard, and how-to guide. We also implemented Gemini AI for generating unique magical stories based on locations.

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

## 📖 API Documentation

The backend provides a comprehensive REST API. Key endpoints include:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/challenges/today` - Get today's challenge
- `POST /api/challenges/submit` - Submit challenge answer
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/locations` - Get all locations




## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments & Credits

### Public Frameworks and APIs Utilized
- **Supabase** - Backend-as-a-Service for database and authentication
- **React.js** - Frontend JavaScript library
- **Node.js** - JavaScript runtime for backend
- **Express.js** - Web application framework
- **MapTiler API** - Interactive mapping and geocoding services
- **Three.js** - 3D graphics library for 360° image rendering
- **MapLibre** - Open-source mapping library
- **Polycam** - 360° image capture and processing
- **Gemini AI** - AI-powered story generation
- **Vite.js** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality UI components
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Special Thanks
- University of Georgia for inspiration
- StateFarm for being a good neighbor
- All contributors and testers

---

Built with ❤️ for the UGA community 🐕
