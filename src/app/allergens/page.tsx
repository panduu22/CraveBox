import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ShieldCheck, HeartPulse } from "lucide-react";

export const metadata: Metadata = {
  title: "Allergen & Nutritional Information | CraveBox",
  description: "Detailed UK Food Standards Agency compliant allergen matrices, dietary badges, and Halal certification info for CraveBox.",
};

const ALLERGEN_CATEGORIES = [
  { item: "Crispy Fried Chicken (Original / Spicy)", gluten: true, egg: true, milk: true, celery: false, mustard: true, sesame: false, soy: false },
  { item: "Signature Chicken Burgers", gluten: true, egg: true, milk: true, celery: false, mustard: true, sesame: true, soy: true },
  { item: "CraveBox Chicken Tenders & Dippers", gluten: true, egg: true, milk: true, celery: false, mustard: false, sesame: false, soy: false },
  { item: "Smash Cheeseburger", gluten: true, egg: true, milk: true, celery: false, mustard: true, sesame: true, soy: true },
  { item: "Peri-Peri Chicken (Grilled)", gluten: false, egg: false, milk: false, celery: false, mustard: true, sesame: false, soy: false },
  { item: "Skin-on Fries & Peri Fries", gluten: false, egg: false, milk: false, celery: false, mustard: false, sesame: false, soy: false },
  { item: "Mac & Cheese Bites", gluten: true, egg: true, milk: true, celery: false, mustard: false, sesame: false, soy: false },
  { item: "Garlic Herb Dip / Crave Mayo", gluten: false, egg: true, milk: true, celery: false, mustard: true, sesame: false, soy: false },
  { item: "Hot Buffalo / Sweet Chilli Sauces", gluten: false, egg: false, milk: false, celery: false, mustard: false, sesame: false, soy: false },
];

export default function AllergensPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-3">
            Health & Safety Compliance
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            Allergen & Dietary Information
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            At CraveBox, we take food safety and allergen management with the utmost seriousness. Please review our guide below before placing your order.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base mb-1">100% Halal Certified</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                All our poultry and meat are strictly sourced from certified HMC / HFA-approved UK suppliers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Cross-Contamination</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our kitchens prepare items containing gluten, milk, and eggs. We cannot guarantee 100% allergen-free environments.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <HeartPulse size={22} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Allergy Advice Line</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Have severe allergies? Call our store directly at 0208 123 4567 to speak with our head chef before ordering.
              </p>
            </div>
          </div>
        </div>

        {/* Matrix table */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm overflow-hidden mb-10">
          <h2 className="font-display font-bold text-xl text-[#1a1a1a] mb-2">UK 14 Major Allergens Matrix</h2>
          <p className="text-xs text-stone-500 mb-6">Key menu items and presence of major recognized allergens.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-semibold">
                  <th className="py-3 px-4">Menu Item</th>
                  <th className="py-3 px-2 text-center">Gluten</th>
                  <th className="py-3 px-2 text-center">Egg</th>
                  <th className="py-3 px-2 text-center">Milk</th>
                  <th className="py-3 px-2 text-center">Mustard</th>
                  <th className="py-3 px-2 text-center">Sesame</th>
                  <th className="py-3 px-2 text-center">Soy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ALLERGEN_CATEGORIES.map((row) => (
                  <tr key={row.item} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-stone-900">{row.item}</td>
                    <td className="py-3 px-2 text-center">{row.gluten ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                    <td className="py-3 px-2 text-center">{row.egg ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                    <td className="py-3 px-2 text-center">{row.milk ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                    <td className="py-3 px-2 text-center">{row.mustard ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                    <td className="py-3 px-2 text-center">{row.sesame ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                    <td className="py-3 px-2 text-center">{row.soy ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Contains" /> : <span className="text-stone-300">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Contains allergen</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-stone-400 font-bold">-</span> Does not intentionally contain</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#d42b2b] text-white font-semibold text-sm hover:bg-[#b52222] transition-colors shadow-md shadow-red-500/20"
          >
            Explore Menu & Customise Order
          </Link>
        </div>
      </div>
    </div>
  );
}
