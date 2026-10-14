"use client";

import { X, ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatGBPFromPence } from "@/lib/currency";
import { restaurantConfig } from "@/lib/restaurantConfig";

const DELIVERY_FEE_PENCE = restaurantConfig.delivery.deliveryFeePence;
const FREE_DELIVERY_THRESHOLD_PENCE = restaurantConfig.delivery.freeDeliveryThresholdPence;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotalPence, getItemPricing } =
    useCart();

  const deliveryFeePence =
    subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE || items.length === 0 ? 0 : DELIVERY_FEE_PENCE;
  const totalPence = subtotalPence + deliveryFeePence;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-up"
        style={{ animation: "slideInRight 0.3s ease-out" }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#d42b2b]" />
            <h2 className="font-display font-bold text-lg text-stone-900">Your Basket</h2>
            {items.length > 0 && (
              <span className="ml-1 bg-[#d42b2b] text-white text-xs font-bold rounded-full px-2.5 py-0.5">
                {items.reduce((s, i) => s + i.customisation.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free delivery progress banner */}
        {items.length > 0 && subtotalPence < FREE_DELIVERY_THRESHOLD_PENCE && (
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-100/80">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-amber-800">
                Add {formatGBPFromPence(FREE_DELIVERY_THRESHOLD_PENCE - subtotalPence)} more for free delivery
              </span>
              <span className="text-amber-900 font-bold">£25.00</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((subtotalPence / FREE_DELIVERY_THRESHOLD_PENCE) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {items.length > 0 && subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <Tag size={13} className="text-emerald-600" />
            🎉 You have unlocked free delivery across London!
          </div>
        )}

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="text-6xl animate-bounce">🛒</div>
              <div>
                <p className="font-display font-bold text-xl text-stone-900 mb-1">Your cart is empty</p>
                <p className="text-stone-500 text-sm max-w-xs">
                  Hungry? Browse our menu of crispy fried chicken, burgers and meal deals!
                </p>
              </div>
              <Link
                href="/menu"
                onClick={closeCart}
                className="bg-[#d42b2b] hover:bg-[#b52222] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md shadow-red-500/20 transition-all hover:scale-105"
              >
                Explore Delicious Menu
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const pricing = getItemPricing(item);

              return (
                <div
                  key={item.cartId}
                  className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-100 flex gap-3 group transition-shadow hover:shadow-sm"
                >
                  <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200 relative">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-sm text-[#1a1a1a] truncate">{item.product.name}</p>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="text-xs text-stone-500 mt-0.5 space-y-0.5 leading-tight">
                        {item.customisation.size && (
                          <p>Portion: <span className="font-medium text-stone-700">{item.customisation.size}</span></p>
                        )}
                        {item.customisation.flavour && (
                          <p>Flavour: <span className="font-medium text-stone-700">{item.customisation.flavour}</span></p>
                        )}
                        {item.customisation.sauce && (
                          <p>Sauce: <span className="font-medium text-stone-700">{item.customisation.sauce}</span></p>
                        )}
                        {item.customisation.extras.length > 0 && (
                          <p className="text-stone-600">
                            + {item.customisation.extras.map((e) => e.name).join(", ")}
                          </p>
                        )}
                        {item.customisation.specialInstructions && (
                          <p className="italic text-stone-400">&ldquo;{item.customisation.specialInstructions}&rdquo;</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-200/60">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.customisation.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors text-stone-700"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold min-w-[20px] text-center text-stone-800">
                          {item.customisation.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.customisation.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-[#d42b2b] hover:bg-[#b01f1f] text-white flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="font-bold text-sm text-[#d42b2b]">
                        {formatGBPFromPence(pricing.totalPence)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-5 py-5 space-y-3 bg-white">
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">{formatGBPFromPence(subtotalPence)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className={deliveryFeePence === 0 ? "text-emerald-600 font-bold" : "font-medium"}>
                  {deliveryFeePence === 0 ? "FREE" : formatGBPFromPence(deliveryFeePence)}
                </span>
              </div>
              <div className="flex justify-between font-black text-base border-t border-stone-100 pt-2 text-[#1a1a1a]">
                <span>Total</span>
                <span className="text-[#d42b2b]">{formatGBPFromPence(totalPence)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full text-center bg-[#d42b2b] hover:bg-[#b52222] text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-red-500/20 hover:scale-[1.01]"
            >
              <span>Go to Checkout</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center border-2 border-stone-200 hover:border-[#d42b2b] text-stone-700 hover:text-[#d42b2b] py-2.5 rounded-2xl font-semibold text-xs transition-all"
            >
              View Full Basket Page
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
