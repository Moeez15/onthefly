# On The Fly ✈️

A collaborative trip planning app where groups can organize travel together — plan trips, curate destinations, vote on activities, invite friends, and use AI to generate itineraries, search trips, and auto-suggest destinations and activities.

## Why I Built This

I wanted to practice building a full-stack app with real authentication and relational data. Trip planning felt like a natural fit for many-to-many relationships (trips ↔ destinations, trips ↔ users) and collaborative features like activity voting. GitHub OAuth was a deliberate choice to avoid building a full auth system from scratch while still learning how OAuth flows work end-to-end. I later integrated AI features using the Groq API to make the planning experience smarter and more interactive.

## Features

### Core
- GitHub OAuth login — users authenticate via GitHub, no separate account needed
- Create, edit, and delete trips with dates, cost, and cover images
- Browse a destinations catalog and add destinations to trips
- Edit and delete destinations from the catalog and from trips
- Add and delete activities on a trip with upvote tracking
- Invite and remove travelers from a trip
- My Trips — view all trips you've been added to

### AI-Powered (Groq API)
- **Itinerary Generation** — generate a detailed day-by-day itinerary for any trip, saved to the database for later viewing
- **Smart Search** — search trips using natural language (e.g. "beach trip under $2000"), with AI-suggested trip creation when no matches are found
- **Auto-Suggest** — AI recommends destinations and activities based on trip details, with selectable suggestions users can add to their trip

## Architecture

```
onthefly/
├── client/          # React (Vite) SPA
│   └── src/
│       ├── pages/       # Route-level views (ReadTrips, TripDetails, SmartSearch, etc.)
│       └── components/  # Reusable UI (Card, Avatar, ActivityBtn, DestinationBtn, etc.)
└── server/          # Node.js / Express REST API
    ├── config/
    │   ├── auth.js      # Passport GitHub strategy
    │   ├── database.js  # pg Pool connection
    │   └── reset.js     # DB schema creation + seed
    ├── controllers/     # Query logic per resource (trips, destinations, activities, ai)
    └── routes/          # Express routers per resource
```

**Stack:** React 18 · React Router v6 · Vite · Node.js · Express · PostgreSQL · Passport.js (GitHub OAuth) · Groq SDK (Llama 3.3 70B)

**Database schema (7 tables):**

| Table | Purpose |
|---|---|
| `trips` | Core trip records |
| `users` | GitHub-authenticated users |
| `destinations` | Browsable destination catalog |
| `activities` | Activities tied to a trip, with vote counts |
| `itineraries` | AI-generated itineraries stored per trip |
| `trips_destinations` | Many-to-many: trips ↔ destinations |
| `users_trips` | Many-to-many: trips ↔ users |

## Getting Started

**Prerequisites:** Node.js, PostgreSQL database (local or hosted), Groq API key

```bash
# Server
cd server
cp .env.example .env   # fill in PG* vars, GitHub OAuth credentials, and GROQ_API_KEY
npm install
node config/reset.js   # create tables and seed data
node server.js

# Client (separate terminal)
cd client
npm install
npm run dev
```

Server runs on `http://localhost:3001`, client on `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|---|---|
| `PGUSER` | PostgreSQL username |
| `PGPASSWORD` | PostgreSQL password |
| `PGHOST` | PostgreSQL host |
| `PGPORT` | PostgreSQL port |
| `PGDATABASE` | PostgreSQL database name |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GROQ_API_KEY` | Groq API key for AI features |

To get GitHub OAuth credentials, create an OAuth App at [github.com/settings/developers]

To get a Groq API key, sign up at [console.groq.com](https://console.groq.com).
