"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCustomerAuthStore } from "../stores/authStore";

export function useCustomerGuard() {
  const router = useRouter();
  const user = useCustomerAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) router.replace("/login");
    if (user && user.role !== "customer") router.replace("/login");
  }, [router, user]);

  return user;
}
