"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Send, CheckCircle2 } from "lucide-react";

const STORES = [
  {
    name: "CraveBox Whitechapel (Main Branch)",
    address: "123 High Street, Whitechapel, London, E1 6RF",
    phone: "0208 123 4567",
    hours: "Sun–Thu: 11:00 – 23:00 | Fri–Sat: 11:00 – 00:00",
    deliveryRadius: "Within 4 miles",
    badge: "Open Now",
  },
  {
    name: "CraveBox Stratford",
    address: "45 Broadway, Stratford, London, E15 4BQ",
    phone: "0208 987 6543",
    hours: "Daily: 11:30 – 23:00",
    deliveryRadius: "Within 3.5 miles",
    badge: "Open Now",
  },
  {
    name: "CraveBox Camden",
    address: "88 Camden High St, London, NW1 0LT",
    phone: "0207 456 7890",
    hours: "Daily: 12:00 – 01:00",
    deliveryRadius: "Within 3 miles",
    badge: "Open Now",
  },
];

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-[#d42b2b] mb-3">
            Get In Touch
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            Contact & Store Locations
          </h1>
          <p className="text-stone-600">
            Have a question about your order, allergens, or catering? Drop us a message or visit our branches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Store branches list */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display font-bold text-xl text-[#1a1a1a] mb-4">Our London Locations</h2>
            {STORES.map((store) => (
              <div
                key={store.name}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-lg text-stone-900">{store.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {store.badge}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-stone-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#d42b2b] flex-shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#d42b2b] flex-shrink-0" />
                    <a href={`tel:${store.phone}`} className="hover:text-[#d42b2b] font-medium">
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#d42b2b] flex-shrink-0 mt-0.5" />
                    <span>{store.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm sticky top-24">
              <h2 className="font-display font-bold text-xl text-[#1a1a1a] mb-2">Send us a Message</h2>
              <p className="text-xs text-stone-500 mb-6">We typically reply within 2 hours during store opening times.</p>

              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-stone-900">Message Received!</h3>
                  <p className="text-xs text-stone-500">Thank you for reaching out. Our customer support team will be in touch shortly.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "General Inquiry", message: "" }); }}
                    className="mt-4 text-xs font-semibold text-[#d42b2b] underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="cname">
                      Your Name
                    </label>
                    <input
                      id="cname"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="cemail">
                      Email Address
                    </label>
                    <input
                      id="cemail"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="csubject">
                      Subject
                    </label>
                    <select
                      id="csubject"
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b]"
                    >
                      <option>General Inquiry</option>
                      <option>Existing Order Issue</option>
                      <option>Allergen / Dietary Question</option>
                      <option>Party & Event Catering</option>
                      <option>Careers & Jobs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="cmessage">
                      Message
                    </label>
                    <textarea
                      id="cmessage"
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="How can we assist you today?"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#d42b2b] hover:bg-[#b52222] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : (
                      <>
                        <Send size={14} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
