import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account | CraveBox",
  description: "Sign up for a CraveBox account for faster ordering, order tracking, and exclusive discounts.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
