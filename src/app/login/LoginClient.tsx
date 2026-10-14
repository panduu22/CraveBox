"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setError("Demo mode: authentication is not connected yet.");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d42b2b] to-[#f97316] flex items-center justify-center shadow-xl mb-4">
            <span className="text-white font-black text-2xl">C</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#1a1a1a]">Welcome back</h1>
          <p className="text-stone-500 mt-1">Sign in to your CraveBox account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-stone-700" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-[#d42b2b] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                className="w-4 h-4 rounded border-stone-300 text-[#d42b2b] accent-[#d42b2b]"
              />
              <span className="text-sm text-stone-600">Remember me for 30 days</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#d42b2b] hover:bg-[#b01f1f] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-red-200"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#d42b2b] font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
