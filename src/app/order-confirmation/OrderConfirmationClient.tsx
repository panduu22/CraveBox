"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Home,
  ShoppingBag,
  ChefHat,
  Bike,
  AlertCircle,
  MapPin,
  Store,
  Banknote,
} from "lucide-react";
import { formatGBPFromPence } from "@/lib/currency";

interface ConfirmedOrderView {
  orderReference: string;
  fulfilmentType: "delivery" | "collection";
  customerName: string;
  delivery?: {
    postcode: string;
    addressLine1: string;
    townOrCity: string;
  };
  collection?: {
    branchName: string;
    collectionSlotLabel: string;
  };
  items: {
    productName: string;
    quantity: number;
    size?: string;
    flavour?: string;
    unitPricePence: number;
    lineTotalPence: number;
  }[];
  pricingSummary: {
    subtotalPence: number;
    deliveryFeePence: number;
    discountPence: number;
    finalTotalPence: number;
    currency: "GBP";
  };
  paymentMethod: "online_card" | "cash_on_delivery" | "cash_on_collection";
  paymentStatus: "unpaid" | "pending" | "paid";
  orderStatus: string;
  estimatedTime: string;
  createdAt: string;
}

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams();
  const urlRef = searchParams.get("ref");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<ConfirmedOrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    Promise.resolve().then(async () => {
      let activeRef = urlRef;
      if (!activeRef && typeof window !== "undefined") {
        activeRef = window.sessionStorage.getItem("cravebox-latest-order-id");
      }

      if (isCancelled) return;

      if (!activeRef) {
        setLoading(false);
        return;
      }

      setOrderId(activeRef);

      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(activeRef)}`);
        if (!res.ok) {
          throw new Error("Order not found or could not be verified by the server.");
        }
        const json = await res.json();
        if (isCancelled) return;
        if (json.success && json.data) {
          setOrderDetails(json.data);
        } else {
          throw new Error(json.error || "Order verification failed.");
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to load order confirmation.";
        setError(msg);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [urlRef]);

  // Case 1: No order ID stored or passed
  if (!loading && !orderId) {
    return (
      <div className="min-h-[75vh] bg-[#faf7f2] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-stone-200/80 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="font-display font-black text-2xl text-stone-900 mb-2">
            No Active Order Found
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            We couldn&apos;t find an active order. Please place an order through our menu to view your order confirmation.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#d42b2b] hover:bg-[#b52222] text-white font-bold text-xs transition-colors shadow-md shadow-red-500/20"
          >
            <ShoppingBag size={15} />
            Explore Menu
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Loading verification
  if (loading) {
    return (
      <div className="min-h-[75vh] bg-[#faf7f2] flex items-center justify-center py-16 px-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#d42b2b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Verifying order with CraveBox kitchen...</p>
        </div>
      </div>
    );
  }

  // Case 3: Error looking up order
  if (error || !orderDetails) {
    return (
      <div className="min-h-[75vh] bg-[#faf7f2] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-stone-200/80 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 border border-amber-200">
            <AlertCircle size={32} />
          </div>
          <h1 className="font-display font-black text-2xl text-stone-900 mb-2">
            Order Verification Notice
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            {error || "We could not verify this order reference with the database."}
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-4 border border-stone-300 rounded-xl font-semibold text-stone-700 text-xs hover:bg-stone-50 transition-colors"
            >
              Back Home
            </Link>
            <Link
              href="/menu"
              className="flex-1 py-3 px-4 bg-[#d42b2b] text-white rounded-xl font-bold text-xs hover:bg-[#b52222] transition-colors"
            >
              Order Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Verified order found from MongoDB
  const isDelivery = orderDetails.fulfilmentType === "delivery";
  const estimatedTime = orderDetails.estimatedTime || (isDelivery ? "25–35 min" : "15–20 min");

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-5">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle size={40} className="text-white" />
          </div>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1a1a1a] mb-2">
          Order Confirmed! 🎉
        </h1>
        <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
          Thank you, <strong className="text-stone-800">{orderDetails.customerName}</strong>. Your order has been received by our kitchen.
        </p>

        {/* Order Reference Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 text-left mb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Order Reference</span>
              <span className="font-mono font-black text-[#d42b2b] text-lg">#{orderDetails.orderReference}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified in MongoDB
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block mb-0.5">Fulfilment</span>
              <span className="font-bold text-stone-800 capitalize flex items-center gap-1">
                {isDelivery ? <Bike size={13} className="text-[#d42b2b]" /> : <Store size={13} className="text-[#d42b2b]" />}
                {isDelivery ? "Home Delivery" : "Collection"}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block mb-0.5">Estimated Time</span>
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Clock size={13} className="text-[#d42b2b]" />
                {estimatedTime}
              </span>
            </div>
          </div>

          {/* Delivery or Collection Address */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
            {isDelivery && orderDetails.delivery ? (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800 block">Delivery Address</span>
                  <p className="text-stone-500">
                    {orderDetails.delivery.addressLine1}, {orderDetails.delivery.townOrCity} {orderDetails.delivery.postcode}
                  </p>
                </div>
              </div>
            ) : orderDetails.collection ? (
              <div className="flex items-start gap-2">
                <Store size={14} className="text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800 block">Collection Branch</span>
                  <p className="text-stone-500">
                    {orderDetails.collection.branchName} ({orderDetails.collection.collectionSlotLabel})
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Payment Status Notice */}
          <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <Banknote size={15} className="text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 block">
                  {orderDetails.paymentMethod === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : orderDetails.paymentMethod === "cash_on_collection"
                    ? "Cash on Collection"
                    : "Card Payment"}
                </span>
                <span className="text-amber-700 text-[11px]">
                  {orderDetails.paymentStatus === "unpaid"
                    ? "Pay upon receiving order"
                    : "Payment pending gateway"}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-bold text-amber-800 text-[11px] uppercase">
              {orderDetails.paymentStatus}
            </span>
          </div>

          {/* Ordered Items Summary */}
          <div className="border-t border-stone-100 pt-3">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">Order Items</span>
            <div className="space-y-1.5">
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-stone-700">
                  <span>
                    <strong className="text-stone-900">{item.quantity}x</strong> {item.productName}
                    {item.size ? ` (${item.size})` : ""}
                  </span>
                  <span className="font-medium text-stone-900">{formatGBPFromPence(item.lineTotalPence)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 mt-3 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Food Subtotal</span>
                <span>{formatGBPFromPence(orderDetails.pricingSummary.subtotalPence)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Fee</span>
                <span>{orderDetails.pricingSummary.deliveryFeePence === 0 ? "FREE" : formatGBPFromPence(orderDetails.pricingSummary.deliveryFeePence)}</span>
              </div>
              {orderDetails.pricingSummary.discountPence > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatGBPFromPence(orderDetails.pricingSummary.discountPence)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline font-black text-stone-900 text-sm pt-1 border-t border-stone-100">
                <span>Total Amount</span>
                <span className="text-[#d42b2b] text-base">{formatGBPFromPence(orderDetails.pricingSummary.finalTotalPence)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Kitchen Status Tracker */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 mb-6">
          <div className="grid grid-cols-3 gap-2 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md">
                <CheckCircle size={18} />
              </div>
              <span className="text-xs font-bold text-stone-800">Received</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#d42b2b] text-white flex items-center justify-center font-bold text-sm mb-2 shadow-md animate-pulse">
                <ChefHat size={18} />
              </div>
              <span className="text-xs font-bold text-[#d42b2b]">Kitchen preparing</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold text-sm mb-2">
                <Bike size={18} />
              </div>
              <span className="text-xs font-medium text-stone-400">{isDelivery ? "On the way" : "Ready for pickup"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Home size={15} />
            Back to Home
          </Link>
          <Link
            href="/menu"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#d42b2b] text-white font-semibold text-xs hover:bg-[#b52222] transition-colors shadow-md shadow-red-500/20"
          >
            <ShoppingBag size={15} />
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
}
