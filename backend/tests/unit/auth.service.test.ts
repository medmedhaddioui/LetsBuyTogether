import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/auth/auth.repository.js", () => ({
  AuthRepository: { create: vi.fn(), findCredentials: vi.fn(), findById: vi.fn() },
}));
process.env.JWT_SECRET ??= "test-secret-at-least-sixteen";
const { AuthService } = await import("../../src/modules/auth/auth.service.js");
const { AuthRepository } = await import("../../src/modules/auth/auth.repository.js");
const { registerSchema } = await import("../../src/modules/auth/auth.schemas.js");

const input = {
  username: "test_user",
  email: "test@example.com",
  address: "12 Test Street",
  password: "Example123!",
  city: "Casablanca",
};
const user = {
  id: "5307804d-8410-4810-9324-e22614b0ad0a",
  username: input.username,
  email: input.email,
  address: input.address,
  city: input.city,
  role: "USER" as const,
  createdAt: new Date(),
  startingPreference: null,
  profileComplete: true,
  phone: null,
  bio: null,
  photoUrl: null,
  isTestAccount: false,
};

afterEach(() => vi.resetAllMocks());

describe("account authentication", () => {
  it("hashes the password before handing account data to storage", async () => {
    vi.mocked(AuthRepository.create).mockResolvedValue(user);
    const session = await AuthService.register(input);
    const [account, hash] = vi.mocked(AuthRepository.create).mock.calls[0];
    expect(account).not.toHaveProperty("password");
    expect(hash).not.toBe(input.password);
    expect(await bcrypt.compare(input.password, hash)).toBe(true);
    expect(session.user).not.toHaveProperty("passwordHash");
    expect(session.user).toEqual(user);
  });

  it("removes the stored password hash from login responses", async () => {
    vi.mocked(AuthRepository.findCredentials).mockResolvedValue({
      ...user,
      passwordHash: await bcrypt.hash(input.password, 4),
    });
    const session = await AuthService.login(input.email, input.password);
    expect(session.user).toEqual(user);
    expect(session.user).not.toHaveProperty("passwordHash");
  });

  it("rejects unknown accounts", async () => {
    vi.mocked(AuthRepository.findCredentials).mockResolvedValue(undefined);
    await expect(AuthService.login(input.email, "wrong-password")).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("requires a real stored account when restoring a session", async () => {
    vi.mocked(AuthRepository.findById).mockResolvedValue(undefined);
    await expect(AuthService.me(user.id)).rejects.toMatchObject({ status: 401 });
  });

  it("normalizes email and strips client-controlled roles", () => {
    const account = registerSchema.parse({ ...input, email: " TEST@EXAMPLE.COM ", role: "ADMIN" });
    expect(account.email).toBe("test@example.com");
    expect(account).not.toHaveProperty("role");
  });

  it("rejects missing addresses and passwords over the hashing byte limit", () => {
    expect(registerSchema.safeParse({ ...input, address: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...input, password: "😀".repeat(20) }).success).toBe(false);
  });
});
