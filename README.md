# LetsBuyTogether

LetsBuyTogether is a group-buying coordination app for Morocco. The current UI lets you browse demo promotions, filter deals, and try simulated login and registration.

## Current storage status

Persistent storage is temporarily disabled. You do not need a database or any database setup commands to run the app.

The frontend continues using its demo records and simulated authentication. Backend endpoints that would read or save records return HTTP `503` with error code `STORAGE_UNAVAILABLE`. They retain their URLs, request validation, and authorization checks. `/api/health` and `/api/auth/logout` remain available. No replacement datastore has been added.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, React Router
- React Hook Form and Zod
- Node.js, Express, JWT, Helmet, rate limiting
- ESLint, Prettier, Vitest and Supertest

## Quick start

Requirements: Node.js 22+ and npm.

From the repository root:

```bash
npm run install
cp .env.example backend/.env
```

If `backend/.env` already exists, edit it instead of overwriting it. Set a random `JWT_SECRET` of at least 16 characters. The example value is for local development only.

Start the backend:

```bash
npm run dev:back
```

In another terminal, start the frontend:

```bash
npm run dev:front
```

Open <http://localhost:5173>. The backend health endpoint is <http://localhost:4000/api/health>. Stop each server with `Ctrl+C`. You can also run `npm run dev` inside the corresponding frontend or backend folder.

`npm run dev` at the root starts only the backend. `npm run dev:all` starts an optional combined development server at <http://localhost:4000>.

## Configuration

Settings are loaded from process variables, then `backend/.env`, then the repository root `.env`, without overriding higher-priority values.

- `JWT_SECRET`: token verification secret; at least 16 characters.
- `JWT_EXPIRES_IN`: token expiry setting retained for future authentication storage.
- `PORT`: backend port, default `4000`.
- `NODE_ENV`: `development`, `test`, or `production`.
- `API_PROXY_TARGET`: optional frontend proxy destination; otherwise the frontend uses the configured backend port.

## Application structure

Feature folders organize the React UI and backend API. The frontend and backend can run separately in development and are built together for production.

```text
frontend/src/app/         application routing
frontend/src/features/    auth, home and promotions
frontend/src/shared/      reusable components, layout and types
frontend/src/styles/      global styles and themes
backend/src/modules/      feature routes, controllers, schemas and domain types
backend/src/http/         API registry, responses, errors and storage-disabled handler
backend/src/middleware/   authentication, validation and errors
backend/src/config/       environment settings and project paths
backend/tests/            integration and unit tests
```

See [Project structure](docs/PROJECT_STRUCTURE.md) for the purpose of each folder.

Vite proxies frontend `/api` requests to the backend during separate development. In production, Express serves the built React UI and API on the same origin. Unknown API routes return JSON errors rather than the React HTML page.

## Production

```bash
npm run install
npm run build
npm start
```

`npm run build` compiles the browser and server code. `npm start` serves both at <http://localhost:4000>. Deploy the package files, backend runtime dependencies, `backend/dist`, and `frontend/dist` together, and set `JWT_SECRET` in the environment. The same paused-storage behavior applies in production.

## Checks

```bash
npm run build
npm run lint
npm test
npm run format:check
```

Run `npm run format` to format maintained source, configuration and documentation.
