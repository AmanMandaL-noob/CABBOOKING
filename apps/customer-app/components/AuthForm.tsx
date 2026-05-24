"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerApi } from "../lib/customerApi";
import { useCustomerAuthStore } from "../stores/authStore";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const setUser = useCustomerAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const password = String(formData.get("password"));
      const user =
        mode === "register"
          ? await customerApi.register({
              name: String(formData.get("name")),
              email: String(formData.get("email")),
              password
            })
          : await customerApi.login({ email: String(formData.get("email")), password });
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/60 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <form 
          action={onSubmit} 
          className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl"
        >
          {/* Visual Header */}
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500 text-white text-xl font-bold mb-4 shadow-md shadow-teal-500/20">
              🚖
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {mode === "login" ? "Welcome back" : "Get riding today"}
            </h1>
            <p className="mt-1.5 text-xs font-medium text-slate-400">
              {mode === "login" ? "Log in to book your next ride" : "Create an account to start booking"}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  name="name" 
                  type="text"
                  required 
                  placeholder="John Doe" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all bg-slate-50/30" 
                />
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="you@example.com" 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all bg-slate-50/30" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                minLength={8} 
                placeholder="••••••••" 
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all bg-slate-50/30" 
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-700">
              ⚠️ {error}
            </p>
          )}

          <button 
            disabled={loading} 
            className="mt-6 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 text-sm tracking-wide shadow-md shadow-teal-600/10 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : mode === "login" ? "Log In" : "Create Account"}
          </button>

          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            {mode === "login" ? "Don't have an account? " : "Already registered? "}
            <Link 
              className="text-teal-600 hover:text-teal-700 font-extrabold transition-colors underline" 
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Register here" : "Log in instead"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
