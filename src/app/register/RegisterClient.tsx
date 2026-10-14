"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";

export default function RegisterClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setError("Demo mode: registration is simulated in frontend preview.");
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
          <h1 className="font-display font-black text-3xl text-[#1a1a1a]">Create Account</h1>
          <p className="text-stone-500 mt-1">Join CraveBox for exclusive rewards and faster ordering</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] transition-colors"
                />
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="phone">
                UK Mobile Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="07123 456789"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] transition-colors"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.marketingConsent}
                onChange={(e) => setForm((p) => ({ ...p, marketingConsent: e.target.checked }))}
                className="w-4 h-4 mt-0.5 rounded border-stone-300 text-[#d42b2b] focus:ring-[#d42b2b]"
              />
              <span className="text-xs text-stone-600 leading-tight">
                Send me spicy offers, secret discount codes and CraveBox perks via email and SMS.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#d42b2b] hover:bg-[#b52222] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#d42b2b] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
