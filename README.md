# LetsBuyTogether

LetsBuyTogether is a group-buying coordination app for Morocco. Account registration and login use PostgreSQL directly. Users can save product searches and publish product posts from the same account. Product browsing reads live PostgreSQL records.

## Account storage

New accounts use **Continue with Google**. The server verifies Google identity and stores the verified email and Google account identifier. Users then enter username, address and city. No app password is created for Google accounts. Existing password accounts can still log in. Username and email uniqueness are enforced case-insensitively by the database.

Follow [Google sign-in setup](docs/GOOGLE_SIGN_IN.md) to configure your Google client ID and secret.

The browser uses Google redirects, profile completion, login, current-user and logout APIs. Sessions use HTTP-only cookies, with secure cookies in production. Private account details stay in React memory rather than browser local storage. Addresses are returned only for the signed-in account, not public profiles.

Product searches and product posts also use PostgreSQL. Legacy group, review, store and promotion APIs remain paused with HTTP `503 STORAGE_UNAVAILABLE`. Prisma is not used.

## Browse, post and profile

After account setup, users choose **Browse products** or **Post a product**. Both actions use the same account.

- `/search`: browse open product posts using keywords, city, category, price and quantity filters.
- `/posts/new`: create a post through Basics, Deal details, Media and Review + publish.
- `/activity`: manage your product posts and their statuses.
- `/profile`: upload a profile photo, edit username, optional phone number and bio, city and address, and view account details.

The separate search-request form has been removed. Old `/requests/new` links redirect to Browse products. Existing search records are preserved in PostgreSQL.

See [Profile and browsing](docs/PROFILE.md) for details. Apply migrations before starting the app. Uploaded photos are validated, resized and stored in PostgreSQL. Profile contact information and photos are private to their owner. Public product posts show the author's username.

Posts can be marked open, full or cancelled. Expired posts are excluded from browsing.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, React Router
- React Hook Form and Zod
- Node.js, Express, PostgreSQL (`pg` driver), JWT, bcrypt, Helmet, rate limiting
- ESLint, Prettier, Vitest and Supertest

## Quick start

Requirements: Node.js 22+, npm, and PostgreSQL 16+.

From the repository root:

```bash
npm run install
cp .env.example backend/.env
```

If `backend/.env` already exists, edit it instead of overwriting it. Set a random `JWT_SECRET` of at least 16 characters. Set `DATABASE_URL` to your PostgreSQL connection string, and create a dedicated database and user matching that connection. The example values are placeholders.

Apply the database migrations before registering:

```bash
npm run db:migrate
```

For the current local workspace, the dedicated `letsbuytogether` database and `backend/.env` connection have already been configured. Keep PostgreSQL running while using account features. See [Database structure](docs/DATABASE.md) for the schema and setup details.

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

- `DATABASE_URL`: PostgreSQL connection for account storage.
- `JWT_SECRET`: token verification secret; at least 16 characters.
- `JWT_EXPIRES_IN`: session token expiry, such as `7d` or `24h`.
- `PORT`: backend port, default `4000`.
- `APP_URL`: public frontend origin; defaults to `http://localhost:5173`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: server-only Google sign-in configuration; see [setup](docs/GOOGLE_SIGN_IN.md).
- `NODE_ENV`: `development`, `test`, or `production`.
- `API_PROXY_TARGET`: optional frontend proxy destination; otherwise the frontend uses the configured backend port.

## Application structure

Feature folders organize the React UI and backend API. The frontend and backend can run separately in development and are built together for production.

```text
frontend/src/app/         application routing
frontend/src/features/    auth, onboarding, products, home and promotions
frontend/src/shared/      reusable components, layout and types
frontend/src/styles/      global styles and themes
backend/src/modules/      feature routes, controllers, schemas, account service and repository
backend/src/http/         API registry, responses, errors and paused-feature handler
backend/src/database/     PostgreSQL connection and migration runner
backend/database/         SQL migrations
backend/src/middleware/   authentication, validation and errors
backend/src/config/       environment settings and project paths
backend/tests/            integration and unit tests
```

See [Project structure](docs/PROJECT_STRUCTURE.md) for the purpose of each folder.

Vite proxies frontend `/api` requests to the backend during separate development. In production, Express serves the built React UI and API on the same origin. Unknown API routes return JSON errors rather than the React HTML page.

## Production

```bash
npm run install
npm run db:migrate
npm run build
npm start
```

`npm run build` compiles the browser and server code. `npm start` serves both at <http://localhost:4000>. Deploy the package files, backend runtime dependencies, `backend/dist`, and `frontend/dist` together, and set `JWT_SECRET` in the environment. Production cookies require HTTPS. Accounts use PostgreSQL; the other paused features remain unavailable. Deploy `backend/database` with the SQL migrations when applying migrations from the deployment.

## Checks

```bash
npm run build
npm run lint
npm test
npm run format:check
```

Run `npm run format` to format maintained source, configuration and documentation.
