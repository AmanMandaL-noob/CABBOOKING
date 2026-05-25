"use client";

import { BookingCard } from "../../components/BookingCard";
import { useCustomerGuard } from "../../hooks/useCustomerGuard";

export default function CustomerDashboard() {
  const user = useCustomerGuard();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-500">Customer app</p>
        <h1 className="text-2xl font-semibold">Hello {user?.name ?? ""}</h1>
      </header>
      <BookingCard />
    </main>
  );
}
