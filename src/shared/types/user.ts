export type UserRole = "traveler" | "administrator";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
