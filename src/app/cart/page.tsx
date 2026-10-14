"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatGBPFromPence } from "@/lib/currency";
import { restaurantConfig } from "@/lib/restaurantConfig";

const DELIVERY_FEE_PENCE = restaurantConfig.delivery.deliveryFeePence;
const FREE_DELIVERY_THRESHOLD_PENCE = restaurantConfig.delivery.freeDeliveryThresholdPence;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotalPence, clearCart, getItemPricing } = useCart();

  const deliveryFeePence =
    subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE || items.length === 0 ? 0 : DELIVERY_FEE_PENCE;
  const totalPence = subtotalPence + deliveryFeePence;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 py-16 bg-[#faf7f2]">
        <div className="text-8xl animate-bounce">🛒</div>
        <div className="text-center">
          <h1 className="font-display font-black text-3xl mb-2 text-[#1a1a1a]">Your basket is empty</h1>
          <p className="text-stone-500 max-w-md text-sm leading-relaxed">
            Looks like you haven&apos;t added anything yet. Head over to our menu to discover our freshly prepared fried chicken, loaded burgers and sharing buckets!
          </p>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-2 bg-[#d42b2b] hover:bg-[#b52222] text-white px-8 py-3.5 rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5"
        >
          <ShoppingCart size={18} />
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1a1a1a]">Your Basket</h1>
            <p className="text-xs text-stone-500 mt-1">Review your selections and portion customisations</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white"
          >
            <Trash2 size={13} />
            Clear Basket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const pricing = getItemPricing(item);

              return (
                <div key={item.cartId} className="bg-white rounded-3xl p-4 sm:p-5 flex gap-4 shadow-sm border border-stone-100">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100 relative">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base text-[#1a1a1a] mb-0.5">{item.product.name}</h3>
                    <div className="text-xs text-stone-500 space-y-0.5 mb-3 leading-tight">
                      {item.customisation.size && (
                        <p>Size / Portion: <span className="font-medium text-stone-700">{item.customisation.size}</span></p>
                      )}
                      {item.customisation.flavour && (
                        <p>Flavour: <span className="font-medium text-stone-700">{item.customisation.flavour}</span></p>
                      )}
                      {item.customisation.sauce && (
                        <p>Sauce: <span className="font-medium text-stone-700">{item.customisation.sauce}</span></p>
                      )}
                      {item.customisation.extras.length > 0 && (
                        <p>Extras: <span className="text-stone-700 font-medium">{item.customisation.extras.map((e) => e.name).join(", ")}</span></p>
                      )}
                      {item.customisation.specialInstructions && (
                        <p className="italic text-stone-400">Note: {item.customisation.specialInstructions}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-stone-100">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.customisation.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center transition-colors shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-xs w-6 text-center text-stone-800">{item.customisation.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.customisation.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-[#d42b2b] hover:bg-[#b01f1f] text-white flex items-center justify-center transition-colors shadow-2xs"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-[#d42b2b] text-base">
                          {formatGBPFromPence(pricing.totalPence)}
                        </span>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-stone-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 sticky top-24">
              <h2 className="font-display font-bold text-lg mb-4 text-stone-900">Order Summary</h2>

              {/* Delivery progress */}
              {subtotalPence < FREE_DELIVERY_THRESHOLD_PENCE && (
                <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200/50 rounded-2xl">
                  <p className="text-xs text-amber-800 font-semibold mb-2">
                    Add {formatGBPFromPence(FREE_DELIVERY_THRESHOLD_PENCE - subtotalPence)} more for free delivery
                  </p>
                  <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(subtotalPence / FREE_DELIVERY_THRESHOLD_PENCE) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <Tag size={13} className="text-emerald-600" />
                  🎉 Free delivery unlocked!
                </div>
              )}

              <div className="space-y-2 text-sm text-stone-600 border-b border-stone-100 pb-4 mb-4">
                {items.map((item) => {
                  const pricing = getItemPricing(item);
                  return (
                    <div key={item.cartId} className="flex justify-between text-xs">
                      <span className="truncate max-w-[200px] text-stone-700">{item.product.name} ×{item.customisation.quantity}</span>
                      <span className="font-medium text-stone-900">{formatGBPFromPence(pricing.totalPence)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatGBPFromPence(subtotalPence)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span className={deliveryFeePence === 0 ? "text-emerald-600 font-bold" : "font-semibold text-stone-900"}>
                    {deliveryFeePence === 0 ? "FREE" : formatGBPFromPence(deliveryFeePence)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-lg text-[#1a1a1a] border-t border-stone-100 pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-[#d42b2b]">{formatGBPFromPence(totalPence)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full mt-6 bg-[#d42b2b] hover:bg-[#b52222] text-white py-4 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/menu"
                className="block text-center mt-3 text-xs font-semibold text-stone-500 hover:text-[#d42b2b] transition-colors"
              >
                ← Add more items from menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
