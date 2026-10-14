import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CraveBox | Premium Fried Chicken & Fast Food UK",
    template: "%s | CraveBox",
  },
  description:
    "Order premium fried chicken, burgers, wings and more from CraveBox. Fast delivery and collection across the UK. Fresh, hot and always delicious.",
  keywords: ["fried chicken", "takeaway", "fast food", "UK", "delivery", "CraveBox"],
  openGraph: {
    title: "CraveBox | Premium Fried Chicken & Fast Food UK",
    description: "Order premium fried chicken, burgers, wings and more from CraveBox.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#faf7f2] text-[#1a1a1a] antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
