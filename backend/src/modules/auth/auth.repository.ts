import { randomUUID } from "node:crypto";
import { query } from "../../database/connection.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { AccountCredentials, AccountUser } from "./auth.types.js";

const accountColumns = `id, username, email, address, city, role, phone, bio,
  created_at AS "createdAt", starting_preference AS "startingPreference",
  profile_complete AS "profileComplete", is_test_account AS "isTestAccount",
  CASE WHEN avatar IS NULL THEN NULL ELSE '/api/auth/avatar?v=' || EXTRACT(EPOCH FROM avatar_updated_at)::text END AS "photoUrl"`;

export const AuthRepository = {
  async saveAvatar(userId: string, image: Buffer | null) {
    return (
      await query<AccountUser>(
        `UPDATE users SET avatar = $1, avatar_updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING ${accountColumns}`,
        [image, userId],
      )
    ).rows[0];
  },
  async getAvatar(userId: string) {
    return (
      await query<{ avatar: Buffer | null }>("SELECT avatar FROM users WHERE id = $1", [userId])
    ).rows[0]?.avatar;
  },
  async findOrCreateTestAccount(email: string) {
    const result = await query<AccountUser>(
      `INSERT INTO users (id, username, email, address, city, is_test_account, profile_complete)
       VALUES ($1, $2, $3, '', '', TRUE, FALSE)
       ON CONFLICT (LOWER(email)) DO UPDATE SET email = users.email
       WHERE users.is_test_account = TRUE AND users.role = 'USER'
       RETURNING ${accountColumns}`,
      [randomUUID(), `test_${randomUUID().replaceAll("-", "").slice(0, 24)}`, email],
    );
    return result.rows[0];
  },
  async findOrCreateGoogle(subject: string, email: string) {
    // Match Google's stable subject, never silently link an existing email account.
    const result = await query<AccountUser>(
      `INSERT INTO users (id, username, email, address, city, google_subject, profile_complete)
       VALUES ($1, $2, $3, '', '', $4, FALSE)
       ON CONFLICT (google_subject) DO UPDATE SET google_subject = EXCLUDED.google_subject
       RETURNING ${accountColumns}`,
      [randomUUID(), `user_${randomUUID().replaceAll("-", "").slice(0, 24)}`, email, subject],
    );
    return result.rows[0];
  },
  async completeProfile(
    userId: string,
    input: { username: string; address: string; city: string; phone?: string; bio?: string },
  ) {
    return (
      await query<AccountUser>(
        `UPDATE users SET username = $1, address = $2, city = $3, profile_complete = TRUE,
         phone = NULLIF(COALESCE($5, phone), ''), bio = NULLIF(COALESCE($6, bio), '')
       WHERE id = $4 RETURNING ${accountColumns}`,
        [input.username, input.address, input.city, userId, input.phone ?? null, input.bio ?? null],
      )
    ).rows[0];
  },
  async updatePreference(userId: string, preference: "search" | "post") {
    return (
      await query<AccountUser>(
        `UPDATE users SET starting_preference = $1 WHERE id = $2 RETURNING ${accountColumns}`,
        [preference, userId],
      )
    ).rows[0];
  },
  async create(input: Omit<RegisterInput, "password">, passwordHash: string) {
    const result = await query<AccountUser>(
      `INSERT INTO users (id, username, email, address, password_hash, city)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${accountColumns}`,
      [randomUUID(), input.username, input.email, input.address, passwordHash, input.city],
    );
    return result.rows[0];
  },

  async findCredentials(email: string): Promise<AccountCredentials | undefined> {
    const result = await query<AccountCredentials>(
      `SELECT ${accountColumns}, password_hash AS "passwordHash" FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<AccountUser | undefined> {
    const result = await query<AccountUser>(`SELECT ${accountColumns} FROM users WHERE id = $1`, [
      id,
    ]);
    return result.rows[0];
  },
};
