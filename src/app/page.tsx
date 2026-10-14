import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "CraveBox | Premium Fried Chicken & Fast Food Delivered in the UK",
  description:
    "Order the UK's finest fried chicken, loaded burgers, wings and more. Fast delivery, easy ordering, always fresh.",
};

export default function HomePage() {
  return <HomeClient />;
}
