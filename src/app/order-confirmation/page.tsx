import type { Metadata } from "next";
import { Suspense } from "react";
import OrderConfirmationClient from "./OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order Confirmed | CraveBox",
  description: "Your CraveBox takeaway order has been confirmed and is being prepared.",
};

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center py-16 px-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#d42b2b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-600">Loading order confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  );
}
