import { AuthUser } from "@cab/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerAuthState {
  user?: AuthUser;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      setUser: (user) => set({ user }),
      logout: () => set({ user: undefined })
    }),
    { name: "customer-auth" }
  )
);
