import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | CraveBox Takeaway",
  description: "Secure online checkout for CraveBox food delivery and collection across the UK.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
