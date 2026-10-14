import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | CraveBox",
  description: "CraveBox Privacy and Cookies Policy compliant with UK GDPR regulations.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#d42b2b] mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-[#d42b2b] flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900">Privacy & Data Policy</h1>
            <p className="text-xs text-stone-400">Last updated: October 2026 · UK GDPR Compliant</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-sm text-stone-600 space-y-5 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">1. Who We Are</h2>
            <p>
              CraveBox Ltd is registered in England and Wales. We operate takeaway and delivery services across London. We are committed to safeguarding the privacy and personal data of our customers in accordance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact details: Name, email address, UK phone number, and delivery address.</li>
              <li>Order specifics: Items ordered, special instructions, and order history.</li>
              <li>Payment details: Processed securely via encrypted PCI-DSS certified payment processors. We do not store full card numbers on our servers.</li>
              <li>Device and usage data: IP address, browser type, and cookie identifiers for session management.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">3. How We Use Your Data</h2>
            <p>
              Your personal data is solely used to prepare and dispatch your takeaway orders, send live delivery tracking alerts, offer customer service assistance, and inform you of special deals if opted-in.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-stone-900 mb-2">4. Contact Our Data Protection Officer</h2>
            <p>
              For data access requests or deletion, contact our compliance officer at privacy@cravebox.co.uk or write to CraveBox Ltd, 123 High Street, Whitechapel, London, E1 6RF.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
