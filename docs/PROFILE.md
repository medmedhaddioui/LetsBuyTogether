# Profile and browsing

Open **My profile** in the left sidebar (or click your account at the bottom).

- Upload a JPEG, PNG or WebP photo up to 2 MB; remove or replace it anytime.
- Edit your username, optional phone number, optional bio, city and address.
- View your email, account type and join date. Email is read-only.
- Save profile details with **Save changes**. Photo changes save separately and immediately.

Photos are decoded and resized to 256 × 256 WebP images by the server, with embedded metadata removed. Images larger than 16 megapixels or invalid files are rejected. The photo bytes, phone and bio persist in PostgreSQL. Contact details and the photo endpoint are private to the authenticated account; product listings continue to show only the author's username.

## Files

- `frontend/src/features/profile/pages/ProfilePage.tsx`: profile form and photo controls.
- `frontend/src/features/profile/styles/profile.css`: profile layout.
- `backend/src/modules/auth/avatar.controller.ts`: photo validation, resize, retrieval and removal.
- `backend/src/modules/auth/auth.repository.ts`: account/profile persistence.
- `backend/database/migrations/005_account_profile.sql`: phone, bio, avatar and avatar timestamp columns.

## API

| Endpoint                  | Purpose                                                     |
| ------------------------- | ----------------------------------------------------------- |
| GET `/api/auth/me`        | Current account details, including phone, bio and photo URL |
| PATCH `/api/auth/profile` | Update username, address, city and optional phone/bio       |
| PUT `/api/auth/avatar`    | Upload raw JPEG, PNG or WebP bytes, maximum 2 MB            |
| GET `/api/auth/avatar`    | Read the signed-in account's photo                          |
| DELETE `/api/auth/avatar` | Remove the signed-in account's photo                        |

All routes require authentication and use the current session as the account identity. Client-supplied account IDs, emails and roles cannot change the target user. Omitting phone or bio preserves its saved value; submitting an empty string clears it.

## Browse products

**Browse products** is now the only product-search screen. The separate saved-search creation page and navigation entry have been removed. Existing `/requests/new` links redirect to `/search`. Onboarding offers Browse products or Post a product, and My activity shows product posts.

Previously saved search records remain in the database; this change does not delete user data. Legacy search APIs remain available, but the UI no longer creates or manages search requests.
