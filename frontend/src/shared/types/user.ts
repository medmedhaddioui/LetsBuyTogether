/** Account information returned only to the signed-in account owner. */
export interface User {
  id: string;
  profileComplete: boolean;
  isTestAccount: boolean;
  username: string;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string;
  address: string;
  city: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  startingPreference: "search" | "post" | null;
}
