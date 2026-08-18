<div align="center">

# ⚡ Quizzify (`quizzy-fy`)
### The Ultimate Interactive Quiz Arena & Multiplayer Battleground

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-Cloud-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://quizzy-fy.vercel.app)

[**Live Demo »**](https://quizzy-fy.vercel.app) · [**Explore Quizzes »**](https://quizzy-fy.vercel.app) · [**Create a Team »**](https://quizzy-fy.vercel.app/teams)

</div>

---

## 🌟 Overview

**Quizzify** is a high-octane, full-stack quiz platform that transforms traditional assessments into an exhilarating, gamified arena. Built with a sleek dark-mode glassmorphic interface, dynamic micro-animations, real-time lifelines, global leaderboards, and collaborative **Multiplayer Team Lobbies**.

---

## ✨ Key Features

- **🎮 Interactive Quiz Arena**:
  - Live countdown timers with dynamic color states.
  - Interactive lifelines: **50:50 Split**, **Skip Question**, and **+15s Extra Time**.
  - Celebratory particle confetti cascades and tactile screen-shake animations on answering.
  - Comprehensive question breakdown and explanation review upon completion.

- **👥 Multiplayer Team Lobbies**:
  - Create custom lobbies linked to any challenge sheet.
  - Shareable 6-character room codes (`TEAM-XXXXXX`) for seamless 1-on-1 or multi-player matchups.
  - Live 5-second polling scoreboard tracking both **single-quiz scores** and **cumulative career XP**.
  - Direct quiz launch and synchronized automatic score logging to the lobby card.

- **🏆 Gamification & Leaderboard**:
  - Dynamic XP progression and real-time accuracy percentages.
  - Top 10 global ranking leaderboard.

- **🛠️ Custom Quiz Studio**:
  - Create and publish customized quizzes with flexible question lengths, timers, and scoring weights.

- **🚀 Serverless Full-Stack Architecture**:
  - Next.js 16 App Router Serverless API Route Handlers.
  - Cached Mongoose cloud database connection tailored for serverless deployments on Vercel.
  - JWT-based authentication with bcrypt password hashing.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide Icons, Canvas Confetti
- **Backend / API**: Next.js Serverless Route Handlers (`/app/api/...`) & Express.js architecture
- **Database**: MongoDB Atlas via Mongoose with serverless connection caching
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt.js
- **Deployment**: Vercel (Edge network)

---

## 📁 Repository Architecture

```text
Quiz_App/
├── client/                     # Full-Stack Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                # App Router (Pages & API Handlers)
│   │   │   ├── api/            # Serverless API Endpoints (Auth, Quizzes, Attempts, Teams, Leaderboard)
│   │   │   ├── create/         # Quiz Creator Studio
│   │   │   ├── dashboard/      # User Analytics & Past History
│   │   │   ├── leaderboard/    # Global XP Standings
│   │   │   ├── quiz/[id]/      # Interactive Quiz Engine & Game Arena
│   │   │   ├── teams/          # Multiplayer Team Dashboard & Lobbies ([code])
│   │   │   ├── globals.css     # Design Tokens, Glassmorphism, Shake Keyframes
│   │   │   └── layout.js       # App Root & Global AuthProvider Wrapper
│   │   ├── components/         # Shared UI (Navbar, Glass Panels, Stat Cards)
│   │   ├── context/            # AuthContext State & Session Store
│   │   ├── lib/                # Shared Mongoose Models & Database Cacher
│   │   └── utils/              # Resilient Fetch API Client
│   └── package.json
├── server/                     # Standalone Express.js Backend Architecture
│   ├── config/                 # MongoDB Connection Middleware
│   ├── controllers/            # Route Controllers (Auth, Quizzes, Attempts, Leaderboard)
│   ├── models/                 # Mongoose Data Schemas
│   ├── routes/                 # Express API Endpoints
│   ├── scripts/                # Database Seeder (Initial Quiz Library)
│   ├── server.js               # Express Server Entry Point
│   └── package.json
├── .gitignore                  # Exclusion Rules (Secrets, Build Artifacts, Node Modules)
└── README.md                   # Project Documentation
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/sambitverse/quizzy-fy.git
cd quizzy-fy/client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the `client/` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Live Deployment

The application is deployed live on **Vercel** with full serverless functionality:
👉 **[https://quizzy-fy.vercel.app](https://quizzy-fy.vercel.app)**

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
