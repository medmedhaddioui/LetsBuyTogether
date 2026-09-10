# LetsBuyTogether

LetsBuyTogether is a full-stack group-buying coordination platform for Morocco. It is not an ecommerce store: people discover promotions offered by external stores, match with nearby shoppers, form a buying group, coordinate products and delivery, and build trust through completed transactions and reviews.

The MVP implements the complete lifecycle: registration → promotion discovery → group creation/joining → participation confirmation → simulated payment → external purchase → receipt confirmation → reviews.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, React Router
- Axios, TanStack Query, React Hook Form, Zod
- Node.js, Express, TypeScript, JWT, bcrypt, Zod
- PostgreSQL and Prisma
- Docker Compose, ESLint, Prettier
- Vitest and Supertest

## Architecture

```text
frontend/src/
  components/     reusable navigation, cards and UI states
  contexts/       JWT-backed authentication state
  lib/            API client and shared frontend types
  pages/          public, member and admin screens
backend/src/
  config/         validated environment configuration
  middleware/     auth, admin authorization, validation, errors
  routes/         thin REST transport layer
  services/       group lifecycle, payments and notifications
  prisma/         shared Prisma client
  utils/          response and domain error helpers
backend/prisma/   schema, migrations and Moroccan demo seed
backend/tests/    API security and state-machine tests
```

Group mutations are server-controlled. Joining and leaving use database transactions; joining locks the group row and uses serializable isolation to prevent two shoppers taking the final capacity. The centralized state derivation never accepts a status from the browser. Payments use a `PaymentService` interface with a `MockPaymentService`, making a future CMI, Payzone, or Stripe adapter replaceable without coupling it to group logic.

## Quick start with Docker

Requirements: Docker with Compose v2.

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend npm run seed
```

Open <http://localhost:5173>. The REST API is at <http://localhost:4000/api> and its health endpoint is `/api/health`.

To stop services, run `docker compose down`. Database data remains in the `postgres_data` volume.

## Local development

Requirements: Node.js 22+, npm, and PostgreSQL 16+.

```bash
cp .env.example .env
npm run install:all
cd backend
npm run prisma:generate
npx prisma migrate dev
npm run seed
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

For local processes, set `DATABASE_URL` to use `localhost` rather than the Compose hostname `postgres`. The frontend reads `VITE_API_URL` at build/start time.

## Database and seed

The Prisma schema contains users, external stores, promotions, groups, members, product requests, payments, purchases, messages, reviews, reports, notifications, favorites, and blocks. It includes query indexes and unique constraints for memberships, product requests, reviews, favorites, payments, and blocks.

```bash
cd backend
npm run prisma:validate
npm run migrate        # production/deployed migrations
npx prisma migrate dev # local migration development
npm run seed
```

Seed data includes 10 users, 8 external stores, 20 promotions, 12 groups, product requests, messages, notifications, and favorites across Casablanca, Rabat, Marrakech, Agadir, Tangier, and Fes.

Demo credentials (development only):

- Admin: `admin@jme3na.ma` / `Demo123!`
- User: `user1@jme3na.ma` / `Demo123!`
- Additional users: `user2@jme3na.ma` through `user9@jme3na.ma`, same password

Never use these credentials or the example JWT secret in production.

## Commands

From the repository root:

```bash
npm run build
npm run lint
npm test
```

Or run package-specific commands with `npm --prefix backend ...` and `npm --prefix frontend ...`.

## API overview

All responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message" } }`. Send JWTs as `Authorization: Bearer <token>`.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/promotions`, `GET /api/promotions/:id`
- `GET /api/promotions/:id/matches`, favorite add/remove
- `GET|POST /api/groups`, group detail and join/leave
- Group actions: `/confirm`, `/payment`, `/purchase`, `/received`, `/cancel`
- Member chat: `GET|POST /api/groups/:id/messages` (REST polling)
- `GET /api/stores`, `GET /api/stores/:id`
- Profiles, profile updates, reviews, history, favorites, and blocking under `/api/users`
- `GET|PATCH /api/notifications`, `POST /api/reports`, `POST /api/reviews`
- Moderation and dashboard endpoints under `/api/admin/*`

Search supports `search`, `store`, `city`, `category`, `type`, `expiringBefore`, `active`, `page`, and `limit`. Matching supports `city` and `quantity`.

## Security and privacy

Helmet, scoped CORS, rate limiting, bcrypt hashing, signed JWTs, Zod validation, role checks, ownership/member checks, and Prisma parameterized queries are enabled. User identity, roles, payment status, totals, and state transitions are always derived server-side. Home addresses are not part of public models; meetup details are intended for group coordination. The current payment flow is visibly simulated and does not collect money.

Before production use, set a long random `JWT_SECRET`, enforce HTTPS, configure production CORS, add email/phone verification, introduce secret rotation and audit logging, and integrate a regulated payment provider.
