export interface Store {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  city?: string;
  isVerified: boolean;
}
