import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}


const footerLinks = {
  "Quick Links": [
    { href: "/menu", label: "Our Menu" },
    { href: "/menu#deals", label: "Meal Deals" },
    { href: "/cart", label: "Your Cart" },
    { href: "/contact", label: "Contact Us" },
  ],
  "Information": [
    { href: "/allergens", label: "Allergen Info" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/admin", label: "Admin Dashboard" },
  ],
  "Account": [
    { href: "/login", label: "Sign In" },
    { href: "/register", label: "Register" },
    { href: "/account", label: "My Orders" },
    { href: "/account#settings", label: "Account Settings" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d42b2b] to-[#f97316] flex items-center justify-center shadow">
                <span className="text-white font-bold text-xl leading-none">C</span>
              </div>
              <span className="font-display font-bold text-2xl">
                Crave<span className="text-[#d42b2b]">Box</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
              Premium fried chicken & fast food delivered to your door across London and surrounding areas. Freshly prepared, always delicious.
            </p>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-[#d42b2b] flex-shrink-0" />
                <span>123 High Street, London, E1 6RF</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#d42b2b]" />
                <span>0208 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#d42b2b]" />
                <span>hello@cravebox.co.uk</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 text-[#d42b2b] flex-shrink-0" />
                <span>Mon–Thu 11am–11pm · Fri–Sat 11am–12am · Sun 12pm–10pm</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: InstagramIcon, href: "#", label: "Instagram" },
                { Icon: FacebookIcon, href: "#", label: "Facebook" },
                { Icon: TwitterIcon, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#d42b2b] flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-stone-300 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>© 2026 CraveBox Ltd. All rights reserved. Registered in England & Wales.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/allergens" className="hover:text-white transition-colors">Allergens</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
