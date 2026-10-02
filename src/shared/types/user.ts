export type UserRole = "traveler" | "editor" | "administrator";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
