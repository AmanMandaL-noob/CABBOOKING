import { AuthUser } from "@cab/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DriverAuthState {
  user?: AuthUser;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useDriverAuthStore = create<DriverAuthState>()(
  persist(
    (set) => ({
      setUser: (user) => set({ user }),
      logout: () => set({ user: undefined })
    }),
    { name: "driver-auth" }
  )
);
