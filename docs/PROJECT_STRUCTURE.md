# Project structure

LetsBuyTogether is a modular monolith. Features live together in one repository and share one backend. Persistent storage is temporarily disabled. You can run the frontend and backend separately during development or serve them together in production.

## Frontend

```text
frontend/src/
├── main.tsx                  Browser entry point and provider setup
├── app/
│   └── App.tsx               Page routing
├── features/
│   ├── auth/
│   │   ├── components/       AuthProvider: authentication state and persistence
│   │   ├── context/          React context definition
│   │   ├── hooks/            useAuth hook
│   │   ├── pages/            Login and registration screen
│   │   ├── schemas/          Form validation rules and inferred form types
│   │   ├── services/         Current simulated authentication behavior
│   │   ├── styles/           Login and registration styles
│   │   └── types/            Auth context and registration contracts
│   ├── home/                 Landing page and its styles
│   └── promotions/
│       ├── components/       PromotionCard and PromotionModal
│       ├── constants/        Available cities, categories and promotion filters
│       ├── data/             Clearly labeled demo promotions and stores
│       ├── pages/            Search and browse screen
│       ├── styles/           Search, result, card and modal styles
│       └── utils/            Display labels for promotion types and discounts
├── shared/
│   ├── components/           Reusable form inputs, badges and UI states
│   ├── layout/               Navigation, page shell and layout styles
│   └── types/                Shared user, store and promotion models
└── styles/                   CSS entry point, base theme and responsive rules
```

Place a component in a feature when it belongs to that feature. Put it in `shared/components` only when it is useful across features. Keep demo records in `data`, validation in `schemas`, and presentation helpers in `utils`.

The current browser UI uses demo records and simulated authentication. Its service is explicitly named `demo-auth.service.ts`; this cleanup does not connect it to the backend API.

## Backend

```text
backend/
├── scripts/build.mjs         Removes stale compiled files and runs TypeScript
├── src/
│   ├── app.ts                Express application and middleware composition
│   ├── server.ts             Development and production HTTP server lifecycle
│   ├── start.ts              Production entry point
│   ├── config/               Validated environment settings and project paths
│   ├── http/                 API registry, errors, responses and storage-disabled handler
│   ├── middleware/           Authentication, authorization, validation and error handling
│   ├── modules/
│   │   ├── admin/            Moderation and administration
│   │   ├── auth/             Authentication routes and validation
│   │   ├── groups/           Group routes and storage-independent state rules
│   │   ├── notifications/    Notification routes
│   │   ├── promotions/       Promotion discovery, matching and favorites
│   │   ├── reports/          User-submitted moderation reports
│   │   ├── reviews/          Review routes and validation
│   │   ├── stores/           Store discovery and details
│   │   └── users/            Public profiles, history, preferences and blocking
│   └── types/                Express request type extensions
└── tests/
    ├── integration/          API routing, security and UI/API hosting
    └── unit/                 Group state-transition rules
```

Inside each module:

- `*.routes.ts` maps URLs to middleware and named controllers.
- `*.controller.ts` reads HTTP input and returns the API response.
- `*.schemas.ts` defines request validation.
- Future `*.service.ts` files can hold application behavior when persistence is reintroduced.

Register new feature routers in `backend/src/http/api.routes.ts`. Use `asyncHandler` for asynchronous controllers so rejected promises reach the shared error middleware. Keep state-transition rules separate from route declarations.

Feature controllers explicitly return HTTP `503 STORAGE_UNAVAILABLE` until persistence is added. Authentication and validation middleware still run. The demo frontend is independent of these paused endpoints. Health checks and logout work without storage.

## What moved

| Previous location                       | New responsibility-based location                                    |
| --------------------------------------- | -------------------------------------------------------------------- |
| `backend/src/routes/*`                  | Each feature's `modules/<feature>/*.routes.ts` and `*.controller.ts` |
| `backend/src/routes/misc.routes.ts`     | Separate `stores`, `notifications`, `reports` and `reviews` modules  |
| `backend/src/services/*`                | The owning feature's module, where applicable                        |
| `backend/src/validators/schemas.ts`     | Each feature's `*.schemas.ts`                                        |
| `backend/src/utils/http.ts`             | Named HTTP error and response helpers in `backend/src/http`          |
| `backend/tests/*.test.ts`               | `backend/tests/integration` or `backend/tests/unit`                  |
| `frontend/src/App.tsx`                  | `frontend/src/app/App.tsx`                                           |
| `frontend/src/pages/*`                  | Feature-owned pages under `frontend/src/features`                    |
| `frontend/src/contexts/AuthContext.tsx` | Separate auth context, provider, hook, types and demo service        |
| `frontend/src/lib/mockData.ts`          | Promotion data and constants, plus shared model types                |
| `frontend/src/components/ui.tsx`        | Individually named components under `frontend/src/shared/components` |
| `frontend/src/index.css`                | Feature styles and a global CSS import entry point                   |

Empty files left over from removed pages were deleted. The obsolete frontend API-client test was also removed: its implementation was already an empty placeholder, and that client is not used by the current app. Current API tests are grouped under `backend/tests/integration`.

## Current storage status

No database service, schema migrations or seed commands are required. Database-backed implementations have been removed for now. Keep new storage work in clearly named feature services when it is needed again.

## Development commands

Run commands from the repository root:

```bash
npm run install       # Install both frontend and backend dependencies
npm run dev:front     # Frontend at http://localhost:5173
npm run dev:back      # Backend at http://localhost:4000 (use another terminal)
npm run dev:all       # Optional combined development server
npm run build         # Build the entire application
npm test              # Unit and integration tests
npm run lint          # Check both source trees
npm run format        # Format maintained source, config and documentation
npm run format:check  # Check formatting without modifying files
```

TypeScript's generated Vite configuration and build metadata now live in `frontend/node_modules/.cache`, instead of beside source files. Production builds go to the existing `dist` directories. These generated folders are ignored by Git and Prettier.
