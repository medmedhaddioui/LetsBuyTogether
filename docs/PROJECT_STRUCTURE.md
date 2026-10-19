# Project structure

LetsBuyTogether is a modular monolith. Features live together in one repository and share one backend. PostgreSQL stores accounts, product searches and product posts. You can run the frontend and backend separately during development or serve them together in production.

## Frontend

```text
frontend/src/
├── main.tsx                  Browser entry point and provider setup
├── app/
│   └── App.tsx               Page routing
├── features/
│   ├── auth/
│   │   ├── components/       AuthProvider: current user and session restoration
│   │   ├── context/          React context definition
│   │   ├── hooks/            useAuth hook
│   │   ├── pages/            Login and registration screen
│   │   ├── schemas/          Form validation rules and inferred form types
│   │   ├── services/         API calls for registration, login, sessions and logout
│   │   ├── styles/           Login and registration styles
│   │   └── types/            Auth context and registration contracts
│   ├── home/                 Landing page and its styles
│   ├── onboarding/pages/     Post-signup action choice
│   ├── products/             Live post/search forms, browsing, activity and API calls
│   └── promotions/           Retained demo components and data
│       ├── components/       PromotionCard and PromotionModal
│       ├── constants/        Available cities, categories and promotion filters
│       ├── data/             Clearly labeled demo promotions and stores
│       ├── pages/            Search and browse screen
│       ├── styles/           Search, result, card and modal styles
│       └── utils/            Display labels for promotion types and discounts
├── shared/
│   ├── components/           Reusable form inputs, badges and UI states
│   ├── layout/               Navigation, page shell and layout styles
│   ├── routing/              Signed-in route protection
│   └── types/                Shared user, store and promotion models
└── styles/                   CSS entry point, base theme and responsive rules
```

Place a component in a feature when it belongs to that feature. Put it in `shared/components` only when it is useful across features. Keep demo records in `data`, validation in `schemas`, and presentation helpers in `utils`.

Product browsing now uses live PostgreSQL posts. The older promotion demo components remain in their original feature folder. Authentication uses `auth.service.ts` to call the real backend. Account details live in React state; the session is an HTTP-only cookie.

## Backend

```text
backend/
├── scripts/build.mjs         Removes stale compiled files and runs TypeScript
├── database/migrations/      Versioned SQL schema changes
├── src/
│   ├── app.ts                Express application and middleware composition
│   ├── server.ts             Development and production HTTP server lifecycle
│   ├── start.ts              Production entry point
│   ├── config/               Validated environment settings and project paths
│   ├── database/             PostgreSQL pool, queries and migration runner
│   ├── http/                 API registry, errors, responses and paused-feature handler
│   ├── middleware/           Authentication, authorization, validation and error handling
│   ├── modules/
│   │   ├── admin/            Moderation and administration
│   │   ├── auth/             Registration/login routes, validation, service and repository
│   │   ├── groups/           Group routes and storage-independent state rules
│   │   ├── notifications/    Notification routes
│   │   ├── product-posts/    Public product discovery and owned product posts
│   │   ├── product-searches/ Private saved searches and owner-managed statuses
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
- `*.service.ts` contains application rules; `*.repository.ts` handles parameterized SQL queries.

Register new feature routers in `backend/src/http/api.routes.ts`. Use `asyncHandler` for asynchronous controllers so rejected promises reach the shared error middleware. Keep state-transition rules separate from route declarations.

The auth, product-search and product-post modules use PostgreSQL. Legacy feature controllers return HTTP `503 STORAGE_UNAVAILABLE` until their persistence is added. Authentication and validation middleware still run.

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
| `frontend/src/contexts/AuthContext.tsx` | Separate auth context, provider, hook, types and API service         |
| `frontend/src/lib/mockData.ts`          | Promotion data and constants, plus shared model types                |
| `frontend/src/components/ui.tsx`        | Individually named components under `frontend/src/shared/components` |
| `frontend/src/index.css`                | Feature styles and a global CSS import entry point                   |

Empty files left over from removed pages were deleted. The obsolete frontend API-client test was also removed: its implementation was already an empty placeholder, and that client is not used by the current app. Current API tests are grouped under `backend/tests/integration`.

## Current storage status

User accounts, product searches and product posts use PostgreSQL. Configure `DATABASE_URL` in `backend/.env` and run `npm run db:migrate`. Legacy group, promotion, review and store APIs remain paused. See [Database structure](DATABASE.md) for the table, API flow and responsible files.

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

Google signup lives in `backend/src/modules/auth/google-auth.service.ts` (Google verification) and `google-auth.controller.ts` (redirects and one-use login state). `require-profile.ts` blocks product actions until the user provides their profile. The Google form and profile screen live in `frontend/src/features/auth/pages`. See [Google setup](GOOGLE_SIGN_IN.md).
