# On The Fly ✈️

A collaborative trip planning app where groups can organize travel together — plan trips, curate destinations, vote on activities, and invite friends.

## Why I Built This

I wanted to practice building a full-stack app with real authentication and relational data. Trip planning felt like a natural fit for many-to-many relationships (trips ↔ destinations, trips ↔ users) and collaborative features like activity voting. GitHub OAuth was a deliberate choice to avoid building a full auth system from scratch while still learning how OAuth flows work end-to-end.

## Features

- GitHub OAuth login — users authenticate via GitHub, no separate account needed
- Create and manage trips with dates, cost, and cover images
- Browse a destinations catalog and add destinations to trips
- Add activities to a trip and track vote counts
- Invite other users to join a trip

## Architecture

```
onthefly/
├── client/          # React (Vite) SPA
│   └── src/
│       ├── pages/   # Route-level views (ReadTrips, TripDetails, CreateTrip, etc.)
│       └── components/  # Reusable UI (Card, Avatar, DestinationCard, etc.)
└── server/          # Node.js / Express REST API
    ├── config/
    │   ├── auth.js      # Passport GitHub strategy
    │   ├── database.js  # pg Pool connection
    │   └── reset.js     # DB schema creation + seed
    ├── controllers/     # Query logic per resource
    └── routes/          # Express routers per resource
```

**Stack:** React 18 · React Router v6 · Vite · Node.js · Express · PostgreSQL · Passport.js (GitHub OAuth)

**Database schema (5 tables):**

| Table | Purpose |
|---|---|
| `trips` | Core trip records |
| `users` | GitHub-authenticated users |
| `destinations` | Browsable destination catalog |
| `activities` | Activities tied to a trip, with vote counts |
| `trips_destinations` | Many-to-many: trips ↔ destinations |
| `trips_users` | Many-to-many: trips ↔ users |

## Getting Started

**Prerequisites:** Node.js, PostgreSQL database (local or hosted)

```bash
# Server
cd server
cp .env.example .env   # fill in PG* vars and GitHub OAuth credentials
npm install
node config/reset.js   # create tables and seed data
node server.js

# Client (separate terminal)
cd client
npm install
npm run dev
```

Server runs on `http://localhost:3001`, client on `http://localhost:5173`.

To get GitHub OAuth credentials, create an OAuth App at [github.com/settings/developers](https://github.com/settings/developers) with callback URL `http://localhost:3001/auth/github/callback`.
