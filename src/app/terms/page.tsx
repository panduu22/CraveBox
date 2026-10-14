import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | CraveBox",
  description: "Terms and conditions for placing takeaway and delivery orders with CraveBox.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#d42b2b] mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-[#d42b2b] flex items-center justify-center">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900">Terms of Service</h1>
            <p className="text-xs text-stone-400">Effective Date: October 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-sm text-stone-600 space-y-5 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">1. Ordering & Acceptance</h2>
            <p>
              By submitting an order through the CraveBox website, you make an offer to purchase the ordered goods at the quoted prices. Our confirmation screen signifies order acceptance and kitchen dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">2. Delivery Policy & Minimum Orders</h2>
            <p>
              Free delivery applies to orders meeting the threshold (typically £15.00+). Delivery times (typically 25–45 minutes) are estimates influenced by traffic, weather, and kitchen capacity. Please ensure your UK telephone number is correct so our rider can contact you upon arrival.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">3. Cancellations & Refunds</h2>
            <p>
              Because orders are prepared fresh to order immediately, cancellations can only be accommodated within 3 minutes of placement. If you receive an incorrect or substandard item, please inform the store team within 2 hours with photographic proof for an immediate refund or replacement.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">4. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with English Law and subject to the exclusive jurisdiction of the English Courts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
