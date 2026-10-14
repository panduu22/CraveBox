import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us & Locations | CraveBox Takeaway",
  description: "Find your nearest CraveBox store in London, view opening hours, and get in touch with our support team.",
};

export default function ContactPage() {
  return <ContactClient />;
}
