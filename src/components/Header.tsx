"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/menu#deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Top info bar */}
      <div className="bg-[#1a1a1a] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={11} />
              <span>0208 123 4567</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin size={11} />
              <span>Delivering across London & surrounding areas</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#d42b2b] px-2 py-0.5 rounded text-white font-semibold">
              FREE DELIVERY OVER £25
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-stone-100"
            : "bg-white shadow-sm"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="CraveBox Home">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d42b2b] to-[#f97316] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg leading-none">C</span>
              </div>
              <span className="font-display font-bold text-xl text-[#1a1a1a] tracking-tight">
                Crave<span className="text-[#d42b2b]">Box</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-stone-600 hover:text-[#d42b2b] transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d42b2b] group-hover:w-full transition-all duration-200" />
                </Link>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* User dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-[#d42b2b] transition-colors"
                  aria-label="User account"
                >
                  <User size={16} />
                  <span className="hidden lg:block">Account</span>
                  <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-stone-100 py-1 z-50 animate-fade-in">
                    {[
                      { href: "/login", label: "Sign In" },
                      { href: "/register", label: "Register" },
                      { href: "/account", label: "My Account" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#d42b2b] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart button */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-[#d42b2b] hover:bg-[#b01f1f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5"
                aria-label={`Open cart, ${itemCount} items`}
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:block">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-[#f97316] text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 shadow-lg animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-[#d42b2b] font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-stone-100 mt-2 pt-3 flex flex-col gap-1">
                {[
                  { href: "/login", label: "Sign In" },
                  { href: "/register", label: "Create Account" },
                  { href: "/account", label: "My Account" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-[#d42b2b] font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
