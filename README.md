# Content Hub

A full-stack page builder + analytics platform: sign in, drag-and-drop pages together from reusable components, publish them to a public URL, and track views/clicks on the published result.

## Purpose

This project exists to practice building and wiring a complete full-stack system end to end — authentication (Keycloak/OIDC), a REST API with real authorization boundaries (NestJS/MongoDB), and a client app that consumes it (Next.js) — rather than to ship a production product. It follows a phased build plan (see [`docs/CONTENT_HUB.md`](docs/CONTENT_HUB.md)), each phase built, tested, and verified before moving to the next.

## Scope

**Built so far:**

- **Infrastructure:** MongoDB + Keycloak via Docker Compose
- **Auth:** Keycloak realm/client/user setup; backend validates JWTs via JWKS; a local `User` record is synced from the Keycloak identity on first login
- **Backend API** (NestJS): full CRUD for pages and page components, component reordering, analytics event tracking + aggregation, ownership-scoped access control
- **Frontend** (Next.js 14, App Router): Keycloak login/callback flow, dashboard listing your pages, create-page flow

**Not yet built** (planned, per the phased doc):

- The drag-and-drop page editor, live preview, and property editor
- The analytics dashboard UI (charts)
- The public page viewer (`/pub/[slug]`)
- Reusable UI component library (Button, Card, Input, Modal, Dropdown)
- Production deployment

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, React Query, Zustand, axios |
| Backend | NestJS, TypeScript, MongoDB/Mongoose, Passport + JWT (JWKS) |
| Auth | Keycloak |
| Local infra | Docker Compose |

## How to run this

### 1. Start infrastructure (MongoDB + Keycloak)

```bash
docker compose up -d
```

Wait ~15s, then confirm both are healthy:

```bash
docker compose ps
```

> First-time setup only: if the `content-hub` Keycloak realm/client/user don't exist yet, they need to be created before login will work — see [`docs/CONTENT_HUB.md`](docs/CONTENT_HUB.md) for the realm (`content-hub`), client (`content-hub-web`, public, redirect URI `http://localhost:3000/auth/callback`), and test user (`testuser` / `password123`) setup.

### 2. Start the backend

```bash
cd backend
npm install   # first time only
npm run start:dev
```

Runs on **http://localhost:3001**. Look for `✅ NestJS app running on http://localhost:3001`.

### 3. Start the frontend

```bash
cd frontend
npm install   # first time only
npm run dev
```

Runs on **http://localhost:3000**.

### 4. Open the app

Go to **http://localhost:3000**. It should redirect to Keycloak login — sign in with `testuser` / `password123` and you'll land on the dashboard.

### Useful extras

- Keycloak admin console: http://localhost:8080/admin (`admin` / `admin`)
- MongoDB shell: `docker compose exec mongodb mongosh "mongodb://admin:password@localhost:27017/content-hub?authSource=admin"`
- Stop infrastructure: `docker compose down`
- Backend health check (with a valid JWT): `curl http://localhost:3001/api/auth/me -H "Authorization: Bearer <token>"`
