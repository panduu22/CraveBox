"use client";

import { useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";

const SAMPLE_ORDERS = [
  {
    id: "CB981240",
    date: "12 Oct 2026, 19:45",
    total: 24.99,
    status: "Delivered",
    items: [
      { name: "Mighty Tower Burger Meal", qty: 1, price: 10.99 },
      { name: "6pc Hot & Spicy Wings", qty: 1, price: 6.99 },
      { name: "Crave Peri-Peri Salted Fries", qty: 2, price: 5.98 },
      { name: "Garlic & Herb Mayo", qty: 1, price: 1.03 },
    ],
  },
  {
    id: "CB894211",
    date: "28 Sep 2026, 20:15",
    total: 34.50,
    status: "Delivered",
    items: [
      { name: "Crave Family Feast Bucket (12pc)", qty: 1, price: 24.99 },
      { name: "Loaded Cheese Fries", qty: 1, price: 5.49 },
      { name: "Warm Chocolate Fudge Cake", qty: 1, price: 4.02 },
    ],
  },
];

export default function AccountClient() {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "settings">("orders");
  const { openCart } = useCart();
  const [reorderedMessage, setReorderedMessage] = useState("");

  function handleReorder(orderId: string) {
    setReorderedMessage(`Order #${orderId} items loaded into your basket!`);
    openCart();
    setTimeout(() => setReorderedMessage(""), 4000);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d42b2b] to-[#f97316] text-white flex items-center justify-center font-black text-3xl shadow-lg">
            A
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900">Alex Morgan</h1>
                <p className="text-stone-500 text-sm">alex.morgan@example.co.uk · +44 7123 987654</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 self-center sm:self-auto">
                ⭐ Crave Rewards: 420 pts
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "orders" ? "bg-[#d42b2b] text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "addresses" ? "bg-[#d42b2b] text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "settings" ? "bg-[#d42b2b] text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {reorderedMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
            <span>{reorderedMessage}</span>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-stone-900">Recent Orders</h2>
            {SAMPLE_ORDERS.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#d42b2b]">#{order.id}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-stone-900 text-lg">£{order.total.toFixed(2)}</span>
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-[#d42b2b] hover:text-white text-stone-700 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw size={13} />
                      Reorder
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs sm:text-sm text-stone-600">
                      <span>{item.qty}x {item.name}</span>
                      <span className="font-medium text-stone-800">£{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-stone-900">Delivery Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border-2 border-[#d42b2b] shadow-sm relative">
                <span className="absolute top-4 right-4 text-xs font-bold text-[#d42b2b] bg-red-50 px-2 py-0.5 rounded-md">
                  Default
                </span>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#d42b2b] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Home</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Flat 4, 18 Cambridge Heath Road<br />
                      Bethnal Green, London<br />
                      E1 5QH
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-stone-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Work</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Floor 3, TechCity Hub, 10 City Road<br />
                      Shoreditch, London<br />
                      EC1Y 2AA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm max-w-xl">
            <h2 className="font-display font-bold text-xl text-stone-900 mb-4">Account Preferences</h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
                <input
                  type="text"
                  defaultValue="Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="alex.morgan@example.co.uk"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="07123 987654"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <button className="px-5 py-2.5 bg-[#d42b2b] text-white font-semibold rounded-xl text-xs hover:bg-[#b52222] transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
