"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDriverAuthStore } from "../stores/authStore";

export function useDriverGuard() {
  const router = useRouter();
  const user = useDriverAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) router.replace("/login");
    if (user && user.role !== "driver") router.replace("/login");
  }, [router, user]);

  return user;
}
