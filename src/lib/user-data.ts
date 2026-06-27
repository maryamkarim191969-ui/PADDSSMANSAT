export type UserRole = "Admin" | "Staff TU" | "Viewer";
export type UserStatus = "Aktif" | "Nonaktif";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
};

export type UserActivity = {
  id: string;
  userId: string;
  action: string;
  detail: string;
  at: string;
};

export const initialUsers: AppUser[] = [];

export const userActivities: UserActivity[] = [];
