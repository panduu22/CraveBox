import type { Metadata } from "next";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu | CraveBox Takeaway",
  description:
    "Browse the full CraveBox menu. Fried chicken, burgers, wraps, wings, family buckets, sides, desserts and drinks. Order online for delivery or collection.",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolved = await searchParams;
  const initialCategory = resolved?.category || "all";

  return <MenuClient initialCategory={initialCategory} />;
}

