import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "@/types/api";

type AuthState = {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      clearAuth: () => set({ token: null, admin: null }),
    }),
    {
      name: "lumina-admin-auth",
    },
  ),
);
