# Google account signup

New accounts use **Continue with Google**. The app stores Google's stable account identifier and verified email. It does not receive the user's Google password or store Google's access/refresh tokens. Existing password accounts can still log in. Google supports Gmail and other Google accounts.

## Set up Google once

1. Open [Google Cloud Console](https://console.cloud.google.com/), select your project or create one.
2. Open **Google Auth Platform**. Configure **Branding** with your app name and support email, and **Audience** with the intended users. For a testing app, add the Google accounts that will test the app as test users.
3. Open **Clients**, choose **Create client**, then **Web application**.
4. Add this exact **Authorized redirect URI** for separate frontend/backend development:

   ```text
   http://localhost:5173/api/auth/google/callback
   ```

5. Copy the client ID and client secret into `backend/.env`:

   ```dotenv
   APP_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google/callback
   ```

   Keep `DATABASE_URL` and `JWT_SECRET` already in that file. Do not commit it or send the secret to the frontend. No browser JavaScript client ID is needed for this server redirect flow.

6. From the project root, update the database:

   ```sh
   npm run db:migrate
   ```

7. Restart the backend and frontend in separate terminals:

   ```sh
   npm run dev:back
   ```

   ```sh
   npm run dev:front
   ```

8. Visit `http://localhost:5173/register`. Choose **Continue with Google**, pick your account, and consent to sharing your basic identity. Enter your username, address and city. Then choose Search or Post.

Use `localhost` consistently. The callback goes through the frontend's `/api` proxy, so its temporary cookie and the authenticated session remain on the same host. The backend may still use port 4000 internally.

For combined development (`npm run dev:all`), use port 4000 for both URLs instead and register that callback with Google. For production, set both URLs to your actual public HTTPS origin, register the exact callback in Google, and set `NODE_ENV=production`. `APP_URL` must be the trusted public site origin. Configure proxy HTTPS forwarding as appropriate to your deployment.

If the Google button is disabled, check all three Google environment settings and restart the backend. A redirect URI mismatch means the value in Google Console differs from `GOOGLE_REDIRECT_URI`.

If a password account already uses an email, Google signup shows a message to log in using its existing password. Accounts are never silently merged; connecting Google to an existing password account is not implemented.

## Files and endpoints

- `backend/src/modules/auth/google-auth.service.ts`: Google authorization, PKCE, identity token verification (signature, issuer, audience, expiry) and nonce/verified email checks through Google's official library.
- `backend/src/modules/auth/google-auth.controller.ts`: redirect flow, signed HTTP-only temporary cookie, database-backed single-use state and app session.
- `backend/database/migrations/003_google_accounts.sql`: optional password hash, unique Google subject, profile completion flag and short-lived login attempts. Existing accounts stay intact.
- `frontend/src/features/auth/pages/AuthPage.tsx`: Google signup and existing password login.
- `frontend/src/features/auth/pages/CompleteProfilePage.tsx`: collects username, address and city after Google authentication.

| Endpoint                        | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| GET `/api/auth/google/status`   | Reports whether Google is configured; returns no secrets |
| GET `/api/auth/google`          | Starts a Google login                                    |
| GET `/api/auth/google/callback` | Consumes the login attempt and verifies Google identity  |
| PATCH `/api/auth/profile`       | Saves the authenticated user's profile                   |
| POST `/api/auth/register`       | Returns 410: signup now requires Google                  |
| POST `/api/auth/login`          | Supports existing password accounts                      |

Google integration tests mock the external Google SDK while exercising real PostgreSQL, cookies, profile validation, duplicate identity protection, redirects and replay rejection. A real Google consent flow requires your client credentials and manual testing with a Google account.

See [Google's server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server) and [OpenID Connect documentation](https://developers.google.com/identity/openid-connect/openid-connect).

## Temporary test access (development only)

You can try the app before configuring Google:

1. Apply migrations with `npm run db:migrate`, then start the frontend and backend normally.
2. Open `http://localhost:5173/register`.
3. Under **Temporary test access**, enter an email such as `bot1@gmail.com`.
4. Press **Enter with test email**. Complete your username, address and city, then choose Search or Post.
5. To return to the same test account, enter the same email in this form again. Its profile and records stay saved.

This does not verify ownership of that email or create a real Google identity. The account is marked `users.is_test_account = true`, has no Google subject or password, and cannot have an admin role. An email already belonging to a real account is rejected. Anyone using the local test form can access the matching test account.

The form is displayed only when the backend reports `NODE_ENV=development`. The signup endpoint and sessions created for test accounts are blocked in production and automated test mode. Do not expose a development server publicly.

Files: `test-auth.controller.ts`, `AuthRepository.findOrCreateTestAccount`, `TestSignupForm.tsx` and migration `004_test_accounts.sql`. The shortcut uses `GET /api/auth/test-signup/status` and `POST /api/auth/test-signup`. Removing those routes and the form later leaves real Google signup intact.
