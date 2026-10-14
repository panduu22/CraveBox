import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | CraveBox",
  description: "Sign in to your CraveBox account to manage your takeaway orders and rewards.",
};

export default function LoginPage() {
  return <LoginClient />;
}
