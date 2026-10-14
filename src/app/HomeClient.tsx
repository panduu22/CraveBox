"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Clock,
  Truck,
  Shield,
  Zap,
  ChevronRight,
  Flame,
} from "lucide-react";
import { products, categories, mealDeals, featuredOffers } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import type { Product } from "@/lib/data";

export default function HomeClient() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const popularProducts = products.filter((p) => p.popular).slice(0, 4);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#1a1a1a]">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1400&q=80"
            alt="Crispy fried chicken"
            fill
            className="object-cover opacity-30"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#d42b2b]/20 border border-[#d42b2b]/40 rounded-full px-4 py-1.5 mb-6">
              <Flame size={14} className="text-[#f97316]" />
              <span className="text-sm font-semibold text-[#f97316]">UK&apos;s Favourite Fried Chicken</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 text-balance">
              Seriously<br />
              <span className="bg-gradient-to-r from-[#d42b2b] to-[#f97316] bg-clip-text text-transparent">
                Good Food
              </span>
            </h1>

            <p className="text-stone-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
              Premium fried chicken, loaded burgers and crispy wings — delivered hot to your door in under 30 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 bg-[#d42b2b] hover:bg-[#b01f1f] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:shadow-xl hover:shadow-red-900/40 hover:-translate-y-0.5"
              >
                Order Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/menu#deals"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 backdrop-blur-sm"
              >
                View Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-10 text-white/70 text-sm">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span><strong className="text-white">4.9</strong> Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span><strong className="text-white">25 min</strong> avg delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} />
                <span><strong className="text-white">Free</strong> over £25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating food image (desktop) */}
        <div className="hidden lg:block absolute right-12 xl:right-24 top-1/2 -translate-y-1/2">
          <div className="relative w-80 h-80 animate-float">
            <Image
              src="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=700&q=80"
              alt="Crispy chicken wings"
              fill
              className="object-cover rounded-full border-4 border-[#d42b2b]/30 shadow-2xl shadow-red-900/30"
              unoptimized
            />
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
              <p className="text-xs text-stone-500 font-medium">Best Seller</p>
              <p className="font-display font-bold text-sm text-[#1a1a1a]">Buffalo Wings</p>
              <p className="text-[#d42b2b] font-bold text-sm">from £7.49</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED OFFERS ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1a1a1a]">Featured Deals</h2>
            <p className="text-stone-500 text-sm mt-1">Limited time offers you don&apos;t want to miss</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`relative bg-gradient-to-br ${offer.color} rounded-3xl p-6 text-white overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 text-xs font-bold tracking-wider">
                {offer.badge}
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <h3 className="font-display font-bold text-xl mb-2 pr-24">{offer.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{offer.description}</p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:gap-2.5 transition-all"
              >
                Order Now <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="bg-[#f0ebe3] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.id}`}
                className="group bg-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#d42b2b] hover:text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 shadow-sm"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-bold text-center leading-tight group-hover:text-white text-stone-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1a1a1a]">
              🔥 Bestsellers
            </h2>
            <p className="text-stone-500 text-sm mt-1">Our most-loved dishes</p>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm font-semibold text-[#d42b2b] hover:gap-2 transition-all"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      {/* ── MEAL DEALS ───────────────────────────────────────── */}
      <section id="deals" className="bg-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Popular Meal Deals</h2>
              <p className="text-stone-400 text-sm mt-1">More food, better value</p>
            </div>
            <Link
              href="/menu"
              className="flex items-center gap-1 text-sm font-semibold text-[#f97316] hover:gap-2 transition-all"
            >
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mealDeals.map((deal) => (
              <div key={deal.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer hover:-translate-y-1 duration-200">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-[#d42b2b] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    SAVE £{(deal.originalPrice - deal.price).toFixed(2)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-white text-sm mb-1">{deal.name}</h3>
                  <p className="text-stone-400 text-xs mb-3 leading-relaxed">{deal.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#f97316] text-lg">£{deal.price.toFixed(2)}</span>
                      <span className="text-stone-500 text-xs line-through ml-2">£{deal.originalPrice.toFixed(2)}</span>
                    </div>
                    <Link
                      href="/menu"
                      className="bg-[#d42b2b] hover:bg-[#f97316] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-3">
            Why Choose CraveBox?
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            We&apos;re more than just takeaway — we&apos;re your neighbourhood favourite.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Zap size={24} className="text-[#d42b2b]" />,
              title: "Lightning Fast",
              desc: "Average delivery in under 30 minutes. Fresh and hot to your door.",
            },
            {
              icon: <Star size={24} className="text-[#d42b2b]" />,
              title: "Premium Quality",
              desc: "Hand-battered using our secret 11-spice recipe with premium chicken.",
            },
            {
              icon: <Shield size={24} className="text-[#d42b2b]" />,
              title: "Safe & Trusted",
              desc: "Food hygiene rating 5 stars. Fully allergen labelled and traceable.",
            },
            {
              icon: <Truck size={24} className="text-[#d42b2b]" />,
              title: "Free Delivery",
              desc: "Free delivery on all orders over £25. Easy online tracking.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-[#d42b2b] group-hover:[&>*]:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-base mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DELIVERY & COLLECTION INFO ───────────────────────── */}
      <section className="bg-gradient-to-br from-[#d42b2b] to-[#f97316] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
                Delivery & Collection
              </h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Choose how you get your food. We offer speedy home delivery across London and collection from our store. Our store is open 7 days a week.
              </p>
              <div className="space-y-3">
                {[
                  { icon: "🚗", label: "Home Delivery", detail: "Free over £25 · 25–40 min" },
                  { icon: "🏪", label: "Click & Collect", detail: "Ready in 15 min · No delivery charge" },
                  { icon: "⏰", label: "Pre-order", detail: "Schedule up to 24hrs in advance" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-white/70 text-xs">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 mt-6 bg-white text-[#d42b2b] font-bold px-6 py-3 rounded-2xl hover:bg-stone-50 transition-colors"
              >
                Start Your Order <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80"
                alt="Family bucket meal"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="font-display font-bold text-lg">Family Feast Bucket</p>
                <p className="text-white/80 text-sm">Serves 4 · from £32.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product customisation modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
