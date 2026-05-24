"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { driverApi } from "../lib/driverApi";
import { useDriverAuthStore } from "../stores/authStore";

export function DriverAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const setUser = useDriverAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const phone = String(formData.get("phone"));
      const password = String(formData.get("password"));
      const user =
        mode === "register"
          ? await driverApi.register({
              name: String(formData.get("name")),
              email: String(formData.get("email")),
              phone,
              password,
              vehicleInfo: {
                make: String(formData.get("make")),
                model: String(formData.get("model")),
                plateNumber: String(formData.get("plateNumber")),
                color: String(formData.get("color") || "")
              }
            })
          : await driverApi.login({ phone, password });
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12 text-slate-100">
      <div className="w-full max-w-md">
        <form 
          action={submit} 
          className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl transition-all duration-300 hover:border-slate-700/50"
        >
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white text-xl font-bold mb-4 shadow-lg shadow-blue-500/20">
              🚖
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === "login" ? "Fleet Operations" : "Join the Fleet"}
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-slate-500">
              {mode === "login" ? "Access driver terminal & navigation logs" : "Register vehicle and pilot credentials"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="mt-8 space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  name="name" 
                  type="text"
                  required 
                  placeholder="Pilot name" 
                  className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-all bg-slate-900/50" 
                />
              </div>
            )}
            
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="email@fleet.local" 
                  className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-all bg-slate-900/50" 
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number (10 digits)</label>
              <input 
                name="phone" 
                type="text"
                required 
                placeholder="9999999999" 
                className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-all bg-slate-900/50" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                minLength={8} 
                placeholder="••••••••" 
                className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-all bg-slate-900/50" 
              />
            </div>

            {mode === "register" && (
              <div className="pt-2 border-t border-slate-900 space-y-3">
                <span className="block text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Vehicle Credentials</span>
                <div className="grid grid-cols-2 gap-3">
                  <input name="make" required placeholder="Make (e.g. Maruti)" className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900/50 focus:border-blue-500 focus:outline-none placeholder-slate-600" />
                  <input name="model" required placeholder="Model (e.g. Dzire)" className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900/50 focus:border-blue-500 focus:outline-none placeholder-slate-600" />
                  <input name="plateNumber" required placeholder="Plate (e.g. DL01AB)" className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900/50 focus:border-blue-500 focus:outline-none placeholder-slate-600" />
                  <input name="color" placeholder="Color" className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900/50 focus:border-blue-500 focus:outline-none placeholder-slate-600" />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-950/20 border border-red-900/40 px-3 py-2 text-xs font-semibold text-red-400">
              ⚠️ {error}
            </p>
          )}

          <button 
            disabled={loading} 
            className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-sm tracking-wide shadow-md shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing Terminal...
              </span>
            ) : mode === "login" ? "Sign In" : "Register Pilot"}
          </button>

          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            {mode === "login" ? "New fleet pilot? " : "Already registered? "}
            <Link 
              className="text-blue-400 hover:text-blue-300 font-extrabold transition-colors underline" 
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Register here" : "Sign in instead"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
